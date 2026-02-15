"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import type { AnimeSeries } from "@/types";
import AnimeCard from "@/components/AnimeCard";

interface BrowseContentProps {
  animeList: AnimeSeries[];
}

const BrowseContent = ({ animeList }: BrowseContentProps) => {
  const [search, setSearch] = useState("");

  const filtered = animeList.filter((anime) =>
    anime.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          Choose Your Anime
        </h1>
        <p className="text-white/50">
          Pick a series and test your knowledge
        </p>
      </motion.div>

      {/* Search bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative mb-8 max-w-md"
      >
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
        />
        <input
          type="text"
          placeholder="Search anime..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50 transition-colors"
        />
      </motion.div>

      {/* Anime grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((anime, i) => (
            <AnimeCard key={anime.id} anime={anime} index={i} />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <p className="text-xl text-white/40 mb-2">No anime found</p>
          <p className="text-sm text-white/30">
            {search
              ? "Try a different search term"
              : "Check back soon for new series!"}
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default BrowseContent;
