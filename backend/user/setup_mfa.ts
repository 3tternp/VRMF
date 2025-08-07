import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { userDB } from "./db";
import { generateMfaSecret, generateQrCodeUrl, verifyMfaCode } from "./mfa";

export interface SetupMfaResponse {
  secret: string;
  qrCodeUrl: string;
}

export interface EnableMfaRequest {
  code: string;
}

export interface EnableMfaResponse {
  message: string;
  backupCodes: string[];
}

export interface DisableMfaRequest {
  password: string;
}

export interface DisableMfaResponse {
  message: string;
}

// Generates MFA setup information
export const setupMfa = api<void, SetupMfaResponse>(
  { auth: true, expose: true, method: "POST", path: "/user/mfa/setup" },
  async () => {
    const auth = getAuthData()!;

    // Get user email
    const user = await userDB.queryRow<{ email: string }>`
      SELECT email FROM users WHERE id = ${auth.userID}
    `;

    if (!user) {
      throw APIError.notFound("User not found");
    }

    // Generate new MFA secret
    const secret = generateMfaSecret();
    const qrCodeUrl = generateQrCodeUrl(user.email, secret);

    // Store temporary secret (not enabled yet)
    await userDB.exec`
      UPDATE users 
      SET mfa_temp_secret = ${secret}
      WHERE id = ${auth.userID}
    `;

    return {
      secret,
      qrCodeUrl
    };
  }
);

// Enables MFA after verifying setup
export const enableMfa = api<EnableMfaRequest, EnableMfaResponse>(
  { auth: true, expose: true, method: "POST", path: "/user/mfa/enable" },
  async (req) => {
    const auth = getAuthData()!;

    // Get temporary secret
    const user = await userDB.queryRow<{ mfa_temp_secret?: string }>`
      SELECT mfa_temp_secret FROM users WHERE id = ${auth.userID}
    `;

    if (!user?.mfa_temp_secret) {
      throw APIError.invalidArgument("No MFA setup in progress");
    }

    // Verify the code
    const codeValid = await verifyMfaCode(user.mfa_temp_secret, req.code);
    if (!codeValid) {
      throw APIError.invalidArgument("Invalid MFA code");
    }

    // Generate backup codes
    const backupCodes = Array.from({ length: 10 }, () => 
      Math.random().toString(36).substring(2, 10).toUpperCase()
    );

    // Enable MFA
    await userDB.exec`
      UPDATE users 
      SET 
        mfa_enabled = true,
        mfa_secret = ${user.mfa_temp_secret},
        mfa_temp_secret = NULL,
        mfa_backup_codes = ${JSON.stringify(backupCodes)},
        updated_at = NOW()
      WHERE id = ${auth.userID}
    `;

    return {
      message: "MFA enabled successfully",
      backupCodes
    };
  }
);

// Disables MFA
export const disableMfa = api<DisableMfaRequest, DisableMfaResponse>(
  { auth: true, expose: true, method: "POST", path: "/user/mfa/disable" },
  async (req) => {
    const auth = getAuthData()!;

    // Verify password
    const user = await userDB.queryRow<{ password: string }>`
      SELECT password FROM users WHERE id = ${auth.userID}
    `;

    if (!user) {
      throw APIError.notFound("User not found");
    }

    const { verifyPassword } = await import("./utils");
    const passwordValid = await verifyPassword(req.password, user.password);
    if (!passwordValid) {
      throw APIError.unauthenticated("Invalid password");
    }

    // Disable MFA
    await userDB.exec`
      UPDATE users 
      SET 
        mfa_enabled = false,
        mfa_secret = NULL,
        mfa_backup_codes = NULL,
        updated_at = NOW()
      WHERE id = ${auth.userID}
    `;

    return {
      message: "MFA disabled successfully"
    };
  }
);
