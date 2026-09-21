// src/modules/proposal/components/ProposalStats.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { ProposalStats } from './ProposalStats';

// ============================================================
// Mock: formatter.utils
// ============================================================
vi.mock('@/utils/formatter.utils', () => ({
  toPersianNumber: (n: any) => String(n),
  formatCurrency: (n: any) => `${n} ریال`,
}));

// ============================================================
// Mock: useProposal
// ============================================================
const mockUseStats = vi.fn();
const mockUseList = vi.fn();

vi.mock('../hooks/useProposal', () => ({
  useProposal: () => ({
    useStats: mockUseStats,
    useList: mockUseList,
  }),
}));

// ============================================================
// داده نمونه
// ============================================================
const mockStats = {
  total: 10,
  winner_count: 4,
  not_winner_count: 6,
  total_by_rfp: [
    { rfp_id: 1, rfp_title: 'RFP اول', year: 1402, count: 5 },
    { rfp_id: 2, rfp_title: 'RFP دوم', year: 1403, count: 5 },
  ],
  total_by_university: [
    { university_id: 1, university_name: 'دانشگاه تهران', count: 6 },
    { university_id: 2, university_name: 'دانشگاه شریف', count: 4 },
  ],
  by_year: [
    { year: 1403, count: 5, winner_count: 2 },
    { year: 1402, count: 5, winner_count: 2 },
  ],
};

// ============================================================
// Tests
// ============================================================
describe('ProposalStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseStats.mockReturnValue({
      data: mockStats,
      isLoading: false,
      isError: false,
    });
  });

  // ============================================================
  // رندر
  // ============================================================
  describe('رندر', () => {
    it('عنوان "آمار پروپوزال‌ها" رو نشون می‌ده', () => {
      render(<ProposalStats />);
      expect(screen.getByText('آمار پروپوزال‌ها')).toBeInTheDocument();
    });

    it('کارت‌های آمار اصلی رو نشون می‌ده', () => {
      render(<ProposalStats />);

      // ✅ چون سال پیش‌فرض انتخاب می‌شه، برچسب‌ها با سال نمایش داده می‌شن
      expect(screen.getByText(/کل پروپوزال/)).toBeInTheDocument();
      expect(screen.getAllByText(/برنده/).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/غیربرنده/).length).toBeGreaterThan(0);
      // ✅ اصلاح: به جای /تعداد RFP/ از الگوی درست استفاده کن
      expect(screen.getByText(/RFPهای مرتبط/)).toBeInTheDocument();
    });

    it('توزیع بر اساس سال رو نشون می‌ده', () => {
      render(<ProposalStats />);
      expect(screen.getByText('توزیع پروپوزال بر اساس سال')).toBeInTheDocument();
    });

    it('توزیع بر اساس RFP رو نشون می‌ده', () => {
      render(<ProposalStats />);
      expect(screen.getByText('توزیع پروپوزال بر اساس RFP')).toBeInTheDocument();
    });

    it('توزیع بر اساس دانشگاه رو نشون می‌ده', () => {
      render(<ProposalStats />);
      expect(screen.getByText('توزیع پروپوزال بر اساس دانشگاه')).toBeInTheDocument();
    });
  });

  // ============================================================
  // حالت بارگذاری
  // ============================================================
  describe('حالت بارگذاری', () => {
    it('وقتی isLoading باشه، skeleton نشون می‌ده', () => {
      mockUseStats.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
      });

      const { container } = render(<ProposalStats />);
      expect(container.querySelectorAll('.skeleton').length).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // حالت خطا
  // ============================================================
  describe('حالت خطا', () => {
    it('وقتی isError باشه، پیام خطا نشون می‌ده', () => {
      mockUseStats.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
      });

      render(<ProposalStats />);
      expect(screen.getByText('خطا در دریافت آمار')).toBeInTheDocument();
    });
  });

  // ============================================================
  // انتخاب سال
  // ============================================================
  describe('انتخاب سال', () => {
    it('سال‌های موجود توی select هستن', async () => {
      render(<ProposalStats />);

      await waitFor(() => {
        const select = document.querySelector('.year-selector') as HTMLSelectElement;
        expect(select).toBeInTheDocument();
      });
    });

    it('گزینه «همه سال‌ها» وجود داره', () => {
      render(<ProposalStats />);

      const select = document.querySelector('.year-selector') as HTMLSelectElement;
      const options = Array.from(select.options).map((o) => o.text);
      expect(options).toContain('همه سال‌ها');
    });

    it('تغییر سال، آمار رو آپدیت می‌کنه', async () => {
      render(<ProposalStats />);

      await waitFor(() => {
        expect(screen.getByText('آمار پروپوزال‌ها')).toBeInTheDocument();
      });

      const select = document.querySelector('.year-selector') as HTMLSelectElement;
      await userEvent.selectOptions(select, '1402');

      await waitFor(() => {
        expect(screen.getByText(/کل پروپوزال‌های سال 1402/)).toBeInTheDocument();
      });
    });
  });
});