"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check } from "lucide-react";
import BadgeIcon from "@/components/BadgeIcon";
import { setEmblem } from "@/lib/badges";
import type { Badge } from "@/types";

interface EmblemSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  earnedBadges: Badge[];
  currentEmblemId: string | null;
  userId: string;
  onEmblemChange: (badgeId: string | null) => void;
}

const EmblemSelector = ({
  isOpen,
  onClose,
  earnedBadges,
  currentEmblemId,
  userId,
  onEmblemChange,
}: EmblemSelectorProps) => {
  const [selectedId, setSelectedId] = useState<string | null>(currentEmblemId);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await setEmblem(userId, selectedId);
    onEmblemChange(selectedId);
    setSaving(false);
    onClose();
  };

  const handleRemove = async () => {
    setSaving(true);
    await setEmblem(userId, null);
    setSelectedId(null);
    onEmblemChange(null);
    setSaving(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 20 }}
            className="w-full max-w-md bg-surface rounded-t-3xl sm:rounded-3xl border border-white/10 p-5 max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Choose Emblem</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Preview */}
            <div className="flex items-center justify-center gap-3 mb-4 p-3 bg-secondary rounded-xl">
              {selectedId ? (
                (() => {
                  const badge = earnedBadges.find((b) => b.id === selectedId);
                  if (!badge) return <p className="text-sm text-white/40">Select a badge</p>;
                  return (
                    <>
                      <BadgeIcon
                        iconName={badge.icon_name}
                        iconColor={badge.icon_color}
                        rarity={badge.rarity}
                        size="md"
                        earned
                        shimmer
                      />
                      <div>
                        <p className="text-sm font-semibold">{badge.name}</p>
                        <p className="text-xs text-white/40">Your profile emblem</p>
                      </div>
                    </>
                  );
                })()
              ) : (
                <p className="text-sm text-white/40">No emblem selected</p>
              )}
            </div>

            {/* Badge grid */}
            <div className="flex-1 overflow-y-auto -mx-1 px-1">
              {earnedBadges.length === 0 ? (
                <p className="text-sm text-white/40 text-center py-8">
                  Earn badges by playing quizzes to unlock emblems!
                </p>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {earnedBadges.map((badge) => {
                    const isSelected = badge.id === selectedId;
                    return (
                      <button
                        key={badge.id}
                        onClick={() => setSelectedId(badge.id)}
                        className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                          isSelected
                            ? "bg-primary/20 border border-primary/50"
                            : "hover:bg-white/5 border border-transparent"
                        }`}
                      >
                        <div className="relative">
                          <BadgeIcon
                            iconName={badge.icon_name}
                            iconColor={badge.icon_color}
                            rarity={badge.rarity}
                            size="md"
                            earned
                          />
                          {isSelected && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                              <Check size={10} className="text-white" />
                            </div>
                          )}
                        </div>
                        <span className="text-[9px] text-white/60 text-center leading-tight line-clamp-1">
                          {badge.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-4 pt-3 border-t border-white/10">
              {currentEmblemId && (
                <button
                  onClick={handleRemove}
                  disabled={saving}
                  className="px-4 py-2.5 text-sm font-medium rounded-xl bg-white/10 text-white/60 hover:bg-white/20 transition-colors disabled:opacity-50"
                >
                  Remove
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={saving || selectedId === currentEmblemId}
                className="flex-1 px-4 py-2.5 text-sm font-bold rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Emblem"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EmblemSelector;
