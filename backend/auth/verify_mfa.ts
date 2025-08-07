import { api, APIError } from "encore.dev/api";
import { userDB } from "../user/db";

export interface VerifyMfaRequest {
  tempToken: string;
  mfaCode: string;
}

export interface VerifyMfaResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: "admin" | "risk_officer" | "auditor";
    mfaEnabled: boolean;
    passwordExpired: boolean;
  };
}

// Verifies MFA code and completes login
export const verifyMfa = api<VerifyMfaRequest, VerifyMfaResponse>(
  { expose: true, method: "POST", path: "/auth/verify-mfa" },
  async (req) => {
    try {
      // Decode and validate temp token
      const tokenData = JSON.parse(Buffer.from(req.tempToken, 'base64').toString());
      
      if (tokenData.type !== 'mfa_pending') {
        throw APIError.invalidArgument("Invalid token type");
      }

      if (Date.now() > tokenData.expires) {
        throw APIError.invalidArgument("Token has expired");
      }

      // Get user and MFA secret
      const user = await userDB.queryRow<{
        id: number;
        email: string;
        role: string;
        mfa_secret: string;
        password_expires_at?: Date;
      }>`
        SELECT id, email, role, mfa_secret, password_expires_at
        FROM users 
        WHERE id = ${tokenData.userID}
      `;

      if (!user) {
        throw APIError.unauthenticated("User not found");
      }

      // Verify MFA code
      const { verifyMfaCode } = await import("../user/mfa");
      const mfaValid = await verifyMfaCode(user.mfa_secret, req.mfaCode);
      
      if (!mfaValid) {
        throw APIError.unauthenticated("Invalid MFA code");
      }

      const passwordExpired = user.password_expires_at && new Date() > new Date(user.password_expires_at);

      // Generate final session token
      const token = Buffer.from(JSON.stringify({
        userID: user.id.toString(),
        email: user.email,
        role: user.role,
        mfaEnabled: true,
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
          mfaEnabled: true,
          passwordExpired: !!passwordExpired,
        }
      };
    } catch (err) {
      if (err instanceof APIError) {
        throw err;
      }
      throw APIError.invalidArgument("Invalid token");
    }
  }
);
