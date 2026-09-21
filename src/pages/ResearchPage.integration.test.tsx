// src/pages/ResearchPage.integration.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';
import { ResearchPage } from './ResearchPage';
import { server } from '../test/msw/server';
import { http, HttpResponse } from 'msw';

// ============================================================
// Mock: JalaliDatePicker
// ============================================================
vi.mock('../components/JalaliDatePicker', () => ({
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
vi.mock('../modules/person/components/PersonSelect', () => ({
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
vi.mock('../modules/company/components/CompanySelect', () => ({
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
      ]
    ),
}));

// ============================================================
// Mock: UniversitySelect
// ============================================================
vi.mock('../modules/university/components/UniversitySelect', () => ({
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

import { toast } from 'react-hot-toast';

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
    React.createElement(
      QueryClientProvider,
      { client: queryClient },
      React.createElement(BrowserRouter, null, children)
    );
};

// ============================================================
// Integration Test
// ============================================================
describe('ResearchPage - Integration', () => {
  let mockResearches: any[] = [];

  beforeEach(() => {
    vi.clearAllMocks();

    mockResearches = [
      {
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
      },
    ];

    // GET - researches list
    server.use(
      http.get('http://172.18.5.77:8000/api/v1/researches/', () => {
        return HttpResponse.json({
          count: mockResearches.length,
          next: null,
          previous: null,
          total_pages: 1,
          current_page: 1,
          page_size: 10,
          results: mockResearches,
        });
      })
    );

    // GET - stats
    server.use(
      http.get('http://172.18.5.77:8000/api/v1/researches/stats/', () => {
        return HttpResponse.json({
          total: mockResearches.length,
          draft: mockResearches.length,
          active: 0,
          completed: 0,
          by_status: { DRAFT: mockResearches.length },
          by_year: { 1402: mockResearches.length },
          by_affiliation: [],
        });
      })
    );

    // POST - create
    server.use(
      http.post(
        'http://172.18.5.77:8000/api/v1/researches/',
        async ({ request }) => {
          const formData = await request.formData();

          const newResearch = {
            id: mockResearches.length + 1,
            code: String(formData.get('code') || 'R-NEW'),
            title: String(formData.get('title') || ''),
            description: String(formData.get('description') || ''),
            year: Number(formData.get('year')) || 1404,
            status: String(formData.get('status') || 'DRAFT'),
            primary_researcher: Number(formData.get('primary_researcher_id')) || 1,
            primary_researcher_name: 'علی احمدی',
            affiliation_type: String(formData.get('affiliation_type') || 'UNIVERSITY'),
            university: 1,
            university_name: 'دانشگاه اول',
            company: null,
            company_name: null,
            researchers: String(formData.get('researchers') || ''),
            budget: Number(formData.get('budget')) || 0,
            created_at: '1404/01/01',
            updated_at: '1404/01/01',
            attachments: [],
            is_active: true,
          };

          mockResearches.push(newResearch);

          return HttpResponse.json(newResearch, { status: 201 });
        }
      )
    );

    // DELETE
    server.use(
      http.delete(
        'http://172.18.5.77:8000/api/v1/researches/:id/',
        ({ params }) => {
          const id = Number(params.id);
          mockResearches = mockResearches.filter((r) => r.id !== id);
          return new HttpResponse(null, { status: 204 });
        }
      )
    );
  });

  // ============================================================
  // تست اصلی
  // ============================================================
  it('کاربر پژوهش جدید ایجاد می‌کند و توی لیست می‌بیند', async () => {
    render(<ResearchPage />, { wrapper: createWrapper() });

    // ============================================================
    // ۱. منتظر لود شدن لیست اولیه
    // ============================================================
    await waitFor(() => {
      expect(screen.getByText('پژوهش تست')).toBeInTheDocument();
    });

    expect(screen.getByText('R-001')).toBeInTheDocument();

    // چک کن پژوهش جدید هنوز نیست
    expect(screen.queryByText('پژوهش جدید')).not.toBeInTheDocument();

    // ============================================================
    // ۲. کلیک روی دکمه افزودن
    // ============================================================
    const addButton = screen.getByRole('button', { name: /افزودن پژوهش/i });
    await userEvent.click(addButton);

    // ============================================================
    // ۳. منتظر باز شدن فرم
    // ============================================================
    await waitFor(() => {
      expect(screen.getByText('افزودن پژوهش جدید')).toBeInTheDocument();
    });

    // ============================================================
    // ۴. پر کردن فرم
    // ============================================================
    // کد پژوهش
    await userEvent.type(
      screen.getByPlaceholderText('مثال: RES-1402-001'),
      'R-NEW'
    );

    // عنوان
    await userEvent.type(
      screen.getByPlaceholderText(/عنوان کامل پژوهش/),
      'پژوهش جدید'
    );

    // پژوهشگر
    await userEvent.selectOptions(screen.getByTestId('person-select'), '1');

    // دانشگاه
    await userEvent.selectOptions(screen.getByTestId('university-select'), '1');

    // ============================================================
    // ۵. Submit
    // ============================================================
    const submitButton = screen.getByRole('button', { name: /افزودن$/i });
    await userEvent.click(submitButton);

    // ============================================================
    // ۶. چک کردن زنجیره
    // ============================================================

    // ۶.۱ - مودال بسته شد
    await waitFor(() => {
      expect(screen.queryByText('افزودن پژوهش جدید')).not.toBeInTheDocument();
    });

    // ۶.۲ - toast.success صدا زده شد
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('پژوهش با موفقیت اضافه شد');
    });

    // ۶.۳ - پژوهش جدید توی لیست ظاهر شد
    await waitFor(() => {
      expect(screen.getByText('پژوهش جدید')).toBeInTheDocument();
    });

    // ۶.۴ - پژوهش قبلی هنوز هست
    expect(screen.getByText('پژوهش تست')).toBeInTheDocument();
  });

  // ============================================================
  // تست دوم: ایجاد + حذف
  // ============================================================
  it('کاربر پژوهش ایجاد می‌کند، سپس آن را حذف می‌کند', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<ResearchPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('پژوهش تست')).toBeInTheDocument();
    });

    // ایجاد
    await userEvent.click(screen.getByRole('button', { name: /افزودن پژوهش/i }));

    await waitFor(() => {
      expect(screen.getByText('افزودن پژوهش جدید')).toBeInTheDocument();
    });

    await userEvent.type(
      screen.getByPlaceholderText(/عنوان کامل پژوهش/),
      'پژوهش برای حذف'
    );

    await userEvent.selectOptions(screen.getByTestId('person-select'), '1');
    await userEvent.selectOptions(screen.getByTestId('university-select'), '1');

    await userEvent.click(screen.getByRole('button', { name: /افزودن$/i }));

    // چک کن اضافه شد
    await waitFor(() => {
      expect(screen.getByText('پژوهش برای حذف')).toBeInTheDocument();
    });

    // حذف
    const rows = screen.getAllByRole('row');
    const newRow = rows.find((row) =>
      within(row).queryByText('پژوهش برای حذف')
    );

    expect(newRow).toBeDefined();

    const deleteButton = within(newRow!).getByTitle('حذف');
    await userEvent.click(deleteButton);

    // چک کن حذف شد
    await waitFor(() => {
      expect(screen.queryByText('پژوهش برای حذف')).not.toBeInTheDocument();
    });

    expect(screen.getByText('پژوهش تست')).toBeInTheDocument();

    confirmSpy.mockRestore();
  });
});