import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settlementApi } from '../api/settlement.api';
import type {
  Settlement,
  SettlementFormData,
  SettlementFilters,
} from '../types/settlement.types';
import { toast } from 'react-hot-toast';

// ========== Keys ==========
const SETTLEMENT_KEYS = {
  all: ['settlements'] as const,
  lists: () => [...SETTLEMENT_KEYS.all, 'list'] as const,
  list: (filters?: SettlementFilters) => [...SETTLEMENT_KEYS.lists(), filters] as const,
  byContract: (contractId: number) => [...SETTLEMENT_KEYS.lists(), 'contract', contractId] as const,
  details: () => [...SETTLEMENT_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...SETTLEMENT_KEYS.details(), id] as const,
};

// ========== Hook ==========
export const useSettlement = () => {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ========== Queries ==========

  const useList = (filters?: SettlementFilters) => {
    return useQuery({
      queryKey: SETTLEMENT_KEYS.list(filters),
      queryFn: () => settlementApi.getAll(filters),
      staleTime: 5 * 60 * 1000,
    });
  };

  const useByContract = (contractId: number) => {
    return useQuery({
      queryKey: SETTLEMENT_KEYS.byContract(contractId),
      queryFn: () => settlementApi.getByContract(contractId),
      enabled: !!contractId && contractId > 0,
      staleTime: 5 * 60 * 1000,
    });
  };

  const useItem = (id: number) => {
    return useQuery({
      queryKey: SETTLEMENT_KEYS.detail(id),
      queryFn: () => settlementApi.getById(id),
      enabled: !!id && id > 0,
      staleTime: 5 * 60 * 1000,
    });
  };

  // ========== Mutations ==========

  const createMutation = useMutation({
    mutationFn: ({ data, onProgress }: { data: SettlementFormData; onProgress?: (p: number) => void }) =>
      settlementApi.create(data, onProgress),
    onMutate: () => setIsCreating(true),
    onSuccess: (_, variables) => {
      setIsCreating(false);
      queryClient.invalidateQueries({ queryKey: SETTLEMENT_KEYS.all });
      queryClient.invalidateQueries({
        queryKey: SETTLEMENT_KEYS.byContract(variables.data.contract_id),
      });
      toast.success('تسویه حساب با موفقیت ثبت شد');
    },
    onError: (error: any) => {
      setIsCreating(false);
      toast.error(error.message || 'خطا در ثبت تسویه حساب');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data, onProgress }: { id: number; data: Partial<SettlementFormData>; onProgress?: (p: number) => void }) =>
      settlementApi.update(id, data, onProgress),
    onMutate: () => setIsUpdating(true),
    onSuccess: () => {
      setIsUpdating(false);
      queryClient.invalidateQueries({ queryKey: SETTLEMENT_KEYS.all });
      toast.success('تسویه حساب با موفقیت ویرایش شد');
    },
    onError: (error: any) => {
      setIsUpdating(false);
      toast.error(error.message || 'خطا در ویرایش تسویه حساب');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => settlementApi.delete(id),
    onMutate: () => setIsDeleting(true),
    onSuccess: () => {
      setIsDeleting(false);
      queryClient.invalidateQueries({ queryKey: SETTLEMENT_KEYS.all });
      toast.success('تسویه حساب با موفقیت حذف شد');
    },
    onError: (error: any) => {
      setIsDeleting(false);
      toast.error(error.message || 'خطا در حذف تسویه حساب');
    },
  });

  // ========== Wrappers ==========

  const create = useCallback(
    (data: SettlementFormData, onProgress?: (p: number) => void) => {
      return createMutation.mutateAsync({ data, onProgress });
    },
    [createMutation]
  );

  const update = useCallback(
    (id: number, data: Partial<SettlementFormData>, onProgress?: (p: number) => void) => {
      return updateMutation.mutateAsync({ id, data, onProgress });
    },
    [updateMutation]
  );

  const deleteItem = useCallback(
    (id: number) => deleteMutation.mutateAsync(id),
    [deleteMutation]
  );

  const refetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: SETTLEMENT_KEYS.all });
  }, [queryClient]);

  // ========== Return ==========

  return {
    // Queries
    useList,
    useByContract,
    useItem,

    // Mutations
    create,
    update,
    delete: deleteItem,
    refetch,

    // Status
    isCreating,
    isUpdating,
    isDeleting,
  };
};