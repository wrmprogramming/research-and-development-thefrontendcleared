// src/modules/progress/hooks/useProgress.ts

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { progressApi } from '../api/progress.api';
import type {
  Progress,
  ProgressFormData,
  ProgressFilters,
  ProgressStats,
} from '../types/progress.types';
import { toast } from 'react-hot-toast';

// ========== Keys ==========
const PROGRESS_KEYS = {
  all: ['progress'] as const,
  lists: () => [...PROGRESS_KEYS.all, 'list'] as const,
  list: (filters?: ProgressFilters) => [...PROGRESS_KEYS.lists(), filters] as const,
  details: () => [...PROGRESS_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...PROGRESS_KEYS.details(), id] as const,
  byContract: (contractId: number) => [...PROGRESS_KEYS.lists(), 'contract', contractId] as const,
  latest: (contractId: number) => [...PROGRESS_KEYS.lists(), 'contract', contractId, 'latest'] as const,
  stats: (params?: { contract?: number; year?: number }) => [...PROGRESS_KEYS.all, 'stats', params] as const,
};

// ========== Hook ==========
export const useProgress = () => {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ==================== Queries ====================

  const useList = (filters?: ProgressFilters) => {
  // ✅ اطمینان از ارسال صحیح فیلترها
  const queryKey = PROGRESS_KEYS.list(filters);
  
  return useQuery({
    queryKey: queryKey,
    queryFn: () => progressApi.getAll(filters),
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
};

 
  const useItem = (id: number) => {
    return useQuery({
      queryKey: PROGRESS_KEYS.detail(id),
      queryFn: () => progressApi.getById(id),
      enabled: !!id && id > 0,
      staleTime: 5 * 60 * 1000,
    });
  };

  const useByContract = (contractId: number, params?: { page?: number; pageSize?: number }) => {
    return useQuery({
      queryKey: [...PROGRESS_KEYS.byContract(contractId), params],
      queryFn: () => progressApi.getByContract(contractId, params),
      enabled: !!contractId && contractId > 0,
      staleTime: 5 * 60 * 1000,
      placeholderData: keepPreviousData,
    });
  };

  const useLatest = (contractId: number) => {
    return useQuery({
      queryKey: PROGRESS_KEYS.latest(contractId),
      queryFn: () => progressApi.getLatestByContract(contractId),
      enabled: !!contractId && contractId > 0,
      staleTime: 2 * 60 * 1000,
    });
  };


  const useStats = (params?: { contract?: number; year?: number }) => {
  // ✅ فقط اگر year وجود داشت و معتبر بود، به queryKey اضافه کن
  const queryKey = params?.year && !isNaN(params.year)
    ? [...PROGRESS_KEYS.stats(), params]
    : PROGRESS_KEYS.stats();
  
  return useQuery({
    queryKey: queryKey,
    queryFn: () => progressApi.getStats(params),
    staleTime: 2 * 60 * 1000,
  });
};

  // ==================== Mutations ====================

  const createMutation = useMutation({
    mutationFn: (data: ProgressFormData) => progressApi.create(data),
    onMutate: () => setIsCreating(true),
    onSuccess: (data) => {
      setIsCreating(false);
      queryClient.invalidateQueries({ queryKey: PROGRESS_KEYS.all });
      if (data.contract) {
        queryClient.invalidateQueries({ queryKey: PROGRESS_KEYS.byContract(data.contract) });
      }
      queryClient.invalidateQueries({ queryKey: PROGRESS_KEYS.stats() });
      toast.success('پیشرفت با موفقیت ثبت شد');
    },
    onError: (error: any) => {
      setIsCreating(false);
      toast.error(error.message || 'خطا در ثبت پیشرفت');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ProgressFormData> }) =>
      progressApi.update(id, data),
    onMutate: () => setIsUpdating(true),
    onSuccess: (data) => {
      setIsUpdating(false);
      queryClient.invalidateQueries({ queryKey: PROGRESS_KEYS.all });
      if (data.contract) {
        queryClient.invalidateQueries({ queryKey: PROGRESS_KEYS.byContract(data.contract) });
      }
      queryClient.invalidateQueries({ queryKey: PROGRESS_KEYS.stats() });
      toast.success('پیشرفت با موفقیت ویرایش شد');
    },
    onError: (error: any) => {
      setIsUpdating(false);
      toast.error(error.message || 'خطا در ویرایش پیشرفت');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => progressApi.delete(id),
    onMutate: () => setIsDeleting(true),
    onSuccess: () => {
      setIsDeleting(false);
      queryClient.invalidateQueries({ queryKey: PROGRESS_KEYS.all });
      queryClient.invalidateQueries({ queryKey: PROGRESS_KEYS.stats() });
      toast.success('پیشرفت با موفقیت حذف شد');
    },
    onError: (error: any) => {
      setIsDeleting(false);
      toast.error(error.message || 'خطا در حذف پیشرفت');
    },
  });

  // ==================== Wrappers ====================

  const create = useCallback(
    (data: ProgressFormData) => createMutation.mutateAsync(data),
    [createMutation]
  );

  const update = useCallback(
    (id: number, data: Partial<ProgressFormData>) => updateMutation.mutateAsync({ id, data }),
    [updateMutation]
  );

  const deleteItem = useCallback((id: number) => deleteMutation.mutateAsync(id), [deleteMutation]);

  const refetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: PROGRESS_KEYS.all });
    queryClient.invalidateQueries({ queryKey: PROGRESS_KEYS.stats() });
  }, [queryClient]);

  // ==================== Return ====================

  return {
    useList,
    useItem,
    useByContract,
    useLatest,
    useStats,
    create,
    update,
    delete: deleteItem,
    refetch,
    isCreating,
    isUpdating,
    isDeleting,
  };
};
