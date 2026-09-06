// src/modules/steering-committee/hooks/useSteeringCommittee.ts

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { steeringCommitteeApi } from '../api/steeringCommittee.api';
import type {
  SteeringCommittee,
  SteeringCommitteeFormData,
  SteeringCommitteeFilters,
  SteeringCommitteeStats,
} from '../types/steeringCommittee.types';
import { toast } from 'react-hot-toast';

const STEERING_COMMITTEE_KEYS = {
  all: ['steering-committees'] as const,
  lists: () => [...STEERING_COMMITTEE_KEYS.all, 'list'] as const,
  list: (filters?: SteeringCommitteeFilters) => [...STEERING_COMMITTEE_KEYS.lists(), filters] as const,
  details: () => [...STEERING_COMMITTEE_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...STEERING_COMMITTEE_KEYS.details(), id] as const,
  stats: () => [...STEERING_COMMITTEE_KEYS.all, 'stats'] as const,
  statsWithYear: (year?: number) => {
    if (year === undefined) {
      return STEERING_COMMITTEE_KEYS.stats();
    }
    return [...STEERING_COMMITTEE_KEYS.stats(), year] as const;
  },
};

export const useSteeringCommittee = () => {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ==================== Queries ====================
  const useList = (filters?: SteeringCommitteeFilters) => {
    return useQuery({
      queryKey: STEERING_COMMITTEE_KEYS.list(filters),
      queryFn: () => steeringCommitteeApi.getAll(filters),
      staleTime: 5 * 60 * 1000,
      placeholderData: keepPreviousData,
    });
  };

  const useItem = (id: number) => {
    return useQuery({
      queryKey: STEERING_COMMITTEE_KEYS.detail(id),
      queryFn: () => steeringCommitteeApi.getById(id),
      enabled: !!id && id > 0,
      staleTime: 5 * 60 * 1000,
    });
  };

  const useStats = (year?: number) => {
    return useQuery<SteeringCommitteeStats>({
      queryKey: STEERING_COMMITTEE_KEYS.statsWithYear(year),
      queryFn: () => steeringCommitteeApi.getStats(year),
      staleTime: 2 * 60 * 1000,
    });
  };

  // ==================== Mutations ====================
  const createMutation = useMutation({
    mutationFn: ({ data, onProgress }: { data: SteeringCommitteeFormData; onProgress?: (p: number) => void }) =>
      steeringCommitteeApi.create(data, onProgress),
    onMutate: () => setIsCreating(true),
    onSuccess: () => {
      setIsCreating(false);
      queryClient.invalidateQueries({ queryKey: STEERING_COMMITTEE_KEYS.all });
      queryClient.invalidateQueries({ queryKey: STEERING_COMMITTEE_KEYS.stats() });
      toast.success('کمیته راهبری با موفقیت اضافه شد');
    },
    onError: (error: any) => {
      setIsCreating(false);
      toast.error(error.message || 'خطا در ایجاد کمیته راهبری');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data, onProgress }: { id: number; data: Partial<SteeringCommitteeFormData>; onProgress?: (p: number) => void }) =>
      steeringCommitteeApi.update(id, data, onProgress),
    onMutate: () => setIsUpdating(true),
    onSuccess: () => {
      setIsUpdating(false);
      queryClient.invalidateQueries({ queryKey: STEERING_COMMITTEE_KEYS.all });
      queryClient.invalidateQueries({ queryKey: STEERING_COMMITTEE_KEYS.stats() });
      toast.success('کمیته راهبری با موفقیت ویرایش شد');
    },
    onError: (error: any) => {
      setIsUpdating(false);
      toast.error(error.message || 'خطا در ویرایش کمیته راهبری');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => steeringCommitteeApi.delete(id),
    onMutate: () => setIsDeleting(true),
    onSuccess: () => {
      setIsDeleting(false);
      queryClient.invalidateQueries({ queryKey: STEERING_COMMITTEE_KEYS.all });
      queryClient.invalidateQueries({ queryKey: STEERING_COMMITTEE_KEYS.stats() });
      toast.success('کمیته راهبری با موفقیت حذف شد');
    },
    onError: (error: any) => {
      setIsDeleting(false);
      toast.error(error.message || 'خطا در حذف کمیته راهبری');
    },
  });

  // ==================== Wrappers ====================
  const create = useCallback(
    (data: SteeringCommitteeFormData, onProgress?: (p: number) => void) => {
      return createMutation.mutateAsync({ data, onProgress });
    },
    [createMutation]
  );

  const update = useCallback(
    (id: number, data: Partial<SteeringCommitteeFormData>, onProgress?: (p: number) => void) => {
      return updateMutation.mutateAsync({ id, data, onProgress });
    },
    [updateMutation]
  );

  const deleteItem = useCallback((id: number) => deleteMutation.mutateAsync(id), [deleteMutation]);

  const refetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: STEERING_COMMITTEE_KEYS.all });
    queryClient.invalidateQueries({ queryKey: STEERING_COMMITTEE_KEYS.stats() });
  }, [queryClient]);

  // ==================== Return ====================
  return {
    useList,
    useItem,
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

