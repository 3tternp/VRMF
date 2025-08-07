import { Header, Cookie, APIError, Gateway } from "encore.dev/api";
import { authHandler } from "encore.dev/auth";
import { userDB } from "../user/db";

interface AuthParams {
  authorization?: Header<"Authorization">;
  session?: Cookie<"session">;
}

export interface AuthData {
  userID: string;
  email: string;
  role: "admin" | "risk_officer" | "auditor";
  mfaEnabled: boolean;
  passwordExpired: boolean;
}

const auth = authHandler<AuthParams, AuthData>(
  async (data) => {
    const token = data.authorization?.replace("Bearer ", "") ?? data.session?.value;
    if (!token) {
      throw APIError.unauthenticated("missing token");
    }

    try {
      // Decode the base64 token and parse as JSON
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
      
      // Validate token structure
      if (!decoded.userID || !decoded.email || !decoded.role) {
        throw APIError.unauthenticated("invalid token structure");
      }
      
      // Get user details from database to check current status
      const user = await userDB.queryRow<{
        id: number;
        email: string;
        role: string;
        mfa_enabled: boolean;
        password_expires_at: Date;
      }>`
        SELECT id, email, role, mfa_enabled, password_expires_at 
        FROM users 
        WHERE id = ${decoded.userID}
      `;

      if (!user) {
        throw APIError.unauthenticated("user not found");
      }

      // Verify the token data matches the current user data
      if (user.email !== decoded.email || user.role !== decoded.role) {
        throw APIError.unauthenticated("token data mismatch");
      }

      const passwordExpired = user.password_expires_at && new Date() > new Date(user.password_expires_at);

      return {
        userID: decoded.userID,
        email: user.email,
        role: user.role as "admin" | "risk_officer" | "auditor",
        mfaEnabled: user.mfa_enabled,
        passwordExpired: !!passwordExpired,
      };
    } catch (err) {
      console.error('Auth handler error:', err);
      throw APIError.unauthenticated("invalid token", err);
    }
  }
);

export const gw = new Gateway({ authHandler: auth });
