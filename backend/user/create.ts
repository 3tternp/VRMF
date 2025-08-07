import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { userDB } from "./db";
import { hashPassword, validatePasswordStrength } from "./utils";

export interface CreateUserRequest {
  email: string;
  password: string;
  role: "admin" | "risk_officer" | "auditor";
  name?: string;
}

export interface CreateUserResponse {
  id: number;
  email: string;
  role: "admin" | "risk_officer" | "auditor";
  name?: string;
  created_at: Date;
}

// Creates a new user
export const create = api<CreateUserRequest, CreateUserResponse>(
  { auth: true, expose: true, method: "POST", path: "/users" },
  async (req) => {
    const auth = getAuthData()!;
    
    // Only admin can create users
    if (auth.role !== "admin") {
      throw APIError.permissionDenied("Only administrators can create users");
    }

    // Validate password strength
    const validation = validatePasswordStrength(req.password);
    if (!validation.valid) {
      throw APIError.invalidArgument(`Password validation failed: ${validation.errors.join(', ')}`);
    }

    // Check if user already exists
    const existingUser = await userDB.queryRow`
      SELECT id FROM users WHERE email = ${req.email}
    `;

    if (existingUser) {
      throw APIError.alreadyExists("User with this email already exists");
    }

    // Hash password
    const hashedPassword = await hashPassword(req.password);
    const passwordExpiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days

    const user = await userDB.queryRow<CreateUserResponse>`
      INSERT INTO users (email, password, role, name, password_expires_at)
      VALUES (${req.email}, ${hashedPassword}, ${req.role}, ${req.name}, ${passwordExpiresAt})
      RETURNING id, email, role, name, created_at
    `;

    if (!user) {
      throw APIError.internal("Failed to create user");
    }

    return user;
  }
);
