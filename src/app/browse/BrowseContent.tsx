"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, LogIn, X } from "lucide-react";
import type { AnimeRegistryEntry } from "@/data/anime/registry";
import { useAuth } from "@/contexts/AuthContext";
import AnimeCard from "@/components/AnimeCard";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";

interface BrowseContentProps {
  animeList: readonly AnimeRegistryEntry[];
}

const BrowseContent = ({ animeList }: BrowseContentProps) => {
  const router = useRouter();
  const { user, ageGroup } = useAuth();
  const [search, setSearch] = useState("");
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);

  // Client-side defense-in-depth — server has already filtered, but the
  // auth context may differ for hydration edge cases.
  const visibleAnime = animeList.filter((anime) => {
    if (!user) return true;
    if (ageGroup === "junior") return anime.contentRating === "E";
    if (ageGroup === "teen")
      return anime.contentRating === "E" || anime.contentRating === "T";
    return true;
  });

  const filtered = visibleAnime.filter((anime) =>
    anime.displayName.toLowerCase().includes(search.toLowerCase())
  );

  const isRestricted = (rating: string) => {
    if (user) return false;
    return rating === "T" || rating === "M";
  };

  const handleCardClick = (anime: AnimeRegistryEntry, e: React.MouseEvent) => {
    if (isRestricted(anime.contentRating)) {
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
        className="mb-8 max-w-md"
      >
        <Input
          type="text"
          aria-label="Search anime"
          placeholder="Search anime..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leadingIcon={<Search size={18} />}
        />
      </motion.div>

      {/* Anime grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((anime, i) => (
            <div
              key={anime.slug}
              onClick={(e) => handleCardClick(anime, e)}
              className={
                isRestricted(anime.contentRating) ? "cursor-pointer" : ""
              }
            >
              <AnimeCard
                anime={anime}
                index={i}
                restricted={isRestricted(anime.contentRating)}
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
      <Modal
        isOpen={showSignInPrompt}
        onClose={() => setShowSignInPrompt(false)}
        presentation="center"
        header={
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-lg font-bold">Sign In Required</h3>
            <Button
              variant="icon"
              onClick={() => setShowSignInPrompt(false)}
              aria-label="Dismiss sign-in prompt"
            >
              <X size={20} />
            </Button>
          </div>
        }
        footer={
          <Button onClick={() => router.push("/auth")} className="w-full">
            <LogIn size={18} />
            Sign In / Sign Up
          </Button>
        }
      >
        <p className="text-white/60 text-sm">
          Sign in or create an account to access this anime quiz. Age
          verification helps us show you the right content.
        </p>
      </Modal>
    </div>
  );
};

export default BrowseContent;
