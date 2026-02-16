"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Tv } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getUserWeeklyPlays } from "@/lib/league-xp";
import { createClient } from "@/lib/supabase/client";
import type { AnimeSeries } from "@/types";

interface AnimePlayData {
  anime_id: string;
  play_count: number;
}

const AnimeDiversityTracker = () => {
  const { user } = useAuth();
  const [allAnime, setAllAnime] = useState<AnimeSeries[]>([]);
  const [playedAnime, setPlayedAnime] = useState<AnimePlayData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const supabase = createClient();
        const { data: anime } = await supabase
          .from("anime_series")
          .select("*")
          .eq("is_active", true)
          .order("title");

        setAllAnime((anime as AnimeSeries[]) ?? []);

        const plays = await getUserWeeklyPlays(user.id);
        setPlayedAnime(plays as unknown as AnimePlayData[]);
      } catch {
        // Failed to load
      }
      setLoading(false);
    };

    fetchData();
  }, [user]);

  if (loading || !user) return null;

  const playedIds = new Set(playedAnime.map((p) => p.anime_id));
  const playedCount = playedIds.size;
  const totalCount = allAnime.length;

  return (
    <div className="bg-surface rounded-2xl border border-white/10 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white/70">
          Anime Explored This Week
        </h3>
        <span className="text-sm font-bold text-primary">
          {playedCount} of {totalCount}
        </span>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
        {allAnime.map((anime, i) => {
          const isPlayed = playedIds.has(anime.id);
          return (
            <motion.div
              key={anime.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
              className={`relative aspect-square rounded-xl flex items-center justify-center text-center p-1 transition-all ${
                isPlayed
                  ? "bg-primary/20 border border-primary/50"
                  : "bg-white/5 border border-white/5 opacity-40"
              }`}
              title={anime.title}
            >
              <Tv
                size={16}
                className={isPlayed ? "text-primary" : "text-white/30"}
              />
              <span
                className={`absolute bottom-0.5 left-0.5 right-0.5 text-[8px] leading-tight truncate ${
                  isPlayed ? "text-white/80" : "text-white/30"
                }`}
              >
                {anime.title.length > 8
                  ? anime.title.slice(0, 8) + "..."
                  : anime.title}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="mt-3">
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{
              width: totalCount > 0
                ? `${(playedCount / totalCount) * 100}%`
                : "0%",
            }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  );
};

export default AnimeDiversityTracker;
