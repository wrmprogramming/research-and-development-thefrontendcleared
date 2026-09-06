// src/modules/person/hooks/usePerson.ts

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { personApi } from '../api/person.api';
import type { Person, PersonFormData, PersonFilters, PersonStats } from '../types/person.types';
import { toast } from 'react-hot-toast';

// ========== Keys ==========
const PERSON_KEYS = {
  all: ['persons'] as const,
  lists: () => [...PERSON_KEYS.all, 'list'] as const,
  list: (filters?: PersonFilters) => [...PERSON_KEYS.lists(), filters] as const,
  details: () => [...PERSON_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...PERSON_KEYS.details(), id] as const,
  stats: () => [...PERSON_KEYS.all, 'stats'] as const,
  search: (query: string) => [...PERSON_KEYS.all, 'search', query] as const,
};

// ========== Hook ==========
export const usePerson = () => {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ========== Queries ==========

//   const useList = (filters?: PersonFilters) => {
//     return useQuery({
//       queryKey: PERSON_KEYS.list(filters),
//       queryFn: () => personApi.getAll(filters),
//       staleTime: 5 * 60 * 1000,
//     });
//   };
// src/modules/person/hooks/usePerson.ts

const useList = (filters?: PersonFilters) => {
  return useQuery({
    queryKey: PERSON_KEYS.list(filters),
    queryFn: () => {
      console.log('🔍 Fetching persons with filters:', filters);
      return personApi.getAll(filters);
    },
    staleTime: 5 * 60 * 1000,
  });
};

  const useItem = (id: number) => {
    return useQuery({
      queryKey: PERSON_KEYS.detail(id),
      queryFn: () => personApi.getById(id),
      enabled: !!id && id > 0,
      staleTime: 5 * 60 * 1000,
    });
  };

  const useStats = () => {
    return useQuery({
      queryKey: PERSON_KEYS.stats(),
      queryFn: () => personApi.getStats(),
      staleTime: 2 * 60 * 1000,
    });
  };

  const useSearch = (query: string) => {
    return useQuery({
      queryKey: PERSON_KEYS.search(query),
      queryFn: () => personApi.search(query),
      enabled: query.length > 0,
      staleTime: 2 * 60 * 1000,
    });
  };

  // ========== Mutations ==========

  const createMutation = useMutation({
    mutationFn: ({ data, onProgress }: { data: PersonFormData; onProgress?: (p: number) => void }) =>
      personApi.create(data, onProgress),
    onMutate: () => setIsCreating(true),
    onSuccess: () => {
      setIsCreating(false);
      queryClient.invalidateQueries({ queryKey: PERSON_KEYS.all });
      toast.success('شخص با موفقیت اضافه شد');
    },
    onError: (error: any) => {
      setIsCreating(false);
      toast.error(error.message || 'خطا در ایجاد شخص');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data, onProgress }: { id: number; data: PersonFormData; onProgress?: (p: number) => void }) =>
      personApi.update(id, data, onProgress),
    onMutate: () => setIsUpdating(true),
    onSuccess: () => {
      setIsUpdating(false);
      queryClient.invalidateQueries({ queryKey: PERSON_KEYS.all });
      toast.success('شخص با موفقیت ویرایش شد');
    },
    onError: (error: any) => {
      setIsUpdating(false);
      toast.error(error.message || 'خطا در ویرایش شخص');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => personApi.delete(id),
    onMutate: () => setIsDeleting(true),
    onSuccess: () => {
      setIsDeleting(false);
      queryClient.invalidateQueries({ queryKey: PERSON_KEYS.all });
      toast.success('شخص با موفقیت حذف شد');
    },
    onError: (error: any) => {
      setIsDeleting(false);
      toast.error(error.message || 'خطا در حذف شخص');
    },
  });

  // ========== Wrappers ==========

  const create = useCallback(
    (data: PersonFormData, onProgress?: (p: number) => void) => {
      return createMutation.mutateAsync({ data, onProgress });
    },
    [createMutation]
  );

  const update = useCallback(
    (id: number, data: PersonFormData, onProgress?: (p: number) => void) => {
      return updateMutation.mutateAsync({ id, data, onProgress });
    },
    [updateMutation]
  );

  const deleteItem = useCallback(
    (id: number) => deleteMutation.mutateAsync(id),
    [deleteMutation]
  );

  const refetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: PERSON_KEYS.all });
  }, [queryClient]);

  // ========== Return ==========

  return {
    // Queries
    useList,
    useItem,
    useStats,
    useSearch,
    
    // Mutations
    create,
    update,
    delete: deleteItem,
    refetch,
    
    // Status
    isCreating,
    isUpdating,
    isDeleting,
    
    // Raw mutations
    createMutation,
    updateMutation,
    deleteMutation,
  };
};