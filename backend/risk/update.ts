import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { riskDB } from "./db";
import type { Risk, RiskCategory, ComplianceFramework, RiskStatus } from "./types";

export interface UpdateRiskRequest {
  id: number;
  title?: string;
  description?: string;
  category?: RiskCategory;
  compliance_framework?: ComplianceFramework;
  likelihood?: number;
  impact?: number;
  status?: RiskStatus;
  owner_id?: string;
  due_date?: Date;
  mitigation_plan?: string;
  residual_likelihood?: number;
  residual_impact?: number;
}

// Updates an existing risk
export const update = api<UpdateRiskRequest, Risk>(
  { auth: true, expose: true, method: "PUT", path: "/risks/:id" },
  async (req) => {
    const auth = getAuthData()!;
    
    // Only admin and risk_officer can update risks
    if (auth.role === "auditor") {
      throw APIError.permissionDenied("Auditors cannot update risks");
    }

    // Validate likelihood and impact values if provided
    if (req.likelihood && (req.likelihood < 1 || req.likelihood > 5)) {
      throw APIError.invalidArgument("Likelihood must be between 1 and 5");
    }
    if (req.impact && (req.impact < 1 || req.impact > 5)) {
      throw APIError.invalidArgument("Impact must be between 1 and 5");
    }
    if (req.residual_likelihood && (req.residual_likelihood < 1 || req.residual_likelihood > 5)) {
      throw APIError.invalidArgument("Residual likelihood must be between 1 and 5");
    }
    if (req.residual_impact && (req.residual_impact < 1 || req.residual_impact > 5)) {
      throw APIError.invalidArgument("Residual impact must be between 1 and 5");
    }

    // Check if risk exists
    const existingRisk = await riskDB.queryRow`
      SELECT id FROM risks WHERE id = ${req.id}
    `;

    if (!existingRisk) {
      throw APIError.notFound("Risk not found");
    }

    // Build update query dynamically
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (req.title !== undefined) {
      updates.push(`title = $${paramIndex}`);
      params.push(req.title);
      paramIndex++;
    }

    if (req.description !== undefined) {
      updates.push(`description = $${paramIndex}`);
      params.push(req.description);
      paramIndex++;
    }

    if (req.category !== undefined) {
      updates.push(`category = $${paramIndex}`);
      params.push(req.category);
      paramIndex++;
    }

    if (req.compliance_framework !== undefined) {
      updates.push(`compliance_framework = $${paramIndex}`);
      params.push(req.compliance_framework);
      paramIndex++;
    }

    if (req.likelihood !== undefined) {
      updates.push(`likelihood = $${paramIndex}`);
      params.push(req.likelihood);
      paramIndex++;
    }

    if (req.impact !== undefined) {
      updates.push(`impact = $${paramIndex}`);
      params.push(req.impact);
      paramIndex++;
    }

    if (req.status !== undefined) {
      updates.push(`status = $${paramIndex}`);
      params.push(req.status);
      paramIndex++;
    }

    if (req.owner_id !== undefined) {
      updates.push(`owner_id = $${paramIndex}`);
      params.push(req.owner_id);
      paramIndex++;
    }

    if (req.due_date !== undefined) {
      updates.push(`due_date = $${paramIndex}`);
      params.push(req.due_date);
      paramIndex++;
    }

    if (req.mitigation_plan !== undefined) {
      updates.push(`mitigation_plan = $${paramIndex}`);
      params.push(req.mitigation_plan);
      paramIndex++;
    }

    if (req.residual_likelihood !== undefined) {
      updates.push(`residual_likelihood = $${paramIndex}`);
      params.push(req.residual_likelihood);
      paramIndex++;
    }

    if (req.residual_impact !== undefined) {
      updates.push(`residual_impact = $${paramIndex}`);
      params.push(req.residual_impact);
      paramIndex++;
    }

    if (updates.length === 0) {
      throw APIError.invalidArgument("No fields to update");
    }

    updates.push(`updated_at = NOW()`);

    const query = `
      UPDATE risks 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;
    params.push(req.id);

    const updatedRisk = await riskDB.rawQueryRow<Risk>(query, ...params);

    if (!updatedRisk) {
      throw APIError.internal("Failed to update risk");
    }

    return updatedRisk;
  }
);
