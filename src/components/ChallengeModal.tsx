"use client";

import { useState, useEffect } from "react";
import { X, Swords } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { AnimeSeries, DuelDifficulty } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      presentation="sheet"
      header={
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Swords size={18} className="text-primary" />
            <h2 className="text-lg font-bold">Challenge {opponentName}</h2>
          </div>
          <Button variant="icon" onClick={onClose} aria-label="Close challenge">
            <X size={18} />
          </Button>
        </div>
      }
      footer={
        <Button onClick={handleSend} disabled={sending} className="w-full">
          <Swords size={16} />
          {sending ? "Sending..." : "Send Challenge"}
        </Button>
      }
    >
      <div className="space-y-5">
        {/* Anime selection */}
        <div>
          <Label htmlFor="challenge-anime">Anime</Label>
          <select
            id="challenge-anime"
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
          <span
            id="challenge-difficulty-label"
            className="block text-sm font-medium leading-[1.4] text-text mb-1"
          >
            Difficulty
          </span>
          <div
            role="group"
            aria-labelledby="challenge-difficulty-label"
            className="flex flex-wrap gap-2.5"
          >
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
          <span
            id="challenge-question-count-label"
            className="block text-sm font-medium leading-[1.4] text-text mb-1"
          >
            Questions
          </span>
          <div
            role="group"
            aria-labelledby="challenge-question-count-label"
            className="flex gap-2"
          >
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
    </Modal>
  );
};

export default ChallengeModal;
