// src/api/user.api.ts

import { axiosClient } from './client/axiosClient';
import type { User, UserLog } from '../modules/auth/types/auth.types';
import type { PaginatedResponse, PaginationParams } from '../types/api.types';

export interface UserFilters extends PaginationParams {
  role?: string;
  is_active?: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
  date_from?: string;
  date_to?: string;
}

export interface UserStatistics {
  total_users: number;
  active_users: number;
  inactive_users: number;
  superusers: number;
  by_role: Record<string, number>;
  by_role_display: Record<string, number>;
  new_users_this_month: number;
  recent_logins: {
    id: number;
    username: string;
    full_name: string;
    role: string;
    last_login: string;
  }[];
}

export interface UserPermissionsResponse {
  user: User;
  role: string;
  role_display: string;
  role_permissions: string[];
  custom_permissions: string[];
  all_permissions: string[];
}

class UserApi {
  async getUsers(params?: UserFilters): Promise<PaginatedResponse<User>> {
    const response = await axiosClient.get<PaginatedResponse<User>>('/users/', { params });
    return response;
  }

  async getUser(id: number): Promise<User> {
    const response = await axiosClient.get<User>(`/users/${id}/`);
    return response;
  }

  async createUser(data: any): Promise<User> {
    const response = await axiosClient.post<User>('/users/', data);
    return response;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const response = await axiosClient.put<User>(`/users/${id}/`, data);
    return response;
  }

  async patchUser(id: number, data: Partial<User>): Promise<User> {
    const response = await axiosClient.patch<User>(`/users/${id}/`, data);
    return response;
  }

  async deleteUser(id: number): Promise<void> {
    await axiosClient.delete(`/users/${id}/`);
  }

  async toggleActive(id: number): Promise<{ message: string; is_active: boolean }> {
    const response = await axiosClient.post<{ message: string; is_active: boolean }>(
      `/users/${id}/toggle-active/`
    );
    return response;
  }

  async changeRole(id: number, role: string): Promise<{ 
    message: string; 
    role: string; 
    role_display: string;
  }> {
    const response = await axiosClient.post<{ 
      message: string; 
      role: string; 
      role_display: string;
    }>(`/users/${id}/change-role/`, { role });
    return response;
  }

  async getUserLogs(userId: number): Promise<UserLog[]> {
    const response = await axiosClient.get<UserLog[]>(`/users/${userId}/logs/`);
    return response;
  }

  async getUserPermissions(userId: number): Promise<UserPermissionsResponse> {
    const response = await axiosClient.get<UserPermissionsResponse>(`/users/${userId}/permissions/`);
    return response;
  }

  async getStatistics(): Promise<UserStatistics> {
    const response = await axiosClient.get<UserStatistics>('/users/statistics/');
    return response;
  }
}

export const userApi = new UserApi();

