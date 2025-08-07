import { api, APIError } from "encore.dev/api";
import { userDB } from "../user/db";

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

// Initiates password reset process
export const forgotPassword = api<ForgotPasswordRequest, ForgotPasswordResponse>(
  { expose: true, method: "POST", path: "/auth/forgot-password" },
  async (req) => {
    // Check if user exists
    const user = await userDB.queryRow<{ id: number; email: string }>`
      SELECT id, email FROM users WHERE email = ${req.email}
    `;

    // Always return success message for security (don't reveal if email exists)
    if (!user) {
      return {
        message: "If an account with that email exists, a password reset link has been sent."
      };
    }

    // Generate reset token with proper JSON structure
    const resetTokenData = {
      userId: user.id.toString(),
      email: user.email,
      expires: Date.now() + 3600000, // 1 hour
      type: 'password_reset'
    };
    const resetToken = Buffer.from(JSON.stringify(resetTokenData)).toString('base64');

    // Store reset token in database
    await userDB.exec`
      UPDATE users 
      SET reset_token = ${resetToken}, reset_token_expires = NOW() + INTERVAL '1 hour'
      WHERE id = ${user.id}
    `;

    // In a real application, you would send an email here
    // For demo purposes, we'll just log the reset link
    console.log(`Password reset link for ${user.email}: /reset-password?token=${resetToken}`);

    return {
      message: "If an account with that email exists, a password reset link has been sent."
    };
  }
);
