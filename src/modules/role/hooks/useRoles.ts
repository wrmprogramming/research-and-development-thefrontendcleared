// src/modules/role/hooks/useRoles.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roleApi } from '../../../api/role.api';
import type { RoleDescription } from '../types/role.types';
import { toast } from 'react-hot-toast';

export const useRoles = () => {
  const queryClient = useQueryClient();

  // ========== Roles ==========

  const useList = () => {
    return useQuery({
      queryKey: ['roles'],
      queryFn: () => roleApi.getRoles(),
    });
  };

  const useDetail = (roleCode: string) => {
    return useQuery({
      queryKey: ['role', roleCode],
      queryFn: () => roleApi.getRole(roleCode),
      enabled: !!roleCode,
    });
  };

  // ========== Role Descriptions ==========

  const useDescriptions = (params?: { is_active?: boolean; search?: string }) => {
    return useQuery({
      queryKey: ['role-descriptions', params],
      queryFn: () => roleApi.getRoleDescriptions(params),
    });
  };

  const useCreateDescription = () => {
    return useMutation({
      mutationFn: (data: Partial<RoleDescription>) =>
        roleApi.createRoleDescription(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['role-descriptions'] });
        toast.success('توضیحات نقش با موفقیت ایجاد شد');
      },
      onError: (error: any) => {
        toast.error(error.message || 'خطا در ایجاد توضیحات نقش');
      },
    });
  };

  const useUpdateDescription = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: number; data: Partial<RoleDescription> }) =>
        roleApi.updateRoleDescription(id, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['role-descriptions'] });
        toast.success('توضیحات نقش با موفقیت به‌روزرسانی شد');
      },
      onError: (error: any) => {
        toast.error(error.message || 'خطا در به‌روزرسانی توضیحات نقش');
      },
    });
  };

  const useDeleteDescription = () => {
    return useMutation({
      mutationFn: (id: number) => roleApi.deleteRoleDescription(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['role-descriptions'] });
        toast.success('توضیحات نقش با موفقیت حذف شد');
      },
      onError: (error: any) => {
        toast.error(error.message || 'خطا در حذف توضیحات نقش');
      },
    });
  };

  return {
    useList,
    useDetail,
    useDescriptions,
    useCreateDescription,
    useUpdateDescription,
    useDeleteDescription,
  };
};