import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { usersDB } from "./db";
import { UpdateUserRequest, User } from "./types";

interface UpdateUserParams {
  id: string;
}

// Updates a user.
export const update = api<UpdateUserParams & UpdateUserRequest, User>(
  { auth: true, expose: true, method: "PUT", path: "/users/:id" },
  async (req) => {
    const auth = getAuthData()!;
    
    // Check permissions
    const currentUser = await usersDB.queryRow<{ role: string }>`
      SELECT role FROM users WHERE id = ${auth.userID}
    `;
    
    if (!currentUser) {
      throw APIError.unauthenticated("User not found");
    }

    // Users can only update their own profile (except role and isActive)
    // Admins can update any user
    if (currentUser.role !== 'admin' && auth.userID !== req.id) {
      throw APIError.permissionDenied("You can only update your own profile");
    }

    // Non-admins cannot change role or isActive
    if (currentUser.role !== 'admin' && (req.role !== undefined || req.isActive !== undefined)) {
      throw APIError.permissionDenied("Only admins can change role or active status");
    }

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (req.firstName !== undefined) {
      updates.push(`first_name = $${paramIndex++}`);
      values.push(req.firstName);
    }
    if (req.lastName !== undefined) {
      updates.push(`last_name = $${paramIndex++}`);
      values.push(req.lastName);
    }
    if (req.role !== undefined && currentUser.role === 'admin') {
      updates.push(`role = $${paramIndex++}`);
      values.push(req.role);
    }
    if (req.isActive !== undefined && currentUser.role === 'admin') {
      updates.push(`is_active = $${paramIndex++}`);
      values.push(req.isActive);
    }

    if (updates.length === 0) {
      throw APIError.invalidArgument("No valid fields to update");
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    updates.push(`updated_by = $${paramIndex++}`);
    values.push(auth.userID);
    values.push(req.id);

    const query = `
      UPDATE users 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
    `;

    await usersDB.rawExec(query, ...values);

    const user = await usersDB.queryRow<User>`
      SELECT 
        id, email, role, first_name as "firstName", last_name as "lastName",
        profile_picture_url as "profilePictureUrl", is_active as "isActive",
        mfa_enabled as "mfaEnabled", password_expires_at as "passwordExpiresAt",
        last_password_change as "lastPasswordChange", failed_login_attempts as "failedLoginAttempts",
        locked_until as "lockedUntil", created_at as "createdAt", updated_at as "updatedAt",
        created_by as "createdBy", updated_by as "updatedBy"
      FROM users WHERE id = ${req.id}
    `;

    if (!user) {
      throw APIError.notFound("User not found");
    }

    return user;
  }
);
