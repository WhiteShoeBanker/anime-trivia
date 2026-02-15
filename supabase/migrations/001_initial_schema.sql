-- OtakuQuiz Initial Schema
-- Tables: anime_series, questions, user_profiles, quiz_sessions, user_answers
-- RLS enabled on all tables with appropriate policies

-- =============================================================
-- 1. anime_series
-- =============================================================
CREATE TABLE anime_series (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  genre TEXT[],
  total_questions INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================
-- 2. questions
-- =============================================================
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anime_id UUID NOT NULL REFERENCES anime_series(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT DEFAULT 'multiple_choice'
    CHECK (question_type IN ('multiple_choice', 'true_false', 'image_guess')),
  difficulty TEXT NOT NULL
    CHECK (difficulty IN ('easy', 'medium', 'hard')),
  options JSONB NOT NULL,
  explanation TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_questions_anime_difficulty ON questions (anime_id, difficulty);

-- =============================================================
-- 3. user_profiles
-- =============================================================
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  total_xp INTEGER DEFAULT 0,
  rank TEXT DEFAULT 'Genin',
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_played_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_profiles_xp ON user_profiles (total_xp DESC);

-- =============================================================
-- 4. quiz_sessions
-- =============================================================
CREATE TABLE quiz_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  anime_id UUID REFERENCES anime_series(id),
  difficulty TEXT,
  score INTEGER DEFAULT 0,
  total_questions INTEGER,
  correct_answers INTEGER DEFAULT 0,
  time_taken_seconds INTEGER,
  xp_earned INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================
-- 5. user_answers
-- =============================================================
CREATE TABLE user_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES quiz_sessions(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id),
  selected_option INTEGER,
  is_correct BOOLEAN,
  time_taken_ms INTEGER
);

-- =============================================================
-- 6. Row Level Security
-- =============================================================

-- anime_series: everyone can read
ALTER TABLE anime_series ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anime_series_select" ON anime_series
  FOR SELECT USING (true);

-- questions: everyone can read
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "questions_select" ON questions
  FOR SELECT USING (true);

-- user_profiles: everyone can read, owners can insert/update/delete
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_profiles_select" ON user_profiles
  FOR SELECT USING (true);

CREATE POLICY "user_profiles_insert" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "user_profiles_update" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "user_profiles_delete" ON user_profiles
  FOR DELETE USING (auth.uid() = id);

-- quiz_sessions: users can read and insert their own rows
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quiz_sessions_select" ON quiz_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "quiz_sessions_insert" ON quiz_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- user_answers: users can read and insert their own rows
ALTER TABLE user_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_answers_select" ON user_answers
  FOR SELECT USING (
    session_id IN (
      SELECT id FROM quiz_sessions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "user_answers_insert" ON user_answers
  FOR INSERT WITH CHECK (
    session_id IN (
      SELECT id FROM quiz_sessions WHERE user_id = auth.uid()
    )
  );

-- =============================================================
-- 7. Auto-create user_profiles on signup
-- =============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, username, display_name)
  VALUES (
    NEW.id,
    SPLIT_PART(NEW.email, '@', 1),
    SPLIT_PART(NEW.email, '@', 1)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
