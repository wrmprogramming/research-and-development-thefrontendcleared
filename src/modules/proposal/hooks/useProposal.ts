// src/modules/proposal/hooks/useProposal.ts

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { proposalApi } from '../api/proposal.api';
import type { Proposal, ProposalFormData, ProposalFilters, ProposalStats } from '../types/proposal.types';
import type { PaginatedResponse } from '../../../types/common.types';
import { toast } from 'react-hot-toast';

const PROPOSAL_KEYS = {
  all: ['proposals'] as const,
  lists: () => [...PROPOSAL_KEYS.all, 'list'] as const,
  list: (filters?: ProposalFilters) => [...PROPOSAL_KEYS.lists(), filters] as const,
  details: () => [...PROPOSAL_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...PROPOSAL_KEYS.details(), id] as const,
  stats: () => [...PROPOSAL_KEYS.all, 'stats'] as const,
};

export const useProposal = () => {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ============================================================
  // 🔥 اصلاح useList با تایپ صحیح
  // ============================================================
  const useList = (filters?: ProposalFilters) => {
    return useQuery<PaginatedResponse<Proposal>>({  // 🔥 اضافه کردن تایپ
      queryKey: PROPOSAL_KEYS.list(filters),
      queryFn: () => proposalApi.getAll(filters),
      staleTime: 5 * 60 * 1000,
      placeholderData: keepPreviousData,
    });
  };

  const useItem = (id: number) => {
    return useQuery<Proposal>({  // 🔥 اضافه کردن تایپ
      queryKey: PROPOSAL_KEYS.detail(id),
      queryFn: () => proposalApi.getById(id),
      enabled: !!id && id > 0,
      staleTime: 5 * 60 * 1000,
    });
  };

  const useStats = () => {
    return useQuery<ProposalStats>({  // 🔥 اضافه کردن تایپ
      queryKey: PROPOSAL_KEYS.stats(),
      queryFn: () => proposalApi.getStats(),
      staleTime: 2 * 60 * 1000,
    });
  };

  const createMutation = useMutation({
    mutationFn: ({ data, onProgress }: { data: ProposalFormData; onProgress?: (p: number) => void }) =>
      proposalApi.create(data, onProgress),
    onMutate: () => setIsCreating(true),
    onSuccess: () => {
      setIsCreating(false);
      queryClient.invalidateQueries({ queryKey: PROPOSAL_KEYS.all });
      queryClient.invalidateQueries({ queryKey: PROPOSAL_KEYS.stats() });
      toast.success('پروپوزال با موفقیت اضافه شد');
    },
    onError: (error: any) => {
      setIsCreating(false);
      toast.error(error.message || 'خطا در ایجاد پروپوزال');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data, onProgress }: { id: number; data: ProposalFormData; onProgress?: (p: number) => void }) =>
      proposalApi.update(id, data, onProgress),
    onMutate: () => setIsUpdating(true),
    onSuccess: () => {
      setIsUpdating(false);
      queryClient.invalidateQueries({ queryKey: PROPOSAL_KEYS.all });
      queryClient.invalidateQueries({ queryKey: PROPOSAL_KEYS.stats() });
      toast.success('پروپوزال با موفقیت ویرایش شد');
    },
    onError: (error: any) => {
      setIsUpdating(false);
      toast.error(error.message || 'خطا در ویرایش پروپوزال');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => proposalApi.delete(id),
    onMutate: () => setIsDeleting(true),
    onSuccess: () => {
      setIsDeleting(false);
      queryClient.invalidateQueries({ queryKey: PROPOSAL_KEYS.all });
      queryClient.invalidateQueries({ queryKey: PROPOSAL_KEYS.stats() });
      toast.success('پروپوزال با موفقیت حذف شد');
    },
    onError: (error: any) => {
      setIsDeleting(false);
      toast.error(error.message || 'خطا در حذف پروپوزال');
    },
  });

  const create = useCallback(
    (data: ProposalFormData, onProgress?: (p: number) => void) => {
      return createMutation.mutateAsync({ data, onProgress });
    },
    [createMutation]
  );

  const update = useCallback(
    (id: number, data: ProposalFormData, onProgress?: (p: number) => void) => {
      return updateMutation.mutateAsync({ id, data, onProgress });
    },
    [updateMutation]
  );

  const deleteItem = useCallback(
    (id: number) => deleteMutation.mutateAsync(id),
    [deleteMutation]
  );

  const refetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: PROPOSAL_KEYS.all });
    queryClient.invalidateQueries({ queryKey: PROPOSAL_KEYS.stats() });
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
