// src/modules/communication/hooks/useCommunication.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useCommunication } from './useCommunication';
import { communicationApi } from '../api/communication.api';
import {
  mockCommunication,
  mockCommunicationsList,
  mockStats,
} from '../../../test/msw/handlers';

// ============================================================
// Wrapper برای React Query
// ============================================================
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,       // توی تست نمی‌خوایم retry کنه
        gcTime: 0,          // cache رو فوری پاک کن
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

// ============================================================
// Mock react-hot-toast
// ============================================================
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import { toast } from 'react-hot-toast';

// ============================================================
// Tests
// ============================================================
describe('useCommunication', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================================
  // useList
  // ============================================================
  describe('useList', () => {
    it('لیست مکاتبات را برمی‌گرداند', async () => {
      const { result } = renderHook(
        () => {
          const { useList } = useCommunication();
          return useList();
        },
        { wrapper: createWrapper() }
      );

      // اول loading
      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.count).toBe(2);
      expect(result.current.data?.results).toHaveLength(2);
      expect(result.current.data?.results[0].title).toBe('مکاتبه تست');
    });

    it('با فیلترها لیست را می‌گیرد', async () => {
      const { result } = renderHook(
        () => {
          const { useList } = useCommunication();
          return useList({ search: 'test', page: 1 });
        },
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.count).toBe(2);
    });
  });

  // ============================================================
  // useItem
  // ============================================================
  describe('useItem', () => {
    it('یک مکاتبه را با id برمی‌گرداند', async () => {
      const { result } = renderHook(
        () => {
          const { useItem } = useCommunication();
          return useItem(1);
        },
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.id).toBe(1);
      expect(result.current.data?.title).toBe('مکاتبه تست');
    });

    it('اگه id نامعتبر باشه، query اجرا نمی‌شه', () => {
      const { result } = renderHook(
        () => {
          const { useItem } = useCommunication();
          return useItem(0);
        },
        { wrapper: createWrapper() }
      );

      // enabled: false → fetchStatus === 'idle'
      expect(result.current.fetchStatus).toBe('idle');
      expect(result.current.data).toBeUndefined();
    });
  });

  // ============================================================
  // useStats
  // ============================================================
  describe('useStats', () => {
    it('آمار را بدون سال برمی‌گرداند', async () => {
      const { result } = renderHook(
        () => {
          const { useStats } = useCommunication();
          return useStats();
        },
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.total).toBe(2);
      expect(result.current.data?.available_years).toEqual([1402]);
    });

    it('آمار را با سال برمی‌گرداند', async () => {
      const { result } = renderHook(
        () => {
          const { useStats } = useCommunication();
          return useStats(1402);
        },
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.total).toBe(2);
    });
  });

  // ============================================================
  // create
  // ============================================================
  describe('create', () => {
    it('مکاتبه جدید ایجاد می‌کند و toast.success صدا می‌زند', async () => {
      const { result } = renderHook(() => useCommunication(), {
        wrapper: createWrapper(),
      });

      await result.current.create({
        title: 'مکاتبه جدید',
        sender: 'الف',
        receiver: 'ب',
        date: '2024-01-01',
        research_id: 1,
      });

      expect(toast.success).toHaveBeenCalledWith('مکاتبه با موفقیت ثبت شد');
    });

    it('در صورت خطا toast.error صدا می‌زند', async () => {
      // mock کردن create برای پرتاب خطا
      const createSpy = vi
        .spyOn(communicationApi, 'create')
        .mockRejectedValueOnce({ message: 'خطای تست' });

      const { result } = renderHook(() => useCommunication(), {
        wrapper: createWrapper(),
      });

      await expect(
        result.current.create({
          title: 'مکاتبه خطادار',
          sender: 'الف',
          receiver: 'ب',
          date: '2024-01-01',
          research_id: 1,
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
    it('مکاتبه را ویرایش می‌کند و toast.success صدا می‌زند', async () => {
      const { result } = renderHook(() => useCommunication(), {
        wrapper: createWrapper(),
      });

      await result.current.update(1, {
        title: 'عنوان ویرایش‌شده',
        sender: 'الف',
        receiver: 'ب',
        date: '2024-01-01',
        research_id: 1,
      });

      expect(toast.success).toHaveBeenCalledWith('مکاتبه با موفقیت ویرایش شد');
    });
  });

  // ============================================================
  // delete
  // ============================================================
  describe('delete', () => {
    it('مکاتبه را حذف می‌کند و toast.success صدا می‌زند', async () => {
      const { result } = renderHook(() => useCommunication(), {
        wrapper: createWrapper(),
      });

      await result.current.delete(1);

      expect(toast.success).toHaveBeenCalledWith('مکاتبه با موفقیت حذف شد');
    });
  });
});