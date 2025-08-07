export async function hashPassword(password: string): Promise<string> {
  // Use Node.js built-in crypto for password hashing
  const crypto = await import('crypto');
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  try {
    // Handle the default admin password with a simple comparison for demo
    if (hashedPassword === 'demo_admin_hash' && password === 'admin123456') {
      return true;
    }
    
    // Handle new format passwords
    const parts = hashedPassword.split(':');
    if (parts.length !== 2) {
      return false;
    }
    
    const [salt, hash] = parts;
    const crypto = await import('crypto');
    const verifyHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return hash === verifyHash;
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

export function validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 10) {
    errors.push("Password must be at least 10 characters long");
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Only JPEG, JPG, and PNG files are allowed'
    };
  }
  
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size must be less than 5MB'
    };
  }
  
  return { valid: true };
}
