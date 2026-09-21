// src/modules/research/hooks/useResearch.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useResearch } from './useResearch';
import { researchApi } from '../api/research.api';

// ============================================================
// Mock: react-hot-toast
// ============================================================
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import { toast } from 'react-hot-toast';

// ============================================================
// Wrapper
// ============================================================
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

// ============================================================
// داده نمونه
// ============================================================
const mockResearch = {
  id: 1,
  code: 'R-001',
  title: 'پژوهش تست',
  description: 'توضیحات',
  year: 1402,
  status: 'DRAFT',
  primary_researcher: 1,
  primary_researcher_name: 'علی احمدی',
  affiliation_type: 'UNIVERSITY',
  university: 1,
  university_name: 'دانشگاه تهران',
  company: null,
  company_name: null,
  researchers: 'سارا رضایی',
  budget: 1000000,
  approve_date: '1402/01/15',
  start_date: '1402/02/01',
  end_date: '1402/12/29',
  created_at: '1402/01/01',
  updated_at: '1402/01/01',
  attachments: [],
  is_active: true,
};

const mockResearchesList = {
  count: 2,
  next: null,
  previous: null,
  total_pages: 1,
  current_page: 1,
  page_size: 10,
  results: [mockResearch],
};

const mockStats = {
  total: 2,
  draft: 1,
  active: 1,
  completed: 0,
  by_status: { DRAFT: 1, IN_PROGRESS: 1, COMPLETED: 0 },
  by_year: { 1402: 2 },
  by_affiliation: [],
};

// ============================================================
// Tests
// ============================================================
describe('useResearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================================
  // useList
  // ============================================================
  describe('useList', () => {
    it('لیست پژوهش‌ها رو برمی‌گردونه', async () => {
      const getAllSpy = vi
        .spyOn(researchApi, 'getAll')
        .mockResolvedValueOnce(mockResearchesList);

      const { result } = renderHook(
        () => {
          const { useList } = useResearch();
          return useList();
        },
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.count).toBe(2);
      getAllSpy.mockRestore();
    });

    it('با فیلتر صدا زده می‌شه', async () => {
      const getAllSpy = vi
        .spyOn(researchApi, 'getAll')
        .mockResolvedValueOnce(mockResearchesList);

      const { result } = renderHook(
        () => {
          const { useList } = useResearch();
          return useList({ search: 'test', year: 1402 });
        },
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(getAllSpy).toHaveBeenCalledWith({ search: 'test', year: 1402 });
      getAllSpy.mockRestore();
    });
  });

  // ============================================================
  // useItem
  // ============================================================
  describe('useItem', () => {
    it('یه پژوهش رو با id برمی‌گردونه', async () => {
      const getByIdSpy = vi
        .spyOn(researchApi, 'getById')
        .mockResolvedValueOnce(mockResearch);

      const { result } = renderHook(
        () => {
          const { useItem } = useResearch();
          return useItem(1);
        },
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.id).toBe(1);
      getByIdSpy.mockRestore();
    });

    it('اگه id صفر باشه، query اجرا نمی‌شه', () => {
      const { result } = renderHook(
        () => {
          const { useItem } = useResearch();
          return useItem(0);
        },
        { wrapper: createWrapper() }
      );

      expect(result.current.fetchStatus).toBe('idle');
      expect(result.current.data).toBeUndefined();
    });
  });

  // ============================================================
  // useStats
  // ============================================================
  describe('useStats', () => {
    it('آمار رو برمی‌گردونه', async () => {
      const getStatsSpy = vi
        .spyOn(researchApi, 'getStats')
        .mockResolvedValueOnce(mockStats);

      const { result } = renderHook(
        () => {
          const { useStats } = useResearch();
          return useStats();
        },
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.total).toBe(2);
      getStatsSpy.mockRestore();
    });
  });

  // ============================================================
  // create
  // ============================================================
  describe('create', () => {
    it('پژوهش جدید ایجاد می‌کنه و toast.success صدا می‌زنه', async () => {
      const createSpy = vi
        .spyOn(researchApi, 'create')
        .mockResolvedValueOnce(mockResearch);

      const { result } = renderHook(() => useResearch(), {
        wrapper: createWrapper(),
      });

      await result.current.create({
        title: 'پژوهش جدید',
        status: 'DRAFT',
        primary_researcher_id: 1,
        affiliation_type: 'UNIVERSITY',
        university_id: 1,
      });

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('پژوهش با موفقیت اضافه شد');
      });

      createSpy.mockRestore();
    });

    it('اگه primary_researcher_id نداشته باشه، خطا می‌ده', async () => {
      const { result } = renderHook(() => useResearch(), {
        wrapper: createWrapper(),
      });

      await expect(
        result.current.create({
          title: 'پژوهش',
          status: 'DRAFT',
          primary_researcher_id: null,
          affiliation_type: 'UNIVERSITY',
          university_id: 1,
        })
      ).rejects.toThrow('پژوهشگر اصلی الزامی است');

      expect(toast.error).toHaveBeenCalledWith('پژوهشگر اصلی الزامی است');
    });

    it('در صورت خطا toast.error صدا می‌زنه', async () => {
      const createSpy = vi
        .spyOn(researchApi, 'create')
        .mockRejectedValueOnce({ message: 'خطای تست' });

      const { result } = renderHook(() => useResearch(), {
        wrapper: createWrapper(),
      });

      await expect(
        result.current.create({
          title: 'پژوهش',
          status: 'DRAFT',
          primary_researcher_id: 1,
          affiliation_type: 'UNIVERSITY',
          university_id: 1,
        })
      ).rejects.toBeDefined();

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      });

      createSpy.mockRestore();
    });
  });

  // ============================================================
  // update
  // ============================================================
  describe('update', () => {
    it('پژوهش رو ویرایش می‌کنه و toast.success صدا می‌زنه', async () => {
      const updateSpy = vi
        .spyOn(researchApi, 'update')
        .mockResolvedValueOnce(mockResearch);

      const { result } = renderHook(() => useResearch(), {
        wrapper: createWrapper(),
      });

      await result.current.update(1, {
        title: 'عنوان جدید',
        status: 'DRAFT',
        primary_researcher_id: 1,
        affiliation_type: 'UNIVERSITY',
        university_id: 1,
      });

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('پژوهش با موفقیت ویرایش شد');
      });

      updateSpy.mockRestore();
    });

    it('اگه primary_researcher_id نداشته باشه، خطا می‌ده', async () => {
      const { result } = renderHook(() => useResearch(), {
        wrapper: createWrapper(),
      });

      await expect(
        result.current.update(1, {
          title: 'پژوهش',
          status: 'DRAFT',
          primary_researcher_id: null,
          affiliation_type: 'UNIVERSITY',
          university_id: 1,
        })
      ).rejects.toThrow('پژوهشگر اصلی الزامی است');
    });
  });

  // ============================================================
  // delete
  // ============================================================
  describe('delete', () => {
    it('پژوهش رو حذف می‌کنه و toast.success صدا می‌زنه', async () => {
      const deleteSpy = vi
        .spyOn(researchApi, 'delete')
        .mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useResearch(), {
        wrapper: createWrapper(),
      });

      await result.current.delete(1);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('پژوهش با موفقیت حذف شد');
      });

      deleteSpy.mockRestore();
    });

    it('در صورت خطا toast.error صدا می‌زنه', async () => {
      const deleteSpy = vi
        .spyOn(researchApi, 'delete')
        .mockRejectedValueOnce({ message: 'خطای تست' });

      const { result } = renderHook(() => useResearch(), {
        wrapper: createWrapper(),
      });

      await expect(result.current.delete(1)).rejects.toBeDefined();

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      });

      deleteSpy.mockRestore();
    });
  });
});