CREATE TABLE IF NOT EXISTS institution_reads (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('status', 'demo_inquiry')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS institution_reads_user_created_at_idx
  ON institution_reads (user_id, created_at DESC);
