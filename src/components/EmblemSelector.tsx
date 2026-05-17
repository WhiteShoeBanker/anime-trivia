"use client";

import { useState } from "react";
import { X, Check } from "lucide-react";
import BadgeFoilCard from "@/components/BadgeFoilCard";
import { setEmblem } from "@/lib/badges";
import type { Badge } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      presentation="sheet"
      header={
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-bold">Choose Emblem</h2>
          <Button variant="icon" onClick={onClose} aria-label="Close emblem selector">
            <X size={18} />
          </Button>
        </div>
      }
      footer={
        <>
          {currentEmblemId && (
            <Button variant="secondary" onClick={handleRemove} disabled={saving}>
              Remove
            </Button>
          )}
          <Button
            onClick={handleSave}
            disabled={saving || selectedId === currentEmblemId}
            className="flex-1"
          >
            {saving ? "Saving..." : "Save Emblem"}
          </Button>
        </>
      }
    >
      {/* Preview */}
      <div className="flex items-center justify-center gap-3 mb-4 p-3 bg-secondary rounded-xl">
        {selectedId ? (
          (() => {
            const badge = earnedBadges.find((b) => b.id === selectedId);
            if (!badge) return <p className="text-sm text-white/40">Select a badge</p>;
            return (
              <>
                <BadgeFoilCard badge={badge} earned size="md" />
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
                <div
                  key={badge.id}
                  className={`flex flex-col items-center gap-1 p-2 rounded-card transition-all ${
                    isSelected
                      ? "bg-primary/20 border border-primary/50"
                      : "hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <div className="relative">
                    <BadgeFoilCard
                      badge={badge}
                      earned
                      size="sm"
                      onClick={() => setSelectedId(badge.id)}
                    />
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center pointer-events-none">
                        <Check size={10} className="text-white" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default EmblemSelector;
