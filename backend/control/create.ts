import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { controlDB } from "./db";
import type { ControlType, ControlEffectiveness, ImplementationStatus } from "../risk/types";

export interface CreateControlRequest {
  risk_id: number;
  control_name: string;
  control_description?: string;
  control_type: ControlType;
  effectiveness: ControlEffectiveness;
  implementation_status?: ImplementationStatus;
}

export interface CreateControlResponse {
  id: number;
  risk_id: number;
  control_name: string;
  control_description?: string;
  control_type: ControlType;
  effectiveness: ControlEffectiveness;
  implementation_status: ImplementationStatus;
  created_at: Date;
  updated_at: Date;
}

// Creates a new control for a risk
export const create = api<CreateControlRequest, CreateControlResponse>(
  { auth: true, expose: true, method: "POST", path: "/controls" },
  async (req) => {
    const auth = getAuthData()!;
    
    // Only admin and risk_officer can create controls
    if (auth.role === "auditor") {
      throw APIError.permissionDenied("Auditors cannot create controls");
    }

    // Verify the risk exists
    const riskExists = await controlDB.queryRow`
      SELECT id FROM risks WHERE id = ${req.risk_id}
    `;

    if (!riskExists) {
      throw APIError.notFound("Risk not found");
    }

    const control = await controlDB.queryRow<CreateControlResponse>`
      INSERT INTO risk_controls (
        risk_id, control_name, control_description, control_type, 
        effectiveness, implementation_status
      ) VALUES (
        ${req.risk_id}, ${req.control_name}, ${req.control_description}, 
        ${req.control_type}, ${req.effectiveness}, ${req.implementation_status || 'planned'}
      )
      RETURNING *
    `;

    if (!control) {
      throw APIError.internal("Failed to create control");
    }

    return control;
  }
);
