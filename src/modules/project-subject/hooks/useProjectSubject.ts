// src/modules/project-subject/hooks/useProjectSubject.ts

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectSubjectApi } from '../api/project-subject.api';
import type { ProjectSubject, ProjectSubjectFormData, ProjectSubjectFilters } from '../types/project-subject.types';
import { toast } from 'react-hot-toast';

const PROJECT_SUBJECT_KEYS = {
  all: ['project-subjects'] as const,
  lists: () => [...PROJECT_SUBJECT_KEYS.all, 'list'] as const,
  list: (filters?: ProjectSubjectFilters) => [...PROJECT_SUBJECT_KEYS.lists(), filters] as const,
  details: () => [...PROJECT_SUBJECT_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...PROJECT_SUBJECT_KEYS.details(), id] as const,
};

export const useProjectSubject = () => {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const useList = (filters?: ProjectSubjectFilters) => {
    return useQuery({
      queryKey: PROJECT_SUBJECT_KEYS.list(filters),
      queryFn: () => projectSubjectApi.getAll(filters),
      staleTime: 5 * 60 * 1000,
    });
  };

  const useItem = (id: number) => {
    return useQuery({
      queryKey: PROJECT_SUBJECT_KEYS.detail(id),
      queryFn: () => projectSubjectApi.getById(id),
      enabled: !!id && id > 0,
      staleTime: 5 * 60 * 1000,
    });
  };

  const createMutation = useMutation({
    mutationFn: (data: ProjectSubjectFormData) => projectSubjectApi.create(data),
    onMutate: () => setIsCreating(true),
    onSuccess: () => {
      setIsCreating(false);
      queryClient.invalidateQueries({ queryKey: PROJECT_SUBJECT_KEYS.all });
      toast.success('موضوع پروژه با موفقیت اضافه شد');
    },
    onError: (error: any) => {
      setIsCreating(false);
      toast.error(error.message || 'خطا در ایجاد موضوع پروژه');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProjectSubjectFormData }) =>
      projectSubjectApi.update(id, data),
    onMutate: () => setIsUpdating(true),
    onSuccess: () => {
      setIsUpdating(false);
      queryClient.invalidateQueries({ queryKey: PROJECT_SUBJECT_KEYS.all });
      toast.success('موضوع پروژه با موفقیت ویرایش شد');
    },
    onError: (error: any) => {
      setIsUpdating(false);
      toast.error(error.message || 'خطا در ویرایش موضوع پروژه');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => projectSubjectApi.delete(id),
    onMutate: () => setIsDeleting(true),
    onSuccess: () => {
      setIsDeleting(false);
      queryClient.invalidateQueries({ queryKey: PROJECT_SUBJECT_KEYS.all });
      toast.success('موضوع پروژه با موفقیت حذف شد');
    },
    onError: (error: any) => {
      setIsDeleting(false);
      toast.error(error.message || 'خطا در حذف موضوع پروژه');
    },
  });

  const create = useCallback(
    (data: ProjectSubjectFormData) => createMutation.mutateAsync(data),
    [createMutation]
  );

  const update = useCallback(
    (id: number, data: ProjectSubjectFormData) => updateMutation.mutateAsync({ id, data }),
    [updateMutation]
  );

  const deleteItem = useCallback(
    (id: number) => deleteMutation.mutateAsync(id),
    [deleteMutation]
  );

  const refetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: PROJECT_SUBJECT_KEYS.all });
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