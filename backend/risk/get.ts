import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { risksDB } from "./db";
import { Risk } from "./types";

interface GetRiskParams {
  id: string;
}

// Gets a risk by ID.
export const get = api<GetRiskParams, Risk>(
  { auth: true, expose: true, method: "GET", path: "/risks/:id" },
  async (params) => {
    const auth = getAuthData()!;

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
      FROM risks WHERE id = ${params.id}
    `;

    if (!risk) {
      throw APIError.notFound("Risk not found");
    }

    return risk;
  }
);
