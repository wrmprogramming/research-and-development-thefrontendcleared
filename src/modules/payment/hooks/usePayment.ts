// src/modules/payment/hooks/usePayment.ts

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { paymentApi } from '../api/payment.api';
import { paymentTypeApi } from '../api/paymentType.api';
import type {
  Payment,
  PaymentFormData,
  PaymentFilters,
  PaymentStats,
  PaymentType,
} from '../types/payment.types';
import { toast } from 'react-hot-toast';

// ========== Keys ==========
const PAYMENT_KEYS = {
  all: ['payments'] as const,
  lists: () => [...PAYMENT_KEYS.all, 'list'] as const,
  list: (filters?: PaymentFilters) => [...PAYMENT_KEYS.lists(), filters] as const,
  details: () => [...PAYMENT_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...PAYMENT_KEYS.details(), id] as const,
  stats: () => [...PAYMENT_KEYS.all, 'stats'] as const,
  types: ['payment-types'] as const,
};

// ========== Hook ==========
export const usePayment = () => {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // ==================== Queries ====================

  const useList = (filters?: PaymentFilters) => {
    return useQuery({
      queryKey: PAYMENT_KEYS.list(filters),
      queryFn: () => paymentApi.getAll(filters),
      staleTime: 5 * 60 * 1000,
      placeholderData: keepPreviousData,
    });
  };

  const useItem = (id: number) => {
    return useQuery({
      queryKey: PAYMENT_KEYS.detail(id),
      queryFn: () => paymentApi.getById(id),
      enabled: !!id && id > 0,
      staleTime: 5 * 60 * 1000,
    });
  };

  const useStats = (year?: number) => {
  return useQuery({
    queryKey: [...PAYMENT_KEYS.stats(), year], //  این خط مهمه
    queryFn: () => paymentApi.getStats(year),
    staleTime: 2 * 60 * 1000,
  });
};

  //  اصلاح: استفاده از paymentTypeApi برای دریافت انواع پرداخت
  const usePaymentTypes = () => {
    return useQuery({
      queryKey: PAYMENT_KEYS.types,
      queryFn: () => paymentTypeApi.getAll(),
      staleTime: 10 * 60 * 1000,
    });
  };

  const useByContract = (contractId: number) => {
    return useQuery({
      queryKey: [...PAYMENT_KEYS.lists(), 'contract', contractId],
      queryFn: () => paymentApi.getByContract(contractId),
      enabled: !!contractId && contractId > 0,
      staleTime: 5 * 60 * 1000,
    });
  };

  // ==================== Mutations ====================

  const createMutation = useMutation({
    mutationFn: ({ data, onProgress }: { data: PaymentFormData; onProgress?: (p: number) => void }) =>
      paymentApi.create(data, onProgress),
    onMutate: () => setIsCreating(true),
    onSuccess: () => {
      setIsCreating(false);
      queryClient.invalidateQueries({ queryKey: PAYMENT_KEYS.all });
      queryClient.invalidateQueries({ queryKey: PAYMENT_KEYS.stats() });
      toast.success('پرداخت با موفقیت ثبت شد');
    },
    onError: (error: any) => {
      setIsCreating(false);
      toast.error(error.message || 'خطا در ثبت پرداخت');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data, onProgress }: { id: number; data: Partial<PaymentFormData>; onProgress?: (p: number) => void }) =>
      paymentApi.update(id, data, onProgress),
    onMutate: () => setIsUpdating(true),
    onSuccess: () => {
      setIsUpdating(false);
      queryClient.invalidateQueries({ queryKey: PAYMENT_KEYS.all });
      queryClient.invalidateQueries({ queryKey: PAYMENT_KEYS.stats() });
      toast.success('پرداخت با موفقیت ویرایش شد');
    },
    onError: (error: any) => {
      setIsUpdating(false);
      toast.error(error.message || 'خطا در ویرایش پرداخت');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => paymentApi.delete(id),
    onMutate: () => setIsDeleting(true),
    onSuccess: () => {
      setIsDeleting(false);
      queryClient.invalidateQueries({ queryKey: PAYMENT_KEYS.all });
      queryClient.invalidateQueries({ queryKey: PAYMENT_KEYS.stats() });
      toast.success('پرداخت با موفقیت حذف شد');
    },
    onError: (error: any) => {
      setIsDeleting(false);
      toast.error(error.message || 'خطا در حذف پرداخت');
    },
  });

  const verifyMutation = useMutation({
    mutationFn: (id: number) => paymentApi.verify(id),
    onMutate: () => setIsVerifying(true),
    onSuccess: () => {
      setIsVerifying(false);
      queryClient.invalidateQueries({ queryKey: PAYMENT_KEYS.all });
      queryClient.invalidateQueries({ queryKey: PAYMENT_KEYS.stats() });
      toast.success('پرداخت با موفقیت تایید شد');
    },
    onError: (error: any) => {
      setIsVerifying(false);
      toast.error(error.message || 'خطا در تایید پرداخت');
    },
  });

  const unverifyMutation = useMutation({
    mutationFn: (id: number) => paymentApi.unverify(id),
    onMutate: () => setIsVerifying(true),
    onSuccess: () => {
      setIsVerifying(false);
      queryClient.invalidateQueries({ queryKey: PAYMENT_KEYS.all });
      queryClient.invalidateQueries({ queryKey: PAYMENT_KEYS.stats() });
      toast.success('تایید پرداخت لغو شد');
    },
    onError: (error: any) => {
      setIsVerifying(false);
      toast.error(error.message || 'خطا در لغو تایید پرداخت');
    },
  });

  // ==================== Wrappers ====================

  const create = useCallback(
    (data: PaymentFormData, onProgress?: (p: number) => void) => {
      return createMutation.mutateAsync({ data, onProgress });
    },
    [createMutation]
  );

  const update = useCallback(
    (id: number, data: Partial<PaymentFormData>, onProgress?: (p: number) => void) => {
      return updateMutation.mutateAsync({ id, data, onProgress });
    },
    [updateMutation]
  );

  const deleteItem = useCallback((id: number) => deleteMutation.mutateAsync(id), [deleteMutation]);

  const verify = useCallback((id: number) => verifyMutation.mutateAsync(id), [verifyMutation]);

  const unverify = useCallback((id: number) => unverifyMutation.mutateAsync(id), [unverifyMutation]);

  const refetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: PAYMENT_KEYS.all });
    queryClient.invalidateQueries({ queryKey: PAYMENT_KEYS.stats() });
  }, [queryClient]);

  // ==================== Return ====================

  return {
    // Queries
    useList,
    useItem,
    useStats,
    usePaymentTypes,  // ✅ این باید موجود باشد
    useByContract,

    // Mutations
    create,
    update,
    delete: deleteItem,
    verify,
    unverify,
    refetch,

    // Status
    isCreating,
    isUpdating,
    isDeleting,
    isVerifying,
  };
};

