-- Reset: APM initial state = nothing active until superadmin stores a DB key
-- and explicitly activates ONE provider + ONE model (activation requires a key).
UPDATE ai_providers SET enabled = false;
UPDATE ai_models SET enabled = false;
