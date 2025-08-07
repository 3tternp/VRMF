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
      let decoded;
      try {
        const decodedString = Buffer.from(token, 'base64').toString('utf8');
        decoded = JSON.parse(decodedString);
      } catch (parseError) {
        console.error('Token parsing error:', parseError);
        throw APIError.unauthenticated("invalid token format");
      }
      
      // Validate token structure
      if (!decoded.userID || !decoded.email || !decoded.role) {
        throw APIError.unauthenticated("invalid token structure");
      }
      
      // Convert userID to number for database query
      const userIdNumber = parseInt(decoded.userID);
      if (isNaN(userIdNumber)) {
        throw APIError.unauthenticated("invalid user ID in token");
      }
      
      // Get user details from database to check current status
      const user = await userDB.queryRow<{
        id: number;
        email: string;
        role: string;
        mfa_enabled: boolean;
        password_expires_at: Date | null;
      }>`
        SELECT id, email, role, mfa_enabled, password_expires_at 
        FROM users 
        WHERE id = ${userIdNumber}
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
      if (err instanceof APIError) {
        throw err;
      }
      throw APIError.unauthenticated("invalid token");
    }
  }
);

export const gw = new Gateway({ authHandler: auth });
