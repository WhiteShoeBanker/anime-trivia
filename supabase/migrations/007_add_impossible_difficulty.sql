-- Add 'impossible' to the difficulty CHECK constraint on questions table
ALTER TABLE questions DROP CONSTRAINT IF EXISTS questions_difficulty_check;
ALTER TABLE questions ADD CONSTRAINT questions_difficulty_check
  CHECK (difficulty IN ('easy', 'medium', 'hard', 'impossible'));
