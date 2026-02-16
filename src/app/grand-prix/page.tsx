"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Trophy, ChevronDown, ChevronUp, Swords, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getCurrentTournament,
  getTournamentMatches,
  getTournamentEmblem,
  getPastWinners,
  getUserPendingMatch,
} from "@/lib/grand-prix";
import TournamentBracket from "@/components/TournamentBracket";
import MonthlyEmblem from "@/components/MonthlyEmblem";
import type {
  GrandPrixTournament,
  GrandPrixMatch,
  GrandPrixEmblem,
} from "@/types";

const GrandPrixPage = () => {
  const { user } = useAuth();
  const [tournament, setTournament] = useState<GrandPrixTournament | null>(null);
  const [matches, setMatches] = useState<GrandPrixMatch[]>([]);
  const [emblem, setEmblem] = useState<GrandPrixEmblem | null>(null);
  const [pastTournaments, setPastTournaments] = useState<GrandPrixTournament[]>([]);
  const [pastEmblems, setPastEmblems] = useState<Map<string, GrandPrixEmblem>>(new Map());
  const [pendingMatch, setPendingMatch] = useState<GrandPrixMatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [t, past] = await Promise.all([
        getCurrentTournament(),
        getPastWinners(6),
      ]);

      setTournament(t);
      setPastTournaments(past);

      if (t) {
        const [m, e] = await Promise.all([
          getTournamentMatches(t.id),
          getTournamentEmblem(t.id),
        ]);
        setMatches(m);
        setEmblem(e);

        if (user && t.status === "in_progress") {
          const pm = await getUserPendingMatch(user.id, t.id);
          setPendingMatch(pm);
        }
      }

      // Fetch emblems for past tournaments
      const emblemMap = new Map<string, GrandPrixEmblem>();
      for (const pt of past) {
        const pe = await getTournamentEmblem(pt.id);
        if (pe) emblemMap.set(pt.id, pe);
      }
      setPastEmblems(emblemMap);
    } catch {
      // Failed to load
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 30-second polling for live updates
  useEffect(() => {
    if (!tournament || tournament.status === "completed") return;

    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [tournament, fetchData]);

  const getMonthLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <Trophy size={40} className="mx-auto text-yellow-400 mb-2" />
        <h1 className="text-2xl font-bold">Otaku Grand Prix</h1>
        <p className="text-sm text-white/40">
          {tournament
            ? getMonthLabel(tournament.month_start)
            : "Monthly Champion Tournament"}
        </p>
      </motion.div>

      {/* Current Tournament State */}
      {!tournament ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-surface rounded-2xl border border-white/10 p-6 text-center"
        >
          <Swords size={32} className="mx-auto text-white/20 mb-3" />
          <h2 className="text-lg font-semibold mb-2">No Active Tournament</h2>
          <p className="text-sm text-white/40 max-w-md mx-auto">
            The Grand Prix features the top 16 Champion League players in a monthly
            single-elimination bracket. Reach Champion League to qualify!
          </p>
        </motion.div>
      ) : tournament.status === "qualifying" ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-surface rounded-2xl border border-white/10 p-6 text-center"
        >
          <Clock size={32} className="mx-auto text-yellow-400 mb-3" />
          <h2 className="text-lg font-semibold mb-2">Qualification Phase</h2>
          <p className="text-sm text-white/40">
            Top 16 Champion League players by monthly XP will qualify for the bracket.
            Keep earning XP to secure your spot!
          </p>
        </motion.div>
      ) : tournament.status === "in_progress" ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          {/* Pending match CTA */}
          {pendingMatch && (
            <div className="bg-primary/10 border border-primary/30 rounded-2xl p-4 text-center">
              <h3 className="font-semibold text-primary mb-2">Your Match is Ready!</h3>
              <p className="text-sm text-white/50 mb-3">
                Round {pendingMatch.round}, Match {pendingMatch.match_number}
              </p>
              <Link
                href={`/grand-prix/match/${pendingMatch.id}`}
                className="inline-block px-6 py-3 font-bold rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors"
              >
                Play Your Match
              </Link>
            </div>
          )}

          {/* Bracket */}
          {tournament.bracket_data && (
            <div className="bg-surface rounded-2xl border border-white/10 p-4">
              <h2 className="text-sm font-semibold text-white/70 mb-4">Tournament Bracket</h2>
              <TournamentBracket
                bracketData={tournament.bracket_data}
                matches={matches}
                currentUserId={user?.id}
                onMatchClick={(matchId) => {
                  const match = matches.find((m) => m.id === matchId);
                  if (
                    match &&
                    user &&
                    (match.player1_id === user.id || match.player2_id === user.id) &&
                    match.status !== "completed" &&
                    match.status !== "forfeit"
                  ) {
                    window.location.href = `/grand-prix/match/${matchId}`;
                  }
                }}
              />
            </div>
          )}
        </motion.div>
      ) : (
        /* Completed */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          {/* Winner + emblem */}
          {emblem && (
            <div className="bg-surface rounded-2xl border border-yellow-400/30 p-6 text-center">
              <MonthlyEmblem emblem={emblem} size="lg" />
              <h2 className="text-lg font-semibold mt-3">Tournament Champion</h2>
              <p className="text-sm text-white/40">
                Winner of the {getMonthLabel(tournament.month_start)} Grand Prix
              </p>
            </div>
          )}

          {/* Final bracket */}
          {tournament.bracket_data && (
            <div className="bg-surface rounded-2xl border border-white/10 p-4">
              <h2 className="text-sm font-semibold text-white/70 mb-4">Final Bracket</h2>
              <TournamentBracket
                bracketData={tournament.bracket_data}
                matches={matches}
                currentUserId={user?.id}
              />
            </div>
          )}
        </motion.div>
      )}

      {/* Past Winners */}
      {pastTournaments.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-sm font-semibold text-white/70 mb-3">Past Champions</h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {pastTournaments.map((pt) => {
              const pe = pastEmblems.get(pt.id);
              if (!pe) return null;
              return (
                <div key={pt.id} className="text-center">
                  <MonthlyEmblem emblem={pe} size="sm" />
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* How It Works */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-surface rounded-2xl border border-white/10"
      >
        <button
          onClick={() => setHowItWorksOpen(!howItWorksOpen)}
          className="w-full p-4 flex items-center justify-between text-left"
        >
          <span className="text-sm font-semibold text-white/70">How It Works</span>
          {howItWorksOpen ? (
            <ChevronUp size={16} className="text-white/40" />
          ) : (
            <ChevronDown size={16} className="text-white/40" />
          )}
        </button>
        {howItWorksOpen && (
          <div className="px-4 pb-4 space-y-3 text-sm text-white/50">
            <p>
              <strong className="text-white/70">Qualification:</strong> The top 16
              Champion League players by monthly XP earn a spot in the bracket.
            </p>
            <p>
              <strong className="text-white/70">Format:</strong> Single-elimination
              bracket (Round of 16, Quarterfinals, Semifinals, Final). Each match is a
              10-question Hard difficulty quiz on a randomly selected anime.
            </p>
            <p>
              <strong className="text-white/70">Async Play:</strong> You have 48 hours
              to complete each match. Both players take the same quiz independently —
              highest score wins. Time is the tiebreaker.
            </p>
            <p>
              <strong className="text-white/70">Rewards:</strong> The winner receives a
              unique collectible monthly emblem and the Grand Prix Champion badge. Collect
              them all!
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default GrandPrixPage;
