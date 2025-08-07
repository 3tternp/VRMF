import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { riskDB } from "./db";
import type { RiskCategory, ComplianceFramework, RiskStatus, AssetGroup, RiskType, TreatmentOption, TreatmentStatus } from "./types";

export interface CreateRiskRequest {
  title: string;
  description?: string;
  category: RiskCategory;
  compliance_framework: ComplianceFramework;
  likelihood: number;
  impact: number;
  status?: RiskStatus;
  owner_id: string;
  due_date?: Date;
  mitigation_plan?: string;
  
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
  comments?: string;
}

export interface CreateRiskResponse {
  id: number;
  title: string;
  description?: string;
  category: RiskCategory;
  compliance_framework: ComplianceFramework;
  likelihood: number;
  impact: number;
  risk_score: number;
  status: RiskStatus;
  owner_id: string;
  created_by: string;
  created_at: Date;
  updated_at: Date;
  due_date?: Date;
  mitigation_plan?: string;
  residual_risk_score: number;
  
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
  comments?: string;
}

// Creates a new risk
export const create = api<CreateRiskRequest, CreateRiskResponse>(
  { auth: true, expose: true, method: "POST", path: "/risks" },
  async (req) => {
    const auth = getAuthData()!;
    
    // Only admin and risk_officer can create risks
    if (auth.role === "auditor") {
      throw APIError.permissionDenied("Auditors cannot create risks");
    }

    // Validate likelihood and impact values
    if (req.likelihood < 1 || req.likelihood > 5) {
      throw APIError.invalidArgument("Likelihood must be between 1 and 5");
    }
    if (req.impact < 1 || req.impact > 5) {
      throw APIError.invalidArgument("Impact must be between 1 and 5");
    }

    const risk = await riskDB.queryRow<CreateRiskResponse>`
      INSERT INTO risks (
        title, description, category, compliance_framework, 
        likelihood, impact, status, owner_id, created_by, due_date, mitigation_plan,
        asset_group, asset, threat, vulnerability, risk_type, risk_owner_approval,
        existing_controls, impact_rationale, treatment_option, proposed_treatment_action,
        annex_a_reference, treatment_cost, treatment_action_owner, treatment_timescale,
        treatment_status, comments
      ) VALUES (
        ${req.title}, ${req.description}, ${req.category}, ${req.compliance_framework},
        ${req.likelihood}, ${req.impact}, ${req.status || 'identified'}, ${req.owner_id}, 
        ${auth.userID}, ${req.due_date}, ${req.mitigation_plan},
        ${req.asset_group}, ${req.asset}, ${req.threat}, ${req.vulnerability}, 
        ${req.risk_type}, ${req.risk_owner_approval || false}, ${req.existing_controls},
        ${req.impact_rationale}, ${req.treatment_option}, ${req.proposed_treatment_action},
        ${req.annex_a_reference}, ${req.treatment_cost}, ${req.treatment_action_owner},
        ${req.treatment_timescale}, ${req.treatment_status || 'not_started'}, ${req.comments}
      )
      RETURNING *
    `;

    if (!risk) {
      throw APIError.internal("Failed to create risk");
    }

    return risk;
  }
);
