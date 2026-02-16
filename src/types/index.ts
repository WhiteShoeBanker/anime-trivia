export type Difficulty = "easy" | "medium" | "hard" | "impossible";

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
  | "league"
  | "grand_prix"
  | "duel";

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

// ── Grand Prix System ─────────────────────────────────────────

export type GrandPrixStatus = "qualifying" | "in_progress" | "completed";

export type GrandPrixMatchStatus =
  | "pending"
  | "player1_done"
  | "player2_done"
  | "completed"
  | "forfeit";

export interface BracketSeed {
  seed: number;
  userId: string;
  username: string;
}

export interface BracketMatchRef {
  matchNumber: number;
  player1Seed: number;
  player2Seed: number;
}

export interface BracketRound {
  round: number;
  label: string;
  matches: BracketMatchRef[];
}

export interface BracketData {
  seeds: BracketSeed[];
  rounds: BracketRound[];
}

export interface GrandPrixTournament {
  id: string;
  month_start: string;
  status: GrandPrixStatus;
  bracket_data: BracketData | null;
  winner_id: string | null;
  created_at: string;
}

export interface GrandPrixMatch {
  id: string;
  tournament_id: string;
  round: number;
  match_number: number;
  player1_id: string | null;
  player2_id: string | null;
  player1_score: number | null;
  player2_score: number | null;
  player1_time_ms: number | null;
  player2_time_ms: number | null;
  winner_id: string | null;
  anime_id: string | null;
  difficulty: string;
  status: GrandPrixMatchStatus;
  deadline_at: string | null;
  played_at: string | null;
  created_at: string;
}

export interface GrandPrixEmblem {
  id: string;
  tournament_id: string;
  name: string;
  description: string;
  icon_name: string;
  icon_color: string;
  month_label: string;
  rarity: string;
  created_at: string;
}

export interface UserEmblem {
  id: string;
  user_id: string;
  emblem_id: string;
  earned_at: string;
}

export interface UserEmblemWithDetails extends UserEmblem {
  grand_prix_emblems: GrandPrixEmblem;
}

export interface BadgeCheckContext {
  userId: string;
  quizScore?: number;
  quizTotal?: number;
  difficulty?: Difficulty;
  animeId?: string;
  answers?: { isCorrect: boolean; timeMs: number }[];
  xpEarned?: number;
  isDuel?: boolean;
  duelOpponentId?: string;
}

// ── Duel System ───────────────────────────────────────────────

export type DuelMatchType = "quick_match" | "friend_challenge";

export type DuelDifficulty = Difficulty | "mixed";

export type DuelStatus =
  | "waiting"
  | "matched"
  | "in_progress"
  | "completed"
  | "expired"
  | "declined";

export type FriendshipStatus = "pending" | "accepted" | "blocked";

export interface Friendship {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: FriendshipStatus;
  created_at: string;
}

export interface FriendshipWithProfile extends Friendship {
  user_profiles: {
    id: string;
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
    age_group: AgeGroup;
    total_xp: number;
  };
}

export interface DuelMatch {
  id: string;
  challenger_id: string;
  opponent_id: string | null;
  match_type: DuelMatchType;
  anime_id: string | null;
  difficulty: DuelDifficulty;
  question_count: number;
  questions: string[];
  challenger_score: number | null;
  challenger_correct: number | null;
  challenger_time_ms: number | null;
  challenger_answers: Record<string, unknown>[] | null;
  challenger_completed_at: string | null;
  opponent_score: number | null;
  opponent_correct: number | null;
  opponent_time_ms: number | null;
  opponent_answers: Record<string, unknown>[] | null;
  opponent_completed_at: string | null;
  winner_id: string | null;
  status: DuelStatus;
  challenger_xp_earned: number;
  opponent_xp_earned: number;
  expires_at: string;
  created_at: string;
}

export interface DuelStats {
  user_id: string;
  total_duels: number;
  wins: number;
  losses: number;
  draws: number;
  win_streak: number;
  best_win_streak: number;
  giant_kills: number;
  duel_xp_total: number;
}

export interface DuelCreateOptions {
  match_type: DuelMatchType;
  anime_id?: string;
  difficulty: DuelDifficulty;
  question_count: 5 | 10;
  opponent_id?: string;
}
