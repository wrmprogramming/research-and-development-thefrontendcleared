// src/modules/communication/components/CommunicationForm.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { CommunicationForm } from './CommunicationForm';
import { mockCommunication } from '../../../test/msw/handlers';

// ============================================================
// Mock: JalaliDatePicker
// ============================================================
vi.mock('../../../components/JalaliDatePicker', () => ({
  default: ({ value, onChange, placeholder, error, disabled }: any) =>
    React.createElement('input', {
      type: 'text',
      placeholder,
      value: value || '',
      onChange: (e: any) => onChange(e.target.value),
      disabled,
      'data-testid': `jalali-${placeholder}`,
      'data-error': error || '',
    }),
}));

// ============================================================
// Mock: ResearchSelect
// ============================================================
vi.mock('../../research/components/ResearchSelect', () => ({
  ResearchSelect: ({ value, onChange, error }: any) =>
    React.createElement('select', {
      value: value || '',
      onChange: (e: any) => onChange(Number(e.target.value) || null),
      'data-testid': 'research-select',
      'data-error': error || '',
    }, [
      React.createElement('option', { key: '', value: '' }, 'انتخاب پژوهش...'),
      React.createElement('option', { key: 1, value: 1 }, 'پژوهش اول'),
      React.createElement('option', { key: 2, value: 2 }, 'پژوهش دوم'),
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
// Mock: dateUtils
// ============================================================
vi.mock('@/utils/dateUtils', () => ({
  formatJalaliDate: (d: any) => d,
  jalaliToGregorian: (d: any) => (d ? `2024-01-01` : null),
}));

// ============================================================
// Mock: useCommunication hook
// ============================================================
const mockCreate = vi.fn();
const mockUpdate = vi.fn();

vi.mock('../hooks/useCommunication', () => ({
  useCommunication: () => ({
    create: mockCreate,
    update: mockUpdate,
    isCreating: false,
    isUpdating: false,
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
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

// ============================================================
// Tests
// ============================================================
describe('CommunicationForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreate.mockReset();
    mockUpdate.mockReset();
  });

  // ============================================================
  // رندر
  // ============================================================
  describe('رندر', () => {
    it('حالت ایجاد — عنوان "افزودن مکاتبه جدید"', () => {
      render(<CommunicationForm />, { wrapper: createWrapper() });
      expect(screen.getByText('افزودن مکاتبه جدید')).toBeInTheDocument();
    });

    it('حالت ویرایش — عنوان "ویرایش مکاتبه"', () => {
      render(<CommunicationForm initialData={mockCommunication as any} />, {
        wrapper: createWrapper(),
      });
      expect(screen.getByText('ویرایش مکاتبه')).toBeInTheDocument();
    });

    it('همه فیلدها رندر می‌شن', () => {
      render(<CommunicationForm />, { wrapper: createWrapper() });

      expect(screen.getByPlaceholderText('شماره مکاتبه...')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/عنوان مکاتبه را وارد کنید/)).toBeInTheDocument();
      expect(screen.getByPlaceholderText('نام ارسال‌کننده...')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('نام دریافت‌کننده...')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('توضیحات تکمیلی...')).toBeInTheDocument();
      expect(screen.getByTestId('research-select')).toBeInTheDocument();
    });
  });

  // ============================================================
  // بارگذاری داده‌های اولیه (ویرایش)
  // ============================================================
  describe('بارگذاری داده‌های اولیه', () => {
    it('مقادیر اولیه رو توی فیلدها پر می‌کنه', () => {
      render(<CommunicationForm initialData={mockCommunication as any} />, {
        wrapper: createWrapper(),
      });

      expect(screen.getByDisplayValue('1402/001')).toBeInTheDocument();
      expect(screen.getByDisplayValue('مکاتبه تست')).toBeInTheDocument();
      expect(screen.getByDisplayValue('احمد احمدی')).toBeInTheDocument();
      expect(screen.getByDisplayValue('رضا رضایی')).toBeInTheDocument();
    });
  });

  // ============================================================
  // اعتبارسنجی
  // ============================================================
  describe('اعتبارسنجی', () => {
    it('اگه عنوان خالی باشه، خطا نشون می‌ده', async () => {
      render(<CommunicationForm />, { wrapper: createWrapper() });

      const submitButton = screen.getByRole('button', { name: /افزودن/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('عنوان مکاتبه الزامی است')).toBeInTheDocument();
      });

      expect(mockCreate).not.toHaveBeenCalled();
    });

    it('اگه ارسال‌کننده خالی باشه، خطا نشون می‌ده', async () => {
      render(<CommunicationForm />, { wrapper: createWrapper() });

      const submitButton = screen.getByRole('button', { name: /افزودن/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('نام ارسال‌کننده الزامی است')).toBeInTheDocument();
      });
    });

    it('اگه دریافت‌کننده خالی باشه، خطا نشون می‌ده', async () => {
      render(<CommunicationForm />, { wrapper: createWrapper() });

      const submitButton = screen.getByRole('button', { name: /افزودن/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('نام دریافت‌کننده الزامی است')).toBeInTheDocument();
      });
    });

    it('اگه تاریخ خالی باشه، خطا نشون می‌ده', async () => {
      render(<CommunicationForm />, { wrapper: createWrapper() });

      const submitButton = screen.getByRole('button', { name: /افزودن/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('تاریخ مکاتبه الزامی است')).toBeInTheDocument();
      });
    });

    it('اگه پژوهش انتخاب نشده باشه، خطا نشون می‌ده', async () => {
      render(<CommunicationForm />, { wrapper: createWrapper() });

      const submitButton = screen.getByRole('button', { name: /افزودن/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('انتخاب پژوهش الزامی است')).toBeInTheDocument();
      });
    });
  });

  // ============================================================
  // Submit موفق
  // ============================================================
  describe('Submit موفق', () => {
 it('با پر کردن همه فیلدها، create صدا زده می‌شه', async () => {
  mockCreate.mockResolvedValueOnce(mockCommunication);

  const onSuccess = vi.fn();
  render(<CommunicationForm onSuccess={onSuccess} />, {
    wrapper: createWrapper(),
  });

  // پر کردن فرم
  await userEvent.type(screen.getByPlaceholderText(/عنوان مکاتبه/), 'عنوان تست');
  await userEvent.type(screen.getByPlaceholderText('نام ارسال‌کننده...'), 'ارسال‌کننده');
  await userEvent.type(screen.getByPlaceholderText('نام دریافت‌کننده...'), 'دریافت‌کننده');

  // ✅ از getAllByTestId استفاده کن و اولی رو بردار (تاریخ مکاتبه)
  const dateInputs = screen.getAllByTestId('jalali-1402/01/01');
  const dateInput = dateInputs[0]; // تاریخ مکاتبه
  await userEvent.type(dateInput, '1402/01/15');

  // پژوهش
  const researchSelect = screen.getByTestId('research-select');
  await userEvent.selectOptions(researchSelect, '1');

  // Submit
  const submitButton = screen.getByRole('button', { name: /افزودن/i });
  await userEvent.click(submitButton);

  await waitFor(() => {
    expect(mockCreate).toHaveBeenCalledTimes(1);
  });

  await waitFor(() => {
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });
});
    it('در حالت ویرایش، update صدا زده می‌شه', async () => {
      mockUpdate.mockResolvedValueOnce(mockCommunication);

      const onSuccess = vi.fn();
      render(
        <CommunicationForm initialData={mockCommunication as any} onSuccess={onSuccess} />,
        { wrapper: createWrapper() }
      );

      const submitButton = screen.getByRole('button', { name: /ویرایش/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockUpdate).toHaveBeenCalledTimes(1);
      });

      expect(mockUpdate.mock.calls[0][0]).toBe(1); // id
    });
  });

  // ============================================================
  // خطای سرور
  // ============================================================
  describe('خطای سرور', () => {
  it('خطاهای سرور رو توی فیلدها نشون می‌ده', async () => {
  mockCreate.mockRejectedValueOnce({
    response: {
      data: {
        title: ['این عنوان تکراری است'],
        sender: ['ارسال‌کننده نامعتبر'],
      },
    },
  });

  render(<CommunicationForm />, { wrapper: createWrapper() });

  // پر کردن فرم با داده معتبر
  await userEvent.type(screen.getByPlaceholderText(/عنوان مکاتبه/), 'عنوان');
  await userEvent.type(screen.getByPlaceholderText('نام ارسال‌کننده...'), 'ارسال');
  await userEvent.type(screen.getByPlaceholderText('نام دریافت‌کننده...'), 'دریافت');

  // ✅ از getAllByTestId استفاده کن و اولی رو بردار
  const dateInputs = screen.getAllByTestId('jalali-1402/01/01');
  await userEvent.type(dateInputs[0], '1402/01/15');

  await userEvent.selectOptions(screen.getByTestId('research-select'), '1');

  const submitButton = screen.getByRole('button', { name: /افزودن/i });
  await userEvent.click(submitButton);

  await waitFor(() => {
    expect(screen.getByText('این عنوان تکراری است')).toBeInTheDocument();
  });
});
  });

  // ============================================================
  // دکمه انصراف
  // ============================================================
  describe('دکمه انصراف', () => {
    it('onCancel رو صدا می‌زنه', async () => {
      const onCancel = vi.fn();
      render(<CommunicationForm onCancel={onCancel} />, {
        wrapper: createWrapper(),
      });

      const cancelButton = screen.getByRole('button', { name: /انصراف/i });
      await userEvent.click(cancelButton);

      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('دکمه بستن (X) هم onCancel رو صدا می‌زنه', async () => {
      const onCancel = vi.fn();
      const { container } = render(<CommunicationForm onCancel={onCancel} />, {
        wrapper: createWrapper(),
      });

      const closeButton = container.querySelector('.close-btn') as HTMLElement;
      await userEvent.click(closeButton);

      expect(onCancel).toHaveBeenCalledTimes(1);
    });
  });
});