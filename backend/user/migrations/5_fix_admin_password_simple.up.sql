-- Update the default admin user with a simple SHA256 hash for password "Admin123!@#"
UPDATE users 
SET password_hash = 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3'
WHERE id = 'default-admin';
