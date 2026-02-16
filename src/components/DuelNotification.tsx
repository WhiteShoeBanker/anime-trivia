"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Swords, X as XIcon } from "lucide-react";
import type { DuelMatch } from "@/types";

interface DuelNotificationProps {
  duel: DuelMatch;
  challengerName: string;
  animeName: string;
  onAccept: () => void;
  onDecline: () => void;
  onDismiss: () => void;
}

const DuelNotification = ({
  duel,
  challengerName,
  animeName,
  onAccept,
  onDecline,
  onDismiss,
}: DuelNotificationProps) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", damping: 20 }}
        className="fixed bottom-4 left-4 right-4 z-[80] max-w-md mx-auto"
      >
        <div className="bg-surface border border-accent/30 rounded-2xl shadow-2xl shadow-accent/10 p-4">
          {/* Dismiss button */}
          <button
            onClick={onDismiss}
            className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-white/10 transition-colors"
          >
            <XIcon size={14} className="text-white/40" />
          </button>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
              <Swords size={18} className="text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white">
                {challengerName} challenges you!
              </p>
              <p className="text-xs text-white/40 mt-0.5">
                {animeName} · {duel.difficulty} · {duel.question_count} questions
              </p>

              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={onAccept}
                  className="flex-1 px-3 py-2 text-xs font-bold rounded-lg bg-success/20 text-success hover:bg-success/30 transition-colors"
                >
                  Accept
                </button>
                <button
                  onClick={onDecline}
                  className="flex-1 px-3 py-2 text-xs font-bold rounded-lg bg-white/10 text-white/50 hover:bg-white/20 transition-colors"
                >
                  Decline
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DuelNotification;
