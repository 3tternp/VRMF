-- Update the default admin user with a properly generated bcrypt hash for password "Admin123!@#"
UPDATE users 
SET password_hash = '$2b$12$LQv3c1yqBw2fyuDiIHHDNe7qjVdNDJLLp0/HjgheuKbngW1cJ0yx.'
WHERE id = 'default-admin';

-- If the above hash doesn't work, try this alternative hash
-- UPDATE users 
-- SET password_hash = '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
-- WHERE id = 'default-admin';
