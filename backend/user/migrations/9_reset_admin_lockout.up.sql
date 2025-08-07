-- Reset the admin user's failed login attempts and unlock the account
UPDATE users 
SET 
  failed_login_attempts = 0,
  locked_until = NULL
WHERE id = 'default-admin';
