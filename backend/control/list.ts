import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { controlDB } from "./db";
import type { RiskControl } from "../risk/types";

export interface ListControlsRequest {
  risk_id?: Query<number>;
}

export interface ListControlsResponse {
  controls: RiskControl[];
}

// Lists controls, optionally filtered by risk ID
export const list = api<ListControlsRequest, ListControlsResponse>(
  { auth: true, expose: true, method: "GET", path: "/controls" },
  async (req) => {
    const auth = getAuthData()!;

    let query = "SELECT * FROM risk_controls";
    const params: any[] = [];

    if (req.risk_id) {
      query += " WHERE risk_id = $1";
      params.push(req.risk_id);
    }

    query += " ORDER BY created_at DESC";

    const controls = await controlDB.rawQueryAll<RiskControl>(query, ...params);

    return { controls };
  }
);
