export type Difficulty = "easy" | "medium" | "hard";

export type QuestionType = "multiple_choice" | "true_false" | "image_guess";

export type SubscriptionTier = "free" | "pro";

export type CosmeticType = "avatar_frame" | "badge" | "title" | "theme";

export type ContentRating = "E" | "T" | "M";

export type AgeGroup = "junior" | "teen" | "full";

export type CosmeticRarity = "common" | "rare" | "epic" | "legendary";

export interface QuestionOption {
  text: string;
  isCorrect: boolean;
}

export interface AnimeSeries {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  genre: string[];
  total_questions: number;
  is_active: boolean;
  content_rating: ContentRating;
  created_at: string;
}

export interface Question {
  id: string;
  anime_id: string;
  question_text: string;
  question_type: QuestionType;
  difficulty: Difficulty;
  options: QuestionOption[];
  explanation: string | null;
  image_url: string | null;
  kid_safe: boolean;
  created_at: string;
}

export interface UserProfile {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  total_xp: number;
  rank: string;
  current_streak: number;
  longest_streak: number;
  last_played_at: string | null;
  subscription_tier: SubscriptionTier;
  is_junior: boolean;
  birth_year: number | null;
  age_group: AgeGroup;
  parent_email: string | null;
  parent_consent_at: string | null;
  emblem_badge_id: string | null;
  created_at: string;
}

export interface QuizSession {
  id: string;
  user_id: string;
  anime_id: string;
  difficulty: Difficulty | null;
  score: number;
  total_questions: number;
  correct_answers: number;
  time_taken_seconds: number | null;
  xp_earned: number;
  completed_at: string;
}

export interface UserAnswer {
  id: string;
  session_id: string;
  question_id: string;
  selected_option: number | null;
  is_correct: boolean;
  time_taken_ms: number | null;
}

export interface StarLeagueWaitlist {
  id: string;
  email: string;
  user_id: string | null;
  signed_up_at: string;
}

export interface Cosmetic {
  id: string;
  name: string;
  description: string | null;
  type: CosmeticType;
  rarity: CosmeticRarity;
  price_coins: number;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface UserCosmetic {
  id: string;
  user_id: string;
  cosmetic_id: string;
  purchased_at: string;
}

// ── League System ─────────────────────────────────────────────

export type LeagueTier = 1 | 2 | 3 | 4 | 5 | 6;

export type LeagueResult = "promoted" | "stayed" | "demoted" | "missed_promotion";

export interface League {
  id: string;
  name: string;
  tier: LeagueTier;
  icon_url: string | null;
  color: string;
  promotion_slots: number;
  demotion_slots: number;
  group_size: number;
  created_at: string;
}

export interface LeagueGroup {
  id: string;
  league_id: string;
  week_start: string;
  is_active: boolean;
  created_at: string;
}

export interface LeagueMembership {
  id: string;
  user_id: string;
  group_id: string;
  league_id: string;
  weekly_xp: number;
  unique_anime_count: number;
  joined_at: string;
}

export interface LeagueMembershipWithProfile extends LeagueMembership {
  user_profiles: {
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
    age_group: AgeGroup;
  };
}

export interface LeagueHistory {
  id: string;
  user_id: string;
  league_id: string;
  group_id: string;
  week_start: string;
  final_rank: number;
  weekly_xp: number;
  unique_anime_count: number;
  result: LeagueResult;
  created_at: string;
}

export interface WeeklyAnimePlay {
  id: string;
  user_id: string;
  anime_id: string;
  week_start: string;
  play_count: number;
  created_at: string;
}

export interface LeagueXpResult {
  leagueXp: number;
  multiplier: number;
  playCount: number;
  nudge: boolean;
}

export interface PromotionRequirements {
  minAnime: number;
  requiresHard: boolean;
  requiresImpossible: number;
}

// ── Badge System ──────────────────────────────────────────────

export type BadgeCategory =
  | "streak"
  | "weekend"
  | "time"
  | "difficulty"
  | "breadth"
  | "volume"
  | "accuracy"
  | "social"
  | "speed"
  | "daily"
  | "special"
  | "league";

export type BadgeRarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

export interface Badge {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: BadgeCategory;
  icon_name: string;
  icon_color: string;
  requirement_type: string;
  requirement_value: Record<string, unknown>;
  rarity: BadgeRarity;
  created_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
}

export interface UserBadgeWithDetails extends UserBadge {
  badges: Badge;
}

export interface BadgeCheckContext {
  userId: string;
  quizScore?: number;
  quizTotal?: number;
  difficulty?: Difficulty;
  animeId?: string;
  answers?: { isCorrect: boolean; timeMs: number }[];
  xpEarned?: number;
}
