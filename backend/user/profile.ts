import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { userDB } from "./db";

export interface UserProfile {
  id: number;
  email: string;
  role: "admin" | "risk_officer" | "auditor";
  name?: string;
  profile_image?: string;
  mfa_enabled: boolean;
  last_login?: Date;
  password_expires_at?: Date;
  created_at: Date;
  updated_at: Date;
}

// Gets the current user's profile
export const getProfile = api<void, UserProfile>(
  { auth: true, expose: true, method: "GET", path: "/user/profile" },
  async () => {
    const auth = getAuthData()!;

    const user = await userDB.queryRow<UserProfile>`
      SELECT id, email, role, name, profile_image, mfa_enabled, 
             last_login, password_expires_at, created_at, updated_at
      FROM users 
      WHERE id = ${auth.userID}
    `;

    if (!user) {
      throw APIError.notFound("User not found");
    }

    return user;
  }
);
