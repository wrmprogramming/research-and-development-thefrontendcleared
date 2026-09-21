// src/modules/research/components/ResearchSelect.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { ResearchSelect } from './ResearchSelect';

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const mockResearch1 = { id: 1, code: 'R-001', title: 'پژوهش اول' };
const mockResearch2 = { id: 2, code: 'R-002', title: 'پژوهش دوم' };
const mockResearch3 = { id: 3, code: 'R-003', title: 'پژوهش سوم' };

const mockUseList = vi.fn();
const mockUseItem = vi.fn();

vi.mock('../hooks/useResearch', () => ({
  useResearch: () => ({
    useList: mockUseList,
    useItem: mockUseItem,
  }),
}));

describe('ResearchSelect', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseList.mockReturnValue({
      data: {
        count: 3,
        results: [mockResearch1, mockResearch2, mockResearch3],
      },
      isLoading: false,
    });

    mockUseItem.mockReturnValue({ data: undefined });
  });

  describe('رندر', () => {
    it('placeholder رو نشون می‌ده وقتی value نداره', () => {
      render(<ResearchSelect value={null} onChange={vi.fn()} />);
      expect(screen.getByText('انتخاب پژوهش...')).toBeInTheDocument();
    });

    it('placeholder سفارشی رو نشون می‌ده', () => {
      render(
        <ResearchSelect value={null} onChange={vi.fn()} placeholder="یه پژوهش انتخاب کن..." />
      );
      expect(screen.getByText('یه پژوهش انتخاب کن...')).toBeInTheDocument();
    });

    it('وقتی value داره، عنوان پژوهش رو نشون می‌ده', () => {
      render(<ResearchSelect value={1} onChange={vi.fn()} />);
      expect(screen.getByText('R-001')).toBeInTheDocument();
      expect(screen.getByText('پژوهش اول')).toBeInTheDocument();
    });
  });

  describe('باز کردن dropdown', () => {
    it('کلیک روی select-control، dropdown رو باز می‌کنه', async () => {
      render(<ResearchSelect value={null} onChange={vi.fn()} />);

      const control = document.querySelector('.select-control') as HTMLElement;
      await userEvent.click(control);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/جستجو در کد یا عنوان/)).toBeInTheDocument();
      });

      expect(screen.getByText('پژوهش اول')).toBeInTheDocument();
      expect(screen.getByText('پژوهش دوم')).toBeInTheDocument();
      expect(screen.getByText('پژوهش سوم')).toBeInTheDocument();
    });

    it('وقتی disabled هست، dropdown باز نمی‌شه', async () => {
      render(<ResearchSelect value={null} onChange={vi.fn()} disabled={true} />);

      const control = document.querySelector('.select-control') as HTMLElement;
      await userEvent.click(control);

      expect(screen.queryByPlaceholderText(/جستجو در کد یا عنوان/)).not.toBeInTheDocument();
    });

    it('وقتی isLoading هست، dropdown باز نمی‌شه', async () => {
      mockUseList.mockReturnValue({ data: undefined, isLoading: true });

      render(<ResearchSelect value={null} onChange={vi.fn()} />);

      const control = document.querySelector('.select-control') as HTMLElement;
      await userEvent.click(control);

      expect(screen.queryByPlaceholderText(/جستجو در کد یا عنوان/)).not.toBeInTheDocument();
    });
  });

  describe('انتخاب پژوهش', () => {
    it('کلیک روی یه پژوهش، onChange رو با id صدا می‌زنه', async () => {
      const onChange = vi.fn();
      render(<ResearchSelect value={null} onChange={onChange} />);

      const control = document.querySelector('.select-control') as HTMLElement;
      await userEvent.click(control);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/جستجو در کد یا عنوان/)).toBeInTheDocument();
      });

      const dropdownItems = document.querySelectorAll('.dropdown-item');
      await userEvent.click(dropdownItems[1] as HTMLElement);

      expect(onChange).toHaveBeenCalledWith(2);
    });

    it('کلیک روی پژوهش انتخاب‌شده فعلی، onChange رو با null صدا می‌زنه', async () => {
      const onChange = vi.fn();
      render(<ResearchSelect value={1} onChange={onChange} />);

      const control = document.querySelector('.select-control') as HTMLElement;
      await userEvent.click(control);

      await waitFor(() => {
        const items = document.querySelectorAll('.dropdown-item');
        expect(items.length).toBeGreaterThan(0);
      });

      const dropdownItems = document.querySelectorAll('.dropdown-item');
      await userEvent.click(dropdownItems[0] as HTMLElement);

      expect(onChange).toHaveBeenCalledWith(null);
    });
  });

  describe('دکمه پاک کردن', () => {
    it('وقتی value داره، دکمه clear نمایش داده می‌شه', () => {
      render(<ResearchSelect value={1} onChange={vi.fn()} />);
      expect(document.querySelector('.clear-btn')).toBeInTheDocument();
    });

    it('وقتی value نداره، دکمه clear نمایش داده نمی‌شه', () => {
      render(<ResearchSelect value={null} onChange={vi.fn()} />);
      expect(document.querySelector('.clear-btn')).not.toBeInTheDocument();
    });

    it('کلیک روی clear، onChange رو با null صدا می‌زنه', async () => {
      const onChange = vi.fn();
      render(<ResearchSelect value={1} onChange={onChange} />);

      const clearBtn = document.querySelector('.clear-btn') as HTMLElement;
      await userEvent.click(clearBtn);

      expect(onChange).toHaveBeenCalledWith(null);
    });
  });

  describe('جستجو', () => {
    it('تایپ توی search، لیست رو فیلتر می‌کنه', async () => {
      render(<ResearchSelect value={null} onChange={vi.fn()} />);

      const control = document.querySelector('.select-control') as HTMLElement;
      await userEvent.click(control);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/جستجو در کد یا عنوان/)).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/جستجو در کد یا عنوان/);
      await userEvent.type(searchInput, 'دوم');

      await waitFor(() => {
        expect(screen.queryByText('پژوهش اول')).not.toBeInTheDocument();
        expect(screen.getByText('پژوهش دوم')).toBeInTheDocument();
        expect(screen.queryByText('پژوهش سوم')).not.toBeInTheDocument();
      });
    });

    it('جستجو بر اساس کد', async () => {
      render(<ResearchSelect value={null} onChange={vi.fn()} />);

      const control = document.querySelector('.select-control') as HTMLElement;
      await userEvent.click(control);

      const searchInput = screen.getByPlaceholderText(/جستجو در کد یا عنوان/);
      await userEvent.type(searchInput, 'R-003');

      await waitFor(() => {
        expect(screen.queryByText('پژوهش اول')).not.toBeInTheDocument();
        expect(screen.queryByText('پژوهش دوم')).not.toBeInTheDocument();
        expect(screen.getByText('پژوهش سوم')).toBeInTheDocument();
      });
    });

    it('اگه نتیجه‌ای نباشه، پیام خالی نشون می‌ده', async () => {
      render(<ResearchSelect value={null} onChange={vi.fn()} />);

      const control = document.querySelector('.select-control') as HTMLElement;
      await userEvent.click(control);

      const searchInput = screen.getByPlaceholderText(/جستجو در کد یا عنوان/);
      await userEvent.type(searchInput, 'xyz');

      await waitFor(() => {
        expect(screen.getByText('نتیجه‌ای یافت نشد')).toBeInTheDocument();
      });
    });
  });

  describe('لیست خالی', () => {
    it('اگه پژوهش‌ها خالی باشن، پیام خالی نشون می‌ده', async () => {
      mockUseList.mockReturnValue({
        data: { count: 0, results: [] },
        isLoading: false,
      });

      render(<ResearchSelect value={null} onChange={vi.fn()} />);

      const control = document.querySelector('.select-control') as HTMLElement;
      await userEvent.click(control);

      await waitFor(() => {
        expect(screen.getByText('نتیجه‌ای یافت نشد')).toBeInTheDocument();
      });
    });
  });

  describe('حالت بارگذاری', () => {
    it('اگه isLoading باشه، placeholder نشون می‌ده', () => {
      mockUseList.mockReturnValue({ data: undefined, isLoading: true });

      render(<ResearchSelect value={null} onChange={vi.fn()} />);

      expect(screen.getByText('انتخاب پژوهش...')).toBeInTheDocument();
    });
  });

  describe('selectedItem از useItem', () => {
    it('اگه value یه پژوهش باشه که توی لیست نیست، از useItem میاد', () => {
      const mockResearch4 = { id: 4, code: 'R-004', title: 'پژوهش چهارم' };
      mockUseItem.mockReturnValue({ data: mockResearch4 });

      render(<ResearchSelect value={4} onChange={vi.fn()} />);

      expect(screen.getByText('R-004')).toBeInTheDocument();
      expect(screen.getByText('پژوهش چهارم')).toBeInTheDocument();
    });
  });
});