// src/hooks/useGenericCrud.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BaseApiService } from '../api/baseApi';
import type { IBaseModel } from '../../../types/common.types';
import { toast } from 'react-hot-toast';

interface CrudOptions {
  successMessages?: {
    create?: string;
    update?: string;
    delete?: string;
  };
  staleTime?: number;
  retry?: number;
  refetchOnWindowFocus?: boolean;
}

export function useGenericCrud<T extends IBaseModel, TCreate, TUpdate>(
  apiService: any, //  از any استفاده کن
  queryKey: string,
  options: CrudOptions = {}
) {
  const queryClient = useQueryClient();
  
  const {
    successMessages = {
      create: 'با موفقیت اضافه شد',
      update: 'با موفقیت ویرایش شد',
      delete: 'با موفقیت حذف شد',
    },
    staleTime = 5 * 60 * 1000,
    retry = 1,
    refetchOnWindowFocus = false,
  } = options;

  // Query for getting all items
  const useItems = (params?: Record<string, any>) => {
    return useQuery({
      queryKey: [queryKey, params],
      queryFn: () => apiService.getAll(params),
      staleTime,
      retry,
      refetchOnWindowFocus,
    });
  };

  // Query for getting a single item
  const useItem = (id: number) => {
    return useQuery({
      queryKey: [queryKey, id],
      queryFn: () => apiService.getById(id),
      enabled: !!id && id > 0,
      staleTime,
      retry,
    });
  };

  // Mutation for creating
  const createMutation = useMutation({
    mutationFn: ({ data, onProgress }: { data: TCreate; onProgress?: (p: number) => void }) => {
      console.log('useGenericCrud.createMutation:', data);
      return apiService.create(data, onProgress);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      toast.success(successMessages.create);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'خطا در ایجاد';
      toast.error(message);
    },
  });

  // Mutation for updating - اینجا رو کامل اصلاح کن
  const updateMutation = useMutation({
    mutationFn: ({ id, data, onProgress }: { id: number; data: TUpdate; onProgress?: (p: number) => void }) => {
      console.log('useGenericCrud.updateMutation CALLED');
      console.log('📤 id:', id);
      console.log('📤 data:', data);
      console.log('📤 data.attachment:', (data as any).attachment);
      console.log('📤 data.attachment === null:', (data as any).attachment === null);
      console.log('📤 data.letter_file:', (data as any).letter_file);
      console.log('📤 data.letter_file === null:', (data as any).letter_file === null);
      console.log('📤 apiService.update exists?', typeof apiService.update);
      
      return apiService.update(id, data, onProgress);
    },
    onSuccess: (data) => {
      console.log('updateMutation.onSuccess:', data);
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      toast.success(successMessages.update);
    },
    onError: (error: any) => {
      console.error('updateMutation.onError:', error);
      console.error('error.response:', error.response?.data);
      const message = error.response?.data?.message || error.message || 'خطا در ویرایش';
      toast.error(message);
    },
  });

  // Mutation for deleting
  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      console.log('useGenericCrud.deleteMutation:', id);
      return apiService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      toast.success(successMessages.delete);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'خطا در حذف';
      toast.error(message);
    },
  });

  const create = (data: TCreate, onProgress?: (p: number) => void) => 
    createMutation.mutateAsync({ data, onProgress });
  
  const update = (id: number, data: TUpdate, onProgress?: (p: number) => void) => {
    console.log(' useGenericCrud.update CALLED');
    console.log('📤 id:', id);
    console.log('📤 data:', data);
    console.log('📤 data.attachment:', (data as any).attachment);
    console.log('📤 data.attachment === null:', (data as any).attachment === null);
    return updateMutation.mutateAsync({ id, data, onProgress });
  };
  
  const deleteItem = (id: number) => deleteMutation.mutateAsync(id);
  
  const refetch = () => queryClient.invalidateQueries({ queryKey: [queryKey] });

  return {
    useItems,
    useItem,
    create,
    update,
    delete: deleteItem,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    refetch,
    queryClient,
  };
}
