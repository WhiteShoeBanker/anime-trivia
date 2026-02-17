import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { getPromotionRequirements } from "@/lib/league-xp";
import { trackEvent } from "@/lib/analytics";
import type { LeagueTier } from "@/types";

// Vercel Cron: runs every Monday at 00:05 UTC
// Configured in vercel.json

const CRON_SECRET = process.env.CRON_SECRET;
const STATUS_KEY = "league_processing_status";
const TIMEOUT_MS = 45_000;
const BATCH_SIZE = 5;
const STALE_THRESHOLD_MS = 5 * 60 * 1000;

interface CronStatus {
  state: "idle" | "in_progress" | "completed" | "failed" | "partial";
  started_at?: string;
  completed_at?: string;
  failed_at?: string;
  error?: string;
  stats?: { processed: number; remaining: number; elapsed_ms: number };
  remaining_ids?: string[];
}

async function updateStatus(
  supabase: ReturnType<typeof createServiceClient>,
  status: CronStatus
) {
  await supabase.from("admin_config").upsert({
    key: STATUS_KEY,
    value: status,
    updated_at: new Date().toISOString(),
  });
}

async function getStatus(
  supabase: ReturnType<typeof createServiceClient>
): Promise<CronStatus | null> {
  const { data } = await supabase
    .from("admin_config")
    .select("value")
    .eq("key", STATUS_KEY)
    .single();
  return (data?.value as CronStatus) ?? null;
}

export async function processLeagueGroups(groupIds?: string[]) {
  const supabase = createServiceClient();
  const startTime = Date.now();

  // Check for double-run
  const currentStatus = await getStatus(supabase);
  if (
    currentStatus?.state === "in_progress" &&
    currentStatus.started_at &&
    Date.now() - new Date(currentStatus.started_at).getTime() < STALE_THRESHOLD_MS
  ) {
    return NextResponse.json(
      { error: "Already in progress" },
      { status: 409 }
    );
  }

  await updateStatus(supabase, {
    state: "in_progress",
    started_at: new Date().toISOString(),
    stats: { processed: 0, remaining: 0, elapsed_ms: 0 },
  });

  try {
    // Get the week that just ended (last Monday)
    const now = new Date();
    const day = now.getUTCDay();
    const diff = day === 0 ? 6 : day - 1;
    const lastMonday = new Date(now);
    lastMonday.setUTCDate(now.getUTCDate() - diff);
    lastMonday.setUTCHours(0, 0, 0, 0);
    const endedWeekStart = lastMonday.toISOString().split("T")[0];
    const newWeekStart = endedWeekStart;

    // Get active league groups — optionally filtered by IDs (for retry)
    let query = supabase
      .from("league_groups")
      .select("*, leagues:league_id (*)")
      .eq("is_active", true);

    if (groupIds && groupIds.length > 0) {
      query = query.in("id", groupIds);
    }

    const { data: activeGroups } = await query;

    if (!activeGroups || activeGroups.length === 0) {
      await updateStatus(supabase, {
        state: "completed",
        completed_at: new Date().toISOString(),
        stats: { processed: 0, remaining: 0, elapsed_ms: Date.now() - startTime },
      });
      return NextResponse.json({ message: "No active groups to process" });
    }

    const userNewLeagues: Map<string, { leagueId: string; tier: number }> =
      new Map();
    let groupsProcessed = 0;
    const failedGroupIds: string[] = [];

    // Process groups in batches
    for (let batchStart = 0; batchStart < activeGroups.length; batchStart += BATCH_SIZE) {
      // Timeout check before each batch
      if (Date.now() - startTime > TIMEOUT_MS) {
        const remainingIds = activeGroups
          .slice(batchStart)
          .map((g) => g.id as string);

        await updateStatus(supabase, {
          state: "partial",
          started_at: new Date(startTime).toISOString(),
          stats: {
            processed: groupsProcessed,
            remaining: remainingIds.length,
            elapsed_ms: Date.now() - startTime,
          },
          remaining_ids: remainingIds,
        });

        trackEvent("league_processing", undefined, {
          groups_processed: groupsProcessed,
          groups_remaining: remainingIds.length,
          elapsed_ms: Date.now() - startTime,
          state: "partial",
        }).catch(() => {});

        return NextResponse.json({
          message: "League processing timed out — partial completion",
          groupsProcessed,
          groupsRemaining: remainingIds.length,
        });
      }

      const batch = activeGroups.slice(batchStart, batchStart + BATCH_SIZE);

      for (const group of batch) {
        try {
          const league = group.leagues as {
            id: string;
            name: string;
            tier: number;
            promotion_slots: number;
            demotion_slots: number;
            group_size: number;
          };

          const { data: members } = await supabase
            .from("league_memberships")
            .select("*")
            .eq("group_id", group.id)
            .order("weekly_xp", { ascending: false });

          if (!members || members.length === 0) {
            groupsProcessed++;
            continue;
          }

          const promotionReqs = getPromotionRequirements(
            league.tier as LeagueTier
          );

          const { data: nextLeague } = await supabase
            .from("leagues")
            .select("*")
            .eq("tier", league.tier + 1)
            .single();

          const { data: prevLeague } = await supabase
            .from("leagues")
            .select("*")
            .eq("tier", league.tier - 1)
            .single();

          for (let i = 0; i < members.length; i++) {
            const member = members[i];
            const rank = i + 1;
            let result: "promoted" | "stayed" | "demoted" | "missed_promotion";
            let newLeagueId = league.id;
            let newTier = league.tier;

            const meetsAnimeReq =
              promotionReqs.minAnime === 0 ||
              member.unique_anime_count >= promotionReqs.minAnime;

            if (rank <= league.promotion_slots && nextLeague) {
              if (meetsAnimeReq) {
                result = "promoted";
                newLeagueId = nextLeague.id;
                newTier = nextLeague.tier;
              } else {
                result = "missed_promotion";
              }
            } else if (
              league.demotion_slots > 0 &&
              rank > members.length - league.demotion_slots &&
              prevLeague
            ) {
              if (league.tier === 1) {
                result = "stayed";
              } else {
                result = "demoted";
                newLeagueId = prevLeague.id;
                newTier = prevLeague.tier;
              }
            } else {
              result = "stayed";
            }

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

            userNewLeagues.set(member.user_id, {
              leagueId: newLeagueId,
              tier: newTier,
            });
          }

          await supabase
            .from("league_groups")
            .update({ is_active: false })
            .eq("id", group.id);

          groupsProcessed++;
        } catch (groupError) {
          console.error(`Failed to process group ${group.id}:`, groupError);
          failedGroupIds.push(group.id as string);
        }
      }
    }

    // All groups processed — create new week groups + reset anime plays
    // Timeout check before post-processing
    if (Date.now() - startTime > TIMEOUT_MS) {
      await updateStatus(supabase, {
        state: "partial",
        started_at: new Date(startTime).toISOString(),
        stats: {
          processed: groupsProcessed,
          remaining: failedGroupIds.length,
          elapsed_ms: Date.now() - startTime,
        },
        remaining_ids: failedGroupIds.length > 0 ? failedGroupIds : undefined,
      });

      return NextResponse.json({
        message: "League processing timed out during post-processing",
        groupsProcessed,
      });
    }

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
      for (let i = userIds.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [userIds[i], userIds[j]] = [userIds[j], userIds[i]];
      }

      const groupSize = 30;
      for (let i = 0; i < userIds.length; i += groupSize) {
        const chunk = userIds.slice(i, i + groupSize);

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

    // Reset weekly_anime_plays for all users
    await supabase
      .from("weekly_anime_plays")
      .delete()
      .lt("week_start", newWeekStart);

    const elapsed = Date.now() - startTime;

    await updateStatus(supabase, {
      state: "completed",
      completed_at: new Date().toISOString(),
      stats: {
        processed: groupsProcessed,
        remaining: failedGroupIds.length,
        elapsed_ms: elapsed,
      },
    });

    trackEvent("league_processing", undefined, {
      groups_processed: groupsProcessed,
      groups_remaining: 0,
      elapsed_ms: elapsed,
      state: "completed",
    }).catch(() => {});

    return NextResponse.json({
      message: "League processing complete",
      groupsProcessed,
      usersProcessed: userNewLeagues.size,
    });
  } catch (error) {
    console.error("League processing failed:", error);

    await updateStatus(supabase, {
      state: "failed",
      failed_at: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error",
      stats: { processed: 0, remaining: 0, elapsed_ms: Date.now() - startTime },
    });

    return NextResponse.json(
      { error: "League processing failed" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return processLeagueGroups();
}
