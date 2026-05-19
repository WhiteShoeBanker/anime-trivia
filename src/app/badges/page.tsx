"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Award, Filter } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getAllBadges, getUserBadges } from "@/lib/badges";
import BadgeCard from "@/components/BadgeCard";
import BadgeGrid from "@/components/BadgeGrid";
import EmblemSelector from "@/components/EmblemSelector";
import type { Badge, BadgeCategory } from "@/types";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Pill } from "@/components/ui/Pill";

type TabFilter = "all" | "earned" | "locked";

const CATEGORY_LABELS: Record<BadgeCategory, string> = {
  streak: "Streak",
  weekend: "Weekend",
  time: "Time",
  difficulty: "Difficulty",
  breadth: "Breadth",
  volume: "Volume",
  accuracy: "Accuracy",
  social: "Social",
  speed: "Speed",
  daily: "Daily",
  special: "Special",
  league: "League",
  grand_prix: "Grand Prix",
  duel: "Duels",
};

const BadgesPage = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [earnedBadges, setEarnedBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<BadgeCategory | "all">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [emblemOpen, setEmblemOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [all, earned] = await Promise.all([
          getAllBadges(),
          user ? getUserBadges(user.id) : Promise.resolve([]),
        ]);
        setAllBadges(all);
        setEarnedBadges(earned);
      } catch {
        // Failed to load
      }
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const earnedIds = useMemo(
    () => new Set(earnedBadges.map((b) => b.id)),
    [earnedBadges]
  );

  const filteredBadges = useMemo(() => {
    let badges = allBadges;

    // Tab filter
    if (tab === "earned") {
      badges = badges.filter((b) => earnedIds.has(b.id));
    } else if (tab === "locked") {
      badges = badges.filter((b) => !earnedIds.has(b.id));
    }

    // Category filter
    if (categoryFilter !== "all") {
      badges = badges.filter((b) => b.category === categoryFilter);
    }

    return badges;
  }, [allBadges, tab, categoryFilter, earnedIds]);

  // Get unique categories present in data
  const categories = useMemo(() => {
    const cats = new Set(allBadges.map((b) => b.category as BadgeCategory));
    return Array.from(cats).sort();
  }, [allBadges]);

  const handleEmblemChange = () => {
    refreshProfile();
  };

  // ── Not Logged In ────────────────────────────────────────

  if (!loading && !user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <Award size={48} className="mx-auto text-primary mb-4" />
        <h1 className="text-3xl font-bold mb-3">Badges & Achievements</h1>
        <p className="text-white/50 max-w-md mx-auto mb-6">
          Earn badges by completing quizzes, building streaks, and climbing leagues!
        </p>
        <Button href="/auth">Sign In to Start Earning</Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold">Badges</h1>
          <p className="text-sm text-white/40">
            {earnedIds.size} of {allBadges.length} earned
          </p>
        </div>
        <Button
          variant="tertiary"
          onClick={() => setEmblemOpen(true)}
          className="bg-primary/20 hover:bg-primary/30 active:bg-primary/40"
        >
          Change Emblem
        </Button>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(["all", "earned", "locked"] as TabFilter[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
              tab === t
                ? "bg-primary text-white"
                : "bg-white/5 text-white/50 hover:bg-white/10"
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}

        {/* View toggle */}
        <div className="ml-auto flex gap-1">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === "grid" ? "bg-white/10" : "hover:bg-white/5"
            }`}
          >
            <div className="grid grid-cols-2 gap-0.5">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-sm bg-white/40" />
              ))}
            </div>
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === "list" ? "bg-white/10" : "hover:bg-white/5"
            }`}
          >
            <div className="flex flex-col gap-0.5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="w-4 h-1 rounded-sm bg-white/40" />
              ))}
            </div>
          </button>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
        <Pill
          interactive
          active={categoryFilter === "all"}
          ariaPressed={categoryFilter === "all"}
          onClick={() => setCategoryFilter("all")}
          className="flex-shrink-0 gap-1"
        >
          <Filter size={12} />
          All
        </Pill>
        {categories.map((cat) => (
          <Pill
            key={cat}
            interactive
            active={categoryFilter === cat}
            ariaPressed={categoryFilter === cat}
            onClick={() => setCategoryFilter(cat)}
            className="flex-shrink-0"
          >
            {CATEGORY_LABELS[cat] ?? cat}
          </Pill>
        ))}
      </div>

      {/* Badge display */}
      {filteredBadges.length === 0 ? (
        <div className="text-center py-12 text-white/30">
          <p className="text-sm">No badges found for this filter</p>
        </div>
      ) : viewMode === "grid" ? (
        <BadgeGrid
          badges={filteredBadges}
          earnedBadgeIds={earnedIds}
          onBadgeClick={(badge) => setSelectedBadge(badge)}
        />
      ) : (
        <div className="space-y-2">
          {filteredBadges.map((badge) => (
            <BadgeCard
              key={badge.id}
              badge={badge}
              earned={earnedIds.has(badge.id)}
              onClick={() => setSelectedBadge(badge)}
            />
          ))}
        </div>
      )}

      {/* Badge detail modal — surfaceless: BadgeCard carries its own
          surface chrome, so Modal omits the container card. */}
      <Modal
        isOpen={!!selectedBadge}
        onClose={() => setSelectedBadge(null)}
        presentation="center"
        surfaceless
        aria-label="Badge details"
        footer={
          selectedBadge ? (
            <Button
              variant="secondary"
              onClick={() => setSelectedBadge(null)}
              className="w-full"
            >
              Close
            </Button>
          ) : undefined
        }
      >
        {selectedBadge && (
          <BadgeCard
            badge={selectedBadge}
            earned={earnedIds.has(selectedBadge.id)}
            selected
          />
        )}
      </Modal>

      {/* Emblem selector */}
      {user && (
        <EmblemSelector
          isOpen={emblemOpen}
          onClose={() => setEmblemOpen(false)}
          earnedBadges={earnedBadges}
          currentEmblemId={profile?.emblem_badge_id ?? null}
          userId={user.id}
          onEmblemChange={handleEmblemChange}
        />
      )}
    </div>
  );
};

export default BadgesPage;
