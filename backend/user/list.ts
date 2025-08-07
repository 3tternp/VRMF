import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { userDB } from "./db";

export interface User {
  id: number;
  email: string;
  role: "admin" | "risk_officer" | "auditor";
  name?: string;
  created_at: Date;
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
      throw new Error("Only administrators can list users");
    }

    const users = await userDB.queryAll<User>`
      SELECT id, email, role, name, created_at 
      FROM users 
      ORDER BY created_at DESC
    `;

    return { users };
  }
);
