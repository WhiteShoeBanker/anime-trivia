"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Swords } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { AnimeSeries, DuelDifficulty } from "@/types";
import useReducedMotion from "@/lib/use-reduced-motion";
import { Button } from "@/components/ui/Button";
import { DifficultyChip } from "@/components/ui/DifficultyChip";
import { difficultyLabels } from "@/themes";

interface ChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  opponent: { id: string; username: string | null; display_name: string | null };
  onSend: (options: {
    anime_id: string | null;
    difficulty: DuelDifficulty;
    question_count: 5 | 10;
  }) => void;
  isJunior?: boolean;
  defaults?: {
    anime_id?: string;
    difficulty?: DuelDifficulty;
    question_count?: 5 | 10;
  };
}

const DIFFICULTIES: DuelDifficulty[] = [
  "easy",
  "medium",
  "hard",
  "impossible",
  "mixed",
];

const ChallengeModal = ({
  isOpen,
  onClose,
  opponent,
  onSend,
  isJunior = false,
  defaults,
}: ChallengeModalProps) => {
  const [animeList, setAnimeList] = useState<AnimeSeries[]>([]);
  const [selectedAnimeId, setSelectedAnimeId] = useState<string | null>(
    defaults?.anime_id ?? null
  );
  const [difficulty, setDifficulty] = useState<DuelDifficulty>(
    defaults?.difficulty ?? "medium"
  );
  const [questionCount, setQuestionCount] = useState<5 | 10>(
    defaults?.question_count ?? 10
  );
  const [sending, setSending] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!isOpen) return;
    const fetchAnime = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("anime_series")
        .select("*")
        .eq("is_active", true)
        .order("title");
      if (data) setAnimeList(data as AnimeSeries[]);
    };
    fetchAnime();
  }, [isOpen]);

  const handleSend = async () => {
    setSending(true);
    onSend({
      anime_id: selectedAnimeId,
      difficulty,
      question_count: questionCount,
    });
    setSending(false);
  };

  const opponentName =
    opponent.display_name ?? opponent.username ?? "Opponent";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={reducedMotion ? false : { y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { y: 100, opacity: 0 }}
            transition={reducedMotion ? { duration: 0 } : { type: "spring", damping: 20 }}
            className="w-full max-w-md bg-surface rounded-t-3xl sm:rounded-3xl border border-white/10 p-5 max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Swords size={18} className="text-primary" />
                <h2 className="text-lg font-bold">Challenge {opponentName}</h2>
              </div>
              <Button
                variant="icon"
                onClick={onClose}
                aria-label="Close challenge"
              >
                <X size={18} />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-5">
              {/* Anime selection */}
              <div>
                <label className="text-xs font-semibold text-white/50 mb-2 block">
                  Anime
                </label>
                <select
                  value={selectedAnimeId ?? "random"}
                  onChange={(e) =>
                    setSelectedAnimeId(
                      e.target.value === "random" ? null : e.target.value
                    )
                  }
                  className="w-full bg-secondary border border-white/10 rounded-xl px-4 py-3 text-sm text-white appearance-none cursor-pointer focus:outline-none focus:border-primary/50"
                >
                  <option value="random">Random Anime</option>
                  {animeList.map((anime) => (
                    <option key={anime.id} value={anime.id}>
                      {anime.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Difficulty */}
              <div>
                <label className="text-xs font-semibold text-white/50 mb-2 block">
                  Difficulty
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {DIFFICULTIES.map((value) => {
                    const locked =
                      isJunior &&
                      (value === "hard" ||
                        value === "impossible" ||
                        value === "mixed");
                    return (
                      <DifficultyChip
                        key={value}
                        tone={value}
                        active={difficulty === value}
                        locked={locked}
                        onClick={() => setDifficulty(value)}
                      >
                        {difficultyLabels[value]}
                      </DifficultyChip>
                    );
                  })}
                </div>
                {isJunior && (
                  <p className="text-xs text-text-muted mt-2">
                    Hard, Impossible, and Mixed unlock at 13
                  </p>
                )}
              </div>

              {/* Question count */}
              <div>
                <label className="text-xs font-semibold text-white/50 mb-2 block">
                  Questions
                </label>
                <div className="flex gap-2">
                  {([5, 10] as const).map((count) => (
                    <button
                      key={count}
                      onClick={() => setQuestionCount(count)}
                      className={`flex-1 px-4 py-3 text-sm font-bold rounded-xl border transition-all ${
                        questionCount === count
                          ? "bg-primary/20 text-primary border-primary/30"
                          : "bg-white/5 text-white/40 border-white/10 hover:bg-white/10"
                      }`}
                    >
                      {count} Questions
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Send button */}
            <Button
              onClick={handleSend}
              disabled={sending}
              className="mt-4 w-full"
            >
              <Swords size={16} />
              {sending ? "Sending..." : "Send Challenge"}
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChallengeModal;
