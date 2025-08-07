import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { risksDB } from "./db";
import { Risk } from "./types";
import { Query } from "encore.dev/api";

interface ListRisksParams {
  limit?: Query<number>;
  offset?: Query<number>;
  assetGroup?: Query<string>;
  riskLevel?: Query<string>;
  treatmentStatus?: Query<string>;
  complianceFramework?: Query<string>;
}

interface ListRisksResponse {
  risks: Risk[];
  total: number;
}

// Lists all risks with optional filtering.
export const list = api<ListRisksParams, ListRisksResponse>(
  { auth: true, expose: true, method: "GET", path: "/risks" },
  async (params) => {
    const auth = getAuthData()!;
    
    const limit = params.limit || 50;
    const offset = params.offset || 0;
    
    // Build WHERE clause for filtering
    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (params.assetGroup) {
      conditions.push(`asset_group = $${paramIndex++}`);
      values.push(params.assetGroup);
    }
    
    if (params.riskLevel) {
      conditions.push(`risk_level = $${paramIndex++}`);
      values.push(params.riskLevel);
    }
    
    if (params.treatmentStatus) {
      conditions.push(`treatment_action_status = $${paramIndex++}`);
      values.push(params.treatmentStatus);
    }
    
    if (params.complianceFramework) {
      conditions.push(`$${paramIndex++} = ANY(compliance_frameworks)`);
      values.push(params.complianceFramework);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM risks ${whereClause}`;
    const totalResult = await risksDB.rawQueryRow<{ total: number }>(countQuery, ...values);
    const total = totalResult?.total || 0;

    // Get risks with pagination
    const risksQuery = `
      SELECT 
        id, sn, asset_group as "assetGroup", asset, threat, vulnerability,
        risk_type as "riskType", risk_owner as "riskOwner", 
        risk_owner_approval as "riskOwnerApproval", existing_controls as "existingControls",
        likelihood, impact, impact_rationale as "impactRationale", risk_level as "riskLevel",
        treatment_option_chosen as "treatmentOptionChosen", 
        proposed_treatment_action as "proposedTreatmentAction",
        annex_a_control_reference as "annexAControlReference", treatment_cost as "treatmentCost",
        treatment_action_owner as "treatmentActionOwner", 
        treatment_action_timescale as "treatmentActionTimescale",
        treatment_action_status as "treatmentActionStatus",
        post_treatment_likelihood as "postTreatmentLikelihood",
        post_treatment_impact as "postTreatmentImpact",
        post_treatment_risk_score as "postTreatmentRiskScore",
        post_treatment_risk_level as "postTreatmentRiskLevel",
        treatment_option_chosen2 as "treatmentOptionChosen2", comments,
        compliance_frameworks as "complianceFrameworks",
        review_date as "reviewDate", next_assessment_date as "nextAssessmentDate",
        created_at as "createdAt", updated_at as "updatedAt",
        created_by as "createdBy", updated_by as "updatedBy"
      FROM risks 
      ${whereClause}
      ORDER BY sn DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    
    values.push(limit, offset);
    const risks = await risksDB.rawQueryAll<Risk>(risksQuery, ...values);

    return { risks, total };
  }
);
