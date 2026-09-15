// src/api/auth.api.ts

import { axiosClient } from './client/axiosClient';
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
  ChangePasswordRequest,
  UserLog,
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

  async getProfile(): Promise<User> {
    const response = await axiosClient.get<User>('/users/me/');
    return response;
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await axiosClient.put<User>('/users/me/update/', data);
    return response;
  }

  async changePassword(data: ChangePasswordRequest): Promise<{ message: string }> {
    const response = await axiosClient.post<{ message: string }>('/users/change-password/', data);
    return response;
  }

  async getMyLogs(): Promise<UserLog[]> {
    const response = await axiosClient.get<UserLog[]>('/users/logs/');
    return response;
  }
}

export const authApi = new AuthApi();
