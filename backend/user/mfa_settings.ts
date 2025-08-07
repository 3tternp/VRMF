import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { usersDB } from "./db";
import { MfaSettingsResponse, UpdateMfaSettingsRequest } from "./types";

// Gets MFA settings (admin only).
export const getMfaSettings = api<void, MfaSettingsResponse>(
  { auth: true, expose: true, method: "GET", path: "/users/mfa-settings" },
  async () => {
    const auth = getAuthData()!;
    
    // Check if user is admin
    const currentUser = await usersDB.queryRow<{ role: string }>`
      SELECT role FROM users WHERE id = ${auth.userID}
    `;
    
    if (!currentUser || currentUser.role !== 'admin') {
      throw APIError.permissionDenied("Only admins can view MFA settings");
    }

    const settings = await usersDB.queryRow<{ enabled: boolean }>`
      SELECT enabled FROM mfa_settings ORDER BY id DESC LIMIT 1
    `;

    return { enabled: settings?.enabled ?? false };
  }
);

// Updates MFA settings (admin only).
export const updateMfaSettings = api<UpdateMfaSettingsRequest, void>(
  { auth: true, expose: true, method: "PUT", path: "/users/mfa-settings" },
  async (req) => {
    const auth = getAuthData()!;
    
    // Check if user is admin
    const currentUser = await usersDB.queryRow<{ role: string }>`
      SELECT role FROM users WHERE id = ${auth.userID}
    `;
    
    if (!currentUser || currentUser.role !== 'admin') {
      throw APIError.permissionDenied("Only admins can update MFA settings");
    }

    await usersDB.exec`
      INSERT INTO mfa_settings (enabled, updated_by)
      VALUES (${req.enabled}, ${auth.userID})
    `;
  }
);
