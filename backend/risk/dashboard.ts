import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { risksDB } from "./db";
import { RiskDashboardStats, AssetGroup, ComplianceFramework } from "./types";

// Gets dashboard statistics for risks.
export const getDashboardStats = api<void, RiskDashboardStats>(
  { auth: true, expose: true, method: "GET", path: "/risks/dashboard" },
  async () => {
    const auth = getAuthData()!;

    // Get total risks
    const totalResult = await risksDB.queryRow<{ total: number }>`
      SELECT COUNT(*) as total FROM risks
    `;
    const totalRisks = totalResult?.total || 0;

    // Get risks by level
    const riskLevels = await risksDB.queryAll<{ risk_level: string, count: number }>`
      SELECT risk_level, COUNT(*) as count 
      FROM risks 
      GROUP BY risk_level
    `;

    let highRisks = 0, mediumRisks = 0, lowRisks = 0;
    riskLevels.forEach(level => {
      switch (level.risk_level) {
        case 'HIGH':
          highRisks = level.count;
          break;
        case 'MEDIUM':
          mediumRisks = level.count;
          break;
        case 'LOW':
          lowRisks = level.count;
          break;
      }
    });

    // Get treatment status counts
    const treatmentStatus = await risksDB.queryAll<{ treatment_action_status: string, count: number }>`
      SELECT treatment_action_status, COUNT(*) as count 
      FROM risks 
      GROUP BY treatment_action_status
    `;

    let completedTreatments = 0, inProgressTreatments = 0, notStartedTreatments = 0;
    treatmentStatus.forEach(status => {
      switch (status.treatment_action_status) {
        case 'Completed':
          completedTreatments = status.count;
          break;
        case 'In Progress':
          inProgressTreatments = status.count;
          break;
        case 'Not Started':
          notStartedTreatments = status.count;
          break;
      }
    });

    // Get risks by asset group
    const assetGroups = await risksDB.queryAll<{ asset_group: AssetGroup, count: number }>`
      SELECT asset_group, COUNT(*) as count 
      FROM risks 
      GROUP BY asset_group
    `;

    const risksByAssetGroup: { [key in AssetGroup]: number } = {
      'Information': 0,
      'Network': 0,
      'Hardware': 0,
      'Software': 0,
      'Physical/Site': 0,
      'People': 0
    };

    assetGroups.forEach(group => {
      risksByAssetGroup[group.asset_group] = group.count;
    });

    // Get risks by compliance framework
    const complianceFrameworks = await risksDB.queryAll<{ framework: ComplianceFramework, count: number }>`
      SELECT UNNEST(compliance_frameworks) as framework, COUNT(*) as count 
      FROM risks 
      GROUP BY framework
    `;

    const risksByComplianceFramework: { [key in ComplianceFramework]: number } = {
      'ISO 27001': 0,
      'SOC2': 0,
      'HIPAA': 0,
      'PCI DSS': 0,
      'COSO': 0,
      'COBIT': 0,
      'GDPR': 0,
      'NIST RMF': 0
    };

    complianceFrameworks.forEach(framework => {
      risksByComplianceFramework[framework.framework] = framework.count;
    });

    return {
      totalRisks,
      highRisks,
      mediumRisks,
      lowRisks,
      completedTreatments,
      inProgressTreatments,
      notStartedTreatments,
      risksByAssetGroup,
      risksByComplianceFramework
    };
  }
);
