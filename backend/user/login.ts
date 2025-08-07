import { api, APIError } from "encore.dev/api";
import { usersDB } from "./db";
import { LoginRequest, LoginResponse } from "./types";
import { verifyPassword, isPasswordExpired, isAccountLocked, getLockoutTime } from "./utils";

// Logs in a user.
export const login = api<LoginRequest, LoginResponse>(
  { expose: true, method: "POST", path: "/users/login" },
  async (req) => {
    console.log('Login attempt for email:', req.email);
    
    // Get user by email
    const user = await usersDB.queryRow<{
      id: string;
      email: string;
      password_hash: string;
      role: string;
      first_name: string;
      last_name: string;
      profile_picture_url: string | null;
      is_active: boolean;
      mfa_enabled: boolean;
      password_expires_at: Date;
      last_password_change: Date;
      failed_login_attempts: number;
      locked_until: Date | null;
      created_at: Date;
      updated_at: Date;
      created_by: string | null;
      updated_by: string | null;
    }>`
      SELECT 
        id, email, password_hash, role, first_name, last_name,
        profile_picture_url, is_active, mfa_enabled, password_expires_at,
        last_password_change, failed_login_attempts, locked_until,
        created_at, updated_at, created_by, updated_by
      FROM users 
      WHERE email = ${req.email}
    `;

    if (!user) {
      console.log('User not found for email:', req.email);
      throw APIError.unauthenticated("Invalid email or password");
    }

    console.log('User found:', user.email, 'Active:', user.is_active);

    // Check if user is active
    if (!user.is_active) {
      console.log('User account is disabled');
      throw APIError.unauthenticated("Account is disabled");
    }

    // Check if account is locked
    if (isAccountLocked(user.locked_until)) {
      console.log('User account is locked');
      throw APIError.unauthenticated("Account is temporarily locked due to too many failed login attempts");
    }

    console.log('Verifying password for user:', user.email);

    // Verify password
    const isPasswordValid = await verifyPassword(req.password, user.password_hash);
    console.log('Password verification result:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('Password verification failed');
      
      // Increment failed login attempts
      const newFailedAttempts = user.failed_login_attempts + 1;
      const lockoutTime = newFailedAttempts >= 5 ? getLockoutTime() : null;

      await usersDB.exec`
        UPDATE users 
        SET 
          failed_login_attempts = ${newFailedAttempts},
          locked_until = ${lockoutTime},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${user.id}
      `;

      if (newFailedAttempts >= 5) {
        throw APIError.unauthenticated("Account locked due to too many failed login attempts");
      }

      throw APIError.unauthenticated("Invalid email or password");
    }

    // Check if password is expired
    if (isPasswordExpired(user.password_expires_at)) {
      console.log('Password has expired');
      throw APIError.unauthenticated("Password has expired. Please reset your password.");
    }

    // Check MFA settings
    const mfaSettings = await usersDB.queryRow<{ enabled: boolean }>`
      SELECT enabled FROM mfa_settings ORDER BY id DESC LIMIT 1
    `;

    const mfaRequired = mfaSettings?.enabled && user.mfa_enabled;

    // If MFA is required but no code provided, return requiresMfa
    if (mfaRequired && !req.mfaCode) {
      return {
        user: {
          id: user.id,
          email: user.email,
          role: user.role as any,
          firstName: user.first_name,
          lastName: user.last_name,
          profilePictureUrl: user.profile_picture_url || undefined,
          isActive: user.is_active,
          mfaEnabled: user.mfa_enabled,
          passwordExpiresAt: user.password_expires_at,
          lastPasswordChange: user.last_password_change,
          failedLoginAttempts: user.failed_login_attempts,
          lockedUntil: user.locked_until || undefined,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
          createdBy: user.created_by || undefined,
          updatedBy: user.updated_by || undefined,
        },
        token: "",
        requiresMfa: true,
      };
    }

    // TODO: Verify MFA code if provided and required
    if (mfaRequired && req.mfaCode) {
      // For now, we'll skip MFA verification
      // In a real implementation, you would verify the MFA code here
    }

    // Reset failed login attempts on successful login
    await usersDB.exec`
      UPDATE users 
      SET 
        failed_login_attempts = 0,
        locked_until = NULL,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${user.id}
    `;

    console.log('Login successful for user:', user.email);

    // Use user ID as token for simplicity
    const token = user.id;

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role as any,
        firstName: user.first_name,
        lastName: user.last_name,
        profilePictureUrl: user.profile_picture_url || undefined,
        isActive: user.is_active,
        mfaEnabled: user.mfa_enabled,
        passwordExpiresAt: user.password_expires_at,
        lastPasswordChange: user.last_password_change,
        failedLoginAttempts: 0,
        lockedUntil: undefined,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        createdBy: user.created_by || undefined,
        updatedBy: user.updated_by || undefined,
      },
      token,
      requiresMfa: false,
    };
  }
);
