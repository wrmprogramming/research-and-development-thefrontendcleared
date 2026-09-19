// src/modules/communication/pages/CommunicationDetailsPage.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';
import { CommunicationDetailsPage } from './CommunicationDetailsPage';

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
// Mock: CommunicationForm
// ============================================================
vi.mock('../components/CommunicationForm', () => ({
  CommunicationForm: ({ onSuccess, onCancel }: any) =>
    React.createElement('div', { 'data-testid': 'communication-form-mock' }, [
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
// Mock: dateUtils و formatter.utils
// ============================================================
vi.mock('@/utils/dateUtils', () => ({
  formatJalaliDate: (d: any) => d,
  jalaliToGregorian: (d: any) => d,
}));

vi.mock('@/utils/formatter.utils', () => ({
  toPersianNumber: (n: any) => String(n),
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
// Helper: منتظر لود شدن صفحه بمون
// ============================================================
const waitForPageLoad = async () => {
  await waitFor(() => {
    // h1 (تیتر صفحه) همیشه یکتاست
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });
};

// ============================================================
// Tests
// ============================================================
describe('CommunicationDetailsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
  });

  // ============================================================
  // رندر و داده‌ها
  // ============================================================
  describe('رندر', () => {
    it('داده‌های مکاتبه رو نشون می‌ده', async () => {
      render(<CommunicationDetailsPage />, { wrapper: createWrapper() });

      await waitForPageLoad();

      expect(screen.getByText('احمد احمدی')).toBeInTheDocument();
      expect(screen.getByText('رضا رضایی')).toBeInTheDocument();
      expect(screen.getAllByText('R-001').length).toBeGreaterThan(0);
      expect(screen.getByText('توضیحات تست')).toBeInTheDocument();

      // تاریخ‌ها ممکنه چند جا باشن
      expect(screen.getAllByText('1402/01/15').length).toBeGreaterThan(0);
      expect(screen.getAllByText('1402/01/20').length).toBeGreaterThan(0);
    });

    it('شماره مکاتبه رو نشون می‌ده', async () => {
      render(<CommunicationDetailsPage />, { wrapper: createWrapper() });

      await waitForPageLoad();

      // "1402/001" چند جا ظاهر می‌شه
      const numbers = screen.getAllByText('1402/001');
      expect(numbers.length).toBeGreaterThan(0);
    });

    it('دکمه بازگشت وجود داره', async () => {
      render(<CommunicationDetailsPage />, { wrapper: createWrapper() });

      await waitForPageLoad();

      expect(screen.getByText('بازگشت')).toBeInTheDocument();
    });
  });

  // ============================================================
  // بازگشت
  // ============================================================
  describe('بازگشت', () => {
    it('کلیک روی بازگشت، به لیست می‌ره', async () => {
      render(<CommunicationDetailsPage />, { wrapper: createWrapper() });

      await waitForPageLoad();

      await userEvent.click(screen.getByText('بازگشت'));

      expect(mockNavigate).toHaveBeenCalledWith('/communication');
    });
  });

  // ============================================================
  // ویرایش
  // ============================================================
  describe('ویرایش', () => {
    it('کلیک روی ویرایش، مودال فرم رو باز می‌کنه', async () => {
      render(<CommunicationDetailsPage />, { wrapper: createWrapper() });

      await waitForPageLoad();

      const editButton = screen.getByRole('button', { name: /ویرایش/i });
      await userEvent.click(editButton);

      await waitFor(() => {
        expect(screen.getByTestId('communication-form-mock')).toBeInTheDocument();
      });
    });

    it('بستن مودال با onCancel', async () => {
      render(<CommunicationDetailsPage />, { wrapper: createWrapper() });

      await waitForPageLoad();

      await userEvent.click(screen.getByRole('button', { name: /ویرایش/i }));

      await waitFor(() => {
        expect(screen.getByTestId('communication-form-mock')).toBeInTheDocument();
      });

      await userEvent.click(screen.getByTestId('form-cancel'));

      await waitFor(() => {
        expect(screen.queryByTestId('communication-form-mock')).not.toBeInTheDocument();
      });
    });
  });

  // ============================================================
  // حذف
  // ============================================================
  describe('حذف', () => {
    it('کلیک روی حذف با تأیید، delete رو صدا می‌زنه و به لیست می‌ره', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

      render(<CommunicationDetailsPage />, { wrapper: createWrapper() });

      await waitForPageLoad();

      const deleteButton = screen.getByRole('button', { name: /حذف/i });
      await userEvent.click(deleteButton);

      await waitFor(() => {
        expect(confirmSpy).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/communication');
      });

      confirmSpy.mockRestore();
    });

    it('اگه کاربر تأیید نکنه، delete صدا زده نمی‌شه', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

      render(<CommunicationDetailsPage />, { wrapper: createWrapper() });

      await waitForPageLoad();

      const deleteButton = screen.getByRole('button', { name: /حذف/i });
      await userEvent.click(deleteButton);

      expect(confirmSpy).toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();

      confirmSpy.mockRestore();
    });
  });

  // ============================================================
  // Export
  // ============================================================
  describe('Export', () => {
    it('دکمه خروجی، منوی export رو باز می‌کنه', async () => {
      render(<CommunicationDetailsPage />, { wrapper: createWrapper() });

      await waitForPageLoad();

      const exportButton = screen.getByRole('button', { name: /خروجی/i });
      await userEvent.click(exportButton);

      await waitFor(() => {
        expect(screen.getByText('PDF')).toBeInTheDocument();
        expect(screen.getByText('Excel')).toBeInTheDocument();
        expect(screen.getByText('JSON')).toBeInTheDocument();
        expect(screen.getByText('XML')).toBeInTheDocument();
        expect(screen.getByText('CSV')).toBeInTheDocument();
        expect(screen.getByText('HTML')).toBeInTheDocument();
        expect(screen.getByText('TXT')).toBeInTheDocument();
        expect(screen.getByText('Word')).toBeInTheDocument();
      });
    });
  });

  // ============================================================
  // حالت خطا (404)
  // ============================================================
  describe('حالت خطا', () => {
    it('اگه مکاتبه پیدا نشه، پیام خطا نشون می‌ده', async () => {
      const { server } = await import('../../../test/msw/server');
      const { http, HttpResponse } = await import('msw');

      server.use(
        http.get('http://172.18.5.77:8000/api/v1/communications/:id/', () => {
          return new HttpResponse(null, { status: 404 });
        })
      );

      render(<CommunicationDetailsPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('مکاتبه یافت نشد')).toBeInTheDocument();
      });
    });
  });
});