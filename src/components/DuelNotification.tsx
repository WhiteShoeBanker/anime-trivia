"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Swords, X as XIcon } from "lucide-react";
import type { DuelMatch } from "@/types";
import useReducedMotion from "@/lib/use-reduced-motion";
import { Button } from "@/components/ui/Button";

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
  const reducedMotion = useReducedMotion();

  return (
    <AnimatePresence>
      <motion.div
        initial={reducedMotion ? false : { y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={reducedMotion ? { opacity: 0 } : { y: 100, opacity: 0 }}
        transition={reducedMotion ? { duration: 0 } : { type: "spring", damping: 20 }}
        className="fixed bottom-4 left-4 right-4 z-[80] max-w-md mx-auto"
      >
        <div className="relative bg-surface border border-accent/30 rounded-card shadow-2xl shadow-accent/10 p-4">
          {/* Dismiss button */}
          <Button
            variant="icon"
            onClick={onDismiss}
            aria-label="Dismiss notification"
            className="absolute top-2 right-2"
          >
            <XIcon size={14} className="text-white/40" />
          </Button>

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
                <Button
                  variant="tertiary"
                  onClick={onAccept}
                  className="flex-1 bg-success/20 text-success hover:bg-success/30 active:bg-success/40 px-3 py-2 min-h-0 text-xs"
                >
                  Accept
                </Button>
                <Button
                  variant="secondary"
                  onClick={onDecline}
                  className="flex-1 px-3 py-2 min-h-0 text-xs"
                >
                  Decline
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DuelNotification;
