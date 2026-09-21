-- Monthly per-tenant usage counters (atomic quota enforcement).
-- One row per (tenant_id, period 'YYYY-MM'); incremented atomically after
-- each successful LLM call via ON CONFLICT on the partial unique index.

CREATE TABLE IF NOT EXISTS usage_counters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  period text NOT NULL,
  tokens_in integer NOT NULL DEFAULT 0,
  tokens_out integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_usage_counters_scope ON usage_counters (tenant_id, period);
CREATE INDEX IF NOT EXISTS idx_usage_counters_deleted_at ON usage_counters (deleted_at);
CREATE UNIQUE INDEX IF NOT EXISTS uq_usage_counters_tenant_period ON usage_counters (tenant_id, period) WHERE deleted_at IS NULL;
