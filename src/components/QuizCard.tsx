"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { Question } from "@/types";
import Timer from "./Timer";
import AnswerButton from "./AnswerButton";
import useReducedMotion from "@/lib/use-reduced-motion";

interface QuizCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (index: number) => void;
  isRevealed: boolean;
  selectedAnswer: number | null;
  timeLeft: number;
  totalTime: number;
}

const difficultyColors: Record<string, string> = {
  easy: "bg-emerald-500/20 text-emerald-400",
  medium: "bg-yellow-500/20 text-yellow-400",
  hard: "bg-red-500/20 text-red-400",
};

const QuizCard = ({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  isRevealed,
  selectedAnswer,
  timeLeft,
  totalTime,
}: QuizCardProps) => {
  const reducedMotion = useReducedMotion();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={question.id}
        initial={reducedMotion ? false : { opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: -50 }}
        transition={{ duration: reducedMotion ? 0 : 0.3 }}
        className="w-full max-w-2xl mx-auto"
      >
        <div className="bg-surface rounded-2xl border border-white/10 p-5 md:p-6">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-white/50">
              {questionNumber}/{totalQuestions}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${difficultyColors[question.difficulty]}`}
            >
              {question.difficulty}
            </span>
            <Timer totalSeconds={totalTime} timeLeft={timeLeft} />
          </div>

          {/* Question text */}
          <h2 className="text-lg md:text-xl font-semibold mb-6">
            {question.question_text}
          </h2>

          {/* Answer options */}
          <div className="flex flex-col gap-3">
            {question.options.map((option, i) => (
              <AnswerButton
                key={i}
                text={option.text}
                index={i}
                isSelected={selectedAnswer === i}
                isCorrect={option.isCorrect}
                isRevealed={isRevealed}
                onClick={() => onAnswer(i)}
                disabled={isRevealed}
              />
            ))}
          </div>

          {/* Explanation */}
          <AnimatePresence>
            {isRevealed && question.explanation && (
              <motion.div
                initial={reducedMotion ? false : { opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={reducedMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
                transition={{ duration: reducedMotion ? 0 : 0.3 }}
                className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10"
              >
                <p className="text-sm text-white/70">
                  <span className="font-semibold text-primary">Explanation: </span>
                  {question.explanation}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default QuizCard;
