import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { riskDB } from "./db";
import type { Risk } from "./types";

export interface GetRiskRequest {
  id: number;
}

// Retrieves a specific risk by ID
export const get = api<GetRiskRequest, Risk>(
  { auth: true, expose: true, method: "GET", path: "/risks/:id" },
  async (req) => {
    const auth = getAuthData()!;

    const risk = await riskDB.queryRow<Risk>`
      SELECT * FROM risks WHERE id = ${req.id}
    `;

    if (!risk) {
      throw APIError.notFound("Risk not found");
    }

    return risk;
  }
);
