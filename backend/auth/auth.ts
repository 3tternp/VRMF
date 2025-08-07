import { Header, Cookie, APIError, Gateway } from "encore.dev/api";
import { authHandler } from "encore.dev/auth";

interface AuthParams {
  authorization?: Header<"Authorization">;
  session?: Cookie<"session">;
}

export interface AuthData {
  userID: string;
  email: string;
  role: "admin" | "risk_officer" | "auditor";
}

const auth = authHandler<AuthParams, AuthData>(
  async (data) => {
    const token = data.authorization?.replace("Bearer ", "") ?? data.session?.value;
    if (!token) {
      throw APIError.unauthenticated("missing token");
    }

    // Simple token validation for demo purposes
    // In production, this would validate against a proper auth service
    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
      return {
        userID: decoded.userID,
        email: decoded.email,
        role: decoded.role,
      };
    } catch (err) {
      throw APIError.unauthenticated("invalid token", err);
    }
  }
);

export const gw = new Gateway({ authHandler: auth });
