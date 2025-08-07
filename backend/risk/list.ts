import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { riskDB } from "./db";
import type { Risk, RiskCategory, ComplianceFramework, RiskStatus } from "./types";

export interface ListRisksRequest {
  category?: Query<RiskCategory>;
  compliance_framework?: Query<ComplianceFramework>;
  status?: Query<RiskStatus>;
  owner_id?: Query<string>;
  limit?: Query<number>;
  offset?: Query<number>;
}

export interface ListRisksResponse {
  risks: Risk[];
  total: number;
}

// Lists all risks with optional filtering
export const list = api<ListRisksRequest, ListRisksResponse>(
  { auth: true, expose: true, method: "GET", path: "/risks" },
  async (req) => {
    const auth = getAuthData()!;
    
    let whereClause = "WHERE 1=1";
    const params: any[] = [];
    let paramIndex = 1;

    // Auditors can only see risks, no additional filtering needed for role
    // Admin and risk_officer can see all risks

    if (req.category) {
      whereClause += ` AND category = $${paramIndex}`;
      params.push(req.category);
      paramIndex++;
    }

    if (req.compliance_framework) {
      whereClause += ` AND compliance_framework = $${paramIndex}`;
      params.push(req.compliance_framework);
      paramIndex++;
    }

    if (req.status) {
      whereClause += ` AND status = $${paramIndex}`;
      params.push(req.status);
      paramIndex++;
    }

    if (req.owner_id) {
      whereClause += ` AND owner_id = $${paramIndex}`;
      params.push(req.owner_id);
      paramIndex++;
    }

    const limit = req.limit || 50;
    const offset = req.offset || 0;

    const countQuery = `SELECT COUNT(*) as total FROM risks ${whereClause}`;
    const totalResult = await riskDB.rawQueryRow<{ total: number }>(countQuery, ...params);
    const total = totalResult?.total || 0;

    const query = `
      SELECT * FROM risks 
      ${whereClause}
      ORDER BY created_at DESC 
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    params.push(limit, offset);

    const risks = await riskDB.rawQueryAll<Risk>(query, ...params);

    return { risks, total };
  }
);
