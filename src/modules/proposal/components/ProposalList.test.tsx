// src/modules/proposal/components/ProposalList.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';
import { ProposalList } from './ProposalList';
import type { Proposal } from '../types/proposal.types';

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
// Mock: UniversitySelect
// ============================================================
vi.mock('../../university/components/UniversitySelect', () => ({
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
      ]
    ),
}));

// ============================================================
// Mock: RfpSelect
// ============================================================
vi.mock('../../rfp/components/RfpSelect', () => ({
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
// Mock: ProjectSubjectSelect
// ============================================================
vi.mock('../../project-subject/components/ProjectSubjectSelect', () => ({
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
// داده نمونه
// ============================================================
const mockProposal1: Proposal = {
  id: 1,
  code: 'PRO-001',
  title_farsi: 'پروپوزال اول',
  title_english: 'Proposal One',
  submit_date: '1402/01/15',
  approved_date: '1402/02/01',
  execution_location: 'تهران',
  execution_time: 6,
  is_winner: true,
  keywords: 'تست، پژوهش',
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
};

const mockProposal2: Proposal = {
  ...mockProposal1,
  id: 2,
  code: 'PRO-002',
  title_farsi: 'پروپوزال دوم',
  title_english: undefined,
  is_winner: false,
  execution_time: 3,
  approved_date: undefined,
  rfp_year: 1403,
};

const mockProposalsList = {
  count: 2,
  next: null,
  previous: null,
  total_pages: 1,
  current_page: 1,
  page_size: 10,
  results: [mockProposal1, mockProposal2],
};

const mockStats = {
  total: 2,
  winner_count: 1,
  not_winner_count: 1,
  total_by_rfp: [
    { rfp_id: 1, rfp_title: 'RFP اول', year: 1402, count: 1 },
    { rfp_id: 2, rfp_title: 'RFP دوم', year: 1403, count: 1 },
  ],
  total_by_university: [
    { university_id: 1, university_name: 'دانشگاه تهران', count: 2 },
  ],
  by_year: [
    { year: 1403, count: 1, winner_count: 0 },
    { year: 1402, count: 1, winner_count: 1 },
  ],
};

// ============================================================
// Mock: useProposal
// ============================================================
const mockUseList = vi.fn();
const mockUseStats = vi.fn();
const mockDelete = vi.fn();

vi.mock('../hooks/useProposal', () => ({
  useProposal: () => ({
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
describe('ProposalList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    mockDelete.mockReset();

    mockUseList.mockReturnValue({
      data: mockProposalsList,
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
      render(<ProposalList />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('پروپوزال‌ها')).toBeInTheDocument();
      });

      const badge = document.querySelector('.badge');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('2');
    });

    it('لیست پروپوزال‌ها رو نشون می‌ده', async () => {
      render(<ProposalList />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('پروپوزال اول')).toBeInTheDocument();
      });

      expect(screen.getByText('پروپوزال دوم')).toBeInTheDocument();
      expect(screen.getByText('PRO-001')).toBeInTheDocument();
      expect(screen.getByText('PRO-002')).toBeInTheDocument();
    });

    it('حالت بارگذاری', () => {
      mockUseList.mockReturnValue({
        data: undefined,
        isLoading: true,
        refetch: vi.fn(),
      });

      render(<ProposalList />, { wrapper: createWrapper() });

      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('حالت خالی', () => {
      mockUseList.mockReturnValue({
        data: { count: 0, results: [] },
        isLoading: false,
        refetch: vi.fn(),
      });

      render(<ProposalList />, { wrapper: createWrapper() });

      expect(screen.getByText('هنوز پروپوزالی ثبت نشده است')).toBeInTheDocument();
    });
  });

  // ============================================================
  // دکمه افزودن
  // ============================================================
  describe('دکمه افزودن', () => {
    it('onAdd رو صدا می‌زنه', async () => {
      const onAdd = vi.fn();
      render(<ProposalList onAdd={onAdd} />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('پروپوزال اول')).toBeInTheDocument();
      });

      const addButton = screen.getByRole('button', { name: /افزودن پروپوزال/i });
      await userEvent.click(addButton);

      expect(onAdd).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================================
  // دکمه مشاهده
  // ============================================================
  describe('دکمه مشاهده', () => {
    it('کلیک روی مشاهده، navigate به جزئیات می‌کنه', async () => {
      render(<ProposalList />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('پروپوزال اول')).toBeInTheDocument();
      });

      const viewButtons = screen.getAllByTitle('مشاهده');
      await userEvent.click(viewButtons[0]);

      expect(mockNavigate).toHaveBeenCalledWith('/proposal/1');
    });
  });

  // ============================================================
  // دکمه ویرایش
  // ============================================================
  describe('دکمه ویرایش', () => {
    it('onEdit رو با item صدا می‌زنه', async () => {
      const onEdit = vi.fn();
      render(<ProposalList onEdit={onEdit} />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('پروپوزال اول')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByTitle('ویرایش');
      await userEvent.click(editButtons[0]);

      expect(onEdit).toHaveBeenCalledTimes(1);
      expect(onEdit).toHaveBeenCalledWith(
        expect.objectContaining({ id: 1, title_farsi: 'پروپوزال اول' })
      );
    });
  });

  // ============================================================
  // دکمه حذف
  // ============================================================
  describe('دکمه حذف', () => {
    it('با تأیید، delete رو صدا می‌زنه', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

      render(<ProposalList />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('پروپوزال اول')).toBeInTheDocument();
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

      render(<ProposalList />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('پروپوزال اول')).toBeInTheDocument();
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
      render(<ProposalList />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('پروپوزال اول')).toBeInTheDocument();
      });

      expect(
        screen.getByPlaceholderText(/جستجو در عنوان فارسی/)
      ).toBeInTheDocument();
    });

    it('تایپ توی جستجو، input رو آپدیت می‌کنه', async () => {
      render(<ProposalList />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('پروپوزال اول')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/جستجو در عنوان فارسی/);
      await userEvent.type(searchInput, 'تست');

      expect(searchInput).toHaveValue('تست');
    });
  });

  // ============================================================
  // فیلتر
  // ============================================================
  describe('فیلتر', () => {
    it('دکمه فیلترها، پنل فیلتر رو باز می‌کنه', async () => {
      render(<ProposalList />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('پروپوزال اول')).toBeInTheDocument();
      });

      const filterButton = screen.getByRole('button', { name: /فیلترها/i });
      await userEvent.click(filterButton);

      await waitFor(() => {
        expect(screen.getByText('سال')).toBeInTheDocument();
      });

      // ✅ چک کردن وجود mock selectها
      expect(screen.getByTestId('university-select')).toBeInTheDocument();
      expect(screen.getByTestId('rfp-select')).toBeInTheDocument();
      expect(screen.getByTestId('project-subject-select')).toBeInTheDocument();
    });
  });
});