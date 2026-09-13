// src/api/role.api.ts

import { axiosClient } from './client/axiosClient';
import type { 
  Role, 
  RoleDetail, 
  RoleDescription 
} from '../modules/role/types/role.types';

class RoleApi {
  async getRoles(): Promise<Role[]> {
    const response = await axiosClient.get<Role[]>('/roles/');
    return response;
  }

  async getRole(roleCode: string): Promise<RoleDetail> {
    const response = await axiosClient.get<RoleDetail>(`/roles/${roleCode}/`);
    return response;
  }

  // ========== Role Descriptions ==========

  async getRoleDescriptions(params?: { is_active?: boolean; search?: string }): Promise<RoleDescription[]> {
    const response = await axiosClient.get<RoleDescription[]>('/role-descriptions/', { params });
    return response;
  }

  async createRoleDescription(data: Partial<RoleDescription>): Promise<RoleDescription> {
    const response = await axiosClient.post<RoleDescription>('/role-descriptions/', data);
    return response;
  }

  async updateRoleDescription(id: number, data: Partial<RoleDescription>): Promise<RoleDescription> {
    const response = await axiosClient.put<RoleDescription>(`/role-descriptions/${id}/`, data);
    return response;
  }

  async deleteRoleDescription(id: number): Promise<void> {
    await axiosClient.delete(`/role-descriptions/${id}/`);
  }
}

export const roleApi = new RoleApi();