import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { riskDB } from "./db";
import type { Risk, RiskCategory, ComplianceFramework, RiskStatus, AssetGroup, RiskType, TreatmentOption, TreatmentStatus } from "./types";

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
  
  // ISO 27001 specific fields
  asset_group?: AssetGroup;
  asset?: string;
  threat?: string;
  vulnerability?: string;
  risk_type?: RiskType;
  risk_owner_approval?: boolean;
  existing_controls?: string;
  impact_rationale?: string;
  treatment_option?: TreatmentOption;
  proposed_treatment_action?: string;
  annex_a_reference?: string;
  treatment_cost?: number;
  treatment_action_owner?: string;
  treatment_timescale?: string;
  treatment_status?: TreatmentStatus;
  post_treatment_likelihood?: number;
  post_treatment_impact?: number;
  post_treatment_treatment_option?: TreatmentOption;
  comments?: string;
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
    if (req.post_treatment_likelihood && (req.post_treatment_likelihood < 1 || req.post_treatment_likelihood > 5)) {
      throw APIError.invalidArgument("Post-treatment likelihood must be between 1 and 5");
    }
    if (req.post_treatment_impact && (req.post_treatment_impact < 1 || req.post_treatment_impact > 5)) {
      throw APIError.invalidArgument("Post-treatment impact must be between 1 and 5");
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

    const fields = [
      'title', 'description', 'category', 'compliance_framework', 'likelihood', 'impact',
      'status', 'owner_id', 'due_date', 'mitigation_plan', 'residual_likelihood', 'residual_impact',
      'asset_group', 'asset', 'threat', 'vulnerability', 'risk_type', 'risk_owner_approval',
      'existing_controls', 'impact_rationale', 'treatment_option', 'proposed_treatment_action',
      'annex_a_reference', 'treatment_cost', 'treatment_action_owner', 'treatment_timescale',
      'treatment_status', 'post_treatment_likelihood', 'post_treatment_impact', 
      'post_treatment_treatment_option', 'comments'
    ];

    for (const field of fields) {
      if (req[field as keyof UpdateRiskRequest] !== undefined) {
        updates.push(`${field} = $${paramIndex}`);
        params.push(req[field as keyof UpdateRiskRequest]);
        paramIndex++;
      }
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
