import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { trackEvent } from "@/lib/analytics";

// Vercel Cron: runs every 6 hours for bracket advancement
// Configured in vercel.json

const CRON_SECRET = process.env.CRON_SECRET;
const STATUS_KEY = "grand_prix_status";
const TIMEOUT_MS = 45_000;
const STALE_THRESHOLD_MS = 5 * 60 * 1000;

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

interface CronStatus {
  state: "idle" | "in_progress" | "completed" | "failed" | "partial";
  started_at?: string;
  completed_at?: string;
  failed_at?: string;
  error?: string;
  stats?: {
    phase: string;
    tournaments_processed: number;
    elapsed_ms: number;
  };
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

export async function processGrandPrix(skipPhases?: string[]) {
  const supabase = createServiceClient();
  const startTime = Date.now();

  // Double-run guard
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
    stats: { phase: "starting", tournaments_processed: 0, elapsed_ms: 0 },
  });

  try {
    const now = new Date();
    const isFirstOfMonth = now.getUTCDate() === 1;
    const monthStart = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-01`;
    const completedPhases: string[] = [];
    let tournamentsProcessed = 0;

    // ── Phase 1: Qualify + Seed (1st of month) ─────────────────────

    if (isFirstOfMonth && !skipPhases?.includes("qualify")) {
      await updateStatus(supabase, {
        state: "in_progress",
        started_at: new Date(startTime).toISOString(),
        stats: { phase: "qualify", tournaments_processed: 0, elapsed_ms: Date.now() - startTime },
      });

      const { data: existing } = await supabase
        .from("grand_prix_tournaments")
        .select("id")
        .eq("month_start", monthStart)
        .single();

      if (!existing) {
        const prevMonth = new Date(now);
        prevMonth.setUTCMonth(prevMonth.getUTCMonth() - 1);
        const prevMonthStart = `${prevMonth.getUTCFullYear()}-${String(prevMonth.getUTCMonth() + 1).padStart(2, "0")}-01`;

        const { data: championLeague } = await supabase
          .from("leagues")
          .select("id")
          .eq("tier", 6)
          .single();

        if (championLeague) {
          const { data: championMembers } = await supabase
            .from("league_memberships")
            .select("user_id")
            .eq("league_id", championLeague.id);

          if (championMembers && championMembers.length >= 2) {
            const championUserIds = championMembers.map((m) => m.user_id);

            const { data: xpData } = await supabase
              .from("quiz_sessions")
              .select("user_id, xp_earned")
              .in("user_id", championUserIds)
              .gte("completed_at", prevMonthStart)
              .lt("completed_at", monthStart);

            const xpMap = new Map<string, number>();
            for (const row of xpData ?? []) {
              xpMap.set(row.user_id, (xpMap.get(row.user_id) ?? 0) + row.xp_earned);
            }

            const ranked = Array.from(xpMap.entries())
              .sort((a, b) => b[1] - a[1])
              .slice(0, 16);

            if (ranked.length >= 2) {
              while (ranked.length < 16) {
                ranked.push(["bye", 0]);
              }

              const userIds = ranked.filter(([id]) => id !== "bye").map(([id]) => id);
              const { data: profiles } = await supabase
                .from("user_profiles")
                .select("id, display_name, username")
                .in("id", userIds);

              const profileMap = new Map<string, string>();
              for (const p of profiles ?? []) {
                profileMap.set(p.id, p.display_name ?? p.username ?? "Player");
              }

              const seeds = ranked.map(([userId], idx) => ({
                seed: idx + 1,
                userId,
                username: userId === "bye" ? "BYE" : (profileMap.get(userId) ?? "Player"),
              }));

              const rounds = ROUND_LABELS.map((label, idx) => {
                const matchCount = 8 / Math.pow(2, idx);
                const matchRefs = [];
                for (let m = 0; m < matchCount; m++) {
                  if (idx === 0) {
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

              const { data: tournament } = await supabase
                .from("grand_prix_tournaments")
                .insert({
                  month_start: monthStart,
                  status: "in_progress",
                  bracket_data: bracketData,
                })
                .select()
                .single();

              if (tournament) {
                const { data: allAnime } = await supabase
                  .from("anime_series")
                  .select("id")
                  .eq("is_active", true);

                const animeIds = (allAnime ?? []).map((a) => a.id);
                const pickAnime = () => animeIds[Math.floor(Math.random() * animeIds.length)];

                const deadline = new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString();

                for (let m = 0; m < 8; m++) {
                  const p1 = seeds[m];
                  const p2 = seeds[15 - m];

                  const p1Id = p1.userId === "bye" ? null : p1.userId;
                  const p2Id = p2.userId === "bye" ? null : p2.userId;

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
                  await supabase.from("user_badges").upsert(qualifierInserts, {
                    onConflict: "user_id,badge_id",
                    ignoreDuplicates: true,
                  });
                }
              }
            }
          }
        }
      }
      completedPhases.push("qualify");
    }

    // Timeout check between phases
    if (Date.now() - startTime > TIMEOUT_MS) {
      await updateStatus(supabase, {
        state: "partial",
        started_at: new Date(startTime).toISOString(),
        stats: {
          phase: "qualify",
          tournaments_processed: 0,
          elapsed_ms: Date.now() - startTime,
        },
        remaining_ids: ["advance_bracket", "cleanup_qualifying"],
      });

      trackEvent("grand_prix_processing", undefined, {
        completed_phases: completedPhases,
        elapsed_ms: Date.now() - startTime,
        state: "partial",
      }).catch(() => {});

      return NextResponse.json({
        message: "Grand Prix timed out after qualification phase",
        completedPhases,
      });
    }

    // ── Phase 2: Advance Bracket ─────────────────────────────────

    if (!skipPhases?.includes("advance_bracket")) {
      await updateStatus(supabase, {
        state: "in_progress",
        started_at: new Date(startTime).toISOString(),
        stats: { phase: "advance_bracket", tournaments_processed: 0, elapsed_ms: Date.now() - startTime },
      });

      const { data: activeTournaments } = await supabase
        .from("grand_prix_tournaments")
        .select("*")
        .eq("status", "in_progress");

      for (const tournament of activeTournaments ?? []) {
        try {
          // Timeout check per tournament
          if (Date.now() - startTime > TIMEOUT_MS) {
            const remainingIds = (activeTournaments ?? [])
              .filter((t) => t.id !== tournament.id)
              .map((t) => t.id as string);

            await updateStatus(supabase, {
              state: "partial",
              started_at: new Date(startTime).toISOString(),
              stats: {
                phase: "advance_bracket",
                tournaments_processed: tournamentsProcessed,
                elapsed_ms: Date.now() - startTime,
              },
              remaining_ids: ["advance_bracket", "cleanup_qualifying", ...remainingIds],
            });

            return NextResponse.json({
              message: "Grand Prix timed out during bracket advancement",
              completedPhases,
              tournamentsProcessed,
            });
          }

          // Check for expired matches and auto-forfeit
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

          if (!allMatches) {
            tournamentsProcessed++;
            continue;
          }

          const roundsMap = new Map<number, typeof allMatches>();
          for (const m of allMatches) {
            const arr = roundsMap.get(m.round) ?? [];
            arr.push(m);
            roundsMap.set(m.round, arr);
          }

          const maxRound = Math.max(...roundsMap.keys());
          const currentRoundMatches = roundsMap.get(maxRound) ?? [];
          const allResolved = currentRoundMatches.every(
            (m) => m.status === "completed" || m.status === "forfeit"
          );

          if (!allResolved) {
            tournamentsProcessed++;
            continue;
          }

          // If this was the final (4th round), complete the tournament
          if (maxRound >= 4) {
            const finalMatch = currentRoundMatches[0];
            if (finalMatch?.winner_id) {
              await supabase
                .from("grand_prix_tournaments")
                .update({
                  status: "completed",
                  winner_id: finalMatch.winner_id,
                })
                .eq("id", tournament.id);

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
            tournamentsProcessed++;
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

          tournamentsProcessed++;
        } catch (tournamentError) {
          console.error(`Failed to process tournament ${tournament.id}:`, tournamentError);
        }
      }
      completedPhases.push("advance_bracket");
    }

    // Timeout check before cleanup phase
    if (Date.now() - startTime > TIMEOUT_MS) {
      await updateStatus(supabase, {
        state: "partial",
        started_at: new Date(startTime).toISOString(),
        stats: {
          phase: "advance_bracket",
          tournaments_processed: tournamentsProcessed,
          elapsed_ms: Date.now() - startTime,
        },
        remaining_ids: ["cleanup_qualifying"],
      });

      trackEvent("grand_prix_processing", undefined, {
        completed_phases: completedPhases,
        tournaments_processed: tournamentsProcessed,
        elapsed_ms: Date.now() - startTime,
        state: "partial",
      }).catch(() => {});

      return NextResponse.json({
        message: "Grand Prix timed out before cleanup phase",
        completedPhases,
        tournamentsProcessed,
      });
    }

    // ── Phase 3: Clean up expired qualifying tournaments ─────────

    if (!skipPhases?.includes("cleanup_qualifying")) {
      await updateStatus(supabase, {
        state: "in_progress",
        started_at: new Date(startTime).toISOString(),
        stats: { phase: "cleanup_qualifying", tournaments_processed: tournamentsProcessed, elapsed_ms: Date.now() - startTime },
      });

      const { data: qualifyingTournaments } = await supabase
        .from("grand_prix_tournaments")
        .select("id, month_start")
        .eq("status", "qualifying");

      for (const t of qualifyingTournaments ?? []) {
        const tournamentMonth = new Date(t.month_start);
        if (now.getUTCMonth() !== tournamentMonth.getUTCMonth() ||
            now.getUTCFullYear() !== tournamentMonth.getUTCFullYear()) {
          await supabase
            .from("grand_prix_tournaments")
            .update({ status: "completed" })
            .eq("id", t.id);
        }
      }
      completedPhases.push("cleanup_qualifying");
    }

    const elapsed = Date.now() - startTime;

    await updateStatus(supabase, {
      state: "completed",
      completed_at: new Date().toISOString(),
      stats: {
        phase: "done",
        tournaments_processed: tournamentsProcessed,
        elapsed_ms: elapsed,
      },
    });

    trackEvent("grand_prix_processing", undefined, {
      completed_phases: completedPhases,
      tournaments_processed: tournamentsProcessed,
      elapsed_ms: elapsed,
      state: "completed",
    }).catch(() => {});

    return NextResponse.json({
      message: "Grand Prix processing complete",
      timestamp: now.toISOString(),
      completedPhases,
      tournamentsProcessed,
    });
  } catch (error) {
    console.error("Grand Prix processing failed:", error);

    await updateStatus(supabase, {
      state: "failed",
      failed_at: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error",
      stats: { phase: "unknown", tournaments_processed: 0, elapsed_ms: Date.now() - startTime },
    });

    return NextResponse.json(
      { error: "Grand Prix processing failed" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return processGrandPrix();
}
