import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { riskDB } from "./db";

export interface DashboardStats {
  total_risks: number;
  risks_by_status: { status: string; count: number }[];
  risks_by_category: { category: string; count: number }[];
  risks_by_compliance: { framework: string; count: number }[];
  risk_heatmap: { likelihood: number; impact: number; count: number }[];
  high_risk_count: number;
  medium_risk_count: number;
  low_risk_count: number;
}

// Retrieves dashboard statistics and risk heatmap data
export const dashboard = api<void, DashboardStats>(
  { auth: true, expose: true, method: "GET", path: "/risks/dashboard" },
  async () => {
    const auth = getAuthData()!;

    // Get total risks
    const totalResult = await riskDB.queryRow<{ count: number }>`
      SELECT COUNT(*) as count FROM risks
    `;
    const total_risks = totalResult?.count || 0;

    // Get risks by status
    const statusResults = await riskDB.queryAll<{ status: string; count: number }>`
      SELECT status, COUNT(*) as count 
      FROM risks 
      GROUP BY status 
      ORDER BY count DESC
    `;

    // Get risks by category
    const categoryResults = await riskDB.queryAll<{ category: string; count: number }>`
      SELECT category, COUNT(*) as count 
      FROM risks 
      GROUP BY category 
      ORDER BY count DESC
    `;

    // Get risks by compliance framework
    const complianceResults = await riskDB.queryAll<{ framework: string; count: number }>`
      SELECT compliance_framework as framework, COUNT(*) as count 
      FROM risks 
      GROUP BY compliance_framework 
      ORDER BY count DESC
    `;

    // Get risk heatmap data
    const heatmapResults = await riskDB.queryAll<{ likelihood: number; impact: number; count: number }>`
      SELECT likelihood, impact, COUNT(*) as count 
      FROM risks 
      GROUP BY likelihood, impact 
      ORDER BY likelihood, impact
    `;

    // Get risk counts by severity
    const severityResults = await riskDB.queryAll<{ risk_level: string; count: number }>`
      SELECT 
        CASE 
          WHEN risk_score >= 15 THEN 'high'
          WHEN risk_score >= 8 THEN 'medium'
          ELSE 'low'
        END as risk_level,
        COUNT(*) as count
      FROM risks 
      GROUP BY risk_level
    `;

    const high_risk_count = severityResults.find(r => r.risk_level === 'high')?.count || 0;
    const medium_risk_count = severityResults.find(r => r.risk_level === 'medium')?.count || 0;
    const low_risk_count = severityResults.find(r => r.risk_level === 'low')?.count || 0;

    return {
      total_risks,
      risks_by_status: statusResults,
      risks_by_category: categoryResults,
      risks_by_compliance: complianceResults,
      risk_heatmap: heatmapResults,
      high_risk_count,
      medium_risk_count,
      low_risk_count,
    };
  }
);
