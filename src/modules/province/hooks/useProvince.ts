// src/modules/province/hooks/useProvince.ts

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { provinceApi } from '../api/province.api';
import type { Province, ProvinceFormData, ProvinceFilters } from '../types/province.types';
import { toast } from 'react-hot-toast';

const PROVINCE_KEYS = {
  all: ['provinces'] as const,
  lists: () => [...PROVINCE_KEYS.all, 'list'] as const,
  list: (filters?: ProvinceFilters) => [...PROVINCE_KEYS.lists(), filters] as const,
  details: () => [...PROVINCE_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...PROVINCE_KEYS.details(), id] as const,
};

export const useProvince = () => {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const useList = (filters?: ProvinceFilters) => {
    return useQuery({
      queryKey: PROVINCE_KEYS.list(filters),
      queryFn: () => provinceApi.getAll(filters),
      staleTime: 5 * 60 * 1000,
    });
  };

  const useItem = (id: number) => {
    return useQuery({
      queryKey: PROVINCE_KEYS.detail(id),
      queryFn: () => provinceApi.getById(id),
      enabled: !!id && id > 0,
      staleTime: 5 * 60 * 1000,
    });
  };

  const createMutation = useMutation({
    mutationFn: (data: ProvinceFormData) => provinceApi.create(data),
    onMutate: () => setIsCreating(true),
    onSuccess: () => {
      setIsCreating(false);
      queryClient.invalidateQueries({ queryKey: PROVINCE_KEYS.all });
      toast.success('استان با موفقیت اضافه شد');
    },
    onError: (error: any) => {
      setIsCreating(false);
      toast.error(error.message || 'خطا در ایجاد استان');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProvinceFormData }) =>
      provinceApi.update(id, data),
    onMutate: () => setIsUpdating(true),
    onSuccess: () => {
      setIsUpdating(false);
      queryClient.invalidateQueries({ queryKey: PROVINCE_KEYS.all });
      toast.success('استان با موفقیت ویرایش شد');
    },
    onError: (error: any) => {
      setIsUpdating(false);
      toast.error(error.message || 'خطا در ویرایش استان');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => provinceApi.delete(id),
    onMutate: () => setIsDeleting(true),
    onSuccess: () => {
      setIsDeleting(false);
      queryClient.invalidateQueries({ queryKey: PROVINCE_KEYS.all });
      toast.success('استان با موفقیت حذف شد');
    },
    onError: (error: any) => {
      setIsDeleting(false);
      toast.error(error.message || 'خطا در حذف استان');
    },
  });

  const create = useCallback(
    (data: ProvinceFormData) => createMutation.mutateAsync(data),
    [createMutation]
  );

  const update = useCallback(
    (id: number, data: ProvinceFormData) => updateMutation.mutateAsync({ id, data }),
    [updateMutation]
  );

  const deleteItem = useCallback(
    (id: number) => deleteMutation.mutateAsync(id),
    [deleteMutation]
  );

  const refetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: PROVINCE_KEYS.all });
  }, [queryClient]);

  return {
    useList,
    useItem,
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

