import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { userDB } from "./db";
import { hashPassword, verifyPassword, validatePasswordStrength } from "./utils";

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  message: string;
}

// Changes the current user's password
export const changePassword = api<ChangePasswordRequest, ChangePasswordResponse>(
  { auth: true, expose: true, method: "POST", path: "/user/change-password" },
  async (req) => {
    const auth = getAuthData()!;

    // Validate new password strength
    const validation = validatePasswordStrength(req.newPassword);
    if (!validation.valid) {
      throw APIError.invalidArgument(`Password validation failed: ${validation.errors.join(', ')}`);
    }

    // Get current user data
    const user = await userDB.queryRow<{
      id: number;
      password: string;
    }>`
      SELECT id, password FROM users WHERE id = ${auth.userID}
    `;

    if (!user) {
      throw APIError.notFound("User not found");
    }

    // Verify current password
    const currentPasswordValid = await verifyPassword(req.currentPassword, user.password);
    if (!currentPasswordValid) {
      throw APIError.unauthenticated("Current password is incorrect");
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(req.newPassword);
    const passwordExpiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days

    // Update password
    await userDB.exec`
      UPDATE users 
      SET 
        password = ${hashedNewPassword},
        password_expires_at = ${passwordExpiresAt},
        updated_at = NOW()
      WHERE id = ${user.id}
    `;

    return {
      message: "Password changed successfully"
    };
  }
);
