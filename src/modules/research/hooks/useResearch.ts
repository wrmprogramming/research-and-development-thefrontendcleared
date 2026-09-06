// src/modules/research/hooks/useResearch.ts

// ============================================================
// 1. ایمپورت‌ها
// ============================================================
import { useState, useCallback } from 'react';
// هوک‌های TanStack Query برای مدیریت داده و کش
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
// نمونه کلاس API
import { researchApi } from '../api/research.api';
// انواع داده‌ای
import type { Research, ResearchFormData, ResearchFilters, ResearchStats } from '../types/research.types';
// کتابخانه برای نمایش پیام‌های اعلان
import { toast } from 'react-hot-toast';

// ============================================================
// 2. کلیدهای کش (Cache Keys)
// ============================================================
// این کلیدها برای مدیریت کش Query استفاده می‌شوند
// با استفاده از آرایه‌های تو در تو، ساختار سلسله‌مراتبی برای کش ایجاد می‌کنیم
const RESEARCH_KEYS = {
  all: ['researches'] as const,              // کلید اصلی همه پژوهش‌ها
  lists: () => [...RESEARCH_KEYS.all, 'list'] as const, // کلید لیست‌ها
  list: (filters?: ResearchFilters) => [...RESEARCH_KEYS.lists(), filters] as const, // کلید لیست با فیلتر
  details: () => [...RESEARCH_KEYS.all, 'detail'] as const, // کلید جزییات
  detail: (id: number) => [...RESEARCH_KEYS.details(), id] as const, // کلید جزییات با شناسه
  stats: () => [...RESEARCH_KEYS.all, 'stats'] as const, // کلید آمار
};

// ============================================================
// 3. هوک اصلی
// ============================================================
export const useResearch = () => {
  // --- 3.1. متغیرهای state برای وضعیت عملیات‌ها ---
  // از این stateها برای نمایش بارگذاری در UI استفاده می‌شود
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // --- 3.2. کلاینت Query برای invalidate کردن کش ---
  const queryClient = useQueryClient();

  // ==========================================================
  // 3.3. کوئری‌ها (برای خواندن داده)
  // ==========================================================

  /**
   * هوک دریافت لیست پژوهش‌ها با فیلتر
   * @param filters - فیلترهای جستجو
   * @returns آبجکت شامل data, isLoading, error و ...
   */
  const useList = (filters?: ResearchFilters) => {
    return useQuery({
      queryKey: RESEARCH_KEYS.list(filters),    // کلید یکتا برای کش
      queryFn: () => researchApi.getAll(filters), // تابع دریافت داده
      staleTime: 5 * 60 * 1000,                 // داده به مدت 5 دقیقه تازه می‌ماند
      placeholderData: keepPreviousData,        // هنگام تغییر صفحه، داده قبلی را نگه دار
    });
  };

  /**
   * هوک دریافت یک پژوهش با شناسه
   * @param id - شناسه پژوهش
   * @returns آبجکت شامل data, isLoading, error و ...
   */
  const useItem = (id: number) => {
    return useQuery({
      queryKey: RESEARCH_KEYS.detail(id),
      queryFn: () => researchApi.getById(id),
      enabled: !!id && id > 0,                  // فقط در صورتی اجرا شود که id معتبر باشد
      staleTime: 5 * 60 * 1000,
    });
  };

  /**
   * هوک دریافت آمار پژوهش‌ها
   * @returns آبجکت شامل data, isLoading, error و ...
   */
  const useStats = () => {
    return useQuery({
      queryKey: RESEARCH_KEYS.stats(),
      queryFn: () => researchApi.getStats(),
      staleTime: 2 * 60 * 1000,                 // آمار زودتر کهنه می‌شود (2 دقیقه)
    });
  };

  // ==========================================================
  // 3.4. میوتیشن‌ها (برای تغییر داده)
  // ==========================================================

  /**
   * میوتیشن ایجاد پژوهش جدید
   */
  const createMutation = useMutation({
    // تابع انجام عملیات
    mutationFn: ({ data, onProgress }: { data: ResearchFormData; onProgress?: (p: number) => void }) =>
      researchApi.create(data, onProgress),
    onMutate: () => setIsCreating(true),        // قبل از شروع، state بارگذاری را true کن
    onSuccess: () => {
      setIsCreating(false);                      // پس از موفقیت، false کن
      // کش‌های مرتبط را بی‌اعتبار کن تا داده‌ها به‌روز شوند
      queryClient.invalidateQueries({ queryKey: RESEARCH_KEYS.all });
      queryClient.invalidateQueries({ queryKey: RESEARCH_KEYS.stats() });
      toast.success('پژوهش با موفقیت اضافه شد'); // پیام موفقیت
    },
    onError: (error: any) => {
      setIsCreating(false);
      toast.error(error.message || 'خطا در ایجاد پژوهش');
    },
  });

  /**
   * میوتیشن ویرایش پژوهش
   */
  const updateMutation = useMutation({
    mutationFn: ({ id, data, onProgress }: { id: number; data: ResearchFormData; onProgress?: (p: number) => void }) =>
      researchApi.update(id, data, onProgress),
    onMutate: () => setIsUpdating(true),
    onSuccess: () => {
      setIsUpdating(false);
      queryClient.invalidateQueries({ queryKey: RESEARCH_KEYS.all });
      queryClient.invalidateQueries({ queryKey: RESEARCH_KEYS.stats() });
      toast.success('پژوهش با موفقیت ویرایش شد');
    },
    onError: (error: any) => {
      setIsUpdating(false);
      toast.error(error.message || 'خطا در ویرایش پژوهش');
    },
  });

  /**
   * میوتیشن حذف پژوهش
   */
  const deleteMutation = useMutation({
    mutationFn: (id: number) => researchApi.delete(id),
    onMutate: () => setIsDeleting(true),
    onSuccess: () => {
      setIsDeleting(false);
      queryClient.invalidateQueries({ queryKey: RESEARCH_KEYS.all });
      queryClient.invalidateQueries({ queryKey: RESEARCH_KEYS.stats() });
      toast.success('پژوهش با موفقیت حذف شد');
    },
    onError: (error: any) => {
      setIsDeleting(false);
      toast.error(error.message || 'خطا در حذف پژوهش');
    },
  });

  // ==========================================================
  // 3.5. توابع wrapper برای استفاده در کامپوننت‌ها
  // ==========================================================

  const create = useCallback(
  (data: ResearchFormData, onProgress?: (p: number) => void) => {
    //  اعتبارسنجی قبل از ارسال
    if (!data.primary_researcher_id) {
      toast.error('پژوهشگر اصلی الزامی است');
      return Promise.reject(new Error('پژوهشگر اصلی الزامی است'));
    }
    return createMutation.mutateAsync({ data, onProgress });
  },
  [createMutation]
);

const update = useCallback(
  (id: number, data: ResearchFormData, onProgress?: (p: number) => void) => {
    //  اعتبارسنجی قبل از ارسال
    if (!data.primary_researcher_id) {
      toast.error('پژوهشگر اصلی الزامی است');
      return Promise.reject(new Error('پژوهشگر اصلی الزامی است'));
    }
    return updateMutation.mutateAsync({ id, data, onProgress });
  },
  [updateMutation]
);

  const deleteItem = useCallback(
    (id: number) => deleteMutation.mutateAsync(id),
    [deleteMutation]
  );

  // تابع برای به‌روزرسانی دستی داده‌ها
  const refetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: RESEARCH_KEYS.all });
    queryClient.invalidateQueries({ queryKey: RESEARCH_KEYS.stats() });
  }, [queryClient]);

  // ==========================================================
  // 3.6. خروجی هوک
  // ==========================================================
  return {
    // هوک‌های کوئری
    useList,
    useItem,
    useStats,
    // توابع عملیات
    create,
    update,
    delete: deleteItem,
    refetch,
    // وضعیت‌ها
    isCreating,
    isUpdating,
    isDeleting,
    // خود میوتیشن‌ها (در صورت نیاز)
    createMutation,
    updateMutation,
    deleteMutation,
  };
};
