export type RiskCategory = 
  | "operational" 
  | "financial" 
  | "strategic" 
  | "compliance" 
  | "technology" 
  | "security" 
  | "reputation" 
  | "legal";

export type ComplianceFramework = 
  | "nist_rmf" 
  | "iso_27001" 
  | "soc2" 
  | "gdpr" 
  | "hipaa" 
  | "pci_dss";

export type RiskStatus = 
  | "identified" 
  | "assessed" 
  | "mitigated" 
  | "accepted" 
  | "transferred" 
  | "closed";

export type ControlType = 
  | "preventive" 
  | "detective" 
  | "corrective" 
  | "compensating";

export type ControlEffectiveness = 
  | "high" 
  | "medium" 
  | "low" 
  | "not_effective";

export type ImplementationStatus = 
  | "planned" 
  | "in_progress" 
  | "implemented" 
  | "not_implemented";

export interface Risk {
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
  residual_likelihood?: number;
  residual_impact?: number;
  residual_risk_score: number;
}

export interface RiskControl {
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

export interface RiskAssessment {
  id: number;
  risk_id: number;
  assessment_date: Date;
  assessor_id: string;
  likelihood: number;
  impact: number;
  notes?: string;
  created_at: Date;
}
