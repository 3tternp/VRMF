import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { usersDB } from "./db";
import { User } from "./types";

interface ListUsersResponse {
  users: User[];
}

// Lists all users (admin only).
export const list = api<void, ListUsersResponse>(
  { auth: true, expose: true, method: "GET", path: "/users" },
  async () => {
    const auth = getAuthData()!;
    
    // Check if user is admin
    const currentUser = await usersDB.queryRow<{ role: string }>`
      SELECT role FROM users WHERE id = ${auth.userID}
    `;
    
    if (!currentUser || currentUser.role !== 'admin') {
      throw APIError.permissionDenied("Only admins can list users");
    }

    const users = await usersDB.queryAll<User>`
      SELECT 
        id, email, role, first_name as "firstName", last_name as "lastName",
        profile_picture_url as "profilePictureUrl", is_active as "isActive",
        mfa_enabled as "mfaEnabled", password_expires_at as "passwordExpiresAt",
        last_password_change as "lastPasswordChange", failed_login_attempts as "failedLoginAttempts",
        locked_until as "lockedUntil", created_at as "createdAt", updated_at as "updatedAt",
        created_by as "createdBy", updated_by as "updatedBy"
      FROM users 
      ORDER BY created_at DESC
    `;

    return { users };
  }
);
