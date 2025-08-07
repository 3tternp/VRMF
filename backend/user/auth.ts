import { Header, APIError, Gateway } from "encore.dev/api";
import { authHandler } from "encore.dev/auth";
import { usersDB } from "./db";

interface AuthParams {
  authorization?: Header<"Authorization">;
}

export interface AuthData {
  userID: string;
  email: string;
  role: string;
}

const auth = authHandler<AuthParams, AuthData>(
  async (data) => {
    const token = data.authorization?.replace("Bearer ", "");
    if (!token) {
      throw APIError.unauthenticated("missing token");
    }

    // Simple token validation - just check if user exists with this token as ID
    const user = await usersDB.queryRow<{ id: string; email: string; role: string; is_active: boolean }>`
      SELECT id, email, role, is_active FROM users WHERE id = ${token}
    `;

    if (!user || !user.is_active) {
      throw APIError.unauthenticated("user not found or inactive");
    }

    return {
      userID: user.id,
      email: user.email,
      role: user.role,
    };
  }
);

// Configure the API gateway to use the auth handler.
export const gw = new Gateway({ authHandler: auth });
