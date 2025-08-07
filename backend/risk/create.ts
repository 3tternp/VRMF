import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { riskDB } from "./db";
import type { RiskCategory, ComplianceFramework, RiskStatus } from "./types";

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
}

// Creates a new risk
export const create = api<CreateRiskRequest, CreateRiskResponse>(
  { auth: true, expose: true, method: "POST", path: "/risks" },
  async (req) => {
    const auth = getAuthData()!;
    
    // Only admin and risk_officer can create risks
    if (auth.role === "auditor") {
      throw new Error("Auditors cannot create risks");
    }

    // Validate likelihood and impact values
    if (req.likelihood < 1 || req.likelihood > 5) {
      throw new Error("Likelihood must be between 1 and 5");
    }
    if (req.impact < 1 || req.impact > 5) {
      throw new Error("Impact must be between 1 and 5");
    }

    const risk = await riskDB.queryRow<CreateRiskResponse>`
      INSERT INTO risks (
        title, description, category, compliance_framework, 
        likelihood, impact, status, owner_id, created_by, due_date, mitigation_plan
      ) VALUES (
        ${req.title}, ${req.description}, ${req.category}, ${req.compliance_framework},
        ${req.likelihood}, ${req.impact}, ${req.status || 'identified'}, ${req.owner_id}, 
        ${auth.userID}, ${req.due_date}, ${req.mitigation_plan}
      )
      RETURNING *
    `;

    if (!risk) {
      throw new Error("Failed to create risk");
    }

    return risk;
  }
);
