export type Difficulty = "easy" | "medium" | "hard";

export type QuestionType = "multiple_choice" | "true_false" | "image_guess";

export type SubscriptionTier = "free" | "pro";

export type CosmeticType = "avatar_frame" | "badge" | "title" | "theme";

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
