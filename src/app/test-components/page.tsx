"use client";

import { useState } from "react";
import type { Difficulty, AnimeSeries, Question } from "@/types";
import AnimeCard from "@/components/AnimeCard";
import DifficultySelector from "@/components/DifficultySelector";
import Timer from "@/components/Timer";
import ProgressBar from "@/components/ProgressBar";
import AnswerButton from "@/components/AnswerButton";
import QuizCard from "@/components/QuizCard";
import ScoreDisplay from "@/components/ScoreDisplay";

// --- Mock Data ---

const mockAnime: AnimeSeries[] = [
  {
    id: "1",
    title: "Naruto",
    slug: "naruto",
    description: "Follow Naruto Uzumaki on his quest to become Hokage.",
    image_url: null,
    genre: ["Action", "Adventure", "Shonen"],
    total_questions: 30,
    is_active: true,
    created_at: "2024-01-01",
  },
  {
    id: "2",
    title: "Attack on Titan",
    slug: "attack-on-titan",
    description: "Humanity fights for survival against Titans.",
    image_url: null,
    genre: ["Action", "Drama", "Dark Fantasy"],
    total_questions: 30,
    is_active: true,
    created_at: "2024-01-01",
  },
  {
    id: "3",
    title: "One Piece",
    slug: "one-piece",
    description: "Luffy sets sail to find the One Piece.",
    image_url: null,
    genre: ["Action", "Adventure", "Comedy"],
    total_questions: 30,
    is_active: true,
    created_at: "2024-01-01",
  },
  {
    id: "4",
    title: "Demon Slayer",
    slug: "demon-slayer",
    description: "Tanjiro fights demons to save his sister.",
    image_url: null,
    genre: ["Action", "Supernatural"],
    total_questions: 30,
    is_active: true,
    created_at: "2024-01-01",
  },
  {
    id: "5",
    title: "Jujutsu Kaisen",
    slug: "jujutsu-kaisen",
    description: "Yuji Itadori enters the world of cursed energy.",
    image_url: null,
    genre: ["Action", "Supernatural", "Shonen"],
    total_questions: 30,
    is_active: true,
    created_at: "2024-01-01",
  },
  {
    id: "6",
    title: "My Hero Academia",
    slug: "my-hero-academia",
    description: "Deku pursues his dream of becoming a hero.",
    image_url: null,
    genre: ["Action", "Superhero", "Shonen"],
    total_questions: 30,
    is_active: true,
    created_at: "2024-01-01",
  },
];

const mockQuestion: Question = {
  id: "q1",
  anime_id: "1",
  question_text: "What is the name of Naruto's signature jutsu?",
  question_type: "multiple_choice",
  difficulty: "easy",
  options: [
    { text: "Shadow Clone Jutsu", isCorrect: true },
    { text: "Fireball Jutsu", isCorrect: false },
    { text: "Chidori", isCorrect: false },
    { text: "Rasengan", isCorrect: false },
  ],
  explanation:
    "The Shadow Clone Jutsu (Kage Bunshin no Jutsu) is Naruto's most frequently used technique throughout the series.",
  image_url: null,
  created_at: "2024-01-01",
};

// --- Page ---

const TestComponentsPage = () => {
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  const handleAnswer = (index: number) => {
    setSelectedAnswer(index);
    setTimeout(() => setIsRevealed(true), 300);
  };

  const resetQuiz = () => {
    setSelectedAnswer(null);
    setIsRevealed(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-16">
      <header>
        <h1 className="text-3xl font-bold text-primary mb-2">
          Component Library
        </h1>
        <p className="text-white/50">
          Visual test page for all OtakuQuiz components
        </p>
      </header>

      {/* --- AnimeCard Grid --- */}
      <section>
        <h2 className="text-xl font-semibold mb-4">AnimeCard</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockAnime.map((anime, i) => (
            <AnimeCard key={anime.id} anime={anime} index={i} />
          ))}
        </div>
      </section>

      {/* --- DifficultySelector --- */}
      <section>
        <h2 className="text-xl font-semibold mb-4">DifficultySelector</h2>
        <div className="max-w-md">
          <DifficultySelector
            selected={difficulty}
            onSelect={setDifficulty}
            questionCounts={{ easy: 80, medium: 90, hard: 70 }}
          />
          <p className="mt-3 text-sm text-white/50">
            Selected: <span className="text-white">{difficulty}</span>
          </p>
        </div>
      </section>

      {/* --- Timer --- */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Timer</h2>
        <div className="flex gap-8 items-center">
          <div className="text-center">
            <Timer totalSeconds={30} timeLeft={25} />
            <p className="text-xs text-white/50 mt-2">Green (83%)</p>
          </div>
          <div className="text-center">
            <Timer totalSeconds={30} timeLeft={10} />
            <p className="text-xs text-white/50 mt-2">Yellow (33%)</p>
          </div>
          <div className="text-center">
            <Timer totalSeconds={30} timeLeft={3} />
            <p className="text-xs text-white/50 mt-2">Red + Pulse (10%)</p>
          </div>
        </div>
      </section>

      {/* --- ProgressBar --- */}
      <section>
        <h2 className="text-xl font-semibold mb-4">ProgressBar</h2>
        <div className="max-w-md space-y-4">
          <ProgressBar current={3} total={10} />
          <ProgressBar current={7} total={10} />
          <ProgressBar current={10} total={10} />
        </div>
      </section>

      {/* --- AnswerButton States --- */}
      <section>
        <h2 className="text-xl font-semibold mb-4">AnswerButton States</h2>
        <div className="max-w-lg space-y-3">
          <AnswerButton
            text="Default state"
            index={0}
            isSelected={false}
            isCorrect={false}
            isRevealed={false}
            onClick={() => {}}
            disabled={false}
          />
          <AnswerButton
            text="Selected (not revealed)"
            index={1}
            isSelected={true}
            isCorrect={false}
            isRevealed={false}
            onClick={() => {}}
            disabled={false}
          />
          <AnswerButton
            text="Revealed - Correct answer"
            index={2}
            isSelected={true}
            isCorrect={true}
            isRevealed={true}
            onClick={() => {}}
            disabled={true}
          />
          <AnswerButton
            text="Revealed - Wrong (selected)"
            index={3}
            isSelected={true}
            isCorrect={false}
            isRevealed={true}
            onClick={() => {}}
            disabled={true}
          />
          <AnswerButton
            text="Revealed - Not selected, not correct"
            index={0}
            isSelected={false}
            isCorrect={false}
            isRevealed={true}
            onClick={() => {}}
            disabled={true}
          />
        </div>
      </section>

      {/* --- QuizCard --- */}
      <section>
        <h2 className="text-xl font-semibold mb-4">QuizCard (Interactive)</h2>
        <QuizCard
          question={mockQuestion}
          questionNumber={3}
          totalQuestions={10}
          onAnswer={handleAnswer}
          isRevealed={isRevealed}
          selectedAnswer={selectedAnswer}
          timeLeft={22}
          totalTime={30}
        />
        {isRevealed && (
          <div className="text-center mt-4">
            <button
              onClick={resetQuiz}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
            >
              Reset Demo
            </button>
          </div>
        )}
      </section>

      {/* --- ScoreDisplay --- */}
      <section>
        <h2 className="text-xl font-semibold mb-4">ScoreDisplay</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-surface rounded-2xl border border-white/10 p-6">
            <h3 className="text-sm text-white/50 mb-4 text-center">
              Normal Result
            </h3>
            <ScoreDisplay
              score={720}
              maxScore={1000}
              correct={7}
              total={10}
              xpEarned={150}
            />
          </div>
          <div className="bg-surface rounded-2xl border border-white/10 p-6">
            <h3 className="text-sm text-white/50 mb-4 text-center">
              With Rank Up
            </h3>
            <ScoreDisplay
              score={950}
              maxScore={1000}
              correct={9}
              total={10}
              xpEarned={300}
              newRank="Chunin"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default TestComponentsPage;
