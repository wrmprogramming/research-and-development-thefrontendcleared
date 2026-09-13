// src/api/permission.api.ts

import { axiosClient } from './client/axiosClient';
import type {
  SystemPermission,
  GroupedPermissions,
  RolePermission,
  UserPermission,
  PermissionMatrix,
} from '../modules/permission/types/permission.types';

class PermissionApi {
  // ========== System Permissions ==========
  
  async getPermissions(params?: {
    category?: string;
    action?: string;
    is_active?: boolean;
    search?: string;
  }): Promise<SystemPermission[]> {
    const response = await axiosClient.get<SystemPermission[]>('/permissions/', { params });
    return response;
  }

  async getGroupedPermissions(): Promise<GroupedPermissions> {
    const response = await axiosClient.get<GroupedPermissions>('/permissions/grouped/');
    return response;
  }

  async initializePermissions(): Promise<{ message: string; total: number }> {
    const response = await axiosClient.post<{ message: string; total: number }>(
      '/permissions/initialize/'
    );
    return response;
  }

  // ========== Role Permissions ==========

  async getRolePermissions(params?: {
    role?: string;
    permission__category?: string;
    is_active?: boolean;
  }): Promise<RolePermission[]> {
    const response = await axiosClient.get<RolePermission[]>('/role-permissions/', { params });
    return response;
  }

  async getPermissionsByRole(role: string): Promise<GroupedPermissions & {
    role: string;
    role_display: string;
    total_permissions: number;
    granted_count: number;
  }> {
    const response = await axiosClient.get(`/role-permissions/by-role/${role}/`);
    return response;
  }

  async bulkUpdateRolePermissions(data: {
    role: string;
    permission_ids: number[];
  }): Promise<{ message: string; role: string; count: number }> {
    const response = await axiosClient.post('/role-permissions/bulk-update/', data);
    return response;
  }

  async getPermissionMatrix(): Promise<PermissionMatrix> {
    const response = await axiosClient.get<PermissionMatrix>('/role-permissions/matrix/');
    return response;
  }

  // ========== User Permissions ==========

  async getUserPermissions(params?: {
    user?: number;
    permission__category?: string;
    is_active?: boolean;
  }): Promise<UserPermission[]> {
    const response = await axiosClient.get<UserPermission[]>('/user-permissions/', { params });
    return response;
  }

  async getPermissionsByUser(userId: number): Promise<GroupedPermissions & {
    user: any;
    role: string;
    role_display: string;
    total_permissions: number;
    granted_count: number;
  }> {
    const response = await axiosClient.get(`/user-permissions/by-user/${userId}/`);
    return response;
  }

  async bulkUpdateUserPermissions(data: {
    user_id: number;
    permission_ids: number[];
  }): Promise<{ message: string; user_id: number; count: number }> {
    const response = await axiosClient.post('/user-permissions/bulk-update/', data);
    return response;
  }
}

export const permissionApi = new PermissionApi();