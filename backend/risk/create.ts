import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { usersDB } from "../users/db";
import { risksDB } from "./db";
import { CreateRiskRequest, Risk } from "./types";
import { calculateRiskLevel, generateRiskId } from "./utils";

// Creates a new risk (admin and iso_officer only).
export const create = api<CreateRiskRequest, Risk>(
  { auth: true, expose: true, method: "POST", path: "/risks" },
  async (req) => {
    const auth = getAuthData()!;
    
    // Check if user can create risks
    const currentUser = await usersDB.queryRow<{ role: string }>`
      SELECT role FROM users WHERE id = ${auth.userID}
    `;
    
    if (!currentUser || !['admin', 'iso_officer'].includes(currentUser.role)) {
      throw APIError.permissionDenied("Only admins and ISO officers can create risks");
    }

    // Calculate risk level
    const riskLevel = calculateRiskLevel(req.likelihood, req.impact);
    
    // Calculate post-treatment risk score and level if provided
    let postTreatmentRiskScore: number | undefined;
    let postTreatmentRiskLevel: string | undefined;
    
    if (req.postTreatmentLikelihood && req.postTreatmentImpact) {
      postTreatmentRiskScore = req.postTreatmentLikelihood * req.postTreatmentImpact;
      postTreatmentRiskLevel = calculateRiskLevel(req.postTreatmentLikelihood, req.postTreatmentImpact);
    }

    const riskId = generateRiskId();
    
    // Get next serial number
    const nextSn = await risksDB.queryRow<{ next_sn: number }>`
      SELECT COALESCE(MAX(sn), 0) + 1 as next_sn FROM risks
    `;

    await risksDB.exec`
      INSERT INTO risks (
        id, sn, asset_group, asset, threat, vulnerability, risk_type,
        risk_owner, risk_owner_approval, existing_controls, likelihood, impact,
        impact_rationale, risk_level, treatment_option_chosen, proposed_treatment_action,
        annex_a_control_reference, treatment_cost, treatment_action_owner,
        treatment_action_timescale, treatment_action_status, post_treatment_likelihood,
        post_treatment_impact, post_treatment_risk_score, post_treatment_risk_level,
        treatment_option_chosen2, comments, compliance_frameworks, review_date,
        next_assessment_date, created_by, updated_by
      ) VALUES (
        ${riskId}, ${nextSn!.next_sn}, ${req.assetGroup}, ${req.asset}, ${req.threat},
        ${req.vulnerability}, ${req.riskType}, ${req.riskOwner}, ${req.riskOwnerApproval},
        ${req.existingControls}, ${req.likelihood}, ${req.impact}, ${req.impactRationale},
        ${riskLevel}, ${req.treatmentOptionChosen}, ${req.proposedTreatmentAction},
        ${req.annexAControlReference}, ${req.treatmentCost}, ${req.treatmentActionOwner},
        ${req.treatmentActionTimescale}, ${req.treatmentActionStatus}, ${req.postTreatmentLikelihood},
        ${req.postTreatmentImpact}, ${postTreatmentRiskScore}, ${postTreatmentRiskLevel},
        ${req.treatmentOptionChosen2}, ${req.comments}, ${req.complianceFrameworks},
        ${req.reviewDate}, ${req.nextAssessmentDate}, ${auth.userID}, ${auth.userID}
      )
    `;

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
      FROM risks WHERE id = ${riskId}
    `;

    if (!risk) {
      throw APIError.internal("Failed to create risk");
    }

    return risk;
  }
);
