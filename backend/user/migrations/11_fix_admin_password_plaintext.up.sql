-- Update the default admin user with plain text password "Admin123!@#"
UPDATE users 
SET 
  password_hash = 'Admin123!@#',
  failed_login_attempts = 0,
  locked_until = NULL,
  password_expires_at = CURRENT_TIMESTAMP + INTERVAL '90 days'
WHERE id = 'default-admin';
