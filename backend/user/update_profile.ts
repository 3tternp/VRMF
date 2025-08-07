import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { userDB } from "./db";

export interface UpdateProfileRequest {
  name?: string;
  profile_image?: string;
}

export interface UpdateProfileResponse {
  id: number;
  email: string;
  role: "admin" | "risk_officer" | "auditor";
  name?: string;
  profile_image?: string;
  mfa_enabled: boolean;
  updated_at: Date;
}

// Updates the current user's profile
export const updateProfile = api<UpdateProfileRequest, UpdateProfileResponse>(
  { auth: true, expose: true, method: "PUT", path: "/user/profile" },
  async (req) => {
    const auth = getAuthData()!;

    // Build update query dynamically
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (req.name !== undefined) {
      updates.push(`name = $${paramIndex}`);
      params.push(req.name);
      paramIndex++;
    }

    if (req.profile_image !== undefined) {
      updates.push(`profile_image = $${paramIndex}`);
      params.push(req.profile_image);
      paramIndex++;
    }

    if (updates.length === 0) {
      throw APIError.invalidArgument("No fields to update");
    }

    updates.push(`updated_at = NOW()`);

    const query = `
      UPDATE users 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, email, role, name, profile_image, mfa_enabled, updated_at
    `;
    params.push(auth.userID);

    const updatedUser = await userDB.rawQueryRow<UpdateProfileResponse>(query, ...params);

    if (!updatedUser) {
      throw APIError.internal("Failed to update profile");
    }

    return updatedUser;
  }
);
