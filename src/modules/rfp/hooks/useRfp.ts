// src/modules/rfp/hooks/useRfp.ts

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { rfpApi } from '../api/rfp.api';
import type { Rfp, RfpFormData, RfpFilters } from '../types/rfp.types';
import { toast } from 'react-hot-toast';

const RFP_KEYS = {
  all: ['rfps'] as const,
  lists: () => [...RFP_KEYS.all, 'list'] as const,
  list: (filters?: RfpFilters) => [...RFP_KEYS.lists(), filters] as const,
  details: () => [...RFP_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...RFP_KEYS.details(), id] as const,
  stats: () => [...RFP_KEYS.all, 'stats'] as const,
  statsByYear: (year?: number) => [...RFP_KEYS.stats(), 'year', year] as const, // اضافه شد
  statsByDateRange: (start?: string, end?: string) => [...RFP_KEYS.stats(), 'range', start, end] as const, // اضافه شد
};

export const useRfp = () => {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const useList = (filters?: RfpFilters) => {
    return useQuery({
      queryKey: RFP_KEYS.list(filters),
      queryFn: () => rfpApi.getAll(filters),
      staleTime: 5 * 60 * 1000,
      placeholderData: keepPreviousData,
    });
  };

  const useItem = (id: number) => {
    return useQuery({
      queryKey: RFP_KEYS.detail(id),
      queryFn: () => rfpApi.getById(id),
      enabled: !!id && id > 0,
      staleTime: 5 * 60 * 1000,
    });
  };

  const useStats = () => {
    return useQuery({
      queryKey: RFP_KEYS.stats(),
      queryFn: () => rfpApi.getStats(),
      staleTime: 2 * 60 * 1000,
    });
  };

  // اضافه شده: دریافت آمار بر اساس سال
  const useStatsByYear = (year?: number) => {
    return useQuery({
      queryKey: RFP_KEYS.statsByYear(year),
      queryFn: () => rfpApi.getStatsByYear(year),
      enabled: year !== undefined,
      staleTime: 2 * 60 * 1000,
    });
  };

  // اضافه شده: دریافت آمار بر اساس بازه تاریخی
  const useStatsByDateRange = (startDate?: string, endDate?: string) => {
    return useQuery({
      queryKey: RFP_KEYS.statsByDateRange(startDate, endDate),
      queryFn: () => rfpApi.getStatsByDateRange(startDate, endDate),
      enabled: !!(startDate && endDate),
      staleTime: 2 * 60 * 1000,
    });
  };

  const createMutation = useMutation({
    mutationFn: ({ data, onProgress }: { data: RfpFormData; onProgress?: (p: number) => void }) =>
      rfpApi.create(data, onProgress),
    onMutate: () => setIsCreating(true),
    onSuccess: () => {
      setIsCreating(false);
      queryClient.invalidateQueries({ queryKey: RFP_KEYS.all });
      toast.success('RFP با موفقیت اضافه شد');
    },
    onError: (error: any) => {
      setIsCreating(false);
      toast.error(error.message || 'خطا در ایجاد RFP');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data, onProgress }: { id: number; data: RfpFormData; onProgress?: (p: number) => void }) =>
      rfpApi.update(id, data, onProgress),
    onMutate: () => setIsUpdating(true),
    onSuccess: () => {
      setIsUpdating(false);
      queryClient.invalidateQueries({ queryKey: RFP_KEYS.all });
      toast.success('RFP با موفقیت ویرایش شد');
    },
    onError: (error: any) => {
      setIsUpdating(false);
      toast.error(error.message || 'خطا در ویرایش RFP');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => rfpApi.delete(id),
    onMutate: () => setIsDeleting(true),
    onSuccess: () => {
      setIsDeleting(false);
      queryClient.invalidateQueries({ queryKey: RFP_KEYS.all });
      toast.success('RFP با موفقیت حذف شد');
    },
    onError: (error: any) => {
      setIsDeleting(false);
      toast.error(error.message || 'خطا در حذف RFP');
    },
  });

  const create = useCallback(
    (data: RfpFormData, onProgress?: (p: number) => void) => {
      return createMutation.mutateAsync({ data, onProgress });
    },
    [createMutation]
  );

  const update = useCallback(
    (id: number, data: RfpFormData, onProgress?: (p: number) => void) => {
      return updateMutation.mutateAsync({ id, data, onProgress });
    },
    [updateMutation]
  );

  const deleteItem = useCallback(
    (id: number) => deleteMutation.mutateAsync(id),
    [deleteMutation]
  );

  const refetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: RFP_KEYS.all });
  }, [queryClient]);

  return {
    useList,
    useItem,
    useStats,
    useStatsByYear, // اضافه شد
    useStatsByDateRange, // اضافه شد
    create,
    update,
    delete: deleteItem,
    refetch,
    isCreating,
    isUpdating,
    isDeleting,
    createMutation,
    updateMutation,
    deleteMutation,
  };
};
