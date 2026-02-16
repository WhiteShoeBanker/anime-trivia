-- Update total question counts after adding impossible difficulty questions
UPDATE anime_series SET total_questions = (
  SELECT COUNT(*) FROM questions WHERE anime_id = anime_series.id
);
