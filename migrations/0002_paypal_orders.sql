CREATE TABLE IF NOT EXISTS paypal_orders (
  order_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  amount_jpy INTEGER NOT NULL CHECK (amount_jpy BETWEEN 100 AND 1000000),
  status TEXT NOT NULL CHECK (status IN ('CREATED', 'COMPLETED', 'FAILED')),
  captured_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS paypal_orders_user_created_at_idx
  ON paypal_orders (user_id, created_at DESC);
