"use server";

import { trackEvent } from "@/lib/analytics";

export const trackQuizStarted = async (
  userId: string,
  data: { anime_slug: string; difficulty: string }
) => {
  await trackEvent("quiz_started", userId, data);
};

export const trackQuizCompleted = async (
  userId: string,
  data: {
    anime_slug: string;
    difficulty: string;
    score: number;
    total: number;
    xp_earned: number;
  }
) => {
  await trackEvent("quiz_completed", userId, data);
};

export const trackQuizAbandoned = async (
  userId: string,
  data: { anime_slug: string; difficulty: string; question_index: number }
) => {
  await trackEvent("quiz_abandoned", userId, data);
};

export const trackSignup = async (
  userId: string,
  data: { age_group: string; auth_provider?: string }
) => {
  await trackEvent("signup", userId, data);
};

export const trackLogin = async (userId: string) => {
  await trackEvent("login", userId);
};

export const trackBadgeEarned = async (
  userId: string,
  data: { badge_slug: string; badge_name: string }
) => {
  await trackEvent("badge_earned", userId, data);
};

export const trackLeaguePromoted = async (
  userId: string,
  data: { from_tier: number; to_tier: number }
) => {
  await trackEvent("league_promoted", userId, data);
};

export const trackLeagueDemoted = async (
  userId: string,
  data: { from_tier: number; to_tier: number }
) => {
  await trackEvent("league_demoted", userId, data);
};

export const trackDailyChallengeCompleted = async (
  userId: string,
  data: { score: number; total: number; xp_earned: number }
) => {
  await trackEvent("daily_challenge_completed", userId, data);
};

export const trackQuizLimitHit = async (
  userId: string,
  data: { count: number; limit: number }
) => {
  await trackEvent("quiz_limit_hit", userId, data);
};

export const trackShopView = async (userId?: string) => {
  await trackEvent("shop_view", userId);
};

export const trackSessionStart = async (userId?: string) => {
  await trackEvent("session_start", userId);
};

export const trackSessionEnd = async (userId?: string) => {
  await trackEvent("session_end", userId);
};

export const trackDuelCreated = async (
  userId: string,
  data: {
    match_type: string;
    difficulty: string;
    question_count: number;
    duel_id: string;
  }
) => {
  await trackEvent("duel_created", userId, data);
};

export const trackDuelCompleted = async (
  userId: string,
  data: {
    duel_id: string;
    match_type: string;
    winner_id: string | null;
    tier_diff?: number;
    xp_earned: number;
  }
) => {
  await trackEvent("duel_completed", userId, data);
};

export const trackFriendRequestSent = async (
  userId: string,
  data: { recipient_id: string }
) => {
  await trackEvent("friend_request_sent", userId, data);
};

export const trackFriendRequestAccepted = async (
  userId: string,
  data: { friendship_id: string }
) => {
  await trackEvent("friend_request_accepted", userId, data);
};

export const trackPromoCodeRedeemed = async (
  userId: string,
  data: { code_type: string; code_id: string }
) => {
  await trackEvent("promo_code_redeemed", userId, data);
};

export const trackAdminConfigChange = async (data: {
  admin_email: string;
  setting_key: string;
}) => {
  await trackEvent("admin_config_change", undefined, data);
};

export const trackAdminUserUpgrade = async (data: {
  admin_email: string;
  target_user_id: string;
  tier: string;
}) => {
  await trackEvent("admin_user_upgrade", undefined, data);
};
