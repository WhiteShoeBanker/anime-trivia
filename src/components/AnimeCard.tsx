"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { AnimeSeries } from "@/types";

interface AnimeCardProps {
  anime: AnimeSeries;
  index?: number;
}

const gradients = [
  "from-purple-600 to-blue-500",
  "from-primary to-yellow-500",
  "from-accent to-pink-500",
  "from-success to-emerald-400",
  "from-blue-500 to-cyan-400",
  "from-red-500 to-orange-400",
  "from-violet-500 to-purple-400",
  "from-amber-500 to-yellow-400",
];

const AnimeCard = ({ anime, index = 0 }: AnimeCardProps) => {
  const gradient = gradients[index % gradients.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ scale: 1.03 }}
    >
      <Link href={`/quiz/${anime.slug}`} className="block group">
        <div className="bg-surface rounded-2xl border border-white/10 overflow-hidden transition-shadow hover:shadow-lg hover:shadow-primary/10">
          {/* Gradient placeholder image */}
          <div
            className={`relative h-[200px] bg-gradient-to-br ${gradient} flex items-end p-4`}
          >
            <h3 className="text-xl font-bold text-white drop-shadow-lg">
              {anime.title}
            </h3>
          </div>

          {/* Card body */}
          <div className="p-4">
            {/* Genre pills */}
            <div className="flex flex-wrap gap-2 mb-3">
              {anime.genre.map((g) => (
                <span
                  key={g}
                  className="px-2 py-1 rounded-full text-xs bg-white/10 text-white/70"
                >
                  {g}
                </span>
              ))}
            </div>

            {/* Question count */}
            <p className="text-sm text-white/50">
              {anime.total_questions} questions
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default AnimeCard;
