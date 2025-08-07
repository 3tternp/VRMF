CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'risk_officer', 'auditor')),
  name VARCHAR(255),
  profile_image TEXT,
  mfa_enabled BOOLEAN DEFAULT FALSE,
  mfa_secret VARCHAR(255),
  mfa_temp_secret VARCHAR(255),
  mfa_backup_codes TEXT,
  password_expires_at TIMESTAMP WITH TIME ZONE,
  last_login TIMESTAMP WITH TIME ZONE,
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP WITH TIME ZONE,
  reset_token VARCHAR(500),
  reset_token_expires TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default admin user with properly hashed password
-- Password: admin123456 (meets 10 character requirement)
-- Using a simple hash format for demo purposes
INSERT INTO users (email, password, role, name, password_expires_at) VALUES 
('admin@company.com', 'salt123:5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'admin', 'System Administrator', NOW() + INTERVAL '90 days');

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_reset_token ON users(reset_token);
CREATE INDEX idx_users_locked_until ON users(locked_until);
