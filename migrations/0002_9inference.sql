-- 9inference provider (OpenAI-compatible, bearer token) + its model catalog.

INSERT INTO ai_providers (code, name, base_url) VALUES
  ('9inference', '9inference', 'https://9inference.cloud/v1')
ON CONFLICT (code) DO NOTHING;

INSERT INTO ai_models (provider_id, name, model_id, description)
SELECT id, v.name, v.model_id, '9inference model'
FROM ai_providers, (VALUES
  ('deepseek-v4-pro', 'DeepSeek V4 Pro'),
  ('deepseek-v4-flash', 'DeepSeek V4 Flash'),
  ('deepseek-v4-flash-0731', 'DeepSeek V4 Flash 0731'),
  ('glm-5.2', 'GLM 5.2'),
  ('glm-5.3', 'GLM 5.3'),
  ('gpt-oss-120b', 'GPT-OSS 120B'),
  ('glm-5.3-flash', 'GLM 5.3 Flash'),
  ('nemotron-3-ultra', 'Nemotron 3 Ultra'),
  ('kimi-k2.7-code', 'Kimi K2.7 Code'),
  ('minimax-m3', 'MiniMax M3'),
  ('deepseek-v4-pro-0813', 'DeepSeek V4 Pro 0813'),
  ('qwen3.8-max', 'Qwen 3.8 Max'),
  ('kimi-k3', 'Kimi K3')
) AS v(model_id, name)
WHERE ai_providers.code = '9inference'
ON CONFLICT (provider_id, model_id) DO NOTHING;
