// src/modules/rfp/pages/RfpPage.integration.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';
import { RfpPage } from './RfpPage';
import { server } from '../test/msw/server';
import { http, HttpResponse } from 'msw';

// ============================================================
// Mock: ResearchSelect
// ============================================================
vi.mock('../../research/components/ResearchSelect', () => ({
  ResearchSelect: ({ value, onChange, placeholder }: any) =>
    React.createElement(
      'select',
      {
        value: value || '',
        onChange: (e: any) => onChange(Number(e.target.value) || null),
        'data-testid': 'research-select',
      },
      [
        React.createElement('option', { key: '', value: '' }, placeholder || 'انتخاب پژوهش...'),
        React.createElement('option', { key: 1, value: 1 }, 'پژوهش اول'),
        React.createElement('option', { key: 2, value: 2 }, 'پژوهش دوم'),
      ]
    ),
}));

// ============================================================
// Mock: react-hot-toast
// ============================================================
vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import { toast } from 'react-hot-toast';

// ============================================================
// Mock: formatter.utils
// ============================================================
vi.mock('@/utils/formatter.utils', () => ({
  formatCurrency: (n: any) => `${n} ریال`,
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
describe('RfpPage - Integration', () => {
  let mockRfps: any[] = [];

  beforeEach(() => {
    vi.clearAllMocks();

    mockRfps = [
      {
        id: 1,
        code: 'RFP-001',
        title: 'RFP تست',
        description: 'توضیحات',
        estimated_price: 5000000,
        approximate_project_time: 6,
        necessity_declaration: 'ضرورت',
        solution_exact_definition: 'راه حل',
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
      },
    ];

    // GET - rfps list
    server.use(
      http.get('http://172.18.5.77:8000/api/v1/rfps/', () => {
        return HttpResponse.json({
          count: mockRfps.length,
          next: null,
          previous: null,
          total_pages: 1,
          current_page: 1,
          page_size: 10,
          results: mockRfps,
        });
      })
    );

    // GET - stats
    server.use(
      http.get('http://172.18.5.77:8000/api/v1/rfps/stats/', () => {
        return HttpResponse.json({
          total: mockRfps.length,
          total_estimated_price: 5000000,
          average_estimated_price: 5000000,
          by_year: [{ year: 1402, count: 1, total_price: 5000000, average_price: 5000000 }],
        });
      })
    );

    // POST - create
    server.use(
      http.post('http://172.18.5.77:8000/api/v1/rfps/', async ({ request }) => {
        const formData = await request.formData();
        const newRfp = {
          id: mockRfps.length + 1,
          code: String(formData.get('code') || 'RFP-NEW'),
          title: String(formData.get('title') || ''),
          description: String(formData.get('description') || ''),
          estimated_price: Number(formData.get('estimated_price')) || 0,
          approximate_project_time: Number(formData.get('approximate_project_time')) || 0,
          necessity_declaration: String(formData.get('necessity_declaration') || ''),
          solution_exact_definition: String(formData.get('solution_exact_definition') || ''),
          publish_date: '1404/01/01',
          research: 1,
          research_title: 'پژوهش اول',
          research_year: 1404,
          attachments: [],
          basic_questions: [],
          consumers: [],
          created_at: '1404/01/01',
          updated_at: '1404/01/01',
        };
        mockRfps.push(newRfp);
        return HttpResponse.json(newRfp, { status: 201 });
      })
    );

    // DELETE
    server.use(
      http.delete('http://172.18.5.77:8000/api/v1/rfps/:id/', ({ params }) => {
        const id = Number(params.id);
        mockRfps = mockRfps.filter((r) => r.id !== id);
        return new HttpResponse(null, { status: 204 });
      })
    );
  });

  // ============================================================
  // تست اصلی: ایجاد + مشاهده در لیست
  // ============================================================
  it('کاربر RFP جدید ایجاد می‌کند و توی لیست می‌بیند', async () => {
    render(<RfpPage />, { wrapper: createWrapper() });

    // ۱. منتظر لود شدن لیست اولیه
    await waitFor(() => {
      expect(screen.getByText('RFP تست')).toBeInTheDocument();
    });

    expect(screen.getByText('RFP-001')).toBeInTheDocument();
    expect(screen.queryByText('RFP جدید')).not.toBeInTheDocument();

    // ۲. کلیک روی دکمه افزودن
    const addButton = screen.getByRole('button', { name: /افزودن RFP/i });
    await userEvent.click(addButton);

    // ۳. منتظر باز شدن فرم
    await waitFor(() => {
      expect(screen.getByText('افزودن RFP جدید')).toBeInTheDocument();
    });

    // ۴. پر کردن فرم
    await userEvent.type(
      screen.getByPlaceholderText('مثال: RFP-1402-001'),
      'RFP-NEW'
    );
    await userEvent.type(
      screen.getByPlaceholderText(/عنوان RFP را وارد کنید/),
      'RFP جدید'
    );
    await userEvent.type(
      screen.getByPlaceholderText(/مبلغ تخمینی/),
      '8000000'
    );
    await userEvent.type(
      screen.getByPlaceholderText('مثال: 6'),
      '4'
    );
    await userEvent.type(
      screen.getByPlaceholderText(/تبیین ضرورت انجام پژوهش/),
      'ضرورت جدید'
    );
    await userEvent.type(
      screen.getByPlaceholderText(/تعریف دقیق مسأله و راه حل/),
      'راه حل جدید'
    );

    // ۵. Submit
    const submitButton = screen.getByRole('button', { name: /افزودن$/i });
    await userEvent.click(submitButton);

    // ۶. چک کردن زنجیره
    await waitFor(() => {
      expect(screen.queryByText('افزودن RFP جدید')).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('RFP با موفقیت اضافه شد');
    });

    await waitFor(() => {
      expect(screen.getByText('RFP جدید')).toBeInTheDocument();
    });

    expect(screen.getByText('RFP تست')).toBeInTheDocument();
  });

  // ============================================================
  // تست دوم: ایجاد + حذف
  // ============================================================
  it('کاربر RFP ایجاد می‌کند، سپس آن را حذف می‌کند', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<RfpPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('RFP تست')).toBeInTheDocument();
    });

    // ایجاد
    await userEvent.click(screen.getByRole('button', { name: /افزودن RFP/i }));

    await waitFor(() => {
      expect(screen.getByText('افزودن RFP جدید')).toBeInTheDocument();
    });

    await userEvent.type(
      screen.getByPlaceholderText(/عنوان RFP را وارد کنید/),
      'RFP برای حذف'
    );
    await userEvent.type(screen.getByPlaceholderText(/مبلغ تخمینی/), '1000000');
    await userEvent.type(screen.getByPlaceholderText('مثال: 6'), '2');
    await userEvent.type(
      screen.getByPlaceholderText(/تبیین ضرورت/),
      'ضرورت'
    );
    await userEvent.type(
      screen.getByPlaceholderText(/تعریف دقیق/),
      'راه حل'
    );

    await userEvent.click(screen.getByRole('button', { name: /افزودن$/i }));

    await waitFor(() => {
      expect(screen.getByText('RFP برای حذف')).toBeInTheDocument();
    });

    // حذف
    const rows = screen.getAllByRole('row');
    const newRow = rows.find((row) =>
      within(row).queryByText('RFP برای حذف')
    );

    expect(newRow).toBeDefined();

    const deleteButton = within(newRow!).getByTitle('حذف');
    await userEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.queryByText('RFP برای حذف')).not.toBeInTheDocument();
    });

    expect(screen.getByText('RFP تست')).toBeInTheDocument();

    confirmSpy.mockRestore();
  });
});