// src/api/auth.api.ts

import { axiosClient } from './client/axiosClient';
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
  ChangePasswordRequest,
} from '../modules/auth/types/auth.types';

class AuthApi {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await axiosClient.post<AuthResponse>('/auth/login/', data);
    return response;
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await axiosClient.post<AuthResponse>('/auth/register/', data);
    return response;
  }

  async logout(refresh: string): Promise<void> {
    await axiosClient.post('/auth/logout/', { refresh });
  }

  async refreshToken(refresh: string): Promise<{ access: string }> {
    const response = await axiosClient.post<{ access: string }>('/auth/token/refresh/', { refresh });
    return response;
  }



  async getUsers(params?: { role?: string; is_active?: boolean }): Promise<User[]> {
    const response = await axiosClient.get<User[]>('/auth/users/', { params });
    return response;
  }

  async getUser(id: number): Promise<User> {
    const response = await axiosClient.get<User>(`/auth/users/${id}/`);
    return response;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const response = await axiosClient.put<User>(`/auth/users/${id}/`, data);
    return response;
  }

  async deleteUser(id: number): Promise<void> {
    await axiosClient.delete(`/auth/users/${id}/`);
  }

  async toggleUserActive(id: number): Promise<{ message: string; is_active: boolean }> {
    const response = await axiosClient.post<{ message: string; is_active: boolean }>(
      `/auth/users/${id}/toggle-active/`
    );
    return response;
  }

  async changeUserRole(id: number, role: string): Promise<{ message: string; role: string }> {
    const response = await axiosClient.post<{ message: string; role: string }>(
      `/auth/users/${id}/change-role/`,
      { role }
    );
    return response;
  }

  async getUserLogs(userId?: number): Promise<any[]> {
    const url = userId ? `/auth/users/${userId}/logs/` : '/auth/users/logs/';
    const response = await axiosClient.get<any[]>(url);
    return response;
  }

    async getProfile(): Promise<User> {
    // ✅ مسیر درست: /users/me/ (بدون auth/)
    const response = await axiosClient.get<User>('/users/me/');
    return response;
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    // ✅ مسیر درست: /users/me/update/
    const response = await axiosClient.put<User>('/users/me/update/', data);
    return response;
  }

  async changePassword(data: ChangePasswordRequest): Promise<{ message: string }> {
    // ✅ مسیر درست: /users/change-password/
    const response = await axiosClient.post<{ message: string }>('/users/change-password/', data);
    return response;
  }
}

export const authApi = new AuthApi();