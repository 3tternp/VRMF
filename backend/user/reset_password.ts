import { api, APIError } from "encore.dev/api";
import { usersDB } from "./db";
import { ResetPasswordRequest } from "./types";
import { hashPassword, hashToken, getPasswordExpiryDate } from "./utils";

// Resets user password using reset token.
export const resetPassword = api<ResetPasswordRequest, void>(
  { expose: true, method: "POST", path: "/users/reset-password" },
  async (req) => {
    const tokenHash = hashToken(req.token);
    
    // Find valid reset token
    const resetToken = await usersDB.queryRow<{ user_id: string }>`
      SELECT user_id 
      FROM password_reset_tokens 
      WHERE token_hash = ${tokenHash} 
        AND expires_at > CURRENT_TIMESTAMP 
        AND used = FALSE
    `;
    
    if (!resetToken) {
      throw APIError.invalidArgument("Invalid or expired reset token");
    }

    // Hash new password
    const newPasswordHash = await hashPassword(req.newPassword);
    const passwordExpiresAt = getPasswordExpiryDate();

    // Update password and mark token as used
    await usersDB.exec`
      UPDATE users 
      SET 
        password_hash = ${newPasswordHash},
        password_expires_at = ${passwordExpiresAt},
        last_password_change = CURRENT_TIMESTAMP,
        failed_login_attempts = 0,
        locked_until = NULL,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${resetToken.user_id}
    `;

    await usersDB.exec`
      UPDATE password_reset_tokens 
      SET used = TRUE 
      WHERE token_hash = ${tokenHash}
    `;
  }
);
