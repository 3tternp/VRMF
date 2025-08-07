import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { userDB } from "./db";

export interface User {
  id: number;
  email: string;
  role: "admin" | "risk_officer" | "auditor";
  name?: string;
  created_at: Date;
  last_login?: Date;
  mfa_enabled: boolean;
  is_default_admin: boolean;
}

export interface ListUsersResponse {
  users: User[];
}

// Lists all users
export const list = api<void, ListUsersResponse>(
  { auth: true, expose: true, method: "GET", path: "/users" },
  async () => {
    const auth = getAuthData()!;
    
    // Only admin can list users
    if (auth.role !== "admin") {
      throw APIError.permissionDenied("Only administrators can list users");
    }

    try {
      const users = await userDB.queryAll<User>`
        SELECT 
          id, 
          email, 
          role, 
          name, 
          created_at,
          last_login,
          mfa_enabled,
          CASE 
            WHEN email = 'admin@company.com' AND password = 'demo_admin_hash' 
            THEN true 
            ELSE false 
          END as is_default_admin
        FROM users 
        ORDER BY created_at DESC
      `;

      return { users };
    } catch (error) {
      console.error('List users error:', error);
      throw APIError.internal("Failed to retrieve users. Please try again.");
    }
  }
);
