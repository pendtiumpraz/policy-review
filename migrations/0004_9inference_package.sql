-- 9inference "Package" provider (separate base URL) with a single model.

INSERT INTO ai_providers (code, name, base_url) VALUES
  ('9inference-package', '9inference Package', 'https://9inference.cloud/v1/package')
ON CONFLICT (code) DO NOTHING;

INSERT INTO ai_models (provider_id, name, model_id, description)
SELECT id, 'DeepSeek V4 Pro 0813', 'deepseek-v4-pro-0813', '9inference package model'
FROM ai_providers WHERE code = '9inference-package'
ON CONFLICT (provider_id, model_id) DO NOTHING;
