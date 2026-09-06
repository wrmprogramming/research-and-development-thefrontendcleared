// src/modules/university-type/hooks/useUniversityType.ts
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { universityTypeApi } from '../api/university-type.api';
import type { UniversityType, UniversityTypeFormData, UniversityTypeFilters } from '../types/university-type.types';
import { toast } from 'react-hot-toast';

const UNIVERSITY_TYPE_KEYS = {
  all: ['university-types'] as const,
  lists: () => [...UNIVERSITY_TYPE_KEYS.all, 'list'] as const,
  list: (filters?: UniversityTypeFilters) => [...UNIVERSITY_TYPE_KEYS.lists(), filters] as const,
  details: () => [...UNIVERSITY_TYPE_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...UNIVERSITY_TYPE_KEYS.details(), id] as const,
  stats: () => [...UNIVERSITY_TYPE_KEYS.all, 'stats'] as const,
};

export const useUniversityType = () => {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ========== Queries ==========

  const useList = (filters?: UniversityTypeFilters) => {
    return useQuery({
      queryKey: UNIVERSITY_TYPE_KEYS.list(filters),
      queryFn: () => universityTypeApi.getAll(filters),
      staleTime: 5 * 60 * 1000,
    });
  };

  const useItem = (id: number) => {
    return useQuery({
      queryKey: UNIVERSITY_TYPE_KEYS.detail(id),
      queryFn: () => universityTypeApi.getById(id),
      enabled: !!id && id > 0,
      staleTime: 5 * 60 * 1000,
    });
  };

  // ✅ اضافه کردن useStats برای دریافت آمار
  const useStats = () => {
    return useQuery({
      queryKey: UNIVERSITY_TYPE_KEYS.stats(),
      queryFn: async () => {
        // دریافت همه انواع دانشگاه با count
        const types = await universityTypeApi.getAll({});
        return {
          total: types.length,
          by_type: types.map(t => ({
            id: t.id,
            name: t.name,
            universities_count: t.universities_count || 0,
          })),
        };
      },
      staleTime: 2 * 60 * 1000,
    });
  };

  // ========== Mutations با Optimistic Update ==========

  const createMutation = useMutation({
    mutationFn: (data: UniversityTypeFormData) => universityTypeApi.create(data),
    onMutate: () => setIsCreating(true),
    onSuccess: () => {
      setIsCreating(false);
      queryClient.invalidateQueries({ queryKey: UNIVERSITY_TYPE_KEYS.all });
      queryClient.invalidateQueries({ queryKey: UNIVERSITY_TYPE_KEYS.stats() });
      toast.success('نوع دانشگاه با موفقیت اضافه شد');
    },
    onError: (error: any) => {
      setIsCreating(false);
      toast.error(error.response?.data?.message || error.message || 'خطا در ایجاد نوع دانشگاه');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UniversityTypeFormData }) =>
      universityTypeApi.update(id, data),
    onMutate: () => setIsUpdating(true),
    onSuccess: () => {
      setIsUpdating(false);
      queryClient.invalidateQueries({ queryKey: UNIVERSITY_TYPE_KEYS.all });
      queryClient.invalidateQueries({ queryKey: UNIVERSITY_TYPE_KEYS.stats() });
      toast.success('نوع دانشگاه با موفقیت ویرایش شد');
    },
    onError: (error: any) => {
      setIsUpdating(false);
      toast.error(error.response?.data?.message || error.message || 'خطا در ویرایش نوع دانشگاه');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => universityTypeApi.delete(id),
    onMutate: () => setIsDeleting(true),
    onSuccess: () => {
      setIsDeleting(false);
      queryClient.invalidateQueries({ queryKey: UNIVERSITY_TYPE_KEYS.all });
      queryClient.invalidateQueries({ queryKey: UNIVERSITY_TYPE_KEYS.stats() });
      toast.success('نوع دانشگاه با موفقیت حذف شد');
    },
    onError: (error: any) => {
      setIsDeleting(false);
      toast.error(error.response?.data?.message || error.message || 'خطا در حذف نوع دانشگاه');
    },
  });

  // ========== Wrappers ==========

  const create = useCallback(
    (data: UniversityTypeFormData) => createMutation.mutateAsync(data),
    [createMutation]
  );

  const update = useCallback(
    (id: number, data: UniversityTypeFormData) => updateMutation.mutateAsync({ id, data }),
    [updateMutation]
  );

  const deleteItem = useCallback(
    (id: number) => deleteMutation.mutateAsync(id),
    [deleteMutation]
  );

  const refetch = useCallback(async () => {
    await Promise.all([
      queryClient.refetchQueries({ queryKey: UNIVERSITY_TYPE_KEYS.all }),
      queryClient.refetchQueries({ queryKey: UNIVERSITY_TYPE_KEYS.stats() }),
    ]);
  }, [queryClient]);

  // ========== Return ==========

  return {
    useList,
    useItem,
    useStats, // ✅ اضافه شد
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

