// ============================================================
// Mock: JalaliDatePicker (چون تقویم واقعی نمی‌خوایم)
// ============================================================
vi.mock('../components/JalaliDatePicker', () => ({
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
vi.mock('../utils/dateUtils', () => ({
  formatJalaliDate: (d: any) => d,
  jalaliToGregorian: (d: any) => d,
}));

// ============================================================
// Mock: ResearchSelect
// ============================================================
vi.mock('../modules/research/components/ResearchSelect', () => ({
  ResearchSelect: ({ value, onChange, placeholder, required, error }: any) =>
    React.createElement(
      'select',
      {
        value: value || '',
        onChange: (e: any) => onChange(Number(e.target.value) || null),
        'data-testid': 'research-select',
        'data-error': error || '',
        'data-placeholder': placeholder,
      },
      [
        React.createElement('option', { key: '', value: '' }, 'انتخاب پژوهش...'),
        React.createElement('option', { key: 1, value: 1 }, 'پژوهش اول'),
        React.createElement('option', { key: 2, value: 2 }, 'پژوهش دوم'),
      ]
    ),
}));
// src/pages/CommunicationPage.integration.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';
import { CommunicationPage } from './CommunicationPage';
import { server } from '../test/msw/server';
import { http, HttpResponse } from 'msw';


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
describe('CommunicationPage - Integration', () => {
  let mockCommunications: any[] = [];

  beforeEach(() => {
    vi.clearAllMocks();

    // ============================================================
    // داده اولیه
    // ============================================================
    mockCommunications = [
      {
        id: 1,
        letter_number: '1402/001',
        title: 'مکاتبه تست',
        description: 'توضیحات',
        sender: 'احمد احمدی',
        receiver: 'رضا رضایی',
        date: '1402/01/15',
        send_receive_date: '1402/01/20',
        attachment: null,
        letter_file: null,
        research: 1,
        research_code: 'R-001',
        research_title: 'پژوهش تست',
        created_at: '1402/01/15',
        updated_at: '1402/01/15',
      },
    ];

    // ============================================================
    // MSW handlers با state
    // ============================================================

    // GET - researches (برای ResearchSelect)
    server.use(
      http.get('http://172.18.5.77:8000/api/v1/researches/', () => {
        return HttpResponse.json({
          count: 2,
          next: null,
          previous: null,
          total_pages: 1,
          current_page: 1,
          page_size: 500,
          results: [
            { id: 1, code: 'R-001', title: 'پژوهش اول' },
            { id: 2, code: 'R-002', title: 'پژوهش دوم' },
          ],
        });
      })
    );

    // GET - communications list
    server.use(
      http.get(
        'http://172.18.5.77:8000/api/v1/communications/',
        () => {
          return HttpResponse.json({
            count: mockCommunications.length,
            next: null,
            previous: null,
            total_pages: 1,
            current_page: 1,
            page_size: 10,
            results: mockCommunications,
          });
        }
      )
    );

    // GET - stats
    server.use(
      http.get(
        'http://172.18.5.77:8000/api/v1/communications/stats/',
        () => {
          return HttpResponse.json({
            total: mockCommunications.length,
            total_with_research: mockCommunications.length,
            by_research: [],
            by_month: {},
            by_year: {},
            available_years: [],
          });
        }
      )
    );

    // POST - create
    server.use(
      http.post(
        'http://172.18.5.77:8000/api/v1/communications/',
        async ({ request }) => {
          const formData = await request.formData();

          const newCommunication = {
            id: mockCommunications.length + 1,
            letter_number: String(formData.get('letter_number') || ''),
            title: String(formData.get('title') || ''),
            description: String(formData.get('description') || ''),
            sender: String(formData.get('sender') || ''),
            receiver: String(formData.get('receiver') || ''),
            date: String(formData.get('date') || ''),
            send_receive_date: String(formData.get('send_receive_date') || ''),
            attachment: null,
            letter_file: null,
            research: Number(formData.get('research_id')) || 1,
            research_code: 'R-001',
            research_title: 'پژوهش تست',
            created_at: '1402/05/01',
            updated_at: '1402/05/01',
          };

          mockCommunications.push(newCommunication);

          return HttpResponse.json(newCommunication, { status: 201 });
        }
      )
    );

    // DELETE
    server.use(
      http.delete(
        'http://172.18.5.77:8000/api/v1/communications/:id/',
        ({ params }) => {
          const id = Number(params.id);
          mockCommunications = mockCommunications.filter((c) => c.id !== id);
          return new HttpResponse(null, { status: 204 });
        }
      )
    );
  });

  // ============================================================
  // تست اصلی
  // ============================================================
  it('کاربر مکاتبه جدید ایجاد می‌کند و توی لیست می‌بیند', async () => {
    render(<CommunicationPage />, { wrapper: createWrapper() });

    // منتظر لود شدن لیست اولیه
    await waitFor(() => {
      expect(screen.getByText('مکاتبه تست')).toBeInTheDocument();
    });

    expect(screen.getByText('احمد احمدی')).toBeInTheDocument();
    expect(screen.queryByText('مکاتبه جدید')).not.toBeInTheDocument();

    // کلیک روی دکمه افزودن
    const addButton = screen.getByRole('button', { name: /افزودن مکاتبه/i });
    await userEvent.click(addButton);

    // منتظر باز شدن فرم
    await waitFor(() => {
      expect(screen.getByText('افزودن مکاتبه جدید')).toBeInTheDocument();
    });

    // پر کردن فرم
    await userEvent.type(
      screen.getByPlaceholderText(/عنوان مکاتبه را وارد کنید/),
      'مکاتبه جدید'
    );
    await userEvent.type(
      screen.getByPlaceholderText('نام ارسال‌کننده...'),
      'علی علوی'
    );
    await userEvent.type(
      screen.getByPlaceholderText('نام دریافت‌کننده...'),
      'مریم مریمی'
    );

    const dateInputs = screen.getAllByTestId('jalali-1402/01/01');
    await userEvent.type(dateInputs[0], '1402/05/01');

    await userEvent.selectOptions(screen.getByTestId('research-select'), '1');

    // Submit
    const submitButton = screen.getByRole('button', { name: /افزودن$/i });
    await userEvent.click(submitButton);

    // **مهم‌ترین بخش**
    await waitFor(() => {
      expect(screen.queryByText('افزودن مکاتبه جدید')).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('مکاتبه با موفقیت ثبت شد');
    });

    await waitFor(() => {
      expect(screen.getByText('مکاتبه جدید')).toBeInTheDocument();
    });

    expect(screen.getByText('علی علوی')).toBeInTheDocument();
    expect(screen.getByText('مریم مریمی')).toBeInTheDocument();

    // مکاتبه قبلی هم هنوز هست
    expect(screen.getByText('مکاتبه تست')).toBeInTheDocument();
    expect(screen.getByText('احمد احمدی')).toBeInTheDocument();
  });

  // ============================================================
  // تست دوم: حذف
  // ============================================================
  it('کاربر مکاتبه ایجاد می‌کند، سپس آن را حذف می‌کند', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<CommunicationPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('مکاتبه تست')).toBeInTheDocument();
    });

    // ایجاد
    await userEvent.click(screen.getByRole('button', { name: /افزودن مکاتبه/i }));

    await waitFor(() => {
      expect(screen.getByText('افزودن مکاتبه جدید')).toBeInTheDocument();
    });

    await userEvent.type(
      screen.getByPlaceholderText(/عنوان مکاتبه را وارد کنید/),
      'مکاتبه برای حذف'
    );
    await userEvent.type(
      screen.getByPlaceholderText('نام ارسال‌کننده...'),
      'علی'
    );
    await userEvent.type(
      screen.getByPlaceholderText('نام دریافت‌کننده...'),
      'مریم'
    );

    const dateInputs = screen.getAllByTestId('jalali-1402/01/01');
    await userEvent.type(dateInputs[0], '1402/05/01');
    await userEvent.selectOptions(screen.getByTestId('research-select'), '1');

    await userEvent.click(screen.getByRole('button', { name: /افزودن$/i }));

    await waitFor(() => {
      expect(screen.getByText('مکاتبه برای حذف')).toBeInTheDocument();
    });

    // حذف: دکمه حذف ردیف مکاتبه جدید
    const rows = screen.getAllByRole('row');
    const newRow = rows.find((row) =>
      within(row).queryByText('مکاتبه برای حذف')
    );

    expect(newRow).toBeDefined();

    const deleteButton = within(newRow!).getByTitle('حذف');
    await userEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.queryByText('مکاتبه برای حذف')).not.toBeInTheDocument();
    });

    expect(screen.getByText('مکاتبه تست')).toBeInTheDocument();

    confirmSpy.mockRestore();
  });
});