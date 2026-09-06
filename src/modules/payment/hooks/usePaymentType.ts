// src/modules/payment/hooks/usePaymentType.ts
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentTypeApi } from '../api/paymentType.api';
import type {
  PaymentType,
  PaymentTypeFormData,
  PaymentTypeFilters,
} from '../types/paymentType.types';
import { toast } from 'react-hot-toast';

// ========== Keys ==========
const PAYMENT_TYPE_KEYS = {
  all: ['payment-types'] as const,
  lists: () => [...PAYMENT_TYPE_KEYS.all, 'list'] as const,
  list: (filters?: PaymentTypeFilters) => [...PAYMENT_TYPE_KEYS.lists(), filters] as const,
  details: () => [...PAYMENT_TYPE_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...PAYMENT_TYPE_KEYS.details(), id] as const,
};

// ========== Hook ==========
export const usePaymentType = () => {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ==================== Queries ====================

  const useList = (filters?: PaymentTypeFilters) => {
    return useQuery({
      queryKey: PAYMENT_TYPE_KEYS.list(filters),
      queryFn: () => paymentTypeApi.getAll(filters),
      staleTime: 10 * 60 * 1000,
    });
  };

  const useItem = (id: number) => {
    return useQuery({
      queryKey: PAYMENT_TYPE_KEYS.detail(id),
      queryFn: () => paymentTypeApi.getById(id),
      enabled: !!id && id > 0,
      staleTime: 10 * 60 * 1000,
    });
  };

  // ==================== Mutations ====================

  const createMutation = useMutation({
    mutationFn: (data: PaymentTypeFormData) => paymentTypeApi.create(data),
    onMutate: () => setIsCreating(true),
    onSuccess: () => {
      setIsCreating(false);
      queryClient.invalidateQueries({ queryKey: PAYMENT_TYPE_KEYS.all });
      toast.success('نوع پرداخت با موفقیت اضافه شد');
    },
    onError: (error: any) => {
      setIsCreating(false);
      toast.error(error.message || 'خطا در ایجاد نوع پرداخت');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<PaymentTypeFormData> }) =>
      paymentTypeApi.update(id, data),
    onMutate: () => setIsUpdating(true),
    onSuccess: () => {
      setIsUpdating(false);
      queryClient.invalidateQueries({ queryKey: PAYMENT_TYPE_KEYS.all });
      toast.success('نوع پرداخت با موفقیت ویرایش شد');
    },
    onError: (error: any) => {
      setIsUpdating(false);
      toast.error(error.message || 'خطا در ویرایش نوع پرداخت');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => paymentTypeApi.delete(id),
    onMutate: () => setIsDeleting(true),
    onSuccess: () => {
      setIsDeleting(false);
      queryClient.invalidateQueries({ queryKey: PAYMENT_TYPE_KEYS.all });
      toast.success('نوع پرداخت با موفقیت حذف شد');
    },
    onError: (error: any) => {
      setIsDeleting(false);
      toast.error(error.message || 'خطا در حذف نوع پرداخت');
    },
  });

  // ==================== Wrappers ====================

  const create = useCallback(
    (data: PaymentTypeFormData) => createMutation.mutateAsync(data),
    [createMutation]
  );

  const update = useCallback(
    (id: number, data: Partial<PaymentTypeFormData>) => updateMutation.mutateAsync({ id, data }),
    [updateMutation]
  );

  const deleteItem = useCallback((id: number) => deleteMutation.mutateAsync(id), [deleteMutation]);

  const refetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: PAYMENT_TYPE_KEYS.all });
  }, [queryClient]);

  // ==================== Return ====================

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
  };
};