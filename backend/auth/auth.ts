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
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
      
      // Get user details from database to check MFA and password expiry
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

      const passwordExpired = user.password_expires_at && new Date() > new Date(user.password_expires_at);

      return {
        userID: decoded.userID,
        email: user.email,
        role: user.role as "admin" | "risk_officer" | "auditor",
        mfaEnabled: user.mfa_enabled,
        passwordExpired: !!passwordExpired,
      };
    } catch (err) {
      throw APIError.unauthenticated("invalid token", err);
    }
  }
);

export const gw = new Gateway({ authHandler: auth });
