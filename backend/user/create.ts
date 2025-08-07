import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { userDB } from "./db";

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

    // Check if user already exists
    const existingUser = await userDB.queryRow`
      SELECT id FROM users WHERE email = ${req.email}
    `;

    if (existingUser) {
      throw APIError.alreadyExists("User with this email already exists");
    }

    const user = await userDB.queryRow<CreateUserResponse>`
      INSERT INTO users (email, password, role, name)
      VALUES (${req.email}, ${req.password}, ${req.role}, ${req.name})
      RETURNING id, email, role, name, created_at
    `;

    if (!user) {
      throw APIError.internal("Failed to create user");
    }

    return user;
  }
);
