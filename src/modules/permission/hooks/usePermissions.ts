// src/modules/permission/hooks/usePermissions.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { permissionApi } from '../../../api/permission.api';
import { toast } from 'react-hot-toast';

export const usePermissions = () => {
  const queryClient = useQueryClient();

  // ========== System Permissions ==========

  const useList = (params?: {
    category?: string;
    action?: string;
    is_active?: boolean;
    search?: string;
  }) => {
    return useQuery({
      queryKey: ['permissions', params],
      queryFn: () => permissionApi.getPermissions(params),
    });
  };

  const useGrouped = () => {
    return useQuery({
      queryKey: ['permissions', 'grouped'],
      queryFn: () => permissionApi.getGroupedPermissions(),
    });
  };

  const useInitialize = () => {
    return useMutation({
      mutationFn: () => permissionApi.initializePermissions(),
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ['permissions'] });
        toast.success(data.message);
      },
      onError: (error: any) => {
        toast.error(error.message || 'خطا در ایجاد مجوزها');
      },
    });
  };

  // ========== Role Permissions ==========

  const useByRole = (role: string) => {
    return useQuery({
      queryKey: ['role-permissions', role],
      queryFn: () => permissionApi.getPermissionsByRole(role),
      enabled: !!role,
    });
  };

  const useBulkUpdateRole = () => {
    return useMutation({
      mutationFn: (data: { role: string; permission_ids: number[] }) =>
        permissionApi.bulkUpdateRolePermissions(data),
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
        queryClient.invalidateQueries({ queryKey: ['roles'] });
        toast.success(data.message);
      },
      onError: (error: any) => {
        toast.error(error.message || 'خطا در به‌روزرسانی مجوزها');
      },
    });
  };

  const useMatrix = () => {
    return useQuery({
      queryKey: ['role-permissions', 'matrix'],
      queryFn: () => permissionApi.getPermissionMatrix(),
    });
  };

  // ========== User Permissions ==========

  const useByUser = (userId: number) => {
    return useQuery({
      queryKey: ['user-permissions', userId],
      queryFn: () => permissionApi.getPermissionsByUser(userId),
      enabled: !!userId,
    });
  };

  const useBulkUpdateUser = () => {
    return useMutation({
      mutationFn: (data: { user_id: number; permission_ids: number[] }) =>
        permissionApi.bulkUpdateUserPermissions(data),
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ['user-permissions'] });
        queryClient.invalidateQueries({ queryKey: ['users'] });
        toast.success(data.message);
      },
      onError: (error: any) => {
        toast.error(error.message || 'خطا در به‌روزرسانی مجوزها');
      },
    });
  };

  return {
    useList,
    useGrouped,
    useInitialize,
    useByRole,
    useBulkUpdateRole,
    useMatrix,
    useByUser,
    useBulkUpdateUser,
  };
};