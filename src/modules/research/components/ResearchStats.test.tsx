// src/modules/research/components/ResearchStats.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { ResearchStats } from './ResearchStats';

// ============================================================
// Mock: useResearch
// ============================================================
const mockUseStats = vi.fn();
const mockUseList = vi.fn();

vi.mock('../hooks/useResearch', () => ({
  useResearch: () => ({
    useStats: mockUseStats,
    useList: mockUseList,
  }),
}));

// ============================================================
// داده نمونه
// ============================================================
const mockStats = {
  total: 10,
  draft: 3,
  active: 4,
  completed: 3,
  by_status: {
    DRAFT: 3,
    IN_PROGRESS: 4,
    COMPLETED: 3,
  },
  by_year: {
    1402: 5,
    1403: 5,
  },
  by_affiliation: [
    { affiliation_type: 'UNIVERSITY', count: 6 },
    { affiliation_type: 'COMPANY', count: 4 },
  ],
};

const mockYearData = {
  results: [
    { id: 1, status: 'DRAFT', affiliation_type: 'UNIVERSITY' },
    { id: 2, status: 'DRAFT', affiliation_type: 'UNIVERSITY' },
    { id: 3, status: 'IN_PROGRESS', affiliation_type: 'COMPANY' },
    { id: 4, status: 'COMPLETED', affiliation_type: 'UNIVERSITY' },
    { id: 5, status: 'IN_PROGRESS', affiliation_type: 'COMPANY' },
  ],
};

// ============================================================
// Tests
// ============================================================
describe('ResearchStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseStats.mockReturnValue({
      data: mockStats,
      isLoading: false,
      isError: false,
    });

    mockUseList.mockReturnValue({
      data: mockYearData,
      isLoading: false,
    });
  });

  // ============================================================
  // رندر
  // ============================================================
  describe('رندر', () => {
    it('عنوان "آمار پژوهش‌ها" رو نشون می‌ده', () => {
      render(<ResearchStats />);
      expect(screen.getByText('آمار پژوهش‌ها')).toBeInTheDocument();
    });

   it('کارت‌های آمار اصلی رو نشون می‌ده', () => {
  render(<ResearchStats />);

  // ✅ چون سال پیش‌فرض انتخاب شده، label «پژوهش‌های سال X» هست
  expect(screen.getByText(/پژوهش‌های سال/)).toBeInTheDocument();

  // ✅ این متن‌ها ممکنه چند جا باشن، پس getAllByText
  expect(screen.getAllByText('پیش‌نویس').length).toBeGreaterThan(0);
  expect(screen.getAllByText('در حال اجرا').length).toBeGreaterThan(0);
  expect(screen.getAllByText('خاتمه یافته').length).toBeGreaterThan(0);
});

    it('توزیع بر اساس وضعیت رو نشون می‌ده', () => {
      render(<ResearchStats />);
      expect(screen.getByText('توزیع بر اساس وضعیت')).toBeInTheDocument();
    });

    it('توزیع بر اساس سال رو نشون می‌ده', () => {
      render(<ResearchStats />);
      expect(screen.getByText('توزیع بر اساس سال')).toBeInTheDocument();
    });

    it('توزیع بر اساس نوع همکار رو نشون می‌ده', () => {
      render(<ResearchStats />);
      expect(screen.getByText('توزیع بر اساس نوع همکار')).toBeInTheDocument();
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

      const { container } = render(<ResearchStats />);
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

      render(<ResearchStats />);
      expect(screen.getByText('خطا در دریافت آمار')).toBeInTheDocument();
    });
  });

  // ============================================================
  // انتخاب سال
  // ============================================================
  describe('انتخاب سال', () => {
    it('سال‌های موجود توی select هستن', async () => {
      render(<ResearchStats />);

      await waitFor(() => {
        const select = document.querySelector('.year-selector') as HTMLSelectElement;
        expect(select).toBeInTheDocument();
      });
    });

    it('تغییر سال، useList رو با year صدا می‌زنه', async () => {
      render(<ResearchStats />);

      await waitFor(() => {
        expect(screen.getByText('آمار پژوهش‌ها')).toBeInTheDocument();
      });

      const select = document.querySelector('.year-selector') as HTMLSelectElement;
      await userEvent.selectOptions(select, '1402');

      await waitFor(() => {
        expect(mockUseList).toHaveBeenCalled();
      });
    });

    it('گزینه «همه سال‌ها» وجود داره', () => {
      render(<ResearchStats />);

      const select = document.querySelector('.year-selector') as HTMLSelectElement;
      const options = Array.from(select.options).map((o) => o.text);
      expect(options).toContain('همه سال‌ها');
    });
  });

  // ============================================================
  // کلیک روی سال توی نمودار
  // ============================================================
  describe('کلیک روی سال توی نمودار', () => {
    it('کلیک روی یه سال، اون سال رو انتخاب می‌کنه', async () => {
      render(<ResearchStats />);

      await waitFor(() => {
        expect(screen.getByText('توزیع بر اساس سال')).toBeInTheDocument();
      });

      const yearItems = document.querySelectorAll('.year-stat-item');
      expect(yearItems.length).toBeGreaterThan(0);

      await userEvent.click(yearItems[0] as HTMLElement);

      await waitFor(() => {
        expect(mockUseList).toHaveBeenCalled();
      });
    });
  });

  // ============================================================
  // محاسبه آمار سال انتخاب‌شده
  // ============================================================
  describe('محاسبه آمار سال انتخاب‌شده', () => {
    it('وقتی سال انتخاب شده، total از yearlyStats میاد', async () => {
      render(<ResearchStats />);

      await waitFor(() => {
        const select = document.querySelector('.year-selector') as HTMLSelectElement;
        expect(select).toBeInTheDocument();
      });

      await waitFor(() => {
        const totalCards = screen.getAllByText(/پژوهش‌های سال/);
        expect(totalCards.length).toBeGreaterThan(0);
      });
    });
  });
});