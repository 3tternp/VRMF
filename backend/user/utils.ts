import crypto from 'crypto';
import { APIError } from 'encore.dev/api';

export function validatePassword(password: string): void {
  if (password.length < 10) {
    throw APIError.invalidArgument("Password must be at least 10 characters long");
  }

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
    throw APIError.invalidArgument(
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    );
  }
}

export async function hashPassword(password: string): Promise<string> {
  validatePassword(password);
  // Store password as plain text for simplicity
  return password;
}

export async function verifyPassword(password: string, storedPassword: string): Promise<boolean> {
  console.log('Verifying password');
  console.log('Input password:', password);
  console.log('Stored password:', storedPassword);
  
  // Simple string comparison
  const result = password === storedPassword;
  console.log('Verification result:', result);
  return result;
}

export function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function getPasswordExpiryDate(): Date {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 90);
  return expiryDate;
}

export function generateUserId(): string {
  return crypto.randomUUID();
}

export function isPasswordExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}

export function isAccountLocked(lockedUntil?: Date): boolean {
  if (!lockedUntil) return false;
  return new Date() < lockedUntil;
}
