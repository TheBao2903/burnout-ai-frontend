// ==========================================
// Auth Types - Firebase Authentication & User Profile
// ==========================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name?: string;
  username?: string;
}

export interface User {
  uid: string;
  id?: string;
  username?: string;
  email?: string;
  full_name?: string;
  role?: string;
  avatar_url?: string;
  created_at?: string;
  email_verified?: boolean;
}

export interface UserProfile {
  uid: string;
  email?: string;
  full_name?: string;
  avatar?: string;
  gender?: string;
  birthday?: string;
  phone?: string;
  email_verified?: boolean;
  created_at?: string;
  standard_working_hours_per_day?: number;
  work_days_per_week?: number;
  average_overtime_hours_per_week?: number;
  job_title?: string;
  industry_code?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type?: string;
  expires_in_hours?: number;
  refresh_token?: string;
  refresh_expires_in_days?: number;
  user: User;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  token_type?: string;
  expires_in_hours?: number;
  refresh_token: string;
  refresh_expires_in_days?: number;
}

