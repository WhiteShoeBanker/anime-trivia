-- OtakuQuiz Auth & Age Filtering
-- Adds: content_rating, kid_safe, age_group, birth_year, parent consent
-- Updates RLS policies for age-based content filtering

-- =============================================================
-- 1. Add content_rating to anime_series
-- =============================================================
ALTER TABLE anime_series
  ADD COLUMN content_rating TEXT NOT NULL DEFAULT 'E'
    CHECK (content_rating IN ('E', 'T', 'M'));

-- =============================================================
-- 2. Add kid_safe to questions
-- =============================================================
ALTER TABLE questions
  ADD COLUMN kid_safe BOOLEAN DEFAULT true;

-- =============================================================
-- 3. Add age fields to user_profiles
-- =============================================================
ALTER TABLE user_profiles
  ADD COLUMN birth_year INTEGER,
  ADD COLUMN age_group TEXT DEFAULT 'full'
    CHECK (age_group IN ('junior', 'teen', 'full')),
  ADD COLUMN parent_email TEXT,
  ADD COLUMN parent_consent_at TIMESTAMPTZ;

-- =============================================================
-- 4. Set content ratings by slug
-- =============================================================
-- E (Everyone 6+): already default
UPDATE anime_series SET content_rating = 'E'
  WHERE slug IN ('dragon-ball-z', 'my-hero-academia', 'naruto', 'one-piece');

-- T (Teen 13+)
UPDATE anime_series SET content_rating = 'T'
  WHERE slug IN ('demon-slayer', 'jujutsu-kaisen');

-- M (Mature 16+)
UPDATE anime_series SET content_rating = 'M'
  WHERE slug IN ('death-note', 'attack-on-titan');

-- =============================================================
-- 5. Mark non-kid-safe questions
-- =============================================================
UPDATE questions SET kid_safe = false
  WHERE question_text IN (
    'What is the name of Sasuke''s older brother?',
    'What is Kakashi''s father''s name and his famous nickname?',
    'What is the name of the forbidden jutsu that reanimates the dead, used extensively by Kabuto during the Fourth Great Ninja War?',
    'What organization does Itachi join after leaving the Hidden Leaf Village?',
    'According to Madara Uchiha, what is the purpose of the Infinite Tsukuyomi?',
    'What is the name of the hero killer who targets heroes he considers unworthy?',
    'What is Eri''s Quirk and why is it significant to the villain Overhaul?',
    'Who is the galactic Emperor who destroyed Planet Vegeta?',
    'Who defeats Cell in the Cell Games?',
    'Who are the Five Elders (Gorosei)?'
  );

-- =============================================================
-- 6. Update RLS policies for age-based filtering
-- =============================================================

-- Drop existing permissive policies
DROP POLICY "anime_series_select" ON anime_series;
DROP POLICY "questions_select" ON questions;

-- anime_series: filter by age group
CREATE POLICY "anime_series_select" ON anime_series
  FOR SELECT USING (
    CASE
      WHEN auth.uid() IS NULL THEN true
      WHEN (SELECT age_group FROM user_profiles WHERE id = auth.uid()) = 'junior'
        THEN content_rating = 'E'
      WHEN (SELECT age_group FROM user_profiles WHERE id = auth.uid()) = 'teen'
        THEN content_rating IN ('E', 'T')
      ELSE true
    END
  );

-- questions: filter by age group + kid_safe
CREATE POLICY "questions_select" ON questions
  FOR SELECT USING (
    CASE
      WHEN auth.uid() IS NULL THEN true
      WHEN (SELECT age_group FROM user_profiles WHERE id = auth.uid()) = 'junior'
        THEN kid_safe = true AND difficulty IN ('easy', 'medium')
      WHEN (SELECT age_group FROM user_profiles WHERE id = auth.uid()) = 'teen'
        THEN true
      ELSE true
    END
  );

-- =============================================================
-- 7. Update handle_new_user trigger to include age_group
-- =============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, username, display_name, age_group)
  VALUES (
    NEW.id,
    SPLIT_PART(NEW.email, '@', 1),
    SPLIT_PART(NEW.email, '@', 1),
    'full'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
