CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'risk_officer', 'auditor')),
  name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default admin user
INSERT INTO users (email, password, role, name) VALUES 
('admin@company.com', 'admin123', 'admin', 'System Administrator'),
('risk@company.com', 'risk123', 'risk_officer', 'Risk Officer'),
('auditor@company.com', 'audit123', 'auditor', 'Auditor');

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
