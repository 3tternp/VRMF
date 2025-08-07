import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { risksDB } from "./db";
import { RiskMonitoringResponse, RiskMonitoringItem } from "./types";

// Gets risk monitoring data for upcoming and overdue assessments.
export const getMonitoring = api<void, RiskMonitoringResponse>(
  { auth: true, expose: true, method: "GET", path: "/risks/monitoring" },
  async () => {
    const auth = getAuthData()!;

    // Get overdue assessments (next_assessment_date < current date)
    const overdueQuery = `
      SELECT 
        id, sn, asset, threat, risk_level as "riskLevel",
        next_assessment_date as "nextAssessmentDate",
        EXTRACT(DAY FROM (CURRENT_DATE - next_assessment_date::date)) as "daysUntilAssessment",
        treatment_action_status as "treatmentActionStatus",
        risk_owner as "riskOwner"
      FROM risks 
      WHERE next_assessment_date IS NOT NULL 
        AND next_assessment_date < CURRENT_DATE
      ORDER BY next_assessment_date ASC
    `;

    const overdueAssessments = await risksDB.rawQueryAll<RiskMonitoringItem>(overdueQuery);

    // Get upcoming assessments (next_assessment_date within next 30 days)
    const upcomingQuery = `
      SELECT 
        id, sn, asset, threat, risk_level as "riskLevel",
        next_assessment_date as "nextAssessmentDate",
        EXTRACT(DAY FROM (next_assessment_date::date - CURRENT_DATE)) as "daysUntilAssessment",
        treatment_action_status as "treatmentActionStatus",
        risk_owner as "riskOwner"
      FROM risks 
      WHERE next_assessment_date IS NOT NULL 
        AND next_assessment_date >= CURRENT_DATE
        AND next_assessment_date <= CURRENT_DATE + INTERVAL '30 days'
      ORDER BY next_assessment_date ASC
    `;

    const upcomingAssessments = await risksDB.rawQueryAll<RiskMonitoringItem>(upcomingQuery);

    // Convert negative days for overdue items
    const processedOverdue = overdueAssessments.map(item => ({
      ...item,
      daysUntilAssessment: -Math.abs(item.daysUntilAssessment)
    }));

    return {
      overdueAssessments: processedOverdue,
      upcomingAssessments,
      totalOverdue: processedOverdue.length,
      totalUpcoming: upcomingAssessments.length,
    };
  }
);
