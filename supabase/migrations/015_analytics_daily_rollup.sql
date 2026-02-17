-- Daily rollup table for analytics retention policy
-- Raw events older than 90 days are aggregated here, then deleted

CREATE TABLE IF NOT EXISTS analytics_daily_rollup (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_date DATE NOT NULL,
  event_name TEXT NOT NULL,
  event_count INT DEFAULT 0,
  unique_users INT DEFAULT 0,
  data_summary JSONB DEFAULT '{}',
  UNIQUE(event_date, event_name)
);

CREATE INDEX idx_rollup_event_date_desc
  ON analytics_daily_rollup (event_date DESC);

-- RLS enabled, no policies = service_role access only
ALTER TABLE analytics_daily_rollup ENABLE ROW LEVEL SECURITY;

-- Atomic upsert: increments counts on conflict
CREATE OR REPLACE FUNCTION upsert_daily_rollup(
  p_event_date DATE,
  p_event_name TEXT,
  p_event_count INT,
  p_unique_users INT,
  p_data_summary JSONB
) RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO analytics_daily_rollup
    (event_date, event_name, event_count, unique_users, data_summary)
  VALUES
    (p_event_date, p_event_name, p_event_count, p_unique_users, p_data_summary)
  ON CONFLICT (event_date, event_name)
  DO UPDATE SET
    event_count  = analytics_daily_rollup.event_count + EXCLUDED.event_count,
    unique_users = GREATEST(analytics_daily_rollup.unique_users, EXCLUDED.unique_users),
    data_summary = EXCLUDED.data_summary;
END;
$$;
