// src/pages/ProposalPage.integration.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';
import { ProposalPage } from './ProposalPage';
import { server } from '../test/msw/server';   // ✅ اصلاح شد
import { http, HttpResponse } from 'msw';

const BASE = 'http://172.18.5.77:8000/api/v1';

// ============================================================
// ✅ Mock: PersonSelect (مسیر اصلاح شد)
// ============================================================
vi.mock('../modules/person/components/PersonSelect', () => ({
  PersonSelect: ({ value, onChange, placeholder }: any) =>
    React.createElement(
      'select',
      {
        value: value || '',
        onChange: (e: any) => onChange(Number(e.target.value) || null),
        'data-testid': 'person-select',
      },
      [
        React.createElement('option', { key: '', value: '' }, placeholder || 'انتخاب پژوهشگر...'),
        React.createElement('option', { key: 1, value: 1 }, 'علی احمدی'),
        React.createElement('option', { key: 2, value: 2 }, 'سارا رضایی'),
      ]
    ),
}));

// ============================================================
// ✅ Mock: UniversitySelect (مسیر اصلاح شد)
// ============================================================
vi.mock('../modules/university/components/UniversitySelect', () => ({
  UniversitySelect: ({ value, onChange, placeholder }: any) =>
    React.createElement(
      'select',
      {
        value: value || '',
        onChange: (e: any) => onChange(Number(e.target.value) || null),
        'data-testid': 'university-select',
      },
      [
        React.createElement('option', { key: '', value: '' }, placeholder || 'انتخاب دانشگاه...'),
        React.createElement('option', { key: 1, value: 1 }, 'دانشگاه تهران'),
        React.createElement('option', { key: 2, value: 2 }, 'دانشگاه شریف'),
      ]
    ),
}));

// ============================================================
// ✅ Mock: CompanySelect (مسیر اصلاح شد)
// ============================================================
vi.mock('../modules/company/components/CompanySelect', () => ({
  CompanySelect: ({ value, onChange, placeholder }: any) =>
    React.createElement(
      'select',
      {
        value: value || '',
        onChange: (e: any) => onChange(Number(e.target.value) || null),
        'data-testid': 'company-select',
      },
      [
        React.createElement('option', { key: '', value: '' }, placeholder || 'انتخاب شرکت...'),
        React.createElement('option', { key: 1, value: 1 }, 'شرکت اول'),
      ]
    ),
}));

// ============================================================
// ✅ Mock: RfpSelect (مسیر اصلاح شد)
// ============================================================
vi.mock('../modules/rfp/components/RfpSelect', () => ({
  RfpSelect: ({ value, onChange, placeholder }: any) =>
    React.createElement(
      'select',
      {
        value: value || '',
        onChange: (e: any) => onChange(Number(e.target.value) || null),
        'data-testid': 'rfp-select',
      },
      [
        React.createElement('option', { key: '', value: '' }, placeholder || 'انتخاب RFP...'),
        React.createElement('option', { key: 1, value: 1 }, 'RFP اول'),
      ]
    ),
}));

// ============================================================
// ✅ Mock: ProjectSubjectSelect (مسیر اصلاح شد)
// ============================================================
vi.mock('../modules/project-subject/components/ProjectSubjectSelect', () => ({
  ProjectSubjectSelect: ({ value, onChange, placeholder }: any) =>
    React.createElement(
      'select',
      {
        value: value || '',
        onChange: (e: any) => onChange(Number(e.target.value) || null),
        'data-testid': 'project-subject-select',
      },
      [
        React.createElement('option', { key: '', value: '' }, placeholder || 'انتخاب موضوع...'),
        React.createElement('option', { key: 1, value: 1 }, 'موضوع اول'),
      ]
    ),
}));

// ============================================================
// ✅ Mock: JalaliDatePicker (مسیر اصلاح شد)
// ============================================================
vi.mock('../components/JalaliDatePicker', () => ({
  default: ({ value, onChange, placeholder }: any) =>
    React.createElement('input', {
      type: 'text',
      placeholder,
      value: value || '',
      onChange: (e: any) => onChange(e.target.value),
      'data-testid': 'jalali-date-picker',
    }),
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
// Mock: dateUtils
// ============================================================
vi.mock('@/utils/dateUtils', () => ({
  formatJalaliDate: (d: any) => d,
  jalaliToGregorian: (d: any) => d,
  getCurrentJalaliYear: () => 1404,
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
describe('ProposalPage - Integration', () => {
  let mockProposals: any[] = [];

  beforeEach(() => {
    vi.clearAllMocks();

    mockProposals = [
      {
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
      },
    ];

    // GET - proposals list
    server.use(
      http.get(`${BASE}/proposals/`, () => {
        return HttpResponse.json({
          count: mockProposals.length,
          next: null,
          previous: null,
          total_pages: 1,
          current_page: 1,
          page_size: 10,
          results: mockProposals,
        });
      })
    );

    // GET - stats
    server.use(
      http.get(`${BASE}/proposals/stats/`, () => {
        return HttpResponse.json({
          total: mockProposals.length,
          winner_count: 1,
          not_winner_count: 0,
          total_by_rfp: [],
          total_by_university: [],
          by_year: [{ year: 1402, count: 1, winner_count: 1 }],
        });
      })
    );

    // POST - create
    server.use(
      http.post(`${BASE}/proposals/`, async ({ request }) => {
        const formData = await request.formData();
        const newProposal = {
          id: mockProposals.length + 1,
          code: String(formData.get('code') || 'PRO-NEW'),
          title_farsi: String(formData.get('title_farsi') || ''),
          title_english: String(formData.get('title_english') || ''),
          submit_date: '1404/01/01',
          approved_date: String(formData.get('approved_date') || ''),
          execution_location: String(formData.get('execution_location') || ''),
          execution_time: Number(formData.get('execution_time')) || 0,
          is_winner: formData.get('is_winner') === 'true',
          keywords: String(formData.get('keywords') || ''),
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
          rfp_year: 1404,
          attachments: [],
          created_at: '1404/01/01',
          updated_at: '1404/01/01',
        };
        mockProposals.push(newProposal);
        return HttpResponse.json(newProposal, { status: 201 });
      })
    );

    // DELETE
    server.use(
      http.delete(`${BASE}/proposals/:id/`, ({ params }) => {
        const id = Number(params.id);
        mockProposals = mockProposals.filter((p) => p.id !== id);
        return new HttpResponse(null, { status: 204 });
      })
    );
  });

  // ============================================================
  // تست اصلی: ایجاد + مشاهده در لیست
  // ============================================================
  it('کاربر پروپوزال جدید ایجاد می‌کند و توی لیست می‌بیند', async () => {
    render(<ProposalPage />, { wrapper: createWrapper() });

    // ۱. منتظر لود شدن لیست
    await waitFor(() => {
      expect(screen.getByText('پروپوزال تست')).toBeInTheDocument();
    });

    expect(screen.getByText('PRO-001')).toBeInTheDocument();
    expect(screen.queryByText('پروپوزال جدید')).not.toBeInTheDocument();

    // ۲. کلیک روی دکمه افزودن
    const addButton = screen.getByRole('button', { name: /افزودن پروپوزال/i });
    await userEvent.click(addButton);

    // ۳. منتظر باز شدن فرم
    await waitFor(() => {
      expect(screen.getByText('افزودن پروپوزال جدید')).toBeInTheDocument();
    });

    // ۴. پر کردن فرم
    await userEvent.type(
      screen.getByPlaceholderText('مثال: PRO-1402-001'),
      'PRO-NEW'
    );
    await userEvent.type(
      screen.getByPlaceholderText(/عنوان فارسی پروپوزال/),
      'پروپوزال جدید'
    );
    await userEvent.type(
      screen.getByPlaceholderText(/محل انجام پروژه/),
      'اصفهان'
    );
    await userEvent.type(screen.getByPlaceholderText('مثال: 6'), '4');

    // انتخاب‌ها
    await userEvent.selectOptions(screen.getByTestId('project-subject-select'), '1');
    await userEvent.selectOptions(screen.getByTestId('rfp-select'), '1');
    await userEvent.selectOptions(screen.getByTestId('university-select'), '1');
    await userEvent.selectOptions(screen.getByTestId('person-select'), '1');

    // ۵. Submit
    const submitButton = screen.getByRole('button', { name: /افزودن$/i });
    await userEvent.click(submitButton);

    // ۶. چک کردن زنجیره
    await waitFor(() => {
      expect(screen.queryByText('افزودن پروپوزال جدید')).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('پروپوزال با موفقیت اضافه شد');
    });

    await waitFor(() => {
      expect(screen.getByText('پروپوزال جدید')).toBeInTheDocument();
    });

    expect(screen.getByText('پروپوزال تست')).toBeInTheDocument();
  });

  // ============================================================
  // تست دوم: ایجاد + حذف
  // ============================================================
  it('کاربر پروپوزال ایجاد می‌کند، سپس آن را حذف می‌کند', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<ProposalPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('پروپوزال تست')).toBeInTheDocument();
    });

    // ایجاد
    await userEvent.click(screen.getByRole('button', { name: /افزودن پروپوزال/i }));

    await waitFor(() => {
      expect(screen.getByText('افزودن پروپوزال جدید')).toBeInTheDocument();
    });

    await userEvent.type(
      screen.getByPlaceholderText(/عنوان فارسی پروپوزال/),
      'پروپوزال برای حذف'
    );
    await userEvent.type(screen.getByPlaceholderText(/محل انجام پروژه/), 'شیراز');
    await userEvent.type(screen.getByPlaceholderText('مثال: 6'), '3');

    await userEvent.selectOptions(screen.getByTestId('project-subject-select'), '1');
    await userEvent.selectOptions(screen.getByTestId('rfp-select'), '1');
    await userEvent.selectOptions(screen.getByTestId('university-select'), '1');
    await userEvent.selectOptions(screen.getByTestId('person-select'), '1');

    await userEvent.click(screen.getByRole('button', { name: /افزودن$/i }));

    await waitFor(() => {
      expect(screen.getByText('پروپوزال برای حذف')).toBeInTheDocument();
    });

    // حذف
    const rows = screen.getAllByRole('row');
    const newRow = rows.find((row) =>
      within(row).queryByText('پروپوزال برای حذف')
    );

    expect(newRow).toBeDefined();

    const deleteButton = within(newRow!).getByTitle('حذف');
    await userEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.queryByText('پروپوزال برای حذف')).not.toBeInTheDocument();
    });

    expect(screen.getByText('پروپوزال تست')).toBeInTheDocument();

    confirmSpy.mockRestore();
  });
});

// // src/modules/proposal/pages/ProposalPage.integration.test.tsx

// import { describe, it, expect, vi, beforeEach } from 'vitest';
// import { render, screen, waitFor, within } from '@testing-library/react';
// import userEvent from '@testing-library/user-event';
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { BrowserRouter } from 'react-router-dom';
// import React from 'react';
// import { ProposalPage } from './ProposalPage';
// import { server } from '../test/msw/server';
// import { http, HttpResponse } from 'msw';

// const BASE = 'http://172.18.5.77:8000/api/v1';

// // ============================================================
// // Mock: PersonSelect
// // ============================================================
// vi.mock('../../person/components/PersonSelect', () => ({
//   PersonSelect: ({ value, onChange, placeholder }: any) =>
//     React.createElement(
//       'select',
//       {
//         value: value || '',
//         onChange: (e: any) => onChange(Number(e.target.value) || null),
//         'data-testid': 'person-select',
//       },
//       [
//         React.createElement('option', { key: '', value: '' }, placeholder || 'انتخاب...'),
//         React.createElement('option', { key: 1, value: 1 }, 'علی احمدی'),
//         React.createElement('option', { key: 2, value: 2 }, 'سارا رضایی'),
//       ]
//     ),
// }));

// // ============================================================
// // Mock: UniversitySelect
// // ============================================================
// vi.mock('../../university/components/UniversitySelect', () => ({
//   UniversitySelect: ({ value, onChange, placeholder }: any) =>
//     React.createElement(
//       'select',
//       {
//         value: value || '',
//         onChange: (e: any) => onChange(Number(e.target.value) || null),
//         'data-testid': 'university-select',
//       },
//       [
//         React.createElement('option', { key: '', value: '' }, placeholder || 'انتخاب دانشگاه...'),
//         React.createElement('option', { key: 1, value: 1 }, 'دانشگاه تهران'),
//       ]
//     ),
// }));

// // ============================================================
// // Mock: CompanySelect
// // ============================================================
// vi.mock('../../company/components/CompanySelect', () => ({
//   CompanySelect: ({ value, onChange, placeholder }: any) =>
//     React.createElement(
//       'select',
//       {
//         value: value || '',
//         onChange: (e: any) => onChange(Number(e.target.value) || null),
//         'data-testid': 'company-select',
//       },
//       [
//         React.createElement('option', { key: '', value: '' }, placeholder || 'انتخاب شرکت...'),
//         React.createElement('option', { key: 1, value: 1 }, 'شرکت اول'),
//       ]
//     ),
// }));

// // ============================================================
// // Mock: RfpSelect
// // ============================================================
// vi.mock('../../rfp/components/RfpSelect', () => ({
//   RfpSelect: ({ value, onChange, placeholder }: any) =>
//     React.createElement(
//       'select',
//       {
//         value: value || '',
//         onChange: (e: any) => onChange(Number(e.target.value) || null),
//         'data-testid': 'rfp-select',
//       },
//       [
//         React.createElement('option', { key: '', value: '' }, placeholder || 'انتخاب RFP...'),
//         React.createElement('option', { key: 1, value: 1 }, 'RFP اول'),
//       ]
//     ),
// }));

// // ============================================================
// // Mock: ProjectSubjectSelect
// // ============================================================
// vi.mock('../../project-subject/components/ProjectSubjectSelect', () => ({
//   ProjectSubjectSelect: ({ value, onChange, placeholder }: any) =>
//     React.createElement(
//       'select',
//       {
//         value: value || '',
//         onChange: (e: any) => onChange(Number(e.target.value) || null),
//         'data-testid': 'project-subject-select',
//       },
//       [
//         React.createElement('option', { key: '', value: '' }, placeholder || 'انتخاب موضوع...'),
//         React.createElement('option', { key: 1, value: 1 }, 'موضوع اول'),
//       ]
//     ),
// }));

// // ============================================================
// // Mock: JalaliDatePicker
// // ============================================================
// vi.mock('../../../components/JalaliDatePicker', () => ({
//   default: ({ value, onChange, placeholder }: any) =>
//     React.createElement('input', {
//       type: 'text',
//       placeholder,
//       value: value || '',
//       onChange: (e: any) => onChange(e.target.value),
//       'data-testid': 'jalali-date-picker',
//     }),
// }));

// // ============================================================
// // Mock: react-hot-toast
// // ============================================================
// vi.mock('react-hot-toast', () => ({
//   toast: { success: vi.fn(), error: vi.fn() },
// }));

// import { toast } from 'react-hot-toast';

// // ============================================================
// // Mock: formatter.utils
// // ============================================================
// vi.mock('@/utils/formatter.utils', () => ({
//   formatCurrency: (n: any) => `${n} ریال`,
//   toPersianNumber: (n: any) => String(n),
// }));

// // ============================================================
// // Mock: dateUtils
// // ============================================================
// vi.mock('@/utils/dateUtils', () => ({
//   formatJalaliDate: (d: any) => d,
//   jalaliToGregorian: (d: any) => d,
//   getCurrentJalaliYear: () => 1404,
// }));

// // ============================================================
// // Wrapper
// // ============================================================
// const createWrapper = () => {
//   const queryClient = new QueryClient({
//     defaultOptions: {
//       queries: { retry: false, gcTime: 0, staleTime: 0 },
//       mutations: { retry: false },
//     },
//   });

//   return ({ children }: { children: React.ReactNode }) =>
//     React.createElement(
//       QueryClientProvider,
//       { client: queryClient },
//       React.createElement(BrowserRouter, null, children)
//     );
// };

// // ============================================================
// // Integration Test
// // ============================================================
// describe('ProposalPage - Integration', () => {
//   let mockProposals: any[] = [];

//   beforeEach(() => {
//     vi.clearAllMocks();

//     mockProposals = [
//       {
//         id: 1,
//         code: 'PRO-001',
//         title_farsi: 'پروپوزال تست',
//         title_english: 'Test Proposal',
//         submit_date: '1402/01/15',
//         approved_date: '1402/02/01',
//         execution_location: 'تهران',
//         execution_time: 6,
//         is_winner: true,
//         keywords: 'تست',
//         project_subject: 1,
//         project_subject_name: 'موضوع اول',
//         university: 1,
//         university_name: 'دانشگاه تهران',
//         primary_researcher: 1,
//         primary_researcher_name: 'علی احمدی',
//         company: null,
//         company_name: null,
//         rfp: 1,
//         rfp_code: 'RFP-001',
//         rfp_title: 'RFP اول',
//         rfp_year: 1402,
//         attachments: [],
//         created_at: '1402/01/01',
//         updated_at: '1402/01/01',
//       },
//     ];

//     // GET - proposals list
//     server.use(
//       http.get(`${BASE}/proposals/`, () => {
//         return HttpResponse.json({
//           count: mockProposals.length,
//           next: null,
//           previous: null,
//           total_pages: 1,
//           current_page: 1,
//           page_size: 10,
//           results: mockProposals,
//         });
//       })
//     );

//     // GET - stats
//     server.use(
//       http.get(`${BASE}/proposals/stats/`, () => {
//         return HttpResponse.json({
//           total: mockProposals.length,
//           winner_count: 1,
//           not_winner_count: 0,
//           total_by_rfp: [],
//           total_by_university: [],
//           by_year: [{ year: 1402, count: 1, winner_count: 1 }],
//         });
//       })
//     );

//     // POST - create
//     server.use(
//       http.post(`${BASE}/proposals/`, async ({ request }) => {
//         const formData = await request.formData();
//         const newProposal = {
//           id: mockProposals.length + 1,
//           code: String(formData.get('code') || 'PRO-NEW'),
//           title_farsi: String(formData.get('title_farsi') || ''),
//           title_english: String(formData.get('title_english') || ''),
//           submit_date: '1404/01/01',
//           approved_date: String(formData.get('approved_date') || ''),
//           execution_location: String(formData.get('execution_location') || ''),
//           execution_time: Number(formData.get('execution_time')) || 0,
//           is_winner: formData.get('is_winner') === 'true',
//           keywords: String(formData.get('keywords') || ''),
//           project_subject: 1,
//           project_subject_name: 'موضوع اول',
//           university: 1,
//           university_name: 'دانشگاه تهران',
//           primary_researcher: 1,
//           primary_researcher_name: 'علی احمدی',
//           company: null,
//           company_name: null,
//           rfp: 1,
//           rfp_code: 'RFP-001',
//           rfp_title: 'RFP اول',
//           rfp_year: 1404,
//           attachments: [],
//           created_at: '1404/01/01',
//           updated_at: '1404/01/01',
//         };
//         mockProposals.push(newProposal);
//         return HttpResponse.json(newProposal, { status: 201 });
//       })
//     );

//     // DELETE
//     server.use(
//       http.delete(`${BASE}/proposals/:id/`, ({ params }) => {
//         const id = Number(params.id);
//         mockProposals = mockProposals.filter((p) => p.id !== id);
//         return new HttpResponse(null, { status: 204 });
//       })
//     );
//   });

//   // ============================================================
//   // تست اصلی: ایجاد + مشاهده در لیست
//   // ============================================================
//   it('کاربر پروپوزال جدید ایجاد می‌کند و توی لیست می‌بیند', async () => {
//     render(<ProposalPage />, { wrapper: createWrapper() });

//     // ۱. منتظر لود شدن لیست
//     await waitFor(() => {
//       expect(screen.getByText('پروپوزال تست')).toBeInTheDocument();
//     });

//     expect(screen.getByText('PRO-001')).toBeInTheDocument();
//     expect(screen.queryByText('پروپوزال جدید')).not.toBeInTheDocument();

//     // ۲. کلیک روی دکمه افزودن
//     const addButton = screen.getByRole('button', { name: /افزودن پروپوزال/i });
//     await userEvent.click(addButton);

//     // ۳. منتظر باز شدن فرم
//     await waitFor(() => {
//       expect(screen.getByText('افزودن پروپوزال جدید')).toBeInTheDocument();
//     });

//     // ۴. پر کردن فرم
//     await userEvent.type(
//       screen.getByPlaceholderText('مثال: PRO-1402-001'),
//       'PRO-NEW'
//     );
//     await userEvent.type(
//       screen.getByPlaceholderText(/عنوان فارسی پروپوزال/),
//       'پروپوزال جدید'
//     );
//     await userEvent.type(
//       screen.getByPlaceholderText(/محل انجام پروژه/),
//       'اصفهان'
//     );
//     await userEvent.type(screen.getByPlaceholderText('مثال: 6'), '4');

//     // انتخاب‌ها
//     await userEvent.selectOptions(screen.getByTestId('project-subject-select'), '1');
//     await userEvent.selectOptions(screen.getByTestId('rfp-select'), '1');
//     await userEvent.selectOptions(screen.getByTestId('university-select'), '1');
//     await userEvent.selectOptions(screen.getByTestId('person-select'), '1');

//     // ۵. Submit
//     const submitButton = screen.getByRole('button', { name: /افزودن$/i });
//     await userEvent.click(submitButton);

//     // ۶. چک کردن زنجیره
//     await waitFor(() => {
//       expect(screen.queryByText('افزودن پروپوزال جدید')).not.toBeInTheDocument();
//     });

//     await waitFor(() => {
//       expect(toast.success).toHaveBeenCalledWith('پروپوزال با موفقیت اضافه شد');
//     });

//     await waitFor(() => {
//       expect(screen.getByText('پروپوزال جدید')).toBeInTheDocument();
//     });

//     expect(screen.getByText('پروپوزال تست')).toBeInTheDocument();
//   });

//   // ============================================================
//   // تست دوم: ایجاد + حذف
//   // ============================================================
//   it('کاربر پروپوزال ایجاد می‌کند، سپس آن را حذف می‌کند', async () => {
//     const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

//     render(<ProposalPage />, { wrapper: createWrapper() });

//     await waitFor(() => {
//       expect(screen.getByText('پروپوزال تست')).toBeInTheDocument();
//     });

//     // ایجاد
//     await userEvent.click(screen.getByRole('button', { name: /افزودن پروپوزال/i }));

//     await waitFor(() => {
//       expect(screen.getByText('افزودن پروپوزال جدید')).toBeInTheDocument();
//     });

//     await userEvent.type(
//       screen.getByPlaceholderText(/عنوان فارسی پروپوزال/),
//       'پروپوزال برای حذف'
//     );
//     await userEvent.type(screen.getByPlaceholderText(/محل انجام پروژه/), 'شیراز');
//     await userEvent.type(screen.getByPlaceholderText('مثال: 6'), '3');

//     await userEvent.selectOptions(screen.getByTestId('project-subject-select'), '1');
//     await userEvent.selectOptions(screen.getByTestId('rfp-select'), '1');
//     await userEvent.selectOptions(screen.getByTestId('university-select'), '1');
//     await userEvent.selectOptions(screen.getByTestId('person-select'), '1');

//     await userEvent.click(screen.getByRole('button', { name: /افزودن$/i }));

//     await waitFor(() => {
//       expect(screen.getByText('پروپوزال برای حذف')).toBeInTheDocument();
//     });

//     // حذف
//     const rows = screen.getAllByRole('row');
//     const newRow = rows.find((row) =>
//       within(row).queryByText('پروپوزال برای حذف')
//     );

//     expect(newRow).toBeDefined();

//     const deleteButton = within(newRow!).getByTitle('حذف');
//     await userEvent.click(deleteButton);

//     await waitFor(() => {
//       expect(screen.queryByText('پروپوزال برای حذف')).not.toBeInTheDocument();
//     });

//     expect(screen.getByText('پروپوزال تست')).toBeInTheDocument();

//     confirmSpy.mockRestore();
//   });
// });