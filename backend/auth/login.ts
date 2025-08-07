import { api, Cookie, APIError } from "encore.dev/api";
import { userDB } from "../user/db";
import { verifyPassword } from "../user/utils";

export interface LoginRequest {
  email: string;
  password: string;
  mfaCode?: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: "admin" | "risk_officer" | "auditor";
    mfaEnabled: boolean;
    passwordExpired: boolean;
  };
  session: Cookie<"session">;
  requiresMfa?: boolean;
  tempToken?: string;
}

// Login endpoint with MFA support
export const login = api<LoginRequest, LoginResponse>(
  { expose: true, method: "POST", path: "/auth/login" },
  async (req) => {
    try {
      // Find user by email
      const user = await userDB.queryRow<{
        id: number;
        email: string;
        password: string;
        role: string;
        mfa_enabled: boolean;
        mfa_secret?: string;
        password_expires_at?: Date;
        failed_login_attempts: number;
        locked_until?: Date;
      }>`
        SELECT id, email, password, role, mfa_enabled, mfa_secret, 
               password_expires_at, failed_login_attempts, locked_until
        FROM users 
        WHERE email = ${req.email}
      `;

      if (!user) {
        throw APIError.unauthenticated("Invalid email or password");
      }

      // Check if account is locked
      if (user.locked_until && new Date() < new Date(user.locked_until)) {
        throw APIError.permissionDenied("Account is temporarily locked due to too many failed login attempts");
      }

      // Verify password
      let passwordValid = false;
      try {
        passwordValid = await verifyPassword(req.password, user.password);
      } catch (error) {
        console.error('Password verification error:', error);
        passwordValid = false;
      }

      if (!passwordValid) {
        // Increment failed login attempts
        const newFailedAttempts = user.failed_login_attempts + 1;
        let lockUntil = null;
        
        if (newFailedAttempts >= 5) {
          lockUntil = new Date(Date.now() + 30 * 60 * 1000); // Lock for 30 minutes
        }

        await userDB.exec`
          UPDATE users 
          SET failed_login_attempts = ${newFailedAttempts},
              locked_until = ${lockUntil}
          WHERE id = ${user.id}
        `;

        throw APIError.unauthenticated("Invalid email or password");
      }

      // Reset failed login attempts on successful password verification
      await userDB.exec`
        UPDATE users 
        SET failed_login_attempts = 0, locked_until = NULL
        WHERE id = ${user.id}
      `;

      const passwordExpired = user.password_expires_at && new Date() > new Date(user.password_expires_at);

      // Check if MFA is enabled and code is required
      if (user.mfa_enabled && !req.mfaCode) {
        // Generate temporary token for MFA verification
        const tempToken = Buffer.from(JSON.stringify({
          userID: user.id.toString(),
          email: user.email,
          role: user.role,
          type: 'mfa_pending',
          expires: Date.now() + 300000, // 5 minutes
        })).toString('base64');

        return {
          token: '',
          user: {
            id: user.id.toString(),
            email: user.email,
            role: user.role as "admin" | "risk_officer" | "auditor",
            mfaEnabled: user.mfa_enabled,
            passwordExpired: !!passwordExpired,
          },
          session: {
            value: '',
            expires: new Date(Date.now() + 300000),
            httpOnly: true,
            secure: true,
            sameSite: "Lax",
          },
          requiresMfa: true,
          tempToken,
        };
      }

      // Verify MFA code if provided
      if (user.mfa_enabled && req.mfaCode) {
        const { verifyMfaCode } = await import("../user/mfa");
        const mfaValid = await verifyMfaCode(user.mfa_secret!, req.mfaCode);
        
        if (!mfaValid) {
          throw APIError.unauthenticated("Invalid MFA code");
        }
      }

      // Generate session token
      const token = Buffer.from(JSON.stringify({
        userID: user.id.toString(),
        email: user.email,
        role: user.role,
        mfaEnabled: user.mfa_enabled,
        passwordExpired: !!passwordExpired,
      })).toString('base64');

      // Update last login
      await userDB.exec`
        UPDATE users 
        SET last_login = NOW()
        WHERE id = ${user.id}
      `;

      return {
        token,
        user: {
          id: user.id.toString(),
          email: user.email,
          role: user.role as "admin" | "risk_officer" | "auditor",
          mfaEnabled: user.mfa_enabled,
          passwordExpired: !!passwordExpired,
        },
        session: {
          value: token,
          expires: new Date(Date.now() + 3600 * 24 * 30 * 1000), // 30 days
          httpOnly: true,
          secure: true,
          sameSite: "Lax",
        }
      };
    } catch (error) {
      console.error('Login error:', error);
      
      if (error instanceof APIError) {
        throw error;
      }
      
      throw APIError.internal("An error occurred during login. Please try again.");
    }
  }
);
