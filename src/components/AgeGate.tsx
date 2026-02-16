"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { AgeGroup } from "@/types";

interface AgeGateProps {
  onAgeConfirmed: (data: {
    birthYear: number;
    ageGroup: AgeGroup;
    age: number;
  }) => void;
}

const AGE_OPTIONS = [
  4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
  24,
];

const AgeGate = ({ onAgeConfirmed }: AgeGateProps) => {
  const [tooYoung, setTooYoung] = useState(false);

  const handleAgeSelect = (age: number) => {
    if (age < 6) {
      setTooYoung(true);
      return;
    }

    const currentYear = new Date().getFullYear();
    const birthYear = currentYear - age;

    let ageGroup: AgeGroup;
    if (age <= 12) {
      ageGroup = "junior";
    } else if (age <= 15) {
      ageGroup = "teen";
    } else {
      ageGroup = "full";
    }

    onAgeConfirmed({ birthYear, ageGroup, age });
  };

  if (tooYoung) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md mx-auto"
      >
        <div className="text-6xl mb-4">&#127800;</div>
        <h2 className="text-2xl font-bold mb-3">Come Back Later!</h2>
        <p className="text-white/60">
          OtakuQuiz is for kids 6 and up. Ask a grown-up to help you get
          started!
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center max-w-lg mx-auto"
    >
      <h1 className="text-3xl font-bold mb-2">Welcome to OtakuQuiz!</h1>
      <p className="text-white/60 mb-8">How old are you?</p>

      <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
        {AGE_OPTIONS.map((age) => (
          <button
            key={age}
            onClick={() => handleAgeSelect(age)}
            className="min-h-[44px] min-w-[44px] px-3 py-3 rounded-xl bg-surface border border-white/10 text-white font-semibold hover:bg-primary hover:border-primary transition-colors"
          >
            {age}
          </button>
        ))}
        <button
          onClick={() => handleAgeSelect(25)}
          className="min-h-[44px] min-w-[44px] px-3 py-3 rounded-xl bg-surface border border-white/10 text-white font-semibold hover:bg-primary hover:border-primary transition-colors"
        >
          25+
        </button>
      </div>
    </motion.div>
  );
};

export default AgeGate;
