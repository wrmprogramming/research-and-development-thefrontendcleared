// src/modules/research/pages/ResearchDetailsPage.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';
import { ResearchDetailsPage } from './ResearchDetails';
import type { Research } from '../types/research.types';

// ============================================================
// Mock: react-router-dom
// ============================================================
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: '1' }),
  };
});

// ============================================================
// Mock: ResearchForm (توی مودال ویرایش)
// ============================================================
vi.mock('../components/ResearchForm', () => ({
  ResearchForm: ({ onSuccess, onCancel }: any) =>
    React.createElement('div', { 'data-testid': 'research-form-mock' }, [
      React.createElement('div', { key: 'title' }, 'فرم ویرایش'),
      React.createElement(
        'button',
        { key: 'success', onClick: onSuccess, 'data-testid': 'form-success' },
        'ذخیره'
      ),
      React.createElement(
        'button',
        { key: 'cancel', onClick: onCancel, 'data-testid': 'form-cancel' },
        'انصراف'
      ),
    ]),
}));

// ============================================================
// Mock: react-hot-toast
// ============================================================
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// ============================================================
// Mock: file-saver
// ============================================================
vi.mock('file-saver', () => ({
  saveAs: vi.fn(),
}));

// ============================================================
// Mock: html2canvas, jspdf, xlsx
// ============================================================
vi.mock('html2canvas', () => ({
  default: vi.fn().mockResolvedValue({
    toDataURL: () => 'data:image/png;base64,mock',
    width: 794,
    height: 1123,
  }),
}));

vi.mock('jspdf', () => ({
  default: vi.fn().mockImplementation(() => ({
    internal: {
      pageSize: {
        getWidth: () => 210,
        getHeight: () => 297,
      },
    },
    addImage: vi.fn(),
    addPage: vi.fn(),
    save: vi.fn(),
  })),
}));

vi.mock('xlsx', () => ({
  utils: {
    book_new: vi.fn(() => ({})),
    json_to_sheet: vi.fn(() => ({})),
    book_append_sheet: vi.fn(),
  },
  writeFile: vi.fn(),
}));

// ============================================================
// Mock: dateUtils
// ============================================================
vi.mock('@/utils/dateUtils', () => ({
  formatJalaliDate: (d: any) => d,
  jalaliToGregorian: (d: any) => d,
  getCurrentJalaliYear: () => 1404,
}));

// ============================================================
// Mock: formatter.utils
// ============================================================
vi.mock('@/utils/formatter.utils', () => ({
  formatCurrency: (n: any) => String(n),
  toPersianNumber: (n: any) => String(n),
}));

// ============================================================
// Mock: useResearch
// ============================================================
const mockUseItem = vi.fn();
const mockDelete = vi.fn();

vi.mock('../hooks/useResearch', () => ({
  useResearch: () => ({
    useItem: mockUseItem,
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
// داده نمونه
// ============================================================
const mockResearch: Research = {
  id: 1,
  code: 'R-001',
  title: 'پژوهش تست',
  description: 'توضیحات تست',
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

// ============================================================
// Helper: منتظر لود شدن صفحه بمون
// ============================================================
const waitForPageLoad = async () => {
  await waitFor(() => {
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });
};

// ============================================================
// Tests
// ============================================================
describe('ResearchDetailsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();

    mockUseItem.mockReturnValue({
      data: mockResearch,
      isLoading: false,
      refetch: vi.fn(),
    });
  });

  // ============================================================
  // رندر
  // ============================================================
  describe('رندر', () => {
    it('کد پژوهش رو به عنوان h1 نشون می‌ده', async () => {
      render(<ResearchDetailsPage />, { wrapper: createWrapper() });
      await waitForPageLoad();

      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toHaveTextContent('R-001');
    });

    it('عنوان پژوهش رو نشون می‌ده', async () => {
      render(<ResearchDetailsPage />, { wrapper: createWrapper() });
      await waitForPageLoad();

      expect(screen.getAllByText('پژوهش تست').length).toBeGreaterThan(0);
    });

    it('اطلاعات پژوهشگر رو نشون می‌ده', async () => {
      render(<ResearchDetailsPage />, { wrapper: createWrapper() });
      await waitForPageLoad();

      expect(screen.getAllByText('علی احمدی').length).toBeGreaterThan(0);
    });

    it('دانشگاه رو نشون می‌ده', async () => {
      render(<ResearchDetailsPage />, { wrapper: createWrapper() });
      await waitForPageLoad();

      expect(screen.getAllByText('دانشگاه تهران').length).toBeGreaterThan(0);
    });

    it('توضیحات رو نشون می‌ده', async () => {
      render(<ResearchDetailsPage />, { wrapper: createWrapper() });
      await waitForPageLoad();

      expect(screen.getByText('توضیحات تست')).toBeInTheDocument();
    });

    it('دکمه بازگشت وجود داره', async () => {
      render(<ResearchDetailsPage />, { wrapper: createWrapper() });
      await waitForPageLoad();

      expect(screen.getByText('بازگشت')).toBeInTheDocument();
    });
  });

  // ============================================================
  // حالت بارگذاری
  // ============================================================
  describe('حالت بارگذاری', () => {
    it('وقتی isLoading باشه، پیام بارگذاری نشون می‌ده', () => {
      mockUseItem.mockReturnValue({
        data: undefined,
        isLoading: true,
        refetch: vi.fn(),
      });

      render(<ResearchDetailsPage />, { wrapper: createWrapper() });

      expect(screen.getByText('در حال بارگذاری اطلاعات پژوهش...')).toBeInTheDocument();
    });
  });

  // ============================================================
  // حالت خطا (پژوهش پیدا نشد)
  // ============================================================
  describe('حالت خطا', () => {
    it('وقتی پژوهش نباشه، پیام خطا نشون می‌ده', () => {
      mockUseItem.mockReturnValue({
        data: undefined,
        isLoading: false,
        refetch: vi.fn(),
      });

      render(<ResearchDetailsPage />, { wrapper: createWrapper() });

      expect(screen.getByText('پژوهش یافت نشد')).toBeInTheDocument();
    });
  });

  // ============================================================
  // بازگشت
  // ============================================================
  describe('بازگشت', () => {
    it('کلیک روی بازگشت، navigate به لیست می‌کنه', async () => {
      render(<ResearchDetailsPage />, { wrapper: createWrapper() });
      await waitForPageLoad();

      await userEvent.click(screen.getByText('بازگشت'));

      expect(mockNavigate).toHaveBeenCalledWith('/research');
    });
  });

  // ============================================================
  // ویرایش
  // ============================================================
  describe('ویرایش', () => {
    it('کلیک روی ویرایش، مودال فرم رو باز می‌کنه', async () => {
      render(<ResearchDetailsPage />, { wrapper: createWrapper() });
      await waitForPageLoad();

      const editButton = screen.getByRole('button', { name: /ویرایش/i });
      await userEvent.click(editButton);

      await waitFor(() => {
        expect(screen.getByTestId('research-form-mock')).toBeInTheDocument();
      });
    });

    it('بستن مودال با onCancel', async () => {
      render(<ResearchDetailsPage />, { wrapper: createWrapper() });
      await waitForPageLoad();

      await userEvent.click(screen.getByRole('button', { name: /ویرایش/i }));

      await waitFor(() => {
        expect(screen.getByTestId('research-form-mock')).toBeInTheDocument();
      });

      await userEvent.click(screen.getByTestId('form-cancel'));

      await waitFor(() => {
        expect(screen.queryByTestId('research-form-mock')).not.toBeInTheDocument();
      });
    });
  });

  // ============================================================
  // حذف
  // ============================================================
  describe('حذف', () => {
    it('کلیک روی حذف با تأیید، delete رو صدا می‌زنه و navigate می‌کنه', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

      render(<ResearchDetailsPage />, { wrapper: createWrapper() });
      await waitForPageLoad();

      const deleteButton = screen.getByRole('button', { name: /حذف/i });
      await userEvent.click(deleteButton);

      await waitFor(() => {
        expect(confirmSpy).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(mockDelete).toHaveBeenCalledWith(1);
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/research');
      });

      confirmSpy.mockRestore();
    });

    it('اگه کاربر تأیید نکنه، delete صدا زده نمی‌شه', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

      render(<ResearchDetailsPage />, { wrapper: createWrapper() });
      await waitForPageLoad();

      const deleteButton = screen.getByRole('button', { name: /حذف/i });
      await userEvent.click(deleteButton);

      expect(confirmSpy).toHaveBeenCalled();
      expect(mockDelete).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();

      confirmSpy.mockRestore();
    });
  });

  // ============================================================
  // Export
  // ============================================================
  describe('Export', () => {
    it('دکمه خروجی، منوی export رو باز می‌کنه', async () => {
      render(<ResearchDetailsPage />, { wrapper: createWrapper() });
      await waitForPageLoad();

      const exportButton = screen.getByRole('button', { name: /خروجی/i });
      await userEvent.click(exportButton);

      await waitFor(() => {
        expect(screen.getByText('PDF')).toBeInTheDocument();
        expect(screen.getByText('Word')).toBeInTheDocument();
        expect(screen.getByText('Excel')).toBeInTheDocument();
        expect(screen.getByText('HTML')).toBeInTheDocument();
        expect(screen.getByText('TXT')).toBeInTheDocument();
        expect(screen.getByText('JSON')).toBeInTheDocument();
        expect(screen.getByText('XML')).toBeInTheDocument();
        expect(screen.getByText('CSV')).toBeInTheDocument();
      });
    });
  });
});