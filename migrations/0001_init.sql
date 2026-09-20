-- Policy Review — initial schema (Sainskerta: no FK, soft delete, snake_case)

CREATE TABLE IF NOT EXISTS tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  brand_primary_color text NOT NULL DEFAULT '#10b981',
  brand_logo_url text,
  token_quota integer NOT NULL DEFAULT 0,
  is_platform boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_tenants_deleted_at ON tenants (deleted_at);

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  email text NOT NULL UNIQUE,
  name text,
  role text NOT NULL DEFAULT 'member',
  password_hash text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users (tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users (deleted_at);

CREATE TABLE IF NOT EXISTS ai_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  base_url text,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_ai_providers_deleted_at ON ai_providers (deleted_at);

CREATE TABLE IF NOT EXISTS ai_models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL,
  name text NOT NULL,
  model_id text NOT NULL,
  description text,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_ai_models_provider_id ON ai_models (provider_id);
CREATE INDEX IF NOT EXISTS idx_ai_models_deleted_at ON ai_models (deleted_at);
CREATE UNIQUE INDEX IF NOT EXISTS uq_ai_models_provider_model ON ai_models (provider_id, model_id);

CREATE TABLE IF NOT EXISTS tenant_ai_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  provider_id uuid NOT NULL,
  api_key_cipher text NOT NULL,
  base_url text,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_tenant_ai_keys_tenant_id ON tenant_ai_keys (tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_ai_keys_provider_id ON tenant_ai_keys (provider_id);
CREATE INDEX IF NOT EXISTS idx_tenant_ai_keys_deleted_at ON tenant_ai_keys (deleted_at);

CREATE TABLE IF NOT EXISTS usage_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  provider_id uuid,
  model_id uuid,
  operation text NOT NULL,
  input_tokens integer NOT NULL DEFAULT 0,
  output_tokens integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_usage_records_tenant_id ON usage_records (tenant_id);
CREATE INDEX IF NOT EXISTS idx_usage_records_created_at ON usage_records (created_at);

CREATE TABLE IF NOT EXISTS regulations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  title text NOT NULL,
  kind text NOT NULL DEFAULT 'external',
  source text,
  description text,
  content text,
  file_name text,
  file_path text,
  checklist jsonb NOT NULL DEFAULT '[]',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_regulations_tenant_id ON regulations (tenant_id);
CREATE INDEX IF NOT EXISTS idx_regulations_deleted_at ON regulations (deleted_at);

CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  title text NOT NULL,
  doc_type text NOT NULL DEFAULT 'kebijakan_privasi',
  extracted_text text,
  file_name text,
  file_path text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_documents_tenant_id ON documents (tenant_id);
CREATE INDEX IF NOT EXISTS idx_documents_deleted_at ON documents (deleted_at);

CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  title text NOT NULL,
  doc_type text NOT NULL DEFAULT 'kebijakan_privasi',
  document_id uuid,
  regulation_ids jsonb NOT NULL DEFAULT '[]',
  regulation_checklist jsonb NOT NULL DEFAULT '[]',
  status text NOT NULL DEFAULT 'pending',
  risk_score integer NOT NULL DEFAULT 0,
  review_summary jsonb,
  error_message text,
  provider_id uuid,
  model_id uuid,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_reviews_tenant_id ON reviews (tenant_id);
CREATE INDEX IF NOT EXISTS idx_reviews_deleted_at ON reviews (deleted_at);

CREATE TABLE IF NOT EXISTS review_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  review_id uuid NOT NULL,
  section_title text NOT NULL,
  status text NOT NULL DEFAULT 'missing',
  score integer NOT NULL DEFAULT 0,
  gap_description text,
  recommendation text,
  reference text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_review_sections_review_id ON review_sections (review_id);
CREATE INDEX IF NOT EXISTS idx_review_sections_tenant_id ON review_sections (tenant_id);
CREATE INDEX IF NOT EXISTS idx_review_sections_deleted_at ON review_sections (deleted_at);

-- Default provider catalog (superadmin can edit).
INSERT INTO ai_providers (code, name, base_url) VALUES
  ('openai', 'OpenAI', 'https://api.openai.com/v1'),
  ('anthropic', 'Anthropic', 'https://api.anthropic.com'),
  ('google', 'Google Gemini', 'https://generativelanguage.googleapis.com'),
  ('deepseek', 'DeepSeek', 'https://api.deepseek.com')
ON CONFLICT (code) DO NOTHING;

-- Default model catalog (superadmin can add/disable).
INSERT INTO ai_models (provider_id, name, model_id, description)
SELECT id, 'GPT-4o mini', 'gpt-4o-mini', 'Fast, low-cost OpenAI model'
FROM ai_providers WHERE code = 'openai' ON CONFLICT (provider_id, model_id) DO NOTHING;
INSERT INTO ai_models (provider_id, name, model_id, description)
SELECT id, 'GPT-4o', 'gpt-4o', 'Best-in-class OpenAI model'
FROM ai_providers WHERE code = 'openai' ON CONFLICT (provider_id, model_id) DO NOTHING;
INSERT INTO ai_models (provider_id, name, model_id, description)
SELECT id, 'Claude Sonnet 4.6', 'claude-sonnet-4-6', 'Balanced Anthropic model'
FROM ai_providers WHERE code = 'anthropic' ON CONFLICT (provider_id, model_id) DO NOTHING;
INSERT INTO ai_models (provider_id, name, model_id, description)
SELECT id, 'Claude Haiku 4.5', 'claude-haiku-4-5', 'Fast Anchroopic model'
FROM ai_providers WHERE code = 'anthropic' ON CONFLICT (provider_id, model_id) DO NOTHING;
INSERT INTO ai_models (provider_id, name, model_id, description)
SELECT id, 'Gemini 2.5 Flash', 'gemini-2.5-flash', 'Fast Google model'
FROM ai_providers WHERE code = 'google' ON CONFLICT (provider_id, model_id) DO NOTHING;
INSERT INTO ai_models (provider_id, name, model_id, description)
SELECT id, 'DeepSeek Chat', 'deepseek-chat', 'Low-cost DeepSeek model'
FROM ai_providers WHERE code = 'deepseek' ON CONFLICT (provider_id, model_id) DO NOTHING;

