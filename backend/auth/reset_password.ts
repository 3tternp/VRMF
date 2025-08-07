import { api, APIError } from "encore.dev/api";
import { userDB } from "../user/db";
import { hashPassword } from "../user/utils";

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}

// Resets user password using reset token
export const resetPassword = api<ResetPasswordRequest, ResetPasswordResponse>(
  { expose: true, method: "POST", path: "/auth/reset-password" },
  async (req) => {
    // Validate password strength
    if (req.newPassword.length < 10) {
      throw APIError.invalidArgument("Password must be at least 10 characters long");
    }

    try {
      // Decode and validate token
      const tokenData = JSON.parse(Buffer.from(req.token, 'base64').toString());
      
      if (tokenData.type !== 'password_reset') {
        throw APIError.invalidArgument("Invalid token type");
      }

      if (Date.now() > tokenData.expires) {
        throw APIError.invalidArgument("Reset token has expired");
      }

      // Verify token exists in database and hasn't expired
      const user = await userDB.queryRow<{ id: number; reset_token: string }>`
        SELECT id, reset_token 
        FROM users 
        WHERE id = ${tokenData.userId} 
        AND reset_token = ${req.token}
        AND reset_token_expires > NOW()
      `;

      if (!user) {
        throw APIError.invalidArgument("Invalid or expired reset token");
      }

      // Hash new password and update user
      const hashedPassword = await hashPassword(req.newPassword);
      const passwordExpiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days

      await userDB.exec`
        UPDATE users 
        SET 
          password = ${hashedPassword},
          password_expires_at = ${passwordExpiresAt},
          reset_token = NULL,
          reset_token_expires = NULL,
          updated_at = NOW()
        WHERE id = ${user.id}
      `;

      return {
        message: "Password has been reset successfully. You can now log in with your new password."
      };
    } catch (err) {
      console.error('Reset password error:', err);
      if (err instanceof APIError) {
        throw err;
      }
      throw APIError.invalidArgument("Invalid reset token");
    }
  }
);
