import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { usersDB } from "../users/db";
import { risksDB } from "./db";

interface DeleteRiskParams {
  id: string;
}

// Deletes a risk (admin only).
export const deleteRisk = api<DeleteRiskParams, void>(
  { auth: true, expose: true, method: "DELETE", path: "/risks/:id" },
  async (params) => {
    const auth = getAuthData()!;
    
    // Check if user is admin
    const currentUser = await usersDB.queryRow<{ role: string }>`
      SELECT role FROM users WHERE id = ${auth.userID}
    `;
    
    if (!currentUser || currentUser.role !== 'admin') {
      throw APIError.permissionDenied("Only admins can delete risks");
    }

    // Check if risk exists
    const risk = await risksDB.queryRow<{ id: string }>`
      SELECT id FROM risks WHERE id = ${params.id}
    `;
    
    if (!risk) {
      throw APIError.notFound("Risk not found");
    }

    // Delete the risk
    await risksDB.exec`DELETE FROM risks WHERE id = ${params.id}`;
  }
);
