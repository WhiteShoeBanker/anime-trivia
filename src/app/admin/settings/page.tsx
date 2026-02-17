"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Loader2,
  Gamepad2,
  ToggleLeft,
  Megaphone,
  CalendarDays,
  Eye,
  Save,
  ClipboardList,
  CheckCircle2,
  XCircle,
  Trophy,
  Swords,
  Shield,
} from "lucide-react";
import {
  getAdminSettings,
  updateAdminSetting,
  type AdminSettings,
} from "../actions";

// ── Types ──────────────────────────────────────────────────

interface ConfigMap {
  free_quiz_limit: number;
  diminishing_returns: string;
  breadth_gates: string;
  league_promotion_sizes: string;
  league_demotion_sizes: string;
  duel_max_per_opponent_weekly: number;
  feature_flags: FeatureFlags;
  maintenance_mode: boolean;
  announcement_banner: string;
  daily_challenge_mix: DailyChallengeMix;
  ad_visibility: boolean;
}

interface FeatureFlags {
  leagues: boolean;
  badges: boolean;
  daily_challenge: boolean;
  grand_prix: boolean;
  cosmetic_shop: boolean;
  duels: boolean;
  swag_shop: boolean;
}

interface DailyChallengeMix {
  easy: number;
  medium: number;
  hard: number;
  impossible: number;
}

interface Toast {
  type: "success" | "error";
  message: string;
}

// ── Helpers ────────────────────────────────────────────────

const FEATURE_FLAG_KEYS: (keyof FeatureFlags)[] = [
  "leagues",
  "badges",
  "daily_challenge",
  "grand_prix",
  "cosmetic_shop",
  "duels",
  "swag_shop",
];

const FEATURE_FLAG_LABELS: Record<keyof FeatureFlags, string> = {
  leagues: "Leagues",
  badges: "Badges",
  daily_challenge: "Daily Challenge",
  grand_prix: "Grand Prix",
  cosmetic_shop: "Cosmetic Shop",
  duels: "Duels",
  swag_shop: "Swag Shop",
};

const DIFFICULTY_KEYS: (keyof DailyChallengeMix)[] = [
  "easy",
  "medium",
  "hard",
  "impossible",
];

const DEFAULT_BREADTH_GATES = JSON.stringify(
  { "1": 0, "2": 2, "3": 3, "4": 5, "5": 6 },
  null,
  2
);

const parseConfigMap = (
  configs: AdminSettings["configs"]
): Partial<ConfigMap> => {
  const map: Partial<ConfigMap> = {};

  for (const cfg of configs) {
    switch (cfg.key) {
      case "free_quiz_limit":
        map.free_quiz_limit =
          typeof cfg.value === "number" ? cfg.value : Number(cfg.value) || 5;
        break;
      case "diminishing_returns":
        map.diminishing_returns =
          typeof cfg.value === "string"
            ? cfg.value
            : JSON.stringify(cfg.value, null, 2);
        break;
      case "breadth_gates":
        map.breadth_gates =
          typeof cfg.value === "string"
            ? cfg.value
            : JSON.stringify(cfg.value, null, 2);
        break;
      case "league_promotion_sizes":
        map.league_promotion_sizes =
          typeof cfg.value === "string"
            ? cfg.value
            : JSON.stringify(cfg.value, null, 2);
        break;
      case "league_demotion_sizes":
        map.league_demotion_sizes =
          typeof cfg.value === "string"
            ? cfg.value
            : JSON.stringify(cfg.value, null, 2);
        break;
      case "duel_max_per_opponent_weekly":
        map.duel_max_per_opponent_weekly =
          typeof cfg.value === "number" ? cfg.value : Number(cfg.value) || 3;
        break;
      case "feature_flags":
        map.feature_flags = cfg.value as FeatureFlags;
        break;
      case "maintenance_mode":
        map.maintenance_mode = Boolean(cfg.value);
        break;
      case "announcement_banner":
        map.announcement_banner =
          typeof cfg.value === "string" ? cfg.value : String(cfg.value ?? "");
        break;
      case "daily_challenge_mix":
        map.daily_challenge_mix = cfg.value as DailyChallengeMix;
        break;
      case "ad_visibility":
        map.ad_visibility = Boolean(cfg.value);
        break;
    }
  }

  return map;
};

const relativeTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return "just now";
  if (diffMinutes < 60)
    return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;
  if (diffHours < 24)
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  if (diffDays < 30)
    return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  const months = Math.floor(diffDays / 30);
  return `${months} month${months === 1 ? "" : "s"} ago`;
};

const truncateValue = (value: unknown): string => {
  const str =
    typeof value === "string" ? value : JSON.stringify(value ?? null);
  return str.length > 40 ? str.slice(0, 40) + "..." : str;
};

// ── Component ──────────────────────────────────────────────

const AdminSettingsPage = () => {
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  // Local form state
  const [freeQuizLimit, setFreeQuizLimit] = useState(5);
  const [diminishingReturns, setDiminishingReturns] = useState("[]");
  const [breadthGates, setBreadthGates] = useState(DEFAULT_BREADTH_GATES);
  const [leaguePromotionSizes, setLeaguePromotionSizes] = useState("{}");
  const [leagueDemotionSizes, setLeagueDemotionSizes] = useState("{}");
  const [duelMaxPerOpponentWeekly, setDuelMaxPerOpponentWeekly] = useState(3);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlags>({
    leagues: false,
    badges: false,
    daily_challenge: false,
    grand_prix: false,
    cosmetic_shop: false,
    duels: false,
    swag_shop: false,
  });
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [announcementBanner, setAnnouncementBanner] = useState("");
  const [dailyChallengeMix, setDailyChallengeMix] =
    useState<DailyChallengeMix>({
      easy: 3,
      medium: 3,
      hard: 2,
      impossible: 2,
    });
  const [adVisibility, setAdVisibility] = useState(false);

  // ── Data Fetching ────────────────────────────────────────

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAdminSettings();
      setSettings(data);

      const parsed = parseConfigMap(data.configs);

      if (parsed.free_quiz_limit !== undefined)
        setFreeQuizLimit(parsed.free_quiz_limit);
      if (parsed.diminishing_returns !== undefined)
        setDiminishingReturns(parsed.diminishing_returns);
      if (parsed.breadth_gates !== undefined)
        setBreadthGates(parsed.breadth_gates);
      if (parsed.league_promotion_sizes !== undefined)
        setLeaguePromotionSizes(parsed.league_promotion_sizes);
      if (parsed.league_demotion_sizes !== undefined)
        setLeagueDemotionSizes(parsed.league_demotion_sizes);
      if (parsed.duel_max_per_opponent_weekly !== undefined)
        setDuelMaxPerOpponentWeekly(parsed.duel_max_per_opponent_weekly);
      if (parsed.feature_flags !== undefined)
        setFeatureFlags((prev) => ({ ...prev, ...parsed.feature_flags }));
      if (parsed.maintenance_mode !== undefined)
        setMaintenanceMode(parsed.maintenance_mode);
      if (parsed.announcement_banner !== undefined)
        setAnnouncementBanner(parsed.announcement_banner);
      if (parsed.daily_challenge_mix !== undefined)
        setDailyChallengeMix(parsed.daily_challenge_mix);
      if (parsed.ad_visibility !== undefined)
        setAdVisibility(parsed.ad_visibility);
    } catch {
      showToast("error", "Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // ── Toast ────────────────────────────────────────────────

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Save Handlers ────────────────────────────────────────

  const handleSave = useCallback(
    async (key: string, value: unknown) => {
      setSavingKey(key);
      try {
        await updateAdminSetting(key, value, "admin");
        showToast("success", `Setting "${key}" updated successfully`);
        // Refresh settings to update audit log
        const data = await getAdminSettings();
        setSettings(data);
      } catch {
        showToast("error", `Failed to update "${key}"`);
      } finally {
        setSavingKey(null);
      }
    },
    []
  );

  const handleSaveGameBalance = useCallback(() => {
    // Validate diminishing_returns JSON
    let parsedDR: unknown;
    try {
      parsedDR = JSON.parse(diminishingReturns);
    } catch {
      showToast("error", "Invalid JSON for diminishing returns");
      return;
    }

    // Validate breadth_gates JSON
    let parsedBG: unknown;
    try {
      parsedBG = JSON.parse(breadthGates);
    } catch {
      showToast("error", "Invalid JSON for breadth gates");
      return;
    }

    handleSave("free_quiz_limit", freeQuizLimit);
    handleSave("diminishing_returns", parsedDR);
    handleSave("breadth_gates", parsedBG);
  }, [freeQuizLimit, diminishingReturns, breadthGates, handleSave]);

  const handleSaveLeagues = useCallback(() => {
    let parsedPromotion: unknown;
    try {
      parsedPromotion = JSON.parse(leaguePromotionSizes);
    } catch {
      showToast("error", "Invalid JSON for league promotion sizes");
      return;
    }

    let parsedDemotion: unknown;
    try {
      parsedDemotion = JSON.parse(leagueDemotionSizes);
    } catch {
      showToast("error", "Invalid JSON for league demotion sizes");
      return;
    }

    handleSave("league_promotion_sizes", parsedPromotion);
    handleSave("league_demotion_sizes", parsedDemotion);
  }, [leaguePromotionSizes, leagueDemotionSizes, handleSave]);

  const handleSaveDuels = useCallback(() => {
    handleSave("duel_max_per_opponent_weekly", duelMaxPerOpponentWeekly);
  }, [duelMaxPerOpponentWeekly, handleSave]);

  const handleSaveFeatureFlags = useCallback(() => {
    handleSave("feature_flags", featureFlags);
  }, [featureFlags, handleSave]);

  const handleSaveCommunication = useCallback(() => {
    handleSave("maintenance_mode", maintenanceMode);
    handleSave("announcement_banner", announcementBanner);
  }, [maintenanceMode, announcementBanner, handleSave]);

  const handleSaveDailyChallenge = useCallback(() => {
    handleSave("daily_challenge_mix", dailyChallengeMix);
  }, [dailyChallengeMix, handleSave]);

  const handleSaveAdVisibility = useCallback(() => {
    handleSave("ad_visibility", adVisibility);
  }, [adVisibility, handleSave]);

  // ── Audit Log ────────────────────────────────────────────

  const auditLog = useMemo(() => settings?.auditLog ?? [], [settings]);

  // ── Render ───────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={32} className="animate-spin text-orange-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8 relative">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all ${
            toast.type === "success"
              ? "bg-emerald-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 size={16} />
          ) : (
            <XCircle size={16} />
          )}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Settings</h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage application configuration and feature flags
        </p>
      </div>

      {/* 1. Game Balance */}
      <div className="bg-slate-800 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Gamepad2 size={20} className="text-orange-400" />
          <h2 className="text-lg font-semibold text-slate-100">
            Game Balance
          </h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Free Quiz Limit
            </label>
            <input
              type="number"
              min={0}
              value={freeQuizLimit}
              onChange={(e) => setFreeQuizLimit(Number(e.target.value))}
              className="w-full max-w-xs px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-colors"
            />
            <p className="text-xs text-slate-500 mt-1">
              Number of free quizzes per day for non-pro users
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Diminishing Returns (JSON)
            </label>
            <textarea
              value={diminishingReturns}
              onChange={(e) => setDiminishingReturns(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-colors resize-y"
            />
            <p className="text-xs text-slate-500 mt-1">
              JSON array config for XP diminishing returns after repeated plays
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Breadth Gates (JSON)
            </label>
            <textarea
              value={breadthGates}
              onChange={(e) => setBreadthGates(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-colors resize-y"
            />
            <p className="text-xs text-slate-500 mt-1">
              Breadth gate config: maps difficulty tier to required unique anime count (e.g. {"{"}1:0, 2:2, 3:3, 4:5, 5:6{"}"})
            </p>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <SaveButton
            onClick={handleSaveGameBalance}
            saving={
              savingKey === "free_quiz_limit" ||
              savingKey === "diminishing_returns" ||
              savingKey === "breadth_gates"
            }
          />
        </div>
      </div>

      {/* 2. Leagues */}
      <div className="bg-slate-800 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Trophy size={20} className="text-yellow-400" />
          <h2 className="text-lg font-semibold text-slate-100">Leagues</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              League Promotion Sizes (JSON)
            </label>
            <textarea
              value={leaguePromotionSizes}
              onChange={(e) => setLeaguePromotionSizes(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-colors resize-y"
            />
            <p className="text-xs text-slate-500 mt-1">
              Number of top players promoted per league tier each week
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              League Demotion Sizes (JSON)
            </label>
            <textarea
              value={leagueDemotionSizes}
              onChange={(e) => setLeagueDemotionSizes(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-colors resize-y"
            />
            <p className="text-xs text-slate-500 mt-1">
              Number of bottom players demoted per league tier each week
            </p>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <SaveButton
            onClick={handleSaveLeagues}
            saving={
              savingKey === "league_promotion_sizes" ||
              savingKey === "league_demotion_sizes"
            }
          />
        </div>
      </div>

      {/* 3. Duels */}
      <div className="bg-slate-800 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Swords size={20} className="text-red-400" />
          <h2 className="text-lg font-semibold text-slate-100">Duels</h2>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Max Duels Per Opponent Weekly
          </label>
          <input
            type="number"
            min={1}
            value={duelMaxPerOpponentWeekly}
            onChange={(e) =>
              setDuelMaxPerOpponentWeekly(Number(e.target.value))
            }
            className="w-full max-w-xs px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-colors"
          />
          <p className="text-xs text-slate-500 mt-1">
            Maximum number of duels a player can have against the same opponent per week
          </p>
        </div>

        <div className="mt-4 flex justify-end">
          <SaveButton
            onClick={handleSaveDuels}
            saving={savingKey === "duel_max_per_opponent_weekly"}
          />
        </div>
      </div>

      {/* 4. Features */}
      <div className="bg-slate-800 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <ToggleLeft size={20} className="text-blue-400" />
          <h2 className="text-lg font-semibold text-slate-100">Features</h2>
        </div>

        <div className="space-y-3">
          {FEATURE_FLAG_KEYS.map((key) => (
            <div
              key={key}
              className="flex items-center justify-between py-2"
            >
              <span className="text-sm text-slate-300">
                {FEATURE_FLAG_LABELS[key]}
              </span>
              <Toggle
                enabled={featureFlags[key]}
                onChange={(val) =>
                  setFeatureFlags((prev) => ({ ...prev, [key]: val }))
                }
              />
            </div>
          ))}
        </div>

        <div className="mt-4 flex justify-end">
          <SaveButton
            onClick={handleSaveFeatureFlags}
            saving={savingKey === "feature_flags"}
          />
        </div>
      </div>

      {/* 5. Communication */}
      <div className="bg-slate-800 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Megaphone size={20} className="text-yellow-400" />
          <h2 className="text-lg font-semibold text-slate-100">
            Communication
          </h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <span className="text-sm font-medium text-slate-300">
                Maintenance Mode
              </span>
              <p className="text-xs text-slate-500 mt-0.5">
                When enabled, users see a maintenance page
              </p>
              {maintenanceMode && (
                <p className="text-xs text-orange-400 font-medium mt-1">
                  Warning: Maintenance mode is currently active. Users cannot access the app.
                </p>
              )}
            </div>
            <Toggle
              enabled={maintenanceMode}
              onChange={setMaintenanceMode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Announcement Banner
            </label>
            <input
              type="text"
              value={announcementBanner}
              onChange={(e) => setAnnouncementBanner(e.target.value)}
              placeholder="Enter announcement text..."
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-colors"
            />
            <p className="text-xs text-slate-500 mt-1">
              Displayed as a banner across the app. Leave empty to hide.
            </p>
            {announcementBanner && (
              <div className="mt-3">
                <span className="text-xs font-medium text-slate-400 mb-1 block">
                  Preview:
                </span>
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg px-4 py-2 text-sm text-orange-300">
                  {announcementBanner}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <SaveButton
            onClick={handleSaveCommunication}
            saving={
              savingKey === "maintenance_mode" ||
              savingKey === "announcement_banner"
            }
          />
        </div>
      </div>

      {/* 6. Daily Challenge */}
      <div className="bg-slate-800 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <CalendarDays size={20} className="text-purple-400" />
          <h2 className="text-lg font-semibold text-slate-100">
            Daily Challenge
          </h2>
        </div>

        <p className="text-sm text-slate-400 mb-4">
          Number of questions per difficulty in the daily challenge mix
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {DIFFICULTY_KEYS.map((key) => (
            <div key={key}>
              <label className="block text-sm font-medium text-slate-300 mb-1 capitalize">
                {key}
              </label>
              <input
                type="number"
                min={0}
                value={dailyChallengeMix[key]}
                onChange={(e) =>
                  setDailyChallengeMix((prev) => ({
                    ...prev,
                    [key]: Number(e.target.value),
                  }))
                }
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-colors"
              />
            </div>
          ))}
        </div>

        <div className="mt-4 flex justify-end">
          <SaveButton
            onClick={handleSaveDailyChallenge}
            saving={savingKey === "daily_challenge_mix"}
          />
        </div>
      </div>

      {/* 7. Ads */}
      <div className="bg-slate-800 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Eye size={20} className="text-teal-400" />
          <h2 className="text-lg font-semibold text-slate-100">Ads</h2>
        </div>

        <div className="flex items-center justify-between py-2">
          <div>
            <span className="text-sm font-medium text-slate-300">
              Ad Visibility
            </span>
            <p className="text-xs text-slate-500 mt-0.5">
              Show ads to free-tier users
            </p>
          </div>
          <Toggle enabled={adVisibility} onChange={setAdVisibility} />
        </div>

        <div className="mt-4 flex justify-end">
          <SaveButton
            onClick={handleSaveAdVisibility}
            saving={savingKey === "ad_visibility"}
          />
        </div>
      </div>

      {/* 8. Audit Log */}
      <div className="bg-slate-800 rounded-xl overflow-hidden">
        <div className="p-6 pb-4">
          <div className="flex items-center gap-2 mb-1">
            <ClipboardList size={20} className="text-slate-400" />
            <h2 className="text-lg font-semibold text-slate-100">
              Audit Log
            </h2>
          </div>
          <p className="text-sm text-slate-400">
            Recent configuration changes
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-700">
                <th className="px-6 py-3 text-left font-semibold text-slate-300">
                  Admin
                </th>
                <th className="px-6 py-3 text-left font-semibold text-slate-300">
                  Action
                </th>
                <th className="px-6 py-3 text-left font-semibold text-slate-300">
                  Setting
                </th>
                <th className="px-6 py-3 text-left font-semibold text-slate-300">
                  Change
                </th>
                <th className="px-6 py-3 text-left font-semibold text-slate-300">
                  Time
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {auditLog.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    No audit log entries yet.
                  </td>
                </tr>
              ) : (
                auditLog.map((entry) => (
                  <tr
                    key={entry.id}
                    className="hover:bg-slate-750 transition-colors"
                  >
                    <td className="px-6 py-3 text-slate-300 whitespace-nowrap">
                      {entry.admin_email ?? "\u2014"}
                    </td>
                    <td className="px-6 py-3 text-slate-400 whitespace-nowrap">
                      {entry.action ?? "\u2014"}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      <span className="inline-block px-2 py-0.5 bg-slate-700 rounded text-xs font-mono text-slate-300">
                        {entry.setting_key ?? "\u2014"}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-slate-400 whitespace-nowrap">
                      <span className="text-red-400">
                        {truncateValue(entry.old_value)}
                      </span>
                      <span className="text-slate-600 mx-1">{"\u2192"}</span>
                      <span className="text-emerald-400">
                        {truncateValue(entry.new_value)}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-slate-500 whitespace-nowrap">
                      {relativeTime(entry.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ── Toggle Sub-component ───────────────────────────────────

interface ToggleProps {
  enabled: boolean;
  onChange: (value: boolean) => void;
}

const Toggle = ({ enabled, onChange }: ToggleProps) => (
  <button
    type="button"
    onClick={() => onChange(!enabled)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/50 ${
      enabled ? "bg-orange-500" : "bg-slate-600"
    }`}
  >
    <span
      className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
        enabled ? "translate-x-6" : "translate-x-1"
      }`}
    />
  </button>
);

// ── Save Button Sub-component ──────────────────────────────

interface SaveButtonProps {
  onClick: () => void;
  saving: boolean;
}

const SaveButton = ({ onClick, saving }: SaveButtonProps) => (
  <button
    onClick={onClick}
    disabled={saving}
    className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium text-white transition-colors"
  >
    {saving ? (
      <Loader2 size={16} className="animate-spin" />
    ) : (
      <Save size={16} />
    )}
    {saving ? "Saving..." : "Save"}
  </button>
);

export default AdminSettingsPage;
