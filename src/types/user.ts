// ==========================================
// User Types
// ==========================================

export interface User {
  id: string;
  username: string;
  email?: string;
  full_name?: string;
  phone?: string;
  role: string;
  is_active: boolean;
  email_verified?: boolean;
  created_at?: string;
  last_login_at?: string;
}

export interface UserListResponse {
  users: User[];
  total: number;
  limit: number;
  offset: number;
}

export interface UpdateUserRequest {
  full_name?: string;
  email?: string;
  phone?: string;
  role?: string;
  is_active?: boolean;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  email?: string;
  full_name?: string;
  phone?: string;
  role?: string;
}
