// src/modules/research-committee/hooks/useResearchCommittee.ts

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { researchCommitteeApi } from '../api/researchCommittee.api';
import type {
  ResearchCommittee,
  ResearchCommitteeFormData,
  ResearchCommitteeFilters,
  ResearchCommitteeStats,
} from '../types/researchCommittee.types';
import { toast } from 'react-hot-toast';

const RESEARCH_COMMITTEE_KEYS = {
  all: ['research-committees'] as const,
  lists: () => [...RESEARCH_COMMITTEE_KEYS.all, 'list'] as const,
  list: (filters?: ResearchCommitteeFilters) => [...RESEARCH_COMMITTEE_KEYS.lists(), filters] as const,
  details: () => [...RESEARCH_COMMITTEE_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...RESEARCH_COMMITTEE_KEYS.details(), id] as const,
  stats: () => [...RESEARCH_COMMITTEE_KEYS.all, 'stats'] as const,
  // ✅ اصلاح: وقتی year undefined باشه، فقط 'stats' برگردون
  statsWithYear: (year?: number) => {
    if (year === undefined) {
      return RESEARCH_COMMITTEE_KEYS.stats();
    }
    return [...RESEARCH_COMMITTEE_KEYS.stats(), year] as const;
  },
};

export const useResearchCommittee = () => {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ==================== Queries ====================
  const useList = (filters?: ResearchCommitteeFilters) => {
    return useQuery({
      queryKey: RESEARCH_COMMITTEE_KEYS.list(filters),
      queryFn: () => researchCommitteeApi.getAll(filters),
      staleTime: 5 * 60 * 1000,
      placeholderData: keepPreviousData,
    });
  };

  const useItem = (id: number) => {
    return useQuery({
      queryKey: RESEARCH_COMMITTEE_KEYS.detail(id),
      queryFn: () => researchCommitteeApi.getById(id),
      enabled: !!id && id > 0,
      staleTime: 5 * 60 * 1000,
    });
  };

  const useStats = (year?: number) => {
    return useQuery<ResearchCommitteeStats>({
      queryKey: RESEARCH_COMMITTEE_KEYS.statsWithYear(year),
      queryFn: () => researchCommitteeApi.getStats(year),
      staleTime: 2 * 60 * 1000,
    });
  };

  // ==================== Mutations ====================
  const createMutation = useMutation({
    mutationFn: ({ data, onProgress }: { data: ResearchCommitteeFormData; onProgress?: (p: number) => void }) =>
      researchCommitteeApi.create(data, onProgress),
    onMutate: () => setIsCreating(true),
    onSuccess: () => {
      setIsCreating(false);
      queryClient.invalidateQueries({ queryKey: RESEARCH_COMMITTEE_KEYS.all });
      queryClient.invalidateQueries({ queryKey: RESEARCH_COMMITTEE_KEYS.stats() });
      toast.success('کمیته تحقیقات با موفقیت اضافه شد');
    },
    onError: (error: any) => {
      setIsCreating(false);
      toast.error(error.message || 'خطا در ایجاد کمیته تحقیقات');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data, onProgress }: { id: number; data: Partial<ResearchCommitteeFormData>; onProgress?: (p: number) => void }) =>
      researchCommitteeApi.update(id, data, onProgress),
    onMutate: () => setIsUpdating(true),
    onSuccess: () => {
      setIsUpdating(false);
      queryClient.invalidateQueries({ queryKey: RESEARCH_COMMITTEE_KEYS.all });
      queryClient.invalidateQueries({ queryKey: RESEARCH_COMMITTEE_KEYS.stats() });
      toast.success('کمیته تحقیقات با موفقیت ویرایش شد');
    },
    onError: (error: any) => {
      setIsUpdating(false);
      toast.error(error.message || 'خطا در ویرایش کمیته تحقیقات');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => researchCommitteeApi.delete(id),
    onMutate: () => setIsDeleting(true),
    onSuccess: () => {
      setIsDeleting(false);
      queryClient.invalidateQueries({ queryKey: RESEARCH_COMMITTEE_KEYS.all });
      queryClient.invalidateQueries({ queryKey: RESEARCH_COMMITTEE_KEYS.stats() });
      toast.success('کمیته تحقیقات با موفقیت حذف شد');
    },
    onError: (error: any) => {
      setIsDeleting(false);
      toast.error(error.message || 'خطا در حذف کمیته تحقیقات');
    },
  });

  // ==================== Wrappers ====================
  const create = useCallback(
    (data: ResearchCommitteeFormData, onProgress?: (p: number) => void) => {
      return createMutation.mutateAsync({ data, onProgress });
    },
    [createMutation]
  );

  const update = useCallback(
    (id: number, data: Partial<ResearchCommitteeFormData>, onProgress?: (p: number) => void) => {
      return updateMutation.mutateAsync({ id, data, onProgress });
    },
    [updateMutation]
  );

  const deleteItem = useCallback((id: number) => deleteMutation.mutateAsync(id), [deleteMutation]);

  const refetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: RESEARCH_COMMITTEE_KEYS.all });
    queryClient.invalidateQueries({ queryKey: RESEARCH_COMMITTEE_KEYS.stats() });
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
