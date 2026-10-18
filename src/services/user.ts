// ==========================================
// User Service - API calls cho user management
// ==========================================

import api from './api';

export interface User {
  id: string;
  uid?: string;
  username: string;
  email?: string;
  full_name?: string;
  phone?: string;
  avatar?: string;
  avatar_url?: string;
  role: string;
  is_active: boolean;
  email_verified?: boolean;
  gender?: string;
  birthday?: string;
  job_title?: string;
  industry_code?: string;
  standard_working_hours_per_day?: number;
  work_days_per_week?: number;
  average_overtime_hours_per_week?: number;
  created_at?: string;
  updated_at?: string;
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
  gender?: string;
  birthday?: string;
  job_title?: string;
  industry_code?: string;
  standard_working_hours_per_day?: number;
  work_days_per_week?: number;
  average_overtime_hours_per_week?: number;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  email?: string;
  full_name?: string;
  phone?: string;
  role?: string;
}

export const userService = {
  /**
   * Lấy danh sách users
   */
  async getUsers(params?: {
    limit?: number;
    offset?: number;
    search?: string;
    role_filter?: string;
  }): Promise<UserListResponse> {
    const response = await api.get<UserListResponse>('/api/auth/admin/users', { params });
    return response.data;
  },

  /**
   * Lấy chi tiết user theo ID
   */
  async getUser(userId: string): Promise<User> {
    const response = await api.get<User>(`/api/auth/admin/users/${userId}`);
    return response.data;
  },

  /**
   * Cập nhật user
   */
  async updateUser(userId: string, data: UpdateUserRequest): Promise<User> {
    const response = await api.put<User>(`/api/auth/admin/users/${userId}`, data);
    return response.data;
  },

  /**
   * Toggle user active status
   */
  async toggleUserActive(userId: string, isActive: boolean): Promise<User> {
    const response = await api.put<User>(`/api/auth/admin/users/${userId}`, {
      is_active: isActive,
    });
    return response.data;
  },

  /**
   * Xóa user (soft delete)
   */
  async deleteUser(userId: string): Promise<void> {
    await api.delete(`/api/auth/admin/users/${userId}`);
  },

  /**
   * Tạo user mới
   */
  async createUser(data: CreateUserRequest): Promise<User> {
    const response = await api.post<User>('/api/auth/register', data);
    return response.data;
  },
};

export default userService;
