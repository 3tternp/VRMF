CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'iso_officer', 'auditor')),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  profile_picture_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  mfa_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  mfa_secret TEXT,
  password_expires_at TIMESTAMP NOT NULL,
  last_password_change TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  failed_login_attempts INTEGER NOT NULL DEFAULT 0,
  locked_until TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by TEXT,
  updated_by TEXT
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

-- Insert default admin user
INSERT INTO users (
  id, 
  email, 
  password_hash, 
  role, 
  first_name, 
  last_name, 
  password_expires_at
) VALUES (
  'default-admin',
  'admin@riskmanagement.com',
  '$2b$12$LQv3c1yqBw2fyuDiIHHDNe7qjVdNDJLLp0/HjgheuKbngW1cJ0yx.',
  'admin',
  'Default',
  'Admin',
  CURRENT_TIMESTAMP + INTERVAL '90 days'
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_reset_token ON users(reset_token);
CREATE INDEX idx_users_locked_until ON users(locked_until);
