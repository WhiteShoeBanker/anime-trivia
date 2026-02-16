"use client";

import { motion } from "framer-motion";
import type { BracketData, GrandPrixMatch } from "@/types";

interface TournamentBracketProps {
  bracketData: BracketData;
  matches: GrandPrixMatch[];
  currentUserId?: string;
  onMatchClick?: (matchId: string) => void;
}

const getPlayerName = (
  userId: string | null,
  bracketData: BracketData
): string => {
  if (!userId) return "TBD";
  const seed = bracketData.seeds.find((s) => s.userId === userId);
  return seed?.username ?? "Player";
};

const TournamentBracket = ({
  bracketData,
  matches,
  currentUserId,
  onMatchClick,
}: TournamentBracketProps) => {
  // Group matches by round
  const matchesByRound = new Map<number, GrandPrixMatch[]>();
  for (const match of matches) {
    const roundMatches = matchesByRound.get(match.round) ?? [];
    roundMatches.push(match);
    matchesByRound.set(match.round, roundMatches);
  }

  return (
    <div className="overflow-x-auto pb-4 -mx-4 px-4">
      <div className="flex gap-4 min-w-[800px]">
        {bracketData.rounds.map((round, roundIdx) => {
          const roundMatches = matchesByRound.get(round.round) ?? [];

          return (
            <div key={round.round} className="flex-1 min-w-[180px]">
              {/* Round label */}
              <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3 text-center">
                {round.label}
              </p>

              {/* Matches in this round */}
              <div
                className="flex flex-col justify-around h-full gap-3"
                style={{ minHeight: roundIdx === 0 ? "auto" : undefined }}
              >
                {roundMatches
                  .sort((a, b) => a.match_number - b.match_number)
                  .map((match, matchIdx) => {
                    const isCurrentUserMatch =
                      currentUserId &&
                      (match.player1_id === currentUserId ||
                        match.player2_id === currentUserId);

                    const isCompleted =
                      match.status === "completed" || match.status === "forfeit";

                    return (
                      <motion.button
                        key={match.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: roundIdx * 0.1 + matchIdx * 0.05 }}
                        onClick={() => onMatchClick?.(match.id)}
                        className={`rounded-xl border p-3 text-left transition-colors ${
                          isCurrentUserMatch
                            ? "border-primary/50 bg-primary/10"
                            : "border-white/10 bg-surface"
                        } ${onMatchClick ? "hover:border-white/20 cursor-pointer" : "cursor-default"}`}
                      >
                        {/* Player 1 */}
                        <div
                          className={`flex items-center justify-between text-sm py-1 ${
                            match.winner_id === match.player1_id && isCompleted
                              ? "text-success font-semibold"
                              : match.player1_id === currentUserId
                                ? "text-primary"
                                : "text-white/70"
                          }`}
                        >
                          <span className="truncate max-w-[120px]">
                            {getPlayerName(match.player1_id, bracketData)}
                          </span>
                          <span className="ml-2 tabular-nums">
                            {match.player1_score ?? "-"}
                          </span>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-white/5 my-1" />

                        {/* Player 2 */}
                        <div
                          className={`flex items-center justify-between text-sm py-1 ${
                            match.winner_id === match.player2_id && isCompleted
                              ? "text-success font-semibold"
                              : match.player2_id === currentUserId
                                ? "text-primary"
                                : "text-white/70"
                          }`}
                        >
                          <span className="truncate max-w-[120px]">
                            {getPlayerName(match.player2_id, bracketData)}
                          </span>
                          <span className="ml-2 tabular-nums">
                            {match.player2_score ?? "-"}
                          </span>
                        </div>

                        {/* Status indicator */}
                        {!isCompleted && (
                          <p className="text-[10px] text-white/30 mt-1 text-center">
                            {match.status === "pending"
                              ? "Awaiting players"
                              : "In progress"}
                          </p>
                        )}
                      </motion.button>
                    );
                  })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TournamentBracket;
