"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, LogIn, X } from "lucide-react";
import type { AnimeSeries } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import AnimeCard from "@/components/AnimeCard";

interface BrowseContentProps {
  animeList: AnimeSeries[];
}

const BrowseContent = ({ animeList }: BrowseContentProps) => {
  const router = useRouter();
  const { user, ageGroup } = useAuth();
  const [search, setSearch] = useState("");
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);

  // Age-based filtering for authenticated users
  const visibleAnime = animeList.filter((anime) => {
    if (!user) return true; // Guests see all cards (with intercept on restricted)
    if (ageGroup === "junior") return anime.content_rating === "E";
    if (ageGroup === "teen")
      return anime.content_rating === "E" || anime.content_rating === "T";
    return true; // full
  });

  const filtered = visibleAnime.filter((anime) =>
    anime.title.toLowerCase().includes(search.toLowerCase())
  );

  const isRestricted = (rating: string) => {
    if (user) return false; // Authenticated users only see what they're allowed
    return rating === "T" || rating === "M";
  };

  const handleCardClick = (anime: AnimeSeries, e: React.MouseEvent) => {
    if (isRestricted(anime.content_rating)) {
      e.preventDefault();
      setShowSignInPrompt(true);
    }
  };

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
            <div
              key={anime.id}
              onClick={(e) => handleCardClick(anime, e)}
              className={
                isRestricted(anime.content_rating) ? "cursor-pointer" : ""
              }
            >
              <AnimeCard
                anime={anime}
                index={i}
                restricted={isRestricted(anime.content_rating)}
              />
            </div>
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

      {/* Sign-in prompt modal */}
      <AnimatePresence>
        {showSignInPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
            onClick={() => setShowSignInPrompt(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-surface border border-white/10 rounded-2xl p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold">Sign In Required</h3>
                <button
                  onClick={() => setShowSignInPrompt(false)}
                  className="text-white/40 hover:text-white/70 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <p className="text-white/60 text-sm mb-6">
                Sign in or create an account to access this anime quiz. Age
                verification helps us show you the right content.
              </p>
              <button
                onClick={() => router.push("/auth")}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors min-h-[44px]"
              >
                <LogIn size={18} />
                Sign In / Sign Up
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BrowseContent;
