// src/modules/research/components/ResearchForm.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { ResearchForm } from './ResearchForm';
import type { Research } from '../types/research.types';

// ============================================================
// Mock: JalaliDatePicker
// ============================================================
vi.mock('../../../components/JalaliDatePicker', () => ({
  default: ({ value, onChange, placeholder, error, disabled, label }: any) => {
    const uniqueId = label ? `jalali-${label}` : `jalali-${placeholder}`;
    return React.createElement('input', {
      type: 'text',
      placeholder,
      value: value || '',
      onChange: (e: any) => onChange(e.target.value),
      disabled,
      'data-testid': uniqueId,
      'data-error': error || '',
      'data-label': label,
    });
  },
}));

// ============================================================
// Mock: PersonSelect
// ============================================================
vi.mock('../../person/components/PersonSelect', () => ({
  PersonSelect: ({ value, onChange, error, label, required }: any) =>
    React.createElement(
      'div',
      { 'data-testid': 'person-select-wrapper' },
      [
        React.createElement('label', { key: 'lbl' },
          label, required ? ' *' : ''
        ),
        React.createElement(
          'select',
          {
            key: 'sel',
            value: value || '',
            onChange: (e: any) => onChange(Number(e.target.value) || null),
            'data-testid': 'person-select',
            'data-error': error || '',
          },
          [
            React.createElement('option', { key: '', value: '' }, 'انتخاب پژوهشگر...'),
            React.createElement('option', { key: 1, value: 1 }, 'علی احمدی'),
            React.createElement('option', { key: 2, value: 2 }, 'سارا رضایی'),
          ]
        ),
      ]
    ),
}));

// ============================================================
// Mock: CompanySelect
// ============================================================
vi.mock('../../company/components/CompanySelect', () => ({
  CompanySelect: ({ value, onChange, error }: any) =>
    React.createElement(
      'select',
      {
        value: value || '',
        onChange: (e: any) => onChange(Number(e.target.value) || null),
        'data-testid': 'company-select',
        'data-error': error || '',
      },
      [
        React.createElement('option', { key: '', value: '' }, 'انتخاب شرکت...'),
        React.createElement('option', { key: 1, value: 1 }, 'شرکت اول'),
        React.createElement('option', { key: 2, value: 2 }, 'شرکت دوم'),
      ]
    ),
}));

// ============================================================
// Mock: UniversitySelect
// ============================================================
vi.mock('../../university/components/UniversitySelect', () => ({
  UniversitySelect: ({ value, onChange, error }: any) =>
    React.createElement(
      'select',
      {
        value: value || '',
        onChange: (e: any) => onChange(Number(e.target.value) || null),
        'data-testid': 'university-select',
        'data-error': error || '',
      },
      [
        React.createElement('option', { key: '', value: '' }, 'انتخاب دانشگاه...'),
        React.createElement('option', { key: 1, value: 1 }, 'دانشگاه اول'),
        React.createElement('option', { key: 2, value: 2 }, 'دانشگاه دوم'),
      ]
    ),
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
// Mock: useResearch hook
// ============================================================
const mockCreate = vi.fn();
const mockUpdate = vi.fn();

vi.mock('../hooks/useResearch', () => ({
  useResearch: () => ({
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
// Tests
// ============================================================
describe('ResearchForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreate.mockReset();
    mockUpdate.mockReset();
  });

  // ============================================================
  // رندر
  // ============================================================
  describe('رندر', () => {
    it('حالت ایجاد — عنوان "افزودن پژوهش جدید"', () => {
      render(<ResearchForm />, { wrapper: createWrapper() });
      expect(screen.getByText('افزودن پژوهش جدید')).toBeInTheDocument();
    });

    it('حالت ویرایش — عنوان "ویرایش پژوهش"', () => {
      render(<ResearchForm initialData={mockResearch} />, {
        wrapper: createWrapper(),
      });
      expect(screen.getByText('ویرایش پژوهش')).toBeInTheDocument();
    });

    it('فیلدهای اصلی رندر می‌شن', () => {
      render(<ResearchForm />, { wrapper: createWrapper() });

      expect(screen.getByPlaceholderText(/عنوان کامل پژوهش/)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/توضیحات تکمیلی/)).toBeInTheDocument();
      expect(screen.getByTestId('person-select')).toBeInTheDocument();
      expect(screen.getByTestId('university-select')).toBeInTheDocument();
    });
  });

  // ============================================================
  // بارگذاری داده‌های اولیه (ویرایش)
  // ============================================================
  describe('بارگذاری داده‌های اولیه', () => {
    it('مقادیر اولیه رو توی فیلدها پر می‌کنه', () => {
      render(<ResearchForm initialData={mockResearch} />, {
        wrapper: createWrapper(),
      });

      expect(screen.getByDisplayValue('R-001')).toBeInTheDocument();
      expect(screen.getByDisplayValue('پژوهش تست')).toBeInTheDocument();
      expect(screen.getByDisplayValue('توضیحات تست')).toBeInTheDocument();
      expect(screen.getByDisplayValue('سارا رضایی')).toBeInTheDocument();
    });

    it('person-select مقدار اولیه رو داره', () => {
      render(<ResearchForm initialData={mockResearch} />, {
        wrapper: createWrapper(),
      });

      const personSelect = screen.getByTestId('person-select') as HTMLSelectElement;
      expect(personSelect.value).toBe('1');
    });

    it('university-select مقدار اولیه رو داره', () => {
      render(<ResearchForm initialData={mockResearch} />, {
        wrapper: createWrapper(),
      });

      const uniSelect = screen.getByTestId('university-select') as HTMLSelectElement;
      expect(uniSelect.value).toBe('1');
    });
  });

  // ============================================================
  // اعتبارسنجی
  // ============================================================
  describe('اعتبارسنجی', () => {
    it('اگه عنوان خالی باشه، خطا نشون می‌ده', async () => {
      render(<ResearchForm />, { wrapper: createWrapper() });

      const submitButton = screen.getByRole('button', { name: /افزودن/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('عنوان پژوهش الزامی است')).toBeInTheDocument();
      });

      expect(mockCreate).not.toHaveBeenCalled();
    });

    it('اگه پژوهشگر انتخاب نشده باشه، خطا نشون می‌ده', async () => {
      render(<ResearchForm />, { wrapper: createWrapper() });

      const submitButton = screen.getByRole('button', { name: /افزودن/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('انتخاب پژوهشگر اصلی الزامی است')).toBeInTheDocument();
      });
    });

    it('اگه دانشگاه انتخاب نشده باشه (affiliation_type=UNIVERSITY)، خطا نشون می‌ده', async () => {
      render(<ResearchForm />, { wrapper: createWrapper() });

      await userEvent.type(screen.getByPlaceholderText(/عنوان کامل پژوهش/), 'عنوان');
      await userEvent.selectOptions(screen.getByTestId('person-select'), '1');

      const submitButton = screen.getByRole('button', { name: /افزودن/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('انتخاب دانشگاه الزامی است')).toBeInTheDocument();
      });
    });

    it('اگه شرکت انتخاب نشده باشه (affiliation_type=COMPANY)، خطا نشون می‌ده', async () => {
      render(<ResearchForm />, { wrapper: createWrapper() });

      const affiliationSelect = screen.getAllByRole('combobox').find(
        (el) => (el as HTMLSelectElement).value === 'UNIVERSITY'
      ) as HTMLSelectElement;

      await userEvent.selectOptions(affiliationSelect, 'COMPANY');

      await userEvent.type(screen.getByPlaceholderText(/عنوان کامل پژوهش/), 'عنوان');
      await userEvent.selectOptions(screen.getByTestId('person-select'), '1');

      const submitButton = screen.getByRole('button', { name: /افزودن/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('انتخاب شرکت الزامی است')).toBeInTheDocument();
      });
    });
  });

  // ============================================================
  // Submit موفق
  // ============================================================
  describe('Submit موفق', () => {
    it('با پر کردن همه فیلدها، create صدا زده می‌شه', async () => {
      mockCreate.mockResolvedValueOnce(mockResearch);

      const onSuccess = vi.fn();
      render(<ResearchForm onSuccess={onSuccess} />, {
        wrapper: createWrapper(),
      });

      await userEvent.type(screen.getByPlaceholderText(/عنوان کامل پژوهش/), 'عنوان تست');
      await userEvent.selectOptions(screen.getByTestId('person-select'), '1');
      await userEvent.selectOptions(screen.getByTestId('university-select'), '1');

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
      mockUpdate.mockResolvedValueOnce(mockResearch);

      const onSuccess = vi.fn();
      render(<ResearchForm initialData={mockResearch} onSuccess={onSuccess} />, {
        wrapper: createWrapper(),
      });

      const submitButton = screen.getByRole('button', { name: /ویرایش/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockUpdate).toHaveBeenCalledTimes(1);
      });

      expect(mockUpdate.mock.calls[0][0]).toBe(1);
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
            primary_researcher: ['پژوهشگر نامعتبر است'],
          },
        },
      });

      render(<ResearchForm />, { wrapper: createWrapper() });

      await userEvent.type(screen.getByPlaceholderText(/عنوان کامل پژوهش/), 'عنوان');
      await userEvent.selectOptions(screen.getByTestId('person-select'), '1');
      await userEvent.selectOptions(screen.getByTestId('university-select'), '1');

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
      render(<ResearchForm onCancel={onCancel} />, {
        wrapper: createWrapper(),
      });

      const cancelButton = screen.getByRole('button', { name: /انصراف/i });
      await userEvent.click(cancelButton);

      expect(onCancel).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================================
  // باگ: year خودکار
  // ============================================================
  describe('باگ: year خودکار', () => {
    it('year باید سال شمسی باشه، نه میلادی', () => {
      render(<ResearchForm />, { wrapper: createWrapper() });

      const yearInput = screen.getByPlaceholderText('مثال: 1405') as HTMLInputElement;

      const yearValue = Number(yearInput.value);

      expect(yearValue).toBeGreaterThanOrEqual(1400);
      expect(yearValue).toBeLessThanOrEqual(1500);
    });
  });

  // ============================================================
  // تبدیل تاریخ‌ها
  // ============================================================
  describe('تبدیل تاریخ‌ها', () => {
    it('تاریخ‌های شمسی قبل از ارسال به میلادی تبدیل می‌شن', async () => {
      mockCreate.mockResolvedValueOnce(mockResearch);

      render(<ResearchForm />, { wrapper: createWrapper() });

      await userEvent.type(screen.getByPlaceholderText(/عنوان کامل پژوهش/), 'عنوان');
      await userEvent.selectOptions(screen.getByTestId('person-select'), '1');
      await userEvent.selectOptions(screen.getByTestId('university-select'), '1');

      // ✅ چون label خالیه، هر سه تا data-testid یکسان دارن
      // از getAllByTestId استفاده کن. ترتیب: approve_date, start_date, end_date
      const dateInputs = screen.getAllByTestId('jalali-1402/01/01');
      const approveDateInput = dateInputs[0]; // تاریخ تصویب

      await userEvent.type(approveDateInput, '1402/01/15');

      const submitButton = screen.getByRole('button', { name: /افزودن/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockCreate).toHaveBeenCalledTimes(1);
      });

      const submitData = mockCreate.mock.calls[0][0];
      expect(submitData.approve_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('اگه تاریخ خالی باشه، null می‌ره', async () => {
      mockCreate.mockResolvedValueOnce(mockResearch);

      render(<ResearchForm />, { wrapper: createWrapper() });

      await userEvent.type(screen.getByPlaceholderText(/عنوان کامل پژوهش/), 'عنوان');
      await userEvent.selectOptions(screen.getByTestId('person-select'), '1');
      await userEvent.selectOptions(screen.getByTestId('university-select'), '1');

      const submitButton = screen.getByRole('button', { name: /افزودن/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockCreate).toHaveBeenCalledTimes(1);
      });

      const submitData = mockCreate.mock.calls[0][0];
      expect(submitData.approve_date).toBeNull();
      expect(submitData.start_date).toBeNull();
      expect(submitData.end_date).toBeNull();
    });
  });
});