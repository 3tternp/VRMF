import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { usersDB } from "./db";
import { ChangePasswordRequest } from "./types";
import { hashPassword, verifyPassword, getPasswordExpiryDate } from "./utils";

// Changes user password.
export const changePassword = api<ChangePasswordRequest, void>(
  { auth: true, expose: true, method: "POST", path: "/users/change-password" },
  async (req) => {
    const auth = getAuthData()!;
    
    // Get current user
    const user = await usersDB.queryRow<{ password_hash: string }>`
      SELECT password_hash FROM users WHERE id = ${auth.userID}
    `;
    
    if (!user) {
      throw APIError.notFound("User not found");
    }

    // Verify current password
    const isCurrentPasswordValid = await verifyPassword(req.currentPassword, user.password_hash);
    if (!isCurrentPasswordValid) {
      throw APIError.invalidArgument("Current password is incorrect");
    }

    // Hash new password
    const newPasswordHash = await hashPassword(req.newPassword);
    const passwordExpiresAt = getPasswordExpiryDate();

    // Update password
    await usersDB.exec`
      UPDATE users 
      SET 
        password_hash = ${newPasswordHash},
        password_expires_at = ${passwordExpiresAt},
        last_password_change = CURRENT_TIMESTAMP,
        failed_login_attempts = 0,
        locked_until = NULL,
        updated_at = CURRENT_TIMESTAMP,
        updated_by = ${auth.userID}
      WHERE id = ${auth.userID}
    `;
  }
);
