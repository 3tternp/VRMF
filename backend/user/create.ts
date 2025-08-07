import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { usersDB } from "./db";
import { CreateUserRequest, User } from "./types";
import { hashPassword, generateUserId, getPasswordExpiryDate } from "./utils";

// Creates a new user (admin only).
export const create = api<CreateUserRequest, User>(
  { auth: true, expose: true, method: "POST", path: "/users" },
  async (req) => {
    const auth = getAuthData()!;
    
    // Check if user is admin
    const currentUser = await usersDB.queryRow<{ role: string }>`
      SELECT role FROM users WHERE id = ${auth.userID}
    `;
    
    if (!currentUser || currentUser.role !== 'admin') {
      throw APIError.permissionDenied("Only admins can create users");
    }

    // Check if email already exists
    const existingUser = await usersDB.queryRow`
      SELECT id FROM users WHERE email = ${req.email}
    `;
    
    if (existingUser) {
      throw APIError.alreadyExists("User with this email already exists");
    }

    const userId = generateUserId();
    const passwordHash = await hashPassword(req.password);
    const passwordExpiresAt = getPasswordExpiryDate();

    await usersDB.exec`
      INSERT INTO users (
        id, email, password_hash, role, first_name, last_name, 
        password_expires_at, created_by, updated_by
      ) VALUES (
        ${userId}, ${req.email}, ${passwordHash}, ${req.role}, 
        ${req.firstName}, ${req.lastName}, ${passwordExpiresAt}, 
        ${auth.userID}, ${auth.userID}
      )
    `;

    const user = await usersDB.queryRow<User>`
      SELECT 
        id, email, role, first_name as "firstName", last_name as "lastName",
        profile_picture_url as "profilePictureUrl", is_active as "isActive",
        mfa_enabled as "mfaEnabled", password_expires_at as "passwordExpiresAt",
        last_password_change as "lastPasswordChange", failed_login_attempts as "failedLoginAttempts",
        locked_until as "lockedUntil", created_at as "createdAt", updated_at as "updatedAt",
        created_by as "createdBy", updated_by as "updatedBy"
      FROM users WHERE id = ${userId}
    `;

    if (!user) {
      throw APIError.internal("Failed to create user");
    }

    return user;
  }
);
