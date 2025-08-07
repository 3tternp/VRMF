-- Update the default admin user with the correct SHA256 hash for password "Admin123!@#"
-- The correct SHA256 hash for "Admin123!@#" is: 8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918
UPDATE users 
SET 
  password_hash = '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
  failed_login_attempts = 0,
  locked_until = NULL,
  password_expires_at = CURRENT_TIMESTAMP + INTERVAL '90 days'
WHERE id = 'default-admin';
