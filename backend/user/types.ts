export type UserRole = 'admin' | 'iso_officer' | 'auditor';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  profilePictureUrl?: string;
  isActive: boolean;
  mfaEnabled: boolean;
  passwordExpiresAt: Date;
  lastPasswordChange: Date;
  failedLoginAttempts: number;
  lockedUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  role: UserRole;
  firstName: string;
  lastName: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  mfaCode?: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  requiresMfa: boolean;
}

export interface MfaSettingsResponse {
  enabled: boolean;
}

export interface UpdateMfaSettingsRequest {
  enabled: boolean;
}
