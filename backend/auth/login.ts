import { api, Cookie } from "encore.dev/api";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: "admin" | "risk_officer" | "auditor";
  };
  session: Cookie<"session">;
}

// Login endpoint for demo purposes
export const login = api<LoginRequest, LoginResponse>(
  { expose: true, method: "POST", path: "/auth/login" },
  async (req) => {
    // Demo users - in production this would validate against a database
    const demoUsers = [
      { id: "1", email: "admin@company.com", password: "admin123", role: "admin" as const },
      { id: "2", email: "risk@company.com", password: "risk123", role: "risk_officer" as const },
      { id: "3", email: "auditor@company.com", password: "audit123", role: "auditor" as const },
    ];

    const user = demoUsers.find(u => u.email === req.email && u.password === req.password);
    if (!user) {
      throw APIError.unauthenticated("invalid credentials");
    }

    const token = Buffer.from(JSON.stringify({
      userID: user.id,
      email: user.email,
      role: user.role,
    })).toString('base64');

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      session: {
        value: token,
        expires: new Date(Date.now() + 3600 * 24 * 30 * 1000), // 30 days
        httpOnly: true,
        secure: true,
        sameSite: "Lax",
      }
    };
  }
);
