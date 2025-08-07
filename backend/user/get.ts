import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { usersDB } from "./db";
import { User } from "./types";

interface GetUserParams {
  id: string;
}

// Gets a user by ID.
export const get = api<GetUserParams, User>(
  { auth: true, expose: true, method: "GET", path: "/users/:id" },
  async (params) => {
    const auth = getAuthData()!;
    
    // Users can only get their own profile unless they're admin
    const currentUser = await usersDB.queryRow<{ role: string }>`
      SELECT role FROM users WHERE id = ${auth.userID}
    `;
    
    if (!currentUser) {
      throw APIError.unauthenticated("User not found");
    }

    if (currentUser.role !== 'admin' && auth.userID !== params.id) {
      throw APIError.permissionDenied("You can only access your own profile");
    }

    const user = await usersDB.queryRow<User>`
      SELECT 
        id, email, role, first_name as "firstName", last_name as "lastName",
        profile_picture_url as "profilePictureUrl", is_active as "isActive",
        mfa_enabled as "mfaEnabled", password_expires_at as "passwordExpiresAt",
        last_password_change as "lastPasswordChange", failed_login_attempts as "failedLoginAttempts",
        locked_until as "lockedUntil", created_at as "createdAt", updated_at as "updatedAt",
        created_by as "createdBy", updated_by as "updatedBy"
      FROM users WHERE id = ${params.id}
    `;

    if (!user) {
      throw APIError.notFound("User not found");
    }

    return user;
  }
);
