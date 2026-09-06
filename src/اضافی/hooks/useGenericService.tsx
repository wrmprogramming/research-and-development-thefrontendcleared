// src/core/hooks/useGenericService.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { IGenericService } from '../core/interfaces/IGenericService';
import type { IBaseModel } from '../types';
import { toast } from 'react-hot-toast';

export function useGenericService<T extends IBaseModel = any>(
  service: IGenericService<T>,
  queryKey: string,
  options?: {
    successMessages?: {
      create?: string;
      update?: string;
      delete?: string;
    };
    staleTime?: number;
    retry?: number;
  }
) {
  const queryClient = useQueryClient();
  
  const {
    successMessages = {
      create: 'با موفقیت اضافه شد',
      update: 'با موفقیت ویرایش شد',
      delete: 'با موفقیت حذف شد',
    },
    staleTime = 5 * 60 * 1000,
    retry = 2,
  } = options || {};

  // ========== Query: دریافت لیست ==========
  const useItems = (params?: Record<string, any>) => {
    return useQuery({
      queryKey: [queryKey, params],
      queryFn: () => service.getAll(params),
      staleTime,
      retry,
    });
  };

  // ========== Query: دریافت یک آیتم ==========
  const useItem = (id: number) => {
    return useQuery({
      queryKey: [queryKey, id],
      queryFn: () => service.getById(id),
      enabled: !!id && id > 0,
      staleTime,
      retry,
    });
  };

  // ========== Mutation: ایجاد ==========
  const createMutation = useMutation({
    mutationFn: ({ data, onProgress }: { data: any; onProgress?: (p: number) => void }) =>
      service.create(data, onProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      toast.success(successMessages.create);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'خطا در ایجاد';
      toast.error(message);
    },
  });

  // ========== Mutation: ویرایش ==========
  const updateMutation = useMutation({
    mutationFn: ({ id, data, onProgress }: { id: number; data: any; onProgress?: (p: number) => void }) =>
      service.update(id, data, onProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      toast.success(successMessages.update);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'خطا در ویرایش';
      toast.error(message);
    },
  });

  // ========== Mutation: حذف ==========
  const deleteMutation = useMutation({
    mutationFn: (id: number) => service.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      toast.success(successMessages.delete);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'خطا در حذف';
      toast.error(message);
    },
  });

  const create = (data: any, onProgress?: (p: number) => void) =>
    createMutation.mutateAsync({ data, onProgress });

  const update = (id: number, data: any, onProgress?: (p: number) => void) =>
     {
console.log('🔥🔥🔥 ===== useGenericService.update =====');
  console.log('📤 id:', id);
  console.log('📤 data:', data);
  console.log('📤 data.attachment:', data.attachment);
  console.log('📤 data.attachment === null:', data.attachment === null);
  console.log('📤 data.attachment type:', typeof data.attachment);
  return updateMutation.mutateAsync({ id, data, onProgress });
};
// updateMutation.mutateAsync({ id, data, onProgress });

  const deleteItem = (id: number) => deleteMutation.mutateAsync(id);

  const refetch = () => queryClient.invalidateQueries({ queryKey: [queryKey] });

  return {
    useItems,
    useItem,
    create,
    update,
    delete: deleteItem,
    refetch,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
//