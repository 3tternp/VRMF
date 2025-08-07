import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { controlDB } from "./db";
import type { RiskControl, ControlType, ControlEffectiveness, ImplementationStatus } from "../risk/types";

export interface UpdateControlRequest {
  id: number;
  control_name?: string;
  control_description?: string;
  control_type?: ControlType;
  effectiveness?: ControlEffectiveness;
  implementation_status?: ImplementationStatus;
}

// Updates an existing control
export const update = api<UpdateControlRequest, RiskControl>(
  { auth: true, expose: true, method: "PUT", path: "/controls/:id" },
  async (req) => {
    const auth = getAuthData()!;
    
    // Only admin and risk_officer can update controls
    if (auth.role === "auditor") {
      throw APIError.permissionDenied("Auditors cannot update controls");
    }

    // Check if control exists
    const existingControl = await controlDB.queryRow`
      SELECT id FROM risk_controls WHERE id = ${req.id}
    `;

    if (!existingControl) {
      throw APIError.notFound("Control not found");
    }

    // Build update query dynamically
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (req.control_name !== undefined) {
      updates.push(`control_name = $${paramIndex}`);
      params.push(req.control_name);
      paramIndex++;
    }

    if (req.control_description !== undefined) {
      updates.push(`control_description = $${paramIndex}`);
      params.push(req.control_description);
      paramIndex++;
    }

    if (req.control_type !== undefined) {
      updates.push(`control_type = $${paramIndex}`);
      params.push(req.control_type);
      paramIndex++;
    }

    if (req.effectiveness !== undefined) {
      updates.push(`effectiveness = $${paramIndex}`);
      params.push(req.effectiveness);
      paramIndex++;
    }

    if (req.implementation_status !== undefined) {
      updates.push(`implementation_status = $${paramIndex}`);
      params.push(req.implementation_status);
      paramIndex++;
    }

    if (updates.length === 0) {
      throw APIError.invalidArgument("No fields to update");
    }

    updates.push(`updated_at = NOW()`);

    const query = `
      UPDATE risk_controls 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;
    params.push(req.id);

    const updatedControl = await controlDB.rawQueryRow<RiskControl>(query, ...params);

    if (!updatedControl) {
      throw APIError.internal("Failed to update control");
    }

    return updatedControl;
  }
);
