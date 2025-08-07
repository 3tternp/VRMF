import { api, APIError } from "encore.dev/api";
import { usersDB } from "./db";
import { ForgotPasswordRequest } from "./types";
import { generateResetToken, hashToken } from "./utils";

// Initiates password reset process.
export const forgotPassword = api<ForgotPasswordRequest, void>(
  { expose: true, method: "POST", path: "/users/forgot-password" },
  async (req) => {
    // Check if user exists
    const user = await usersDB.queryRow<{ id: string }>`
      SELECT id FROM users WHERE email = ${req.email} AND is_active = TRUE
    `;
    
    // Always return success to prevent email enumeration
    if (!user) {
      return;
    }

    // Generate reset token
    const resetToken = generateResetToken();
    const tokenHash = hashToken(resetToken);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry

    // Store reset token
    await usersDB.exec`
      INSERT INTO password_reset_tokens (id, user_id, token_hash, expires_at)
      VALUES (${crypto.randomUUID()}, ${user.id}, ${tokenHash}, ${expiresAt})
    `;

    // TODO: Send email with reset token
    // For now, we'll just log it (in production, send via email service)
    console.log(`Password reset token for ${req.email}: ${resetToken}`);
  }
);
