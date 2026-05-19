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
import {
  DifficultyChip,
  type DifficultyTone,
} from "@/components/ui/DifficultyChip";
import { Label } from "@/components/ui/Label";
import { FieldHint } from "@/components/ui/FieldHint";
import { FieldError } from "@/components/ui/FieldError";
import { Input } from "@/components/ui/Input";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ModalShell } from "@/components/ui/ModalShell";
import { Search } from "lucide-react";

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
    content_rating: "E",
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
    content_rating: "E",
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
    content_rating: "E",
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
    content_rating: "E",
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
    content_rating: "E",
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
    content_rating: "E",
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
  kid_safe: true,
  created_at: "2024-01-01",
};

// --- Page ---

const TestComponentsPage = () => {
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [formEmail, setFormEmail] = useState("");
  const [showFieldError, setShowFieldError] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [centerOpen, setCenterOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [shellOpen, setShellOpen] = useState(false);

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
            questionCounts={{ easy: 80, medium: 90, hard: 70, impossible: 30 }}
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

      {/* --- DifficultyChip States --- */}
      <section>
        <h2 className="text-xl font-semibold mb-4">DifficultyChip</h2>
        <div className="space-y-4 max-w-2xl">
          <div>
            <h3 className="text-sm text-white/50 mb-2">Active (filled)</h3>
            <div className="flex flex-wrap gap-2">
              {(
                ["easy", "medium", "hard", "impossible", "mixed"] as DifficultyTone[]
              ).map((tone) => (
                <DifficultyChip key={tone} tone={tone} active>
                  {tone.charAt(0).toUpperCase() + tone.slice(1)}
                </DifficultyChip>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm text-white/50 mb-2">Inactive (ghost)</h3>
            <div className="flex flex-wrap gap-2">
              {(
                ["easy", "medium", "hard", "impossible", "mixed"] as DifficultyTone[]
              ).map((tone) => (
                <DifficultyChip key={tone} tone={tone} active={false}>
                  {tone.charAt(0).toUpperCase() + tone.slice(1)}
                </DifficultyChip>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm text-white/50 mb-2">
              Locked (COPPA age gate)
            </h3>
            <div className="flex flex-wrap gap-2">
              <DifficultyChip tone="hard" active={false} locked>
                Hard (Locked)
              </DifficultyChip>
            </div>
          </div>
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

      {/* --- Form primitives --- */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Form</h2>
        <div className="max-w-md space-y-8">
          {/* Standalone primitives */}
          <div className="space-y-4">
            <h3 className="text-sm text-white/50">
              Standalone primitives
            </h3>
            <div>
              <Label htmlFor="demo-standalone" required>
                Standalone label
              </Label>
              <FieldHint>
                Standalone hint — full text-text-muted alpha.
              </FieldHint>
              <FieldError>
                Standalone error — text-error-strong, aria-live polite.
              </FieldError>
            </div>
          </div>

          {/* Bare <Input> variants (no <Field> wrapper) */}
          <div className="space-y-4">
            <h3 className="text-sm text-white/50">
              Bare &lt;Input&gt; variants
            </h3>
            <div>
              <label htmlFor="demo-search" className="sr-only">
                Search anime
              </label>
              <Input
                id="demo-search"
                placeholder="Search anime…"
                leadingIcon={<Search size={18} />}
              />
            </div>
            <Input
              aria-label="OTP code"
              placeholder="••••••"
              maxLength={6}
              className="text-center text-2xl tracking-[0.5em] font-mono"
            />
            <Input
              aria-label="Disabled field"
              placeholder="Disabled"
              disabled
            />
            <Input
              aria-label="Error field"
              placeholder="Error visual state"
              error
            />
          </div>

          {/* <Field> compositions */}
          <div className="space-y-6">
            <h3 className="text-sm text-white/50">
              &lt;Field&gt; compositions
            </h3>
            <Field id="demo-email" label="Email" hint="We never share it.">
              <Input
                type="email"
                placeholder="you@example.com"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
              />
            </Field>

            <Field id="demo-username" label="Username">
              <Input placeholder="No hint on this one" />
            </Field>

            <Field
              id="demo-required"
              label="Display name"
              required
              error={
                showFieldError ? "This field is required." : undefined
              }
            >
              <Input placeholder="Toggle the error below" />
            </Field>

            <button
              type="button"
              onClick={() => setShowFieldError((v) => !v)}
              className="px-4 py-2 text-sm font-medium rounded-sharp bg-primary text-white hover:bg-primary/90 transition-colors"
            >
              {showFieldError ? "Clear error" : "Trigger error"}
            </button>
          </div>
        </div>
      </section>

      {/* --- Modal --- */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Modal</h2>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setSheetOpen(true)}>Open sheet modal</Button>
          <Button onClick={() => setCenterOpen(true)}>Open center modal</Button>
          <Button variant="secondary" onClick={() => setAlertOpen(true)}>
            Open alertdialog
          </Button>
          <Button variant="secondary" onClick={() => setShellOpen(true)}>
            Open full-bleed shell
          </Button>
        </div>

        <Modal
          isOpen={sheetOpen}
          onClose={() => setSheetOpen(false)}
          presentation="sheet"
          header={<h3 className="text-lg font-bold">Sheet header</h3>}
          footer={
            <Button variant="secondary" onClick={() => setSheetOpen(false)}>
              Close
            </Button>
          }
        >
          <p className="text-sm text-text-muted">
            Lorem ipsum sheet content — slides up from the viewport bottom
            below sm, centers at sm+. Backdrop click and Escape both dismiss.
          </p>
        </Modal>

        <Modal
          isOpen={centerOpen}
          onClose={() => setCenterOpen(false)}
          presentation="center"
          header={<h3 className="text-lg font-bold">Center header</h3>}
          footer={
            <Button variant="secondary" onClick={() => setCenterOpen(false)}>
              Close
            </Button>
          }
        >
          <p className="text-sm text-text-muted">
            Lorem ipsum center content — scales in from 0.95, vertically
            centered at every breakpoint.
          </p>
        </Modal>

        <Modal
          isOpen={alertOpen}
          onClose={() => setAlertOpen(false)}
          role="alertdialog"
          header={<h3 className="text-lg font-bold">Delete everything?</h3>}
          footer={
            <Button onClick={() => setAlertOpen(false)}>
              Acknowledge
            </Button>
          }
        >
          <p className="text-sm text-text-muted">
            An alertdialog is not dismissible by backdrop click or Escape —
            the user must make an explicit choice.
          </p>
        </Modal>

        <ModalShell
          isOpen={shellOpen}
          onClose={() => setShellOpen(false)}
          aria-label="Full-bleed shell demo"
          backdropClassName="flex items-center justify-center bg-ink/80"
        >
          <div className="text-center">
            <p className="text-text mb-4">
              Full-bleed surface — no container card. The caller owns its own
              layout and entrance.
            </p>
            <Button variant="secondary" onClick={() => setShellOpen(false)}>
              Close
            </Button>
          </div>
        </ModalShell>
      </section>
    </div>
  );
};

export default TestComponentsPage;
