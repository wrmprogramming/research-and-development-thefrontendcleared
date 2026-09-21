// src/modules/rfp/components/RfpList.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';
import { RfpList } from './RfpList';
import type { Rfp } from '../types/rfp.types';

// ============================================================
// Mock: react-router-dom
// ============================================================
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

// ============================================================
// Mock: react-hot-toast
// ============================================================
vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

// ============================================================
// Mock: formatter.utils
// ============================================================
vi.mock('@/utils/formatter.utils', () => ({
  formatCurrency: (n: any) => `${n} ریال`,
  toPersianNumber: (n: any) => String(n),
}));

// ============================================================
// داده نمونه
// ============================================================
const mockRfp1: Rfp = {
  id: 1,
  code: 'RFP-001',
  title: 'RFP اول',
  description: 'توضیحات اول',
  estimated_price: 5000000,
  approximate_project_time: 6,
  necessity_declaration: 'ضرورت اول',
  solution_exact_definition: 'راه حل اول',
  publish_date: '1402/01/15',
  research: 1,
  research_code: 'R-001',
  research_title: 'پژوهش اول',
  research_year: 1402,
  attachments: [],
  basic_questions: [],
  consumers: [],
  created_at: '1402/01/01',
  updated_at: '1402/01/01',
};

const mockRfp2: Rfp = {
  ...mockRfp1,
  id: 2,
  code: 'RFP-002',
  title: 'RFP دوم',
  estimated_price: 3000000,
  approximate_project_time: 3,
  research_title: 'پژوهش دوم',
  research_year: 1403,
};

const mockRfpList = {
  count: 2,
  next: null,
  previous: null,
  total_pages: 1,
  current_page: 1,
  page_size: 10,
  results: [mockRfp1, mockRfp2],
};

const mockStats = {
  total: 2,
  total_estimated_price: 8000000,
  average_estimated_price: 4000000,
  by_year: [
    { year: 1403, count: 1, total_price: 3000000, average_price: 3000000 },
    { year: 1402, count: 1, total_price: 5000000, average_price: 5000000 },
  ],
};

// ============================================================
// Mock: useRfp
// ============================================================
const mockUseList = vi.fn();
const mockUseStats = vi.fn();
const mockDelete = vi.fn();

vi.mock('../hooks/useRfp', () => ({
  useRfp: () => ({
    useList: mockUseList,
    useStats: mockUseStats,
    delete: mockDelete,
    isDeleting: false,
  }),
}));

// ============================================================
// Wrapper
// ============================================================
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(
      QueryClientProvider,
      { client: queryClient },
      React.createElement(BrowserRouter, null, children)
    );
};

// ============================================================
// Tests
// ============================================================
describe('RfpList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    mockDelete.mockReset();

    mockUseList.mockReturnValue({
      data: mockRfpList,
      isLoading: false,
      refetch: vi.fn(),
    });

    mockUseStats.mockReturnValue({
      data: mockStats,
      isLoading: false,
    });
  });

  // ============================================================
  // رندر
  // ============================================================
  describe('رندر', () => {
    it('عنوان و تعداد رو نشون می‌ده', async () => {
      render(<RfpList />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('RFPها')).toBeInTheDocument();
      });

      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('لیست RFPها رو نشون می‌ده', async () => {
      render(<RfpList />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('RFP اول')).toBeInTheDocument();
      });

      expect(screen.getByText('RFP دوم')).toBeInTheDocument();
      expect(screen.getByText('RFP-001')).toBeInTheDocument();
      expect(screen.getByText('RFP-002')).toBeInTheDocument();
    });

    it('حالت بارگذاری', () => {
      mockUseList.mockReturnValue({
        data: undefined,
        isLoading: true,
        refetch: vi.fn(),
      });

      render(<RfpList />, { wrapper: createWrapper() });

      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('حالت خالی', () => {
      mockUseList.mockReturnValue({
        data: { count: 0, results: [] },
        isLoading: false,
        refetch: vi.fn(),
      });

      render(<RfpList />, { wrapper: createWrapper() });

      expect(screen.getByText('هنوز RFPی ثبت نشده است')).toBeInTheDocument();
    });
  });

  // ============================================================
  // دکمه افزودن
  // ============================================================
  describe('دکمه افزودن', () => {
    it('onAdd رو صدا می‌زنه', async () => {
      const onAdd = vi.fn();
      render(<RfpList onAdd={onAdd} />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('RFP اول')).toBeInTheDocument();
      });

      const addButton = screen.getByRole('button', { name: /افزودن RFP/i });
      await userEvent.click(addButton);

      expect(onAdd).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================================
  // دکمه مشاهده
  // ============================================================
  describe('دکمه مشاهده', () => {
    it('کلیک روی مشاهده، navigate به جزئیات می‌کنه', async () => {
      render(<RfpList />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('RFP اول')).toBeInTheDocument();
      });

      const viewButtons = screen.getAllByTitle('مشاهده');
      await userEvent.click(viewButtons[0]);

      expect(mockNavigate).toHaveBeenCalledWith('/rfp/1');
    });
  });

  // ============================================================
  // دکمه ویرایش
  // ============================================================
  describe('دکمه ویرایش', () => {
    it('onEdit رو با item صدا می‌زنه', async () => {
      const onEdit = vi.fn();
      render(<RfpList onEdit={onEdit} />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('RFP اول')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByTitle('ویرایش');
      await userEvent.click(editButtons[0]);

      expect(onEdit).toHaveBeenCalledTimes(1);
      expect(onEdit).toHaveBeenCalledWith(
        expect.objectContaining({ id: 1, title: 'RFP اول' })
      );
    });
  });

  // ============================================================
  // دکمه حذف
  // ============================================================
  describe('دکمه حذف', () => {
    it('با تأیید، delete رو صدا می‌زنه', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

      render(<RfpList />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('RFP اول')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByTitle('حذف');
      await userEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(confirmSpy).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(mockDelete).toHaveBeenCalledWith(1);
      });

      confirmSpy.mockRestore();
    });

    it('بدون تأیید، delete صدا زده نمی‌شه', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

      render(<RfpList />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('RFP اول')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByTitle('حذف');
      await userEvent.click(deleteButtons[0]);

      expect(confirmSpy).toHaveBeenCalled();
      expect(mockDelete).not.toHaveBeenCalled();

      confirmSpy.mockRestore();
    });
  });

  // ============================================================
  // جستجو
  // ============================================================
  describe('جستجو', () => {
    it('input جستجو وجود داره', async () => {
      render(<RfpList />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('RFP اول')).toBeInTheDocument();
      });

      expect(
        screen.getByPlaceholderText(/جستجو در کد، عنوان/)
      ).toBeInTheDocument();
    });

    it('تایپ توی جستجو، input رو آپدیت می‌کنه', async () => {
      render(<RfpList />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('RFP اول')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/جستجو در کد، عنوان/);
      await userEvent.type(searchInput, 'تست');

      expect(searchInput).toHaveValue('تست');
    });
  });

  // ============================================================
  // فیلتر
  // ============================================================
  describe('فیلتر', () => {
    it('دکمه فیلترها، پنل فیلتر رو باز می‌کنه', async () => {
      render(<RfpList />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('RFP اول')).toBeInTheDocument();
      });

      const filterButton = screen.getByRole('button', { name: /فیلترها/i });
      await userEvent.click(filterButton);

      await waitFor(() => {
        expect(screen.getByLabelText('سال پژوهش مرتبط')).toBeInTheDocument();
      });
    });
  });
});