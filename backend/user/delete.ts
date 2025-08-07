import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { usersDB } from "./db";

interface DeleteUserParams {
  id: string;
}

// Deletes a user (admin only).
export const deleteUser = api<DeleteUserParams, void>(
  { auth: true, expose: true, method: "DELETE", path: "/users/:id" },
  async (params) => {
    const auth = getAuthData()!;
    
    // Check if user is admin
    const currentUser = await usersDB.queryRow<{ role: string }>`
      SELECT role FROM users WHERE id = ${auth.userID}
    `;
    
    if (!currentUser || currentUser.role !== 'admin') {
      throw APIError.permissionDenied("Only admins can delete users");
    }

    // Check if user exists
    const userToDelete = await usersDB.queryRow<{ id: string }>`
      SELECT id FROM users WHERE id = ${params.id}
    `;
    
    if (!userToDelete) {
      throw APIError.notFound("User not found");
    }

    // Delete the user
    await usersDB.exec`DELETE FROM users WHERE id = ${params.id}`;
  }
);
