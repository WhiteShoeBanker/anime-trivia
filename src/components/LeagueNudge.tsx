"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Zap, ArrowRight } from "lucide-react";
import { getRandomUnplayedAnime } from "@/lib/league-xp";

interface LeagueNudgeProps {
  userId: string;
  leagueXp: number;
  multiplier: number;
  playCount: number;
  animeName: string;
}

const LeagueNudge = ({
  userId,
  leagueXp,
  multiplier,
  playCount,
  animeName,
}: LeagueNudgeProps) => {
  const [suggestedAnime, setSuggestedAnime] = useState<{
    title: string;
    slug: string;
  } | null>(null);

  useEffect(() => {
    const fetchSuggestion = async () => {
      const anime = await getRandomUnplayedAnime(userId);
      if (anime) {
        setSuggestedAnime({ title: anime.title, slug: anime.slug });
      }
    };
    fetchSuggestion();
  }, [userId]);

  const percentLabel = Math.round(multiplier * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 mt-4"
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Zap size={16} className="text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-amber-300 mb-1">
            Diminishing Returns Active
          </p>
          <p className="text-sm text-white/60">
            You earned{" "}
            <span className="font-bold text-amber-300">+{leagueXp}</span>{" "}
            league XP ({percentLabel}% — already played {animeName}{" "}
            {playCount} {playCount === 1 ? "time" : "times"} this week).
          </p>
          {suggestedAnime && (
            <Link
              href={`/quiz/${suggestedAnime.slug}`}
              className="inline-flex items-center gap-1.5 mt-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              Try {suggestedAnime.title} for full XP
              <ArrowRight size={14} />
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default LeagueNudge;
