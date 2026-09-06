// src/modules/communication/hooks/useCommunication.ts

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { communicationApi } from '../api/communication.api';
import type {
  Communication,
  CommunicationFormData,
  CommunicationFilters,
  CommunicationStats,
} from '../types/communication.types';
import { toast } from 'react-hot-toast';

// ========== Keys ==========
const COMMUNICATION_KEYS = {
  all: ['communications'] as const,
  lists: () => [...COMMUNICATION_KEYS.all, 'list'] as const,
  list: (filters?: CommunicationFilters) => [...COMMUNICATION_KEYS.lists(), filters] as const,
  details: () => [...COMMUNICATION_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...COMMUNICATION_KEYS.details(), id] as const,
  stats: (year?: number) => [...COMMUNICATION_KEYS.all, 'stats', year] as const,
};

// ========== Hook ==========
export const useCommunication = () => {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ============================================================
  // Queries
  // ============================================================

  const useList = (filters?: CommunicationFilters) => {
    return useQuery({
      queryKey: COMMUNICATION_KEYS.list(filters),
      queryFn: () => communicationApi.getAll(filters),
      staleTime: 5 * 60 * 1000,
      placeholderData: keepPreviousData,
    });
  };

  const useItem = (id: number) => {
    return useQuery({
      queryKey: COMMUNICATION_KEYS.detail(id),
      queryFn: () => communicationApi.getById(id),
      enabled: !!id && id > 0,
      staleTime: 5 * 60 * 1000,
    });
  };

  const useStats = (year?: number) => {
    return useQuery({
      queryKey: COMMUNICATION_KEYS.stats(year),
      queryFn: () => communicationApi.getStats(year),
      staleTime: 2 * 60 * 1000,
    });
  };

  // ============================================================
  // Mutations
  // ============================================================

  const createMutation = useMutation({
    mutationFn: ({ data, onProgress }: { data: CommunicationFormData; onProgress?: (p: number) => void }) =>
      communicationApi.create(data, onProgress),
    onMutate: () => setIsCreating(true),
    onSuccess: () => {
      setIsCreating(false);
      queryClient.invalidateQueries({ queryKey: COMMUNICATION_KEYS.all });
      queryClient.invalidateQueries({ queryKey: COMMUNICATION_KEYS.stats() });
      toast.success('مکاتبه با موفقیت ثبت شد');
    },
    onError: (error: any) => {
      setIsCreating(false);
      toast.error(error.message || 'خطا در ثبت مکاتبه');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data, onProgress }: { id: number; data: Partial<CommunicationFormData>; onProgress?: (p: number) => void }) =>
      communicationApi.update(id, data, onProgress),
    onMutate: () => setIsUpdating(true),
    onSuccess: () => {
      setIsUpdating(false);
      queryClient.invalidateQueries({ queryKey: COMMUNICATION_KEYS.all });
      queryClient.invalidateQueries({ queryKey: COMMUNICATION_KEYS.stats() });
      toast.success('مکاتبه با موفقیت ویرایش شد');
    },
    onError: (error: any) => {
      setIsUpdating(false);
      toast.error(error.message || 'خطا در ویرایش مکاتبه');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => communicationApi.delete(id),
    onMutate: () => setIsDeleting(true),
    onSuccess: () => {
      setIsDeleting(false);
      queryClient.invalidateQueries({ queryKey: COMMUNICATION_KEYS.all });
      queryClient.invalidateQueries({ queryKey: COMMUNICATION_KEYS.stats() });
      toast.success('مکاتبه با موفقیت حذف شد');
    },
    onError: (error: any) => {
      setIsDeleting(false);
      toast.error(error.message || 'خطا در حذف مکاتبه');
    },
  });

  // ============================================================
  // Wrappers
  // ============================================================

  const create = useCallback(
    (data: CommunicationFormData, onProgress?: (p: number) => void) => {
      return createMutation.mutateAsync({ data, onProgress });
    },
    [createMutation]
  );

  const update = useCallback(
    (id: number, data: Partial<CommunicationFormData>, onProgress?: (p: number) => void) => {
      return updateMutation.mutateAsync({ id, data, onProgress });
    },
    [updateMutation]
  );

  const deleteItem = useCallback((id: number) => deleteMutation.mutateAsync(id), [deleteMutation]);

  const refetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: COMMUNICATION_KEYS.all });
    queryClient.invalidateQueries({ queryKey: COMMUNICATION_KEYS.stats() });
  }, [queryClient]);

  // ============================================================
  // Return
  // ============================================================

  return {
    // Queries
    useList,
    useItem,
    useStats,
    
    // Mutations
    create,
    update,
    delete: deleteItem,
    
    // Utilities
    refetch,
    
    // Status
    isCreating,
    isUpdating,
    isDeleting,
  };
};

