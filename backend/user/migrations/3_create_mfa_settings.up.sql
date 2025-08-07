CREATE TABLE mfa_settings (
  id SERIAL PRIMARY KEY,
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  updated_by TEXT NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Insert default MFA setting (disabled)
INSERT INTO mfa_settings (enabled, updated_by) VALUES (FALSE, 'system');
