import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { userDB } from "./db";

export interface DeleteUserRequest {
  id: number;
}

export interface DeleteUserResponse {
  message: string;
}

// Deletes a user (admin only)
export const deleteUser = api<DeleteUserRequest, DeleteUserResponse>(
  { auth: true, expose: true, method: "DELETE", path: "/users/:id" },
  async (req) => {
    const auth = getAuthData()!;
    
    // Only admin can delete users
    if (auth.role !== "admin") {
      throw APIError.permissionDenied("Only administrators can delete users");
    }

    // Check if the user exists and get their details
    const userToDelete = await userDB.queryRow<{
      id: number;
      email: string;
      role: string;
    }>`
      SELECT id, email, role FROM users WHERE id = ${req.id}
    `;

    if (!userToDelete) {
      throw APIError.notFound("User not found");
    }

    // Prevent self-deletion
    if (userToDelete.id.toString() === auth.userID) {
      throw APIError.invalidArgument("You cannot delete your own account");
    }

    // Check if this is the last admin account
    if (userToDelete.role === 'admin') {
      const adminCount = await userDB.queryRow<{ count: number }>`
        SELECT COUNT(*) as count FROM users WHERE role = 'admin'
      `;

      if (adminCount && adminCount.count <= 1) {
        throw APIError.invalidArgument("Cannot delete the last administrator account. Create another admin first.");
      }
    }

    try {
      // Delete the user
      await userDB.exec`
        DELETE FROM users WHERE id = ${req.id}
      `;

      return {
        message: `User ${userToDelete.email} has been successfully deleted`
      };
    } catch (error) {
      console.error('Delete user error:', error);
      throw APIError.internal("Failed to delete user. Please try again.");
    }
  }
);
