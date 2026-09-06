// src/modules/company/hooks/useCompany.ts

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { companyApi } from '../api/company.api';
import type { Company, CompanyFormData, CompanyFilters, CompanyStats } from '../types/company.types';
import { toast } from 'react-hot-toast';

const COMPANY_KEYS = {
  all: ['companies'] as const,
  lists: () => [...COMPANY_KEYS.all, 'list'] as const,
  list: (filters?: CompanyFilters) => [...COMPANY_KEYS.lists(), filters] as const,
  details: () => [...COMPANY_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...COMPANY_KEYS.details(), id] as const,
  stats: () => [...COMPANY_KEYS.all, 'stats'] as const,
};

export const useCompany = () => {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const useList = (filters?: CompanyFilters) => {
    return useQuery({
      queryKey: COMPANY_KEYS.list(filters),
      queryFn: () => companyApi.getAll(filters),
      staleTime: 5 * 60 * 1000,
    });
  };

  const useItem = (id: number) => {
    return useQuery({
      queryKey: COMPANY_KEYS.detail(id),
      queryFn: () => companyApi.getById(id),
      enabled: !!id && id > 0,
      staleTime: 5 * 60 * 1000,
    });
  };

  const useStats = () => {
    return useQuery({
      queryKey: COMPANY_KEYS.stats(),
      queryFn: () => companyApi.getStats(),
      staleTime: 2 * 60 * 1000,
    });
  };

  const createMutation = useMutation({
    mutationFn: (data: CompanyFormData) => companyApi.create(data),
    onMutate: () => setIsCreating(true),
    onSuccess: () => {
      setIsCreating(false);
      queryClient.invalidateQueries({ queryKey: COMPANY_KEYS.all });
      toast.success('شرکت با موفقیت اضافه شد');
    },
    onError: (error: any) => {
      setIsCreating(false);
      toast.error(error.message || 'خطا در ایجاد شرکت');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CompanyFormData }) =>
      companyApi.update(id, data),
    onMutate: () => setIsUpdating(true),
    onSuccess: () => {
      setIsUpdating(false);
      queryClient.invalidateQueries({ queryKey: COMPANY_KEYS.all });
      toast.success('شرکت با موفقیت ویرایش شد');
    },
    onError: (error: any) => {
      setIsUpdating(false);
      toast.error(error.message || 'خطا در ویرایش شرکت');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => companyApi.delete(id),
    onMutate: () => setIsDeleting(true),
    onSuccess: () => {
      setIsDeleting(false);
      queryClient.invalidateQueries({ queryKey: COMPANY_KEYS.all });
      toast.success('شرکت با موفقیت حذف شد');
    },
    onError: (error: any) => {
      setIsDeleting(false);
      toast.error(error.message || 'خطا در حذف شرکت');
    },
  });

  const create = useCallback(
    (data: CompanyFormData) => createMutation.mutateAsync(data),
    [createMutation]
  );

  const update = useCallback(
    (id: number, data: CompanyFormData) => updateMutation.mutateAsync({ id, data }),
    [updateMutation]
  );

  const deleteItem = useCallback(
    (id: number) => deleteMutation.mutateAsync(id),
    [deleteMutation]
  );

  const refetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: COMPANY_KEYS.all });
  }, [queryClient]);

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
    createMutation,
    updateMutation,
    deleteMutation,
  };
};
