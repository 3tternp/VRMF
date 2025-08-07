import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { usersDB } from "../users/db";
import { risksDB } from "./db";
import { UpdateRiskRequest, Risk } from "./types";
import { calculateRiskLevel } from "./utils";

interface UpdateRiskParams {
  id: string;
}

// Updates a risk (admin and iso_officer only).
export const update = api<UpdateRiskParams & UpdateRiskRequest, Risk>(
  { auth: true, expose: true, method: "PUT", path: "/risks/:id" },
  async (req) => {
    const auth = getAuthData()!;
    
    // Check if user can update risks
    const currentUser = await usersDB.queryRow<{ role: string }>`
      SELECT role FROM users WHERE id = ${auth.userID}
    `;
    
    if (!currentUser || !['admin', 'iso_officer'].includes(currentUser.role)) {
      throw APIError.permissionDenied("Only admins and ISO officers can update risks");
    }

    // Check if risk exists
    const existingRisk = await risksDB.queryRow<{ id: string, likelihood: number, impact: number }>`
      SELECT id, likelihood, impact FROM risks WHERE id = ${req.id}
    `;
    
    if (!existingRisk) {
      throw APIError.notFound("Risk not found");
    }

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (req.assetGroup !== undefined) {
      updates.push(`asset_group = $${paramIndex++}`);
      values.push(req.assetGroup);
    }
    if (req.asset !== undefined) {
      updates.push(`asset = $${paramIndex++}`);
      values.push(req.asset);
    }
    if (req.threat !== undefined) {
      updates.push(`threat = $${paramIndex++}`);
      values.push(req.threat);
    }
    if (req.vulnerability !== undefined) {
      updates.push(`vulnerability = $${paramIndex++}`);
      values.push(req.vulnerability);
    }
    if (req.riskType !== undefined) {
      updates.push(`risk_type = $${paramIndex++}`);
      values.push(req.riskType);
    }
    if (req.riskOwner !== undefined) {
      updates.push(`risk_owner = $${paramIndex++}`);
      values.push(req.riskOwner);
    }
    if (req.riskOwnerApproval !== undefined) {
      updates.push(`risk_owner_approval = $${paramIndex++}`);
      values.push(req.riskOwnerApproval);
    }
    if (req.existingControls !== undefined) {
      updates.push(`existing_controls = $${paramIndex++}`);
      values.push(req.existingControls);
    }
    if (req.likelihood !== undefined) {
      updates.push(`likelihood = $${paramIndex++}`);
      values.push(req.likelihood);
    }
    if (req.impact !== undefined) {
      updates.push(`impact = $${paramIndex++}`);
      values.push(req.impact);
    }
    if (req.impactRationale !== undefined) {
      updates.push(`impact_rationale = $${paramIndex++}`);
      values.push(req.impactRationale);
    }
    if (req.treatmentOptionChosen !== undefined) {
      updates.push(`treatment_option_chosen = $${paramIndex++}`);
      values.push(req.treatmentOptionChosen);
    }
    if (req.proposedTreatmentAction !== undefined) {
      updates.push(`proposed_treatment_action = $${paramIndex++}`);
      values.push(req.proposedTreatmentAction);
    }
    if (req.annexAControlReference !== undefined) {
      updates.push(`annex_a_control_reference = $${paramIndex++}`);
      values.push(req.annexAControlReference);
    }
    if (req.treatmentCost !== undefined) {
      updates.push(`treatment_cost = $${paramIndex++}`);
      values.push(req.treatmentCost);
    }
    if (req.treatmentActionOwner !== undefined) {
      updates.push(`treatment_action_owner = $${paramIndex++}`);
      values.push(req.treatmentActionOwner);
    }
    if (req.treatmentActionTimescale !== undefined) {
      updates.push(`treatment_action_timescale = $${paramIndex++}`);
      values.push(req.treatmentActionTimescale);
    }
    if (req.treatmentActionStatus !== undefined) {
      updates.push(`treatment_action_status = $${paramIndex++}`);
      values.push(req.treatmentActionStatus);
    }
    if (req.postTreatmentLikelihood !== undefined) {
      updates.push(`post_treatment_likelihood = $${paramIndex++}`);
      values.push(req.postTreatmentLikelihood);
    }
    if (req.postTreatmentImpact !== undefined) {
      updates.push(`post_treatment_impact = $${paramIndex++}`);
      values.push(req.postTreatmentImpact);
    }
    if (req.treatmentOptionChosen2 !== undefined) {
      updates.push(`treatment_option_chosen2 = $${paramIndex++}`);
      values.push(req.treatmentOptionChosen2);
    }
    if (req.comments !== undefined) {
      updates.push(`comments = $${paramIndex++}`);
      values.push(req.comments);
    }
    if (req.complianceFrameworks !== undefined) {
      updates.push(`compliance_frameworks = $${paramIndex++}`);
      values.push(req.complianceFrameworks);
    }
    if (req.reviewDate !== undefined) {
      updates.push(`review_date = $${paramIndex++}`);
      values.push(req.reviewDate);
    }
    if (req.nextAssessmentDate !== undefined) {
      updates.push(`next_assessment_date = $${paramIndex++}`);
      values.push(req.nextAssessmentDate);
    }

    // Recalculate risk level if likelihood or impact changed
    const newLikelihood = req.likelihood ?? existingRisk.likelihood;
    const newImpact = req.impact ?? existingRisk.impact;
    const newRiskLevel = calculateRiskLevel(newLikelihood, newImpact);
    
    updates.push(`risk_level = $${paramIndex++}`);
    values.push(newRiskLevel);

    // Calculate post-treatment risk score and level if both values are provided
    if (req.postTreatmentLikelihood !== undefined && req.postTreatmentImpact !== undefined) {
      const postTreatmentRiskScore = req.postTreatmentLikelihood * req.postTreatmentImpact;
      const postTreatmentRiskLevel = calculateRiskLevel(req.postTreatmentLikelihood, req.postTreatmentImpact);
      
      updates.push(`post_treatment_risk_score = $${paramIndex++}`);
      values.push(postTreatmentRiskScore);
      
      updates.push(`post_treatment_risk_level = $${paramIndex++}`);
      values.push(postTreatmentRiskLevel);
    }

    if (updates.length === 0) {
      throw APIError.invalidArgument("No valid fields to update");
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    updates.push(`updated_by = $${paramIndex++}`);
    values.push(auth.userID);
    values.push(req.id);

    const query = `
      UPDATE risks 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
    `;

    await risksDB.rawExec(query, ...values);

    const risk = await risksDB.queryRow<Risk>`
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
      FROM risks WHERE id = ${req.id}
    `;

    if (!risk) {
      throw APIError.notFound("Risk not found");
    }

    return risk;
  }
);
