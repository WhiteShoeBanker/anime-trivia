import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { getPromotionRequirements } from "@/lib/league-xp";
import type { LeagueTier } from "@/types";

// Vercel Cron: runs every Monday at 00:05 UTC
// Configured in vercel.json

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: Request) {
  // Verify cron secret (Vercel sends this header)
  const authHeader = request.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

  try {
    // Get the week that just ended (last Monday)
    const now = new Date();
    const day = now.getUTCDay();
    const diff = day === 0 ? 6 : day - 1;
    const lastMonday = new Date(now);
    lastMonday.setUTCDate(now.getUTCDate() - diff);
    lastMonday.setUTCHours(0, 0, 0, 0);
    const endedWeekStart = lastMonday.toISOString().split("T")[0];

    // New week start is today (Monday)
    const newWeekStart = endedWeekStart;

    // 1. Get all active league groups from the ended week
    const { data: activeGroups } = await supabase
      .from("league_groups")
      .select("*, leagues:league_id (*)")
      .eq("is_active", true);

    if (!activeGroups || activeGroups.length === 0) {
      return NextResponse.json({ message: "No active groups to process" });
    }

    // Track all users and their new league assignments
    const userNewLeagues: Map<
      string,
      { leagueId: string; tier: number }
    > = new Map();

    // 2. Process each group
    for (const group of activeGroups) {
      const league = group.leagues as {
        id: string;
        name: string;
        tier: number;
        promotion_slots: number;
        demotion_slots: number;
        group_size: number;
      };

      // Get all members ranked by weekly_xp
      const { data: members } = await supabase
        .from("league_memberships")
        .select("*")
        .eq("group_id", group.id)
        .order("weekly_xp", { ascending: false });

      if (!members || members.length === 0) continue;

      const promotionReqs = getPromotionRequirements(
        league.tier as LeagueTier
      );

      // Get next higher league
      const { data: nextLeague } = await supabase
        .from("leagues")
        .select("*")
        .eq("tier", league.tier + 1)
        .single();

      // Get next lower league
      const { data: prevLeague } = await supabase
        .from("leagues")
        .select("*")
        .eq("tier", league.tier - 1)
        .single();

      // 3. Determine results for each member
      for (let i = 0; i < members.length; i++) {
        const member = members[i];
        const rank = i + 1;
        let result: "promoted" | "stayed" | "demoted" | "missed_promotion";
        let newLeagueId = league.id;
        let newTier = league.tier;

        const meetsAnimeReq =
          promotionReqs.minAnime === 0 ||
          member.unique_anime_count >= promotionReqs.minAnime;

        // Check promotion zone
        if (rank <= league.promotion_slots && nextLeague) {
          if (meetsAnimeReq) {
            result = "promoted";
            newLeagueId = nextLeague.id;
            newTier = nextLeague.tier;
          } else {
            result = "missed_promotion";
          }
        }
        // Check demotion zone
        else if (
          league.demotion_slots > 0 &&
          rank > members.length - league.demotion_slots &&
          prevLeague
        ) {
          // Bronze (tier 1) can't demote
          if (league.tier === 1) {
            result = "stayed";
          } else {
            result = "demoted";
            newLeagueId = prevLeague.id;
            newTier = prevLeague.tier;
          }
        }
        // Safe zone
        else {
          result = "stayed";
        }

        // Archive to league_history
        await supabase.from("league_history").insert({
          user_id: member.user_id,
          league_id: league.id,
          group_id: group.id,
          week_start: endedWeekStart,
          final_rank: rank,
          weekly_xp: member.weekly_xp,
          unique_anime_count: member.unique_anime_count,
          result,
        });

        // Track new league for this user
        userNewLeagues.set(member.user_id, {
          leagueId: newLeagueId,
          tier: newTier,
        });
      }

      // Mark group as inactive
      await supabase
        .from("league_groups")
        .update({ is_active: false })
        .eq("id", group.id);
    }

    // 4. Create new week's groups and assign members
    // Group users by their new league tier
    const tierGroups: Map<string, string[]> = new Map();
    for (const [userId, info] of userNewLeagues) {
      const key = info.leagueId;
      if (!tierGroups.has(key)) {
        tierGroups.set(key, []);
      }
      tierGroups.get(key)!.push(userId);
    }

    // Create groups of ~30 for each league
    for (const [leagueId, userIds] of tierGroups) {
      // Shuffle users for fair grouping
      for (let i = userIds.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [userIds[i], userIds[j]] = [userIds[j], userIds[i]];
      }

      // Split into groups of 30
      const groupSize = 30;
      for (let i = 0; i < userIds.length; i += groupSize) {
        const chunk = userIds.slice(i, i + groupSize);

        // Create new group
        const { data: newGroup } = await supabase
          .from("league_groups")
          .insert({
            league_id: leagueId,
            week_start: newWeekStart,
            is_active: true,
          })
          .select()
          .single();

        if (!newGroup) continue;

        // Create memberships
        const memberships = chunk.map((userId) => ({
          user_id: userId,
          group_id: newGroup.id,
          league_id: leagueId,
          weekly_xp: 0,
          unique_anime_count: 0,
        }));

        await supabase.from("league_memberships").insert(memberships);
      }
    }

    // 5. Reset weekly_anime_plays for all users
    await supabase
      .from("weekly_anime_plays")
      .delete()
      .lt("week_start", newWeekStart);

    return NextResponse.json({
      message: "League processing complete",
      groupsProcessed: activeGroups.length,
      usersProcessed: userNewLeagues.size,
    });
  } catch (error) {
    console.error("League processing failed:", error);
    return NextResponse.json(
      { error: "League processing failed" },
      { status: 500 }
    );
  }
}
