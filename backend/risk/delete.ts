import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { riskDB } from "./db";

export interface DeleteRiskRequest {
  id: number;
}

// Deletes a risk
export const deleteRisk = api<DeleteRiskRequest, void>(
  { auth: true, expose: true, method: "DELETE", path: "/risks/:id" },
  async (req) => {
    const auth = getAuthData()!;
    
    // Only admin can delete risks
    if (auth.role !== "admin") {
      throw APIError.permissionDenied("Only administrators can delete risks");
    }

    const result = await riskDB.exec`
      DELETE FROM risks WHERE id = ${req.id}
    `;

    // Note: PostgreSQL doesn't return affected rows count in this context
    // We could check if the risk existed first, but for simplicity we'll assume success
  }
);
