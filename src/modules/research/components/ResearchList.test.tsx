// src/modules/research/components/ResearchList.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';
import { ResearchList } from './ResearchList';
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
  };
});

// ============================================================
// Mock: react-hot-toast
// ============================================================
vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

// ============================================================
// ✅ Mock: formatter.utils
// ============================================================
vi.mock('@/utils/formatter.utils', () => ({
  formatCurrency: (n: any) => `${n} ریال`,
  toPersianNumber: (n: any) => String(n),
}));

// ============================================================
// ✅ Mock: PersonSelect
// ============================================================
vi.mock('../../person/components/PersonSelect', () => ({
  PersonSelect: ({ value, onChange, placeholder, label }: any) =>
    React.createElement(
      'div',
      { 'data-testid': 'person-select' },
      [
        React.createElement('label', { key: 'lbl' }, label || 'پژوهشگر'),
        React.createElement(
          'select',
          {
            key: 'sel',
            value: value || '',
            onChange: (e: any) => onChange(Number(e.target.value) || null),
            'data-testid': 'person-select-input',
            'aria-label': label || 'پژوهشگر اصلی',
          },
          [
            React.createElement('option', { key: '', value: '' }, placeholder || 'انتخاب...'),
            React.createElement('option', { key: 1, value: 1 }, 'علی احمدی'),
            React.createElement('option', { key: 2, value: 2 }, 'سارا رضایی'),
          ]
        ),
      ]
    ),
}));

// ============================================================
// ✅ Mock: UniversitySelect
// ============================================================
vi.mock('../../university/components/UniversitySelect', () => ({
  UniversitySelect: ({ value, onChange, placeholder }: any) =>
    React.createElement(
      'select',
      {
        value: value || '',
        onChange: (e: any) => onChange(Number(e.target.value) || null),
        'data-testid': 'university-select',
        'aria-label': 'دانشگاه',
      },
      [
        React.createElement('option', { key: '', value: '' }, placeholder || 'انتخاب دانشگاه...'),
        React.createElement('option', { key: 1, value: 1 }, 'دانشگاه تهران'),
      ]
    ),
}));

// ============================================================
// ✅ Mock: CompanySelect
// ============================================================
vi.mock('../../company/components/CompanySelect', () => ({
  CompanySelect: ({ value, onChange, placeholder }: any) =>
    React.createElement(
      'select',
      {
        value: value || '',
        onChange: (e: any) => onChange(Number(e.target.value) || null),
        'data-testid': 'company-select',
        'aria-label': 'شرکت',
      },
      [
        React.createElement('option', { key: '', value: '' }, placeholder || 'انتخاب شرکت...'),
        React.createElement('option', { key: 1, value: 1 }, 'شرکت اول'),
      ]
    ),
}));

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
// داده نمونه
// ============================================================
const mockResearch1: Research = {
  id: 1,
  code: 'R-001',
  title: 'پژوهش اول',
  description: 'توضیحات اول',
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

const mockResearch2: Research = {
  ...mockResearch1,
  id: 2,
  code: 'R-002',
  title: 'پژوهش دوم',
  status: 'IN_PROGRESS',
  primary_researcher_name: 'سارا رضایی',
  affiliation_type: 'COMPANY',
  university: null,
  university_name: null,
  company: 1,
  company_name: 'شرکت اول',
};

const mockResearchesList = {
  count: 2,
  next: null,
  previous: null,
  total_pages: 1,
  current_page: 1,
  page_size: 10,
  results: [mockResearch1, mockResearch2],
};

// ============================================================
// Mock: useResearch
// ============================================================
const mockUseList = vi.fn();
const mockUseStats = vi.fn();
const mockDelete = vi.fn();

vi.mock('../hooks/useResearch', () => ({
  useResearch: () => ({
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
describe('ResearchList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    mockDelete.mockReset();

    mockUseList.mockReturnValue({
      data: mockResearchesList,
      isLoading: false,
      refetch: vi.fn(),
    });

    mockUseStats.mockReturnValue({
      data: {
        total: 2,
        draft: 1,
        active: 1,
        completed: 0,
        by_status: { DRAFT: 1, IN_PROGRESS: 1, COMPLETED: 0 },
        by_year: { 1402: 2 },
        by_affiliation: [],
      },
      isLoading: false,
    });
  });

  // ============================================================
  // رندر
  // ============================================================
  describe('رندر', () => {
    it('عنوان و تعداد رو نشون می‌ده', async () => {
      render(<ResearchList />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('پژوهش‌ها')).toBeInTheDocument();
      });

      const badge = document.querySelector('.badge');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('2');
    });

    it('لیست پژوهش‌ها رو نشون می‌ده', async () => {
      render(<ResearchList />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('پژوهش اول')).toBeInTheDocument();
      });

      expect(screen.getByText('پژوهش دوم')).toBeInTheDocument();
      expect(screen.getByText('R-001')).toBeInTheDocument();
      expect(screen.getByText('R-002')).toBeInTheDocument();
    });

    it('حالت بارگذاری', () => {
      mockUseList.mockReturnValue({
        data: undefined,
        isLoading: true,
        refetch: vi.fn(),
      });

      render(<ResearchList />, { wrapper: createWrapper() });

      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('حالت خالی', () => {
      mockUseList.mockReturnValue({
        data: { count: 0, results: [] },
        isLoading: false,
        refetch: vi.fn(),
      });

      render(<ResearchList />, { wrapper: createWrapper() });

      expect(screen.getByText('هنوز پژوهشی ثبت نشده است')).toBeInTheDocument();
    });
  });

  // ============================================================
  // دکمه افزودن
  // ============================================================
  describe('دکمه افزودن', () => {
    it('onAdd رو صدا می‌زنه', async () => {
      const onAdd = vi.fn();
      render(<ResearchList onAdd={onAdd} />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('پژوهش اول')).toBeInTheDocument();
      });

      const addButton = screen.getByRole('button', { name: /افزودن پژوهش/i });
      await userEvent.click(addButton);

      expect(onAdd).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================================
  // دکمه مشاهده
  // ============================================================
  describe('دکمه مشاهده', () => {
    it('کلیک روی مشاهده، navigate به جزئیات می‌کنه', async () => {
      render(<ResearchList />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('پژوهش اول')).toBeInTheDocument();
      });

      const viewButtons = screen.getAllByTitle('مشاهده');
      await userEvent.click(viewButtons[0]);

      expect(mockNavigate).toHaveBeenCalledWith('/research/1');
    });
  });

  // ============================================================
  // دکمه ویرایش
  // ============================================================
  describe('دکمه ویرایش', () => {
    it('onEdit رو با item صدا می‌زنه', async () => {
      const onEdit = vi.fn();
      render(<ResearchList onEdit={onEdit} />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('پژوهش اول')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByTitle('ویرایش');
      await userEvent.click(editButtons[0]);

      expect(onEdit).toHaveBeenCalledTimes(1);
      expect(onEdit).toHaveBeenCalledWith(
        expect.objectContaining({ id: 1, title: 'پژوهش اول' })
      );
    });
  });

  // ============================================================
  // دکمه حذف
  // ============================================================
  describe('دکمه حذف', () => {
    it('با تأیید، delete رو صدا می‌زنه', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

      render(<ResearchList />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('پژوهش اول')).toBeInTheDocument();
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

      render(<ResearchList />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('پژوهش اول')).toBeInTheDocument();
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
      render(<ResearchList />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('پژوهش اول')).toBeInTheDocument();
      });

      expect(screen.getByPlaceholderText(/جستجو در کد/)).toBeInTheDocument();
    });

    it('تایپ توی جستجو، input رو آپدیت می‌کنه', async () => {
      render(<ResearchList />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('پژوهش اول')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/جستجو در کد/);
      await userEvent.type(searchInput, 'تست');

      expect(searchInput).toHaveValue('تست');
    });
  });

  // ============================================================
  // فیلتر
  // ============================================================
  describe('فیلتر', () => {
    it('دکمه فیلترها، پنل فیلتر رو باز می‌کنه', async () => {
      render(<ResearchList />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('پژوهش اول')).toBeInTheDocument();
      });

      const filterButton = screen.getByRole('button', { name: /فیلترها/i });
      await userEvent.click(filterButton);

      // ✅ حالا PersonSelect mock شده
      await waitFor(() => {
        expect(screen.getByTestId('person-select')).toBeInTheDocument();
      });

      // ✅ UniversitySelect هم mock شده
      expect(screen.getByTestId('university-select')).toBeInTheDocument();

      // ✅ CompanySelect هم mock شده
      expect(screen.getByTestId('company-select')).toBeInTheDocument();
    });
  });
});

// // src/modules/research/components/ResearchList.test.tsx

// import { describe, it, expect, vi, beforeEach } from 'vitest';
// import { render, screen, waitFor } from '@testing-library/react';
// import userEvent from '@testing-library/user-event';
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { BrowserRouter } from 'react-router-dom';
// import React from 'react';
// import { ResearchList } from './ResearchList';
// import type { Research } from '../types/research.types';

// // ============================================================
// // Mock: react-router-dom
// // ============================================================
// const mockNavigate = vi.fn();
// vi.mock('react-router-dom', async () => {
//   const actual = await vi.importActual('react-router-dom');
//   return {
//     ...actual,
//     useNavigate: () => mockNavigate,
//   };
// });

// // ============================================================
// // Mock: react-hot-toast
// // ============================================================
// vi.mock('react-hot-toast', () => ({
//   toast: {
//     success: vi.fn(),
//     error: vi.fn(),
//   },
// }));

// // ============================================================
// // ✅ Mock: formatter.utils
// // ============================================================
// // این mock باعث می‌شود toPersianNumber عدد را به فارسی تبدیل نکند
// // و تست‌ها بتوانند با اعداد انگلیسی چک کنند
// vi.mock('@/utils/formatter.utils', () => ({
//   formatCurrency: (n: any) => `${n} ریال`,
//   toPersianNumber: (n: any) => String(n),
// }));

// // ============================================================
// // Mock: JalaliDatePicker
// // ============================================================
// vi.mock('../../../components/JalaliDatePicker', () => ({
//   default: ({ value, onChange, placeholder, error, disabled, label }: any) => {
//     const uniqueId = label ? `jalali-${label}` : `jalali-${placeholder}`;
//     return React.createElement('input', {
//       type: 'text',
//       placeholder,
//       value: value || '',
//       onChange: (e: any) => onChange(e.target.value),
//       disabled,
//       'data-testid': uniqueId,
//       'data-error': error || '',
//       'data-label': label,
//     });
//   },
// }));

// // ============================================================
// // داده نمونه
// // ============================================================
// const mockResearch1: Research = {
//   id: 1,
//   code: 'R-001',
//   title: 'پژوهش اول',
//   description: 'توضیحات اول',
//   year: 1402,
//   status: 'DRAFT',
//   primary_researcher: 1,
//   primary_researcher_name: 'علی احمدی',
//   affiliation_type: 'UNIVERSITY',
//   university: 1,
//   university_name: 'دانشگاه تهران',
//   company: null,
//   company_name: null,
//   researchers: 'سارا رضایی',
//   budget: 1000000,
//   approve_date: '1402/01/15',
//   start_date: '1402/02/01',
//   end_date: '1402/12/29',
//   created_at: '1402/01/01',
//   updated_at: '1402/01/01',
//   attachments: [],
//   is_active: true,
// };

// const mockResearch2: Research = {
//   ...mockResearch1,
//   id: 2,
//   code: 'R-002',
//   title: 'پژوهش دوم',
//   status: 'IN_PROGRESS',
//   primary_researcher_name: 'سارا رضایی',
//   affiliation_type: 'COMPANY',
//   university: null,
//   university_name: null,
//   company: 1,
//   company_name: 'شرکت اول',
// };

// const mockResearchesList = {
//   count: 2,
//   next: null,
//   previous: null,
//   total_pages: 1,
//   current_page: 1,
//   page_size: 10,
//   results: [mockResearch1, mockResearch2],
// };

// // ============================================================
// // Mock: useResearch
// // ============================================================
// const mockUseList = vi.fn();
// const mockUseStats = vi.fn();
// const mockDelete = vi.fn();

// vi.mock('../hooks/useResearch', () => ({
//   useResearch: () => ({
//     useList: mockUseList,
//     useStats: mockUseStats,
//     delete: mockDelete,
//     isDeleting: false,
//   }),
// }));

// // ============================================================
// // Wrapper
// // ============================================================
// const createWrapper = () => {
//   const queryClient = new QueryClient({
//     defaultOptions: {
//       queries: { retry: false, gcTime: 0 },
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
// // Tests
// // ============================================================
// describe('ResearchList', () => {
//   beforeEach(() => {
//     vi.clearAllMocks();
//     mockNavigate.mockClear();
//     mockDelete.mockReset();

//     // mock پیش‌فرض useList
//     mockUseList.mockReturnValue({
//       data: mockResearchesList,
//       isLoading: false,
//       refetch: vi.fn(),
//     });

//     // mock پیش‌فرض useStats
//     mockUseStats.mockReturnValue({
//       data: {
//         total: 2,
//         draft: 1,
//         active: 1,
//         completed: 0,
//         by_status: { DRAFT: 1, IN_PROGRESS: 1, COMPLETED: 0 },
//         by_year: { 1402: 2 },
//         by_affiliation: [],
//       },
//       isLoading: false,
//     });
//   });

//   // ============================================================
//   // رندر
//   // ============================================================
//   describe('رندر', () => {
//     it('عنوان و تعداد رو نشون می‌ده', async () => {
//       render(<ResearchList />, { wrapper: createWrapper() });

//       await waitFor(() => {
//         expect(screen.getByText('پژوهش‌ها')).toBeInTheDocument();
//       });

//       // ✅ چون formatter.utils mock شده، عدد به صورت انگلیسی "2" است
//       const badge = document.querySelector('.badge');
//       expect(badge).toBeInTheDocument();
//       expect(badge).toHaveTextContent('2');
//     });

//     it('لیست پژوهش‌ها رو نشون می‌ده', async () => {
//       render(<ResearchList />, { wrapper: createWrapper() });

//       await waitFor(() => {
//         expect(screen.getByText('پژوهش اول')).toBeInTheDocument();
//       });

//       expect(screen.getByText('پژوهش دوم')).toBeInTheDocument();
//       expect(screen.getByText('R-001')).toBeInTheDocument();
//       expect(screen.getByText('R-002')).toBeInTheDocument();
//     });

//     it('حالت بارگذاری', () => {
//       mockUseList.mockReturnValue({
//         data: undefined,
//         isLoading: true,
//         refetch: vi.fn(),
//       });

//       render(<ResearchList />, { wrapper: createWrapper() });

//       expect(screen.getByRole('status')).toBeInTheDocument();
//     });

//     it('حالت خالی', () => {
//       mockUseList.mockReturnValue({
//         data: { count: 0, results: [] },
//         isLoading: false,
//         refetch: vi.fn(),
//       });

//       render(<ResearchList />, { wrapper: createWrapper() });

//       expect(screen.getByText('هنوز پژوهشی ثبت نشده است')).toBeInTheDocument();
//     });
//   });

//   // ============================================================
//   // دکمه افزودن
//   // ============================================================
//   describe('دکمه افزودن', () => {
//     it('onAdd رو صدا می‌زنه', async () => {
//       const onAdd = vi.fn();
//       render(<ResearchList onAdd={onAdd} />, { wrapper: createWrapper() });

//       await waitFor(() => {
//         expect(screen.getByText('پژوهش اول')).toBeInTheDocument();
//       });

//       const addButton = screen.getByRole('button', { name: /افزودن پژوهش/i });
//       await userEvent.click(addButton);

//       expect(onAdd).toHaveBeenCalledTimes(1);
//     });
//   });

//   // ============================================================
//   // دکمه مشاهده
//   // ============================================================
//   describe('دکمه مشاهده', () => {
//     it('کلیک روی مشاهده، navigate به جزئیات می‌کنه', async () => {
//       render(<ResearchList />, { wrapper: createWrapper() });

//       await waitFor(() => {
//         expect(screen.getByText('پژوهش اول')).toBeInTheDocument();
//       });

//       const viewButtons = screen.getAllByTitle('مشاهده');
//       await userEvent.click(viewButtons[0]);

//       expect(mockNavigate).toHaveBeenCalledWith('/research/1');
//     });
//   });

//   // ============================================================
//   // دکمه ویرایش
//   // ============================================================
//   describe('دکمه ویرایش', () => {
//     it('onEdit رو با item صدا می‌زنه', async () => {
//       const onEdit = vi.fn();
//       render(<ResearchList onEdit={onEdit} />, { wrapper: createWrapper() });

//       await waitFor(() => {
//         expect(screen.getByText('پژوهش اول')).toBeInTheDocument();
//       });

//       const editButtons = screen.getAllByTitle('ویرایش');
//       await userEvent.click(editButtons[0]);

//       expect(onEdit).toHaveBeenCalledTimes(1);
//       expect(onEdit).toHaveBeenCalledWith(
//         expect.objectContaining({ id: 1, title: 'پژوهش اول' })
//       );
//     });
//   });

//   // ============================================================
//   // دکمه حذف
//   // ============================================================
//   describe('دکمه حذف', () => {
//     it('با تأیید، delete رو صدا می‌زنه', async () => {
//       const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

//       render(<ResearchList />, { wrapper: createWrapper() });

//       await waitFor(() => {
//         expect(screen.getByText('پژوهش اول')).toBeInTheDocument();
//       });

//       const deleteButtons = screen.getAllByTitle('حذف');
//       await userEvent.click(deleteButtons[0]);

//       await waitFor(() => {
//         expect(confirmSpy).toHaveBeenCalled();
//       });

//       await waitFor(() => {
//         expect(mockDelete).toHaveBeenCalledWith(1);
//       });

//       confirmSpy.mockRestore();
//     });

//     it('بدون تأیید، delete صدا زده نمی‌شه', async () => {
//       const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

//       render(<ResearchList />, { wrapper: createWrapper() });

//       await waitFor(() => {
//         expect(screen.getByText('پژوهش اول')).toBeInTheDocument();
//       });

//       const deleteButtons = screen.getAllByTitle('حذف');
//       await userEvent.click(deleteButtons[0]);

//       expect(confirmSpy).toHaveBeenCalled();
//       expect(mockDelete).not.toHaveBeenCalled();

//       confirmSpy.mockRestore();
//     });
//   });

//   // ============================================================
//   // جستجو
//   // ============================================================
//   describe('جستجو', () => {
//     it('input جستجو وجود داره', async () => {
//       render(<ResearchList />, { wrapper: createWrapper() });

//       await waitFor(() => {
//         expect(screen.getByText('پژوهش اول')).toBeInTheDocument();
//       });

//       expect(screen.getByPlaceholderText(/جستجو در کد/)).toBeInTheDocument();
//     });

//     it('تایپ توی جستجو، input رو آپدیت می‌کنه', async () => {
//       render(<ResearchList />, { wrapper: createWrapper() });

//       await waitFor(() => {
//         expect(screen.getByText('پژوهش اول')).toBeInTheDocument();
//       });

//       const searchInput = screen.getByPlaceholderText(/جستجو در کد/);
//       await userEvent.type(searchInput, 'تست');

//       expect(searchInput).toHaveValue('تست');
//     });
//   });

//   // ============================================================
//   // فیلتر
//   // ============================================================
//   describe('فیلتر', () => {
//     it('دکمه فیلترها، پنل فیلتر رو باز می‌کنه', async () => {
//       render(<ResearchList />, { wrapper: createWrapper() });

//       await waitFor(() => {
//         expect(screen.getByText('پژوهش اول')).toBeInTheDocument();
//       });

//       const filterButton = screen.getByRole('button', { name: /فیلترها/i });
//       await userEvent.click(filterButton);

//       await waitFor(() => {
//         expect(screen.getByLabelText('وضعیت')).toBeInTheDocument();
//       });
//     });
//   });
// });

// // // src/modules/research/components/ResearchList.test.tsx

// // import { describe, it, expect, vi, beforeEach } from 'vitest';
// // import { render, screen, waitFor } from '@testing-library/react';
// // import userEvent from '@testing-library/user-event';
// // import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// // import { BrowserRouter } from 'react-router-dom';
// // import React from 'react';
// // import { ResearchList } from './ResearchList';
// // import type { Research } from '../types/research.types';

// // // ============================================================
// // // Mock: react-router-dom
// // // ============================================================
// // const mockNavigate = vi.fn();
// // vi.mock('react-router-dom', async () => {
// //   const actual = await vi.importActual('react-router-dom');
// //   return {
// //     ...actual,
// //     useNavigate: () => mockNavigate,
// //   };
// // });

// // // ============================================================
// // // Mock: react-hot-toast
// // // ============================================================
// // vi.mock('react-hot-toast', () => ({
// //   toast: {
// //     success: vi.fn(),
// //     error: vi.fn(),
// //   },
// // }));

// // // ============================================================
// // // Mock: JalaliDatePicker (چون ResearchList ازش استفاده نمی‌کنه
// // // ولی ممکنه از طریق DataTable یا ... لازم شه)
// // // ============================================================
// // vi.mock('../../../components/JalaliDatePicker', () => ({
// //   default: ({ value, onChange, placeholder, error, disabled, label }: any) => {
// //     const uniqueId = label ? `jalali-${label}` : `jalali-${placeholder}`;
// //     return React.createElement('input', {
// //       type: 'text',
// //       placeholder,
// //       value: value || '',
// //       onChange: (e: any) => onChange(e.target.value),
// //       disabled,
// //       'data-testid': uniqueId,
// //       'data-error': error || '',
// //       'data-label': label,
// //     });
// //   },
// // }));

// // // ============================================================
// // // داده نمونه
// // // ============================================================
// // const mockResearch1: Research = {
// //   id: 1,
// //   code: 'R-001',
// //   title: 'پژوهش اول',
// //   description: 'توضیحات اول',
// //   year: 1402,
// //   status: 'DRAFT',
// //   primary_researcher: 1,
// //   primary_researcher_name: 'علی احمدی',
// //   affiliation_type: 'UNIVERSITY',
// //   university: 1,
// //   university_name: 'دانشگاه تهران',
// //   company: null,
// //   company_name: null,
// //   researchers: 'سارا رضایی',
// //   budget: 1000000,
// //   approve_date: '1402/01/15',
// //   start_date: '1402/02/01',
// //   end_date: '1402/12/29',
// //   created_at: '1402/01/01',
// //   updated_at: '1402/01/01',
// //   attachments: [],
// //   is_active: true,
// // };

// // const mockResearch2: Research = {
// //   ...mockResearch1,
// //   id: 2,
// //   code: 'R-002',
// //   title: 'پژوهش دوم',
// //   status: 'IN_PROGRESS',
// //   primary_researcher_name: 'سارا رضایی',
// //   affiliation_type: 'COMPANY',
// //   university: null,
// //   university_name: null,
// //   company: 1,
// //   company_name: 'شرکت اول',
// // };

// // const mockResearchesList = {
// //   count: 2,
// //   next: null,
// //   previous: null,
// //   total_pages: 1,
// //   current_page: 1,
// //   page_size: 10,
// //   results: [mockResearch1, mockResearch2],
// // };

// // // ============================================================
// // // Mock: useResearch
// // // ============================================================
// // const mockUseList = vi.fn();
// // const mockDelete = vi.fn();

// // vi.mock('../hooks/useResearch', () => ({
// //   useResearch: () => ({
// //     useList: mockUseList,
// //     delete: mockDelete,
// //     isDeleting: false,
// //   }),
// // }));

// // // ============================================================
// // // Wrapper
// // // ============================================================
// // const createWrapper = () => {
// //   const queryClient = new QueryClient({
// //     defaultOptions: {
// //       queries: { retry: false, gcTime: 0 },
// //       mutations: { retry: false },
// //     },
// //   });

// //   return ({ children }: { children: React.ReactNode }) =>
// //     React.createElement(
// //       QueryClientProvider,
// //       { client: queryClient },
// //       React.createElement(BrowserRouter, null, children)
// //     );
// // };

// // // ============================================================
// // // Tests
// // // ============================================================
// // describe('ResearchList', () => {
// //   beforeEach(() => {
// //     vi.clearAllMocks();
// //     mockNavigate.mockClear();
// //     mockDelete.mockReset();

// //     // mock پیش‌فرض useList
// //     mockUseList.mockReturnValue({
// //       data: mockResearchesList,
// //       isLoading: false,
// //       refetch: vi.fn(),
// //     });
// //   });

// //   // ============================================================
// //   // رندر
// //   // ============================================================
// //   describe('رندر', () => {
// //     it('عنوان و تعداد رو نشون می‌ده', async () => {
// //       render(<ResearchList />, { wrapper: createWrapper() });

// //       await waitFor(() => {
// //         expect(screen.getByText('پژوهش‌ها')).toBeInTheDocument();
// //       });

// //       expect(screen.getByText('2')).toBeInTheDocument(); // badge
// //     });

// //     it('لیست پژوهش‌ها رو نشون می‌ده', async () => {
// //       render(<ResearchList />, { wrapper: createWrapper() });

// //       await waitFor(() => {
// //         expect(screen.getByText('پژوهش اول')).toBeInTheDocument();
// //       });

// //       expect(screen.getByText('پژوهش دوم')).toBeInTheDocument();
// //       expect(screen.getByText('R-001')).toBeInTheDocument();
// //       expect(screen.getByText('R-002')).toBeInTheDocument();
// //     });

// //     it('حالت بارگذاری', () => {
// //       mockUseList.mockReturnValue({
// //         data: undefined,
// //         isLoading: true,
// //         refetch: vi.fn(),
// //       });

// //       render(<ResearchList />, { wrapper: createWrapper() });

// //       // DataTable loading رو نشون می‌ده
// //       expect(screen.getByRole('status')).toBeInTheDocument();
// //     });

// //     it('حالت خالی', () => {
// //       mockUseList.mockReturnValue({
// //         data: { count: 0, results: [] },
// //         isLoading: false,
// //         refetch: vi.fn(),
// //       });

// //       render(<ResearchList />, { wrapper: createWrapper() });

// //       expect(screen.getByText('هنوز پژوهشی ثبت نشده است')).toBeInTheDocument();
// //     });
// //   });

// //   // ============================================================
// //   // دکمه افزودن
// //   // ============================================================
// //   describe('دکمه افزودن', () => {
// //     it('onAdd رو صدا می‌زنه', async () => {
// //       const onAdd = vi.fn();
// //       render(<ResearchList onAdd={onAdd} />, { wrapper: createWrapper() });

// //       await waitFor(() => {
// //         expect(screen.getByText('پژوهش اول')).toBeInTheDocument();
// //       });

// //       const addButton = screen.getByRole('button', { name: /افزودن پژوهش/i });
// //       await userEvent.click(addButton);

// //       expect(onAdd).toHaveBeenCalledTimes(1);
// //     });
// //   });

// //   // ============================================================
// //   // دکمه مشاهده
// //   // ============================================================
// //   describe('دکمه مشاهده', () => {
// //     it('کلیک روی مشاهده، navigate به جزئیات می‌کنه', async () => {
// //       render(<ResearchList />, { wrapper: createWrapper() });

// //       await waitFor(() => {
// //         expect(screen.getByText('پژوهش اول')).toBeInTheDocument();
// //       });

// //       const viewButtons = screen.getAllByTitle('مشاهده');
// //       await userEvent.click(viewButtons[0]);

// //       expect(mockNavigate).toHaveBeenCalledWith('/research/1');
// //     });
// //   });

// //   // ============================================================
// //   // دکمه ویرایش
// //   // ============================================================
// //   describe('دکمه ویرایش', () => {
// //     it('onEdit رو با item صدا می‌زنه', async () => {
// //       const onEdit = vi.fn();
// //       render(<ResearchList onEdit={onEdit} />, { wrapper: createWrapper() });

// //       await waitFor(() => {
// //         expect(screen.getByText('پژوهش اول')).toBeInTheDocument();
// //       });

// //       const editButtons = screen.getAllByTitle('ویرایش');
// //       await userEvent.click(editButtons[0]);

// //       expect(onEdit).toHaveBeenCalledTimes(1);
// //       expect(onEdit).toHaveBeenCalledWith(
// //         expect.objectContaining({ id: 1, title: 'پژوهش اول' })
// //       );
// //     });
// //   });

// //   // ============================================================
// //   // دکمه حذف
// //   // ============================================================
// //   describe('دکمه حذف', () => {
// //     it('با تأیید، delete رو صدا می‌زنه', async () => {
// //       const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

// //       render(<ResearchList />, { wrapper: createWrapper() });

// //       await waitFor(() => {
// //         expect(screen.getByText('پژوهش اول')).toBeInTheDocument();
// //       });

// //       const deleteButtons = screen.getAllByTitle('حذف');
// //       await userEvent.click(deleteButtons[0]);

// //       await waitFor(() => {
// //         expect(confirmSpy).toHaveBeenCalled();
// //       });

// //       await waitFor(() => {
// //         expect(mockDelete).toHaveBeenCalledWith(1);
// //       });

// //       confirmSpy.mockRestore();
// //     });

// //     it('بدون تأیید، delete صدا زده نمی‌شه', async () => {
// //       const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

// //       render(<ResearchList />, { wrapper: createWrapper() });

// //       await waitFor(() => {
// //         expect(screen.getByText('پژوهش اول')).toBeInTheDocument();
// //       });

// //       const deleteButtons = screen.getAllByTitle('حذف');
// //       await userEvent.click(deleteButtons[0]);

// //       expect(confirmSpy).toHaveBeenCalled();
// //       expect(mockDelete).not.toHaveBeenCalled();

// //       confirmSpy.mockRestore();
// //     });
// //   });

// //   // ============================================================
// //   // جستجو
// //   // ============================================================
// //   describe('جستجو', () => {
// //     it('input جستجو وجود داره', async () => {
// //       render(<ResearchList />, { wrapper: createWrapper() });

// //       await waitFor(() => {
// //         expect(screen.getByText('پژوهش اول')).toBeInTheDocument();
// //       });

// //       expect(screen.getByPlaceholderText(/جستجو در کد/)).toBeInTheDocument();
// //     });

// //     it('تایپ توی جستجو، input رو آپدیت می‌کنه', async () => {
// //       render(<ResearchList />, { wrapper: createWrapper() });

// //       await waitFor(() => {
// //         expect(screen.getByText('پژوهش اول')).toBeInTheDocument();
// //       });

// //       const searchInput = screen.getByPlaceholderText(/جستجو در کد/);
// //       await userEvent.type(searchInput, 'تست');

// //       expect(searchInput).toHaveValue('تست');
// //     });
// //   });

// //   // ============================================================
// //   // فیلتر
// //   // ============================================================
// // it('دکمه فیلترها، پنل فیلتر رو باز می‌کنه', async () => {
// //   render(<ResearchList />, { wrapper: createWrapper() });

// //   await waitFor(() => {
// //     expect(screen.getByText('پژوهش اول')).toBeInTheDocument();
// //   });

// //   const filterButton = screen.getByRole('button', { name: /فیلترها/i });
// //   await userEvent.click(filterButton);

// //   await waitFor(() => {
// //     // ✅ از getByRole با selector دقیق‌تر استفاده کن
// //     expect(screen.getByLabelText('وضعیت')).toBeInTheDocument();
// //   });
// // });


// // });