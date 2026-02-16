import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

// Vercel Cron: runs every 6 hours for bracket advancement
// Configured in vercel.json

const CRON_SECRET = process.env.CRON_SECRET;

// Monthly emblem templates — cycled through
const EMBLEM_ICONS = [
  { icon_name: "Trophy", description: "Champion of the Otaku Grand Prix" },
  { icon_name: "Crown", description: "Crowned champion of the Grand Prix" },
  { icon_name: "Star", description: "Star champion of the Grand Prix" },
  { icon_name: "Gem", description: "Grand Prix diamond champion" },
  { icon_name: "Flame", description: "Grand Prix blazing champion" },
  { icon_name: "Shield", description: "Grand Prix legendary defender" },
  { icon_name: "Swords", description: "Grand Prix master duelist" },
  { icon_name: "Zap", description: "Grand Prix lightning champion" },
  { icon_name: "Award", description: "Grand Prix distinguished champion" },
  { icon_name: "Medal", description: "Grand Prix medal of honor" },
  { icon_name: "Target", description: "Grand Prix precision champion" },
  { icon_name: "Rocket", description: "Grand Prix rocket champion" },
];

const ROUND_LABELS = ["Round of 16", "Quarterfinals", "Semifinals", "Final"];

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

  try {
    const now = new Date();
    const isFirstOfMonth = now.getUTCDate() === 1;
    const monthStart = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-01`;

    // ── 1. Qualify + Seed (1st of month) ─────────────────────────

    if (isFirstOfMonth) {
      // Check if tournament already exists for this month
      const { data: existing } = await supabase
        .from("grand_prix_tournaments")
        .select("id")
        .eq("month_start", monthStart)
        .single();

      if (!existing) {
        // Get top 16 Champion league (tier 6) players by monthly XP
        const prevMonth = new Date(now);
        prevMonth.setUTCMonth(prevMonth.getUTCMonth() - 1);
        const prevMonthStart = `${prevMonth.getUTCFullYear()}-${String(prevMonth.getUTCMonth() + 1).padStart(2, "0")}-01`;

        // Get Champion league members
        const { data: championLeague } = await supabase
          .from("leagues")
          .select("id")
          .eq("tier", 6)
          .single();

        if (!championLeague) {
          return NextResponse.json({ message: "No Champion league found" });
        }

        const { data: championMembers } = await supabase
          .from("league_memberships")
          .select("user_id")
          .eq("league_id", championLeague.id);

        if (!championMembers || championMembers.length < 2) {
          return NextResponse.json({ message: "Not enough Champion players" });
        }

        const championUserIds = championMembers.map((m) => m.user_id);

        // Sum XP earned from quiz_sessions during previous month
        const { data: xpData } = await supabase
          .from("quiz_sessions")
          .select("user_id, xp_earned")
          .in("user_id", championUserIds)
          .gte("completed_at", prevMonthStart)
          .lt("completed_at", monthStart);

        // Aggregate XP per user
        const xpMap = new Map<string, number>();
        for (const row of xpData ?? []) {
          xpMap.set(row.user_id, (xpMap.get(row.user_id) ?? 0) + row.xp_earned);
        }

        // Sort by XP, take top 16
        const ranked = Array.from(xpMap.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 16);

        if (ranked.length < 2) {
          return NextResponse.json({ message: "Not enough qualifying players" });
        }

        // Pad to 16 if needed (byes for missing slots)
        while (ranked.length < 16) {
          ranked.push(["bye", 0]);
        }

        // Get usernames for bracket display
        const userIds = ranked.filter(([id]) => id !== "bye").map(([id]) => id);
        const { data: profiles } = await supabase
          .from("user_profiles")
          .select("id, display_name, username")
          .in("id", userIds);

        const profileMap = new Map<string, string>();
        for (const p of profiles ?? []) {
          profileMap.set(p.id, p.display_name ?? p.username ?? "Player");
        }

        // Build seeds
        const seeds = ranked.map(([userId], idx) => ({
          seed: idx + 1,
          userId,
          username: userId === "bye" ? "BYE" : (profileMap.get(userId) ?? "Player"),
        }));

        // Build bracket rounds
        const rounds = ROUND_LABELS.map((label, idx) => {
          const matchCount = 8 / Math.pow(2, idx);
          const matchRefs = [];
          for (let m = 0; m < matchCount; m++) {
            if (idx === 0) {
              // Seeded matchups: 1v16, 2v15, 3v14, etc.
              matchRefs.push({
                matchNumber: m + 1,
                player1Seed: m + 1,
                player2Seed: 16 - m,
              });
            } else {
              matchRefs.push({
                matchNumber: m + 1,
                player1Seed: 0,
                player2Seed: 0,
              });
            }
          }
          return { round: idx + 1, label, matches: matchRefs };
        });

        const bracketData = { seeds, rounds };

        // Create tournament
        const { data: tournament } = await supabase
          .from("grand_prix_tournaments")
          .insert({
            month_start: monthStart,
            status: "in_progress",
            bracket_data: bracketData,
          })
          .select()
          .single();

        if (!tournament) {
          return NextResponse.json({ error: "Failed to create tournament" }, { status: 500 });
        }

        // Pick random anime for each round-1 match
        const { data: allAnime } = await supabase
          .from("anime_series")
          .select("id")
          .eq("is_active", true);

        const animeIds = (allAnime ?? []).map((a) => a.id);
        const pickAnime = () => animeIds[Math.floor(Math.random() * animeIds.length)];

        // Create round 1 matches
        const deadline = new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString();

        for (let m = 0; m < 8; m++) {
          const p1 = seeds[m];
          const p2 = seeds[15 - m];

          const p1Id = p1.userId === "bye" ? null : p1.userId;
          const p2Id = p2.userId === "bye" ? null : p2.userId;

          // Handle byes: if one player is bye, auto-advance the other
          const isBye = !p1Id || !p2Id;

          await supabase.from("grand_prix_matches").insert({
            tournament_id: tournament.id,
            round: 1,
            match_number: m + 1,
            player1_id: p1Id,
            player2_id: p2Id,
            winner_id: isBye ? (p1Id ?? p2Id) : null,
            anime_id: isBye ? null : pickAnime(),
            status: isBye ? "completed" : "pending",
            deadline_at: isBye ? null : deadline,
          });
        }

        // Create monthly emblem
        const monthIdx = now.getUTCMonth();
        const emblemTemplate = EMBLEM_ICONS[monthIdx % EMBLEM_ICONS.length];
        const monthLabel = now.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
          timeZone: "UTC",
        });

        await supabase.from("grand_prix_emblems").insert({
          tournament_id: tournament.id,
          name: `Grand Prix Champion — ${monthLabel}`,
          description: emblemTemplate.description,
          icon_name: emblemTemplate.icon_name,
          icon_color: "#FFD700",
          month_label: monthLabel,
          rarity: "legendary",
        });

        // Award gp-qualifier badge to all participants
        const { data: qualifierBadge } = await supabase
          .from("badges")
          .select("id")
          .eq("slug", "gp-qualifier")
          .single();

        if (qualifierBadge) {
          const qualifierInserts = userIds.map((uid) => ({
            user_id: uid,
            badge_id: qualifierBadge.id,
          }));
          // Upsert to avoid duplicates for returning qualifiers
          await supabase.from("user_badges").upsert(qualifierInserts, {
            onConflict: "user_id,badge_id",
            ignoreDuplicates: true,
          });
        }
      }
    }

    // ── 2. Advance Bracket ─────────────────────────────────────

    const { data: activeTournaments } = await supabase
      .from("grand_prix_tournaments")
      .select("*")
      .eq("status", "in_progress");

    for (const tournament of activeTournaments ?? []) {
      // Check for expired matches (past deadline) and auto-forfeit
      const { data: expiredMatches } = await supabase
        .from("grand_prix_matches")
        .select("*")
        .eq("tournament_id", tournament.id)
        .in("status", ["pending", "player1_done", "player2_done"])
        .lt("deadline_at", now.toISOString());

      for (const match of expiredMatches ?? []) {
        let winnerId: string | null = null;

        if (match.status === "player1_done") {
          winnerId = match.player1_id;
        } else if (match.status === "player2_done") {
          winnerId = match.player2_id;
        } else {
          // Neither played — higher seed (player1) advances
          winnerId = match.player1_id;
        }

        await supabase
          .from("grand_prix_matches")
          .update({
            status: "forfeit",
            winner_id: winnerId,
            played_at: now.toISOString(),
          })
          .eq("id", match.id);
      }

      // Check if all matches in the current round are resolved
      const { data: allMatches } = await supabase
        .from("grand_prix_matches")
        .select("*")
        .eq("tournament_id", tournament.id)
        .order("round", { ascending: true })
        .order("match_number", { ascending: true });

      if (!allMatches) continue;

      // Find highest active round
      const rounds = new Map<number, typeof allMatches>();
      for (const m of allMatches) {
        const arr = rounds.get(m.round) ?? [];
        arr.push(m);
        rounds.set(m.round, arr);
      }

      const maxRound = Math.max(...rounds.keys());

      // Check if all matches in the current max round are resolved
      const currentRoundMatches = rounds.get(maxRound) ?? [];
      const allResolved = currentRoundMatches.every(
        (m) => m.status === "completed" || m.status === "forfeit"
      );

      if (!allResolved) continue;

      // If this was the final (4th round), complete the tournament
      if (maxRound >= 4) {
        const finalMatch = currentRoundMatches[0];
        if (finalMatch?.winner_id) {
          // Complete tournament
          await supabase
            .from("grand_prix_tournaments")
            .update({
              status: "completed",
              winner_id: finalMatch.winner_id,
            })
            .eq("id", tournament.id);

          // Award emblem to winner
          const { data: emblem } = await supabase
            .from("grand_prix_emblems")
            .select("id")
            .eq("tournament_id", tournament.id)
            .single();

          if (emblem) {
            await supabase.from("user_emblems").upsert(
              {
                user_id: finalMatch.winner_id,
                emblem_id: emblem.id,
              },
              { onConflict: "user_id,emblem_id", ignoreDuplicates: true }
            );
          }

          // Award gp-winner badge
          const { data: winnerBadge } = await supabase
            .from("badges")
            .select("id")
            .eq("slug", "gp-winner")
            .single();

          if (winnerBadge) {
            await supabase.from("user_badges").upsert(
              {
                user_id: finalMatch.winner_id,
                badge_id: winnerBadge.id,
              },
              { onConflict: "user_id,badge_id", ignoreDuplicates: true }
            );
          }

          // Check for Triple Crown badge
          const { count: winCount } = await supabase
            .from("grand_prix_tournaments")
            .select("*", { count: "exact", head: true })
            .eq("winner_id", finalMatch.winner_id)
            .eq("status", "completed");

          if ((winCount ?? 0) >= 3) {
            const { data: tripleCrownBadge } = await supabase
              .from("badges")
              .select("id")
              .eq("slug", "gp-3-wins")
              .single();

            if (tripleCrownBadge) {
              await supabase.from("user_badges").upsert(
                {
                  user_id: finalMatch.winner_id,
                  badge_id: tripleCrownBadge.id,
                },
                { onConflict: "user_id,badge_id", ignoreDuplicates: true }
              );
            }
          }
        }
        continue;
      }

      // Create next round matches
      const nextRound = maxRound + 1;
      const { data: allAnime } = await supabase
        .from("anime_series")
        .select("id")
        .eq("is_active", true);

      const animeIds = (allAnime ?? []).map((a) => a.id);
      const pickAnime = () => animeIds[Math.floor(Math.random() * animeIds.length)];

      const deadline = new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString();

      // Pair winners: match 1 winner vs match 2 winner, etc.
      const sortedMatches = currentRoundMatches.sort(
        (a, b) => a.match_number - b.match_number
      );

      for (let i = 0; i < sortedMatches.length; i += 2) {
        const m1 = sortedMatches[i];
        const m2 = sortedMatches[i + 1];
        if (!m1 || !m2) continue;

        await supabase.from("grand_prix_matches").insert({
          tournament_id: tournament.id,
          round: nextRound,
          match_number: Math.floor(i / 2) + 1,
          player1_id: m1.winner_id,
          player2_id: m2.winner_id,
          anime_id: pickAnime(),
          status: "pending",
          deadline_at: deadline,
        });
      }
    }

    // ── 3. Clean up expired qualifying tournaments ─────────────

    const { data: qualifyingTournaments } = await supabase
      .from("grand_prix_tournaments")
      .select("id, month_start")
      .eq("status", "qualifying");

    for (const t of qualifyingTournaments ?? []) {
      const tournamentMonth = new Date(t.month_start);
      // If it's past the tournament month, mark as completed
      if (now.getUTCMonth() !== tournamentMonth.getUTCMonth() ||
          now.getUTCFullYear() !== tournamentMonth.getUTCFullYear()) {
        await supabase
          .from("grand_prix_tournaments")
          .update({ status: "completed" })
          .eq("id", t.id);
      }
    }

    return NextResponse.json({
      message: "Grand Prix processing complete",
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error("Grand Prix processing failed:", error);
    return NextResponse.json(
      { error: "Grand Prix processing failed" },
      { status: 500 }
    );
  }
}
