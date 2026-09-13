// src/modules/user/hooks/useUsers.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi, type UserFilters } from '../../../api/user.api';
import type { User } from '../../auth/types/auth.types';
import { toast } from 'react-hot-toast';

export const useUsers = () => {
  const queryClient = useQueryClient();

  // ========== Queries ==========

  const useList = (filters?: UserFilters) => {
  return useQuery({
    queryKey: ['users', filters],
    queryFn: async () => {
      const result = await userApi.getUsers(filters);
      console.log('📦 useUsers result:', result);
      console.log('📦 result type:', typeof result);
      console.log('📦 result keys:', result ? Object.keys(result) : 'null');
      console.log('📦 result.results:', result?.results);
      return result;
    },
    staleTime: 0,
  });
};

//   const useList = (filters?: UserFilters) => {
//     return useQuery({
//       queryKey: ['users', filters],
//       queryFn: () => userApi.getUsers(filters),
//       staleTime: 0,
//     });
//   };

  const useDetail = (id: number) => {
    return useQuery({
      queryKey: ['user', id],
      queryFn: () => userApi.getUser(id),
      enabled: !!id,
    });
  };

  const useStatistics = () => {
    return useQuery({
      queryKey: ['users', 'statistics'],
      queryFn: () => userApi.getStatistics(),
    });
  };

  const useUserLogs = (userId: number) => {
    return useQuery({
      queryKey: ['users', userId, 'logs'],
      queryFn: () => userApi.getUserLogs(userId),
      enabled: !!userId,
    });
  };

  const useUserPermissions = (userId: number) => {
    return useQuery({
      queryKey: ['users', userId, 'permissions'],
      queryFn: () => userApi.getUserPermissions(userId),
      enabled: !!userId,
    });
  };

  // ========== Mutations ==========

  const useCreate = () => {
    return useMutation({
      mutationFn: (data: any) => userApi.createUser(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['users'] });
        toast.success('کاربر با موفقیت ایجاد شد');
      },
      onError: (error: any) => {
        toast.error(error.message || 'خطا در ایجاد کاربر');
      },
    });
  };

  const useUpdate = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: number; data: Partial<User> }) =>
        userApi.updateUser(id, data),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['users'] });
        queryClient.invalidateQueries({ queryKey: ['user', variables.id] });
        toast.success('کاربر با موفقیت به‌روزرسانی شد');
      },
      onError: (error: any) => {
        toast.error(error.message || 'خطا در به‌روزرسانی کاربر');
      },
    });
  };

  const useDelete = () => {
    return useMutation({
      mutationFn: (id: number) => userApi.deleteUser(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['users'] });
        toast.success('کاربر با موفقیت حذف شد');
      },
      onError: (error: any) => {
        toast.error(error.message || 'خطا در حذف کاربر');
      },
    });
  };

  const useToggleActive = () => {
    return useMutation({
      mutationFn: (id: number) => userApi.toggleActive(id),
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ['users'] });
        toast.success(data.message);
      },
      onError: (error: any) => {
        toast.error(error.message || 'خطا در تغییر وضعیت کاربر');
      },
    });
  };

  const useChangeRole = () => {
    return useMutation({
      mutationFn: ({ id, role }: { id: number; role: string }) =>
        userApi.changeRole(id, role),
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ['users'] });
        toast.success(data.message);
      },
      onError: (error: any) => {
        toast.error(error.message || 'خطا در تغییر نقش کاربر');
      },
    });
  };

  return {
    useList,
    useDetail,
    useStatistics,
    useUserLogs,
    useUserPermissions,
    useCreate,
    useUpdate,
    useDelete,
    useToggleActive,
    useChangeRole,
  };
};