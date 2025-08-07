export type AssetGroup = 'Information' | 'Network' | 'Hardware' | 'Software' | 'Physical/Site' | 'People';
export type RiskType = 'Confidentiality' | 'Integrity' | 'Availability' | 'Confidentiality, Integrity' | 'Confidentiality, Availability' | 'Integrity, Availability' | 'Confidentiality, Integrity, Availability';
export type ApprovalStatus = 'Approved' | 'Not Approved';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type TreatmentOption = 'Accept' | 'Avoid' | 'Modify' | 'Share';
export type TreatmentStatus = 'Not Started' | 'In Progress' | 'Completed' | 'Rejected';
export type ComplianceFramework = 'ISO 27001' | 'SOC2' | 'HIPAA' | 'PCI DSS' | 'COSO' | 'COBIT' | 'GDPR' | 'NIST RMF';

export interface Risk {
  id: string;
  sn: number;
  assetGroup: AssetGroup;
  asset: string;
  threat: string;
  vulnerability: string;
  riskType: string;
  riskOwner: string;
  riskOwnerApproval: ApprovalStatus;
  existingControls?: string;
  likelihood: number;
  impact: number;
  impactRationale: string;
  riskLevel: RiskLevel;
  treatmentOptionChosen: TreatmentOption;
  proposedTreatmentAction: string;
  annexAControlReference: string;
  treatmentCost: string;
  treatmentActionOwner: string;
  treatmentActionTimescale: string;
  treatmentActionStatus: TreatmentStatus;
  postTreatmentLikelihood?: number;
  postTreatmentImpact?: number;
  postTreatmentRiskScore?: number;
  postTreatmentRiskLevel?: RiskLevel;
  treatmentOptionChosen2?: TreatmentOption;
  comments?: string;
  complianceFrameworks: ComplianceFramework[];
  reviewDate?: Date;
  nextAssessmentDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface CreateRiskRequest {
  assetGroup: AssetGroup;
  asset: string;
  threat: string;
  vulnerability: string;
  riskType: string;
  riskOwner: string;
  riskOwnerApproval: ApprovalStatus;
  existingControls?: string;
  likelihood: number;
  impact: number;
  impactRationale: string;
  treatmentOptionChosen: TreatmentOption;
  proposedTreatmentAction: string;
  annexAControlReference: string;
  treatmentCost: string;
  treatmentActionOwner: string;
  treatmentActionTimescale: string;
  treatmentActionStatus: TreatmentStatus;
  postTreatmentLikelihood?: number;
  postTreatmentImpact?: number;
  treatmentOptionChosen2?: TreatmentOption;
  comments?: string;
  complianceFrameworks: ComplianceFramework[];
  reviewDate?: Date;
  nextAssessmentDate?: Date;
}

export interface UpdateRiskRequest {
  assetGroup?: AssetGroup;
  asset?: string;
  threat?: string;
  vulnerability?: string;
  riskType?: string;
  riskOwner?: string;
  riskOwnerApproval?: ApprovalStatus;
  existingControls?: string;
  likelihood?: number;
  impact?: number;
  impactRationale?: string;
  treatmentOptionChosen?: TreatmentOption;
  proposedTreatmentAction?: string;
  annexAControlReference?: string;
  treatmentCost?: string;
  treatmentActionOwner?: string;
  treatmentActionTimescale?: string;
  treatmentActionStatus?: TreatmentStatus;
  postTreatmentLikelihood?: number;
  postTreatmentImpact?: number;
  treatmentOptionChosen2?: TreatmentOption;
  comments?: string;
  complianceFrameworks?: ComplianceFramework[];
  reviewDate?: Date;
  nextAssessmentDate?: Date;
}

export interface RiskDashboardStats {
  totalRisks: number;
  highRisks: number;
  mediumRisks: number;
  lowRisks: number;
  completedTreatments: number;
  inProgressTreatments: number;
  notStartedTreatments: number;
  risksByAssetGroup: { [key in AssetGroup]: number };
  risksByComplianceFramework: { [key in ComplianceFramework]: number };
}

export interface RiskMonitoringItem {
  id: string;
  sn: number;
  asset: string;
  threat: string;
  riskLevel: RiskLevel;
  nextAssessmentDate: Date;
  daysUntilAssessment: number;
  treatmentActionStatus: TreatmentStatus;
  riskOwner: string;
}

export interface RiskMonitoringResponse {
  overdueAssessments: RiskMonitoringItem[];
  upcomingAssessments: RiskMonitoringItem[];
  totalOverdue: number;
  totalUpcoming: number;
}
