import { RiskLevel } from "./types";

export function calculateRiskLevel(likelihood: number, impact: number): RiskLevel {
  const score = likelihood * impact;
  
  if (score >= 1 && score <= 4) {
    return 'LOW';
  } else if (score >= 5 && score <= 10) {
    return 'MEDIUM';
  } else if (score >= 12 && score <= 25) {
    return 'HIGH';
  }
  
  return 'LOW'; // fallback
}

export function generateRiskId(): string {
  return crypto.randomUUID();
}

export function getRiskColor(level: RiskLevel): string {
  switch (level) {
    case 'HIGH':
      return '#ef4444'; // red-500
    case 'MEDIUM':
      return '#f59e0b'; // amber-500
    case 'LOW':
      return '#10b981'; // emerald-500
    default:
      return '#6b7280'; // gray-500
  }
}

export function getTreatmentStatusColor(status: string): string {
  switch (status) {
    case 'Completed':
      return '#10b981'; // emerald-500
    case 'In Progress':
      return '#3b82f6'; // blue-500
    case 'Not Started':
      return '#6b7280'; // gray-500
    case 'Rejected':
      return '#ef4444'; // red-500
    default:
      return '#6b7280'; // gray-500
  }
}
