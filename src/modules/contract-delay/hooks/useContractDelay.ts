import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contractDelayApi } from '../api/contractDelay.api';
import type {
  ContractDelay,
  ContractDelayFormData,
  ContractDelayFilters,
} from '../types/contractDelay.types';
import { toast } from 'react-hot-toast';

// ========== Keys ==========
const CONTRACT_DELAY_KEYS = {
  all: ['contract-delays'] as const,
  lists: () => [...CONTRACT_DELAY_KEYS.all, 'list'] as const,
  list: (filters?: ContractDelayFilters) => [...CONTRACT_DELAY_KEYS.lists(), filters] as const,
  byContract: (contractId: number) => [...CONTRACT_DELAY_KEYS.lists(), 'contract', contractId] as const,
  details: () => [...CONTRACT_DELAY_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...CONTRACT_DELAY_KEYS.details(), id] as const,
};

// ========== Hook ==========
export const useContractDelay = () => {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ========== Queries ==========

  const useList = (filters?: ContractDelayFilters) => {
    return useQuery({
      queryKey: CONTRACT_DELAY_KEYS.list(filters),
      queryFn: () => contractDelayApi.getAll(filters),
      staleTime: 5 * 60 * 1000,
    });
  };

  const useByContract = (contractId: number) => {
    return useQuery({
      queryKey: CONTRACT_DELAY_KEYS.byContract(contractId),
      queryFn: () => contractDelayApi.getByContract(contractId),
      enabled: !!contractId && contractId > 0,
      staleTime: 5 * 60 * 1000,
    });
  };

  const useItem = (id: number) => {
    return useQuery({
      queryKey: CONTRACT_DELAY_KEYS.detail(id),
      queryFn: () => contractDelayApi.getById(id),
      enabled: !!id && id > 0,
      staleTime: 5 * 60 * 1000,
    });
  };

  // ========== Mutations ==========

  const createMutation = useMutation({
    mutationFn: (data: ContractDelayFormData) => contractDelayApi.create(data),
    onMutate: () => setIsCreating(true),
    onSuccess: (_, variables) => {
      setIsCreating(false);
      queryClient.invalidateQueries({ queryKey: CONTRACT_DELAY_KEYS.all });
      queryClient.invalidateQueries({
        queryKey: CONTRACT_DELAY_KEYS.byContract(variables.contract_id),
      });
      toast.success('تاخیر با موفقیت ثبت شد');
    },
    onError: (error: any) => {
      setIsCreating(false);
      toast.error(error.message || 'خطا در ثبت تاخیر');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ContractDelayFormData> }) =>
      contractDelayApi.update(id, data),
    onMutate: () => setIsUpdating(true),
    onSuccess: () => {
      setIsUpdating(false);
      queryClient.invalidateQueries({ queryKey: CONTRACT_DELAY_KEYS.all });
      toast.success('تاخیر با موفقیت ویرایش شد');
    },
    onError: (error: any) => {
      setIsUpdating(false);
      toast.error(error.message || 'خطا در ویرایش تاخیر');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => contractDelayApi.delete(id),
    onMutate: () => setIsDeleting(true),
    onSuccess: () => {
      setIsDeleting(false);
      queryClient.invalidateQueries({ queryKey: CONTRACT_DELAY_KEYS.all });
      toast.success('تاخیر با موفقیت حذف شد');
    },
    onError: (error: any) => {
      setIsDeleting(false);
      toast.error(error.message || 'خطا در حذف تاخیر');
    },
  });

  // ========== Wrappers ==========

  const create = useCallback(
    (data: ContractDelayFormData) => createMutation.mutateAsync(data),
    [createMutation]
  );

  const update = useCallback(
    (id: number, data: Partial<ContractDelayFormData>) =>
      updateMutation.mutateAsync({ id, data }),
    [updateMutation]
  );

  const deleteItem = useCallback(
    (id: number) => deleteMutation.mutateAsync(id),
    [deleteMutation]
  );

  const refetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: CONTRACT_DELAY_KEYS.all });
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