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

export type AssetGroup = 
  | "information"
  | "network"
  | "hardware"
  | "software"
  | "physical_site"
  | "people";

export type RiskType = 
  | "confidentiality"
  | "integrity"
  | "availability"
  | "confidentiality_integrity"
  | "confidentiality_availability"
  | "integrity_availability"
  | "confidentiality_integrity_availability";

export type TreatmentOption = 
  | "accept"
  | "avoid"
  | "modify"
  | "share";

export type TreatmentStatus = 
  | "not_started"
  | "in_progress"
  | "completed"
  | "rejected";

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
  post_treatment_risk_score?: number;
  post_treatment_treatment_option?: TreatmentOption;
  comments?: string;
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
