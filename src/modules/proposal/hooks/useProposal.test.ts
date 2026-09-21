// src/modules/proposal/hooks/useProposal.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useProposal } from './useProposal';
import { proposalApi } from '../api/proposal.api';

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import { toast } from 'react-hot-toast';

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

const mockProposal = {
  id: 1,
  code: 'PRO-001',
  title_farsi: 'پروپوزال تست',
  title_english: 'Test Proposal',
  submit_date: '1402/01/15',
  approved_date: '1402/02/01',
  execution_location: 'تهران',
  execution_time: 6,
  is_winner: true,
  keywords: 'تست',
  project_subject: 1,
  project_subject_name: 'موضوع اول',
  university: 1,
  university_name: 'دانشگاه تهران',
  primary_researcher: 1,
  primary_researcher_name: 'علی احمدی',
  company: null,
  company_name: null,
  rfp: 1,
  rfp_code: 'RFP-001',
  rfp_title: 'RFP اول',
  rfp_year: 1402,
  attachments: [],
  created_at: '1402/01/01',
  updated_at: '1402/01/01',
};

const mockList = {
  count: 1,
  next: null,
  previous: null,
  total_pages: 1,
  current_page: 1,
  page_size: 10,
  results: [mockProposal],
};

const mockStats = {
  total: 1,
  winner_count: 1,
  not_winner_count: 0,
  total_by_rfp: [],
  total_by_university: [],
  by_year: [{ year: 1402, count: 1, winner_count: 1 }],
};

describe('useProposal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================================
  // useList
  // ============================================================
  describe('useList', () => {
    it('لیست پروپوزال‌ها رو برمی‌گردونه', async () => {
      const getAllSpy = vi.spyOn(proposalApi, 'getAll').mockResolvedValueOnce(mockList);

      const { result } = renderHook(
        () => {
          const { useList } = useProposal();
          return useList();
        },
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.count).toBe(1);
      getAllSpy.mockRestore();
    });

    it('با فیلتر صدا زده می‌شه', async () => {
      const getAllSpy = vi.spyOn(proposalApi, 'getAll').mockResolvedValueOnce(mockList);

      const { result } = renderHook(
        () => {
          const { useList } = useProposal();
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
    it('یه پروپوزال رو با id برمی‌گردونه', async () => {
      const getByIdSpy = vi.spyOn(proposalApi, 'getById').mockResolvedValueOnce(mockProposal);

      const { result } = renderHook(
        () => {
          const { useItem } = useProposal();
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
          const { useItem } = useProposal();
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
      const getStatsSpy = vi.spyOn(proposalApi, 'getStats').mockResolvedValueOnce(mockStats);

      const { result } = renderHook(
        () => {
          const { useStats } = useProposal();
          return useStats();
        },
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.total).toBe(1);
      getStatsSpy.mockRestore();
    });
  });

  // ============================================================
  // create
  // ============================================================
  describe('create', () => {
    it('پروپوزال جدید ایجاد می‌کنه و toast.success صدا می‌زنه', async () => {
      const createSpy = vi.spyOn(proposalApi, 'create').mockResolvedValueOnce(mockProposal);

      const { result } = renderHook(() => useProposal(), { wrapper: createWrapper() });

      await act(async () => {
        await result.current.create({
          title_farsi: 'پروپوزال جدید',
          execution_location: 'تهران',
          execution_time: 6,
          project_subject_id: 1,
          university_id: 1,
          primary_researcher_id: 1,
          rfp_id: 1,
        });
      });

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('پروپوزال با موفقیت اضافه شد');
      });

      createSpy.mockRestore();
    });

    it('در صورت خطا toast.error صدا می‌زنه', async () => {
      const createSpy = vi
        .spyOn(proposalApi, 'create')
        .mockRejectedValueOnce({ message: 'خطای تست' });

      const { result } = renderHook(() => useProposal(), { wrapper: createWrapper() });

      await act(async () => {
        try {
          await result.current.create({
            title_farsi: 'پروپوزال',
            execution_location: 'تهران',
            execution_time: 6,
            project_subject_id: 1,
            university_id: 1,
            primary_researcher_id: 1,
            rfp_id: 1,
          });
        } catch {
          // ignore
        }
      });

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
    it('پروپوزال رو ویرایش می‌کنه و toast.success صدا می‌زنه', async () => {
      const updateSpy = vi.spyOn(proposalApi, 'update').mockResolvedValueOnce(mockProposal);

      const { result } = renderHook(() => useProposal(), { wrapper: createWrapper() });

      await act(async () => {
        await result.current.update(1, {
          title_farsi: 'عنوان جدید',
          execution_location: 'تهران',
          execution_time: 6,
          project_subject_id: 1,
          university_id: 1,
          primary_researcher_id: 1,
          rfp_id: 1,
        });
      });

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('پروپوزال با موفقیت ویرایش شد');
      });

      updateSpy.mockRestore();
    });
  });

  // ============================================================
  // delete
  // ============================================================
  describe('delete', () => {
    it('پروپوزال رو حذف می‌کنه و toast.success صدا می‌زنه', async () => {
      const deleteSpy = vi.spyOn(proposalApi, 'delete').mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useProposal(), { wrapper: createWrapper() });

      await act(async () => {
        await result.current.delete(1);
      });

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('پروپوزال با موفقیت حذف شد');
      });

      deleteSpy.mockRestore();
    });

    it('در صورت خطا toast.error صدا می‌زنه', async () => {
      const deleteSpy = vi
        .spyOn(proposalApi, 'delete')
        .mockRejectedValueOnce({ message: 'خطای تست' });

      const { result } = renderHook(() => useProposal(), { wrapper: createWrapper() });

      await act(async () => {
        try {
          await result.current.delete(1);
        } catch {
          // ignore
        }
      });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      });

      deleteSpy.mockRestore();
    });
  });
});