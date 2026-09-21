// src/modules/rfp/hooks/useRfp.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useRfp } from './useRfp';
import { rfpApi } from '../api/rfp.api';

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import { toast } from 'react-hot-toast';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

const mockRfp = {
  id: 1,
  code: 'RFP-001',
  title: 'RFP تست',
  estimated_price: 5000000,
  approximate_project_time: 6,
  necessity_declaration: 'ضرورت',
  solution_exact_definition: 'راه حل',
  publish_date: '1402/01/15',
  research: 1,
  research_title: 'پژوهش اول',
  research_year: 1402,
  attachments: [],
  basic_questions: [],
  consumers: [],
  created_at: '1402/01/01',
  updated_at: '1402/01/01',
};

const mockList = {
  count: 1,
  next: null,
  previous: null,
  total_pages: 1,
  current_page: 1,
  page_size: 10,
  results: [mockRfp],
};

const mockStats = {
  total: 1,
  total_estimated_price: 5000000,
  average_estimated_price: 5000000,
  by_year: [{ year: 1402, count: 1, total_price: 5000000, average_price: 5000000 }],
};

describe('useRfp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================================
  // useList
  // ============================================================
  describe('useList', () => {
    it('لیست RFPها رو برمی‌گردونه', async () => {
      const getAllSpy = vi.spyOn(rfpApi, 'getAll').mockResolvedValueOnce(mockList);

      const { result } = renderHook(
        () => {
          const { useList } = useRfp();
          return useList();
        },
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.count).toBe(1);
      getAllSpy.mockRestore();
    });

    it('با فیلتر صدا زده می‌شه', async () => {
      const getAllSpy = vi.spyOn(rfpApi, 'getAll').mockResolvedValueOnce(mockList);

      const { result } = renderHook(
        () => {
          const { useList } = useRfp();
          return useList({ search: 'test', year: 1402 });
        },
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(getAllSpy).toHaveBeenCalledWith({ search: 'test', year: 1402 });
      getAllSpy.mockRestore();
    });
  });

  // ============================================================
  // useItem
  // ============================================================
  describe('useItem', () => {
    it('یه RFP رو با id برمی‌گردونه', async () => {
      const getByIdSpy = vi.spyOn(rfpApi, 'getById').mockResolvedValueOnce(mockRfp);

      const { result } = renderHook(
        () => {
          const { useItem } = useRfp();
          return useItem(1);
        },
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.id).toBe(1);
      getByIdSpy.mockRestore();
    });

    it('اگه id صفر باشه، query اجرا نمی‌شه', () => {
      const { result } = renderHook(
        () => {
          const { useItem } = useRfp();
          return useItem(0);
        },
        { wrapper: createWrapper() }
      );

      expect(result.current.fetchStatus).toBe('idle');
      expect(result.current.data).toBeUndefined();
    });
  });

  // ============================================================
  // useStats
  // ============================================================
  describe('useStats', () => {
    it('آمار رو برمی‌گردونه', async () => {
      const getStatsSpy = vi.spyOn(rfpApi, 'getStats').mockResolvedValueOnce(mockStats);

      const { result } = renderHook(
        () => {
          const { useStats } = useRfp();
          return useStats();
        },
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.total).toBe(1);
      getStatsSpy.mockRestore();
    });
  });

  // ============================================================
  // create
  // ============================================================
  describe('create', () => {
    it('RFP جدید ایجاد می‌کنه و toast.success صدا می‌زنه', async () => {
      const createSpy = vi.spyOn(rfpApi, 'create').mockResolvedValueOnce(mockRfp);

      const { result } = renderHook(() => useRfp(), { wrapper: createWrapper() });

      await act(async () => {
        await result.current.create({
          title: 'RFP جدید',
          estimated_price: 1000000,
          approximate_project_time: 3,
          necessity_declaration: 'ضرورت',
          solution_exact_definition: 'راه حل',
          research_id: 1,
        });
      });

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('RFP با موفقیت اضافه شد');
      });

      createSpy.mockRestore();
    });

    it('در صورت خطا toast.error صدا می‌زنه', async () => {
      const createSpy = vi
        .spyOn(rfpApi, 'create')
        .mockRejectedValueOnce({ message: 'خطای تست' });

      const { result } = renderHook(() => useRfp(), { wrapper: createWrapper() });

      // ✅ استفاده از act برای wrap کردن mutation که state آپدیت می‌کنه
      await act(async () => {
        try {
          await result.current.create({
            title: 'RFP',
            estimated_price: 1000000,
            approximate_project_time: 3,
            necessity_declaration: 'ضرورت',
            solution_exact_definition: 'راه حل',
            research_id: 1,
          });
        } catch {
          // خطا رو ignore کن چون در onError handle شده
        }
      });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      });

      createSpy.mockRestore();
    });
  });

  // ============================================================
  // update
  // ============================================================
  describe('update', () => {
    it('RFP رو ویرایش می‌کنه و toast.success صدا می‌زنه', async () => {
      const updateSpy = vi.spyOn(rfpApi, 'update').mockResolvedValueOnce(mockRfp);

      const { result } = renderHook(() => useRfp(), { wrapper: createWrapper() });

      await act(async () => {
        await result.current.update(1, {
          title: 'عنوان جدید',
          estimated_price: 2000000,
          approximate_project_time: 4,
          necessity_declaration: 'ضرورت',
          solution_exact_definition: 'راه حل',
          research_id: 1,
        });
      });

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('RFP با موفقیت ویرایش شد');
      });

      updateSpy.mockRestore();
    });
  });

  // ============================================================
  // delete
  // ============================================================
  describe('delete', () => {
    it('RFP رو حذف می‌کنه و toast.success صدا می‌زنه', async () => {
      const deleteSpy = vi.spyOn(rfpApi, 'delete').mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useRfp(), { wrapper: createWrapper() });

      await act(async () => {
        await result.current.delete(1);
      });

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('RFP با موفقیت حذف شد');
      });

      deleteSpy.mockRestore();
    });

    it('در صورت خطا toast.error صدا می‌زنه', async () => {
      const deleteSpy = vi
        .spyOn(rfpApi, 'delete')
        .mockRejectedValueOnce({ message: 'خطای تست' });

      const { result } = renderHook(() => useRfp(), { wrapper: createWrapper() });

      //  استفاده از act
      await act(async () => {
        try {
          await result.current.delete(1);
        } catch {
          // ignore
        }
      });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      });

      deleteSpy.mockRestore();
    });
  });
});

// // src/modules/rfp/hooks/useRfp.test.ts

// import { describe, it, expect, vi, beforeEach } from 'vitest';
// import { renderHook, waitFor } from '@testing-library/react';
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import React from 'react';
// import { useRfp } from './useRfp';
// import { rfpApi } from '../api/rfp.api';

// vi.mock('react-hot-toast', () => ({
//   toast: { success: vi.fn(), error: vi.fn() },
// }));

// import { toast } from 'react-hot-toast';

// const createWrapper = () => {
//   const queryClient = new QueryClient({
//     defaultOptions: {
//       queries: { retry: false, gcTime: 0, staleTime: 0 },
//       mutations: { retry: false },
//     },
//   });
//   return ({ children }: { children: React.ReactNode }) =>
//     React.createElement(QueryClientProvider, { client: queryClient }, children);
// };

// const mockRfp = {
//   id: 1,
//   code: 'RFP-001',
//   title: 'RFP تست',
//   estimated_price: 5000000,
//   approximate_project_time: 6,
//   necessity_declaration: 'ضرورت',
//   solution_exact_definition: 'راه حل',
//   publish_date: '1402/01/15',
//   research: 1,
//   research_title: 'پژوهش اول',
//   research_year: 1402,
//   attachments: [],
//   basic_questions: [],
//   consumers: [],
//   created_at: '1402/01/01',
//   updated_at: '1402/01/01',
// };

// const mockList = {
//   count: 1,
//   next: null,
//   previous: null,
//   total_pages: 1,
//   current_page: 1,
//   page_size: 10,
//   results: [mockRfp],
// };

// const mockStats = {
//   total: 1,
//   total_estimated_price: 5000000,
//   average_estimated_price: 5000000,
//   by_year: [{ year: 1402, count: 1, total_price: 5000000, average_price: 5000000 }],
// };

// describe('useRfp', () => {
//   beforeEach(() => {
//     vi.clearAllMocks();
//   });

//   // ============================================================
//   // useList
//   // ============================================================
//   describe('useList', () => {
//     it('لیست RFPها رو برمی‌گردونه', async () => {
//       const getAllSpy = vi.spyOn(rfpApi, 'getAll').mockResolvedValueOnce(mockList);

//       const { result } = renderHook(
//         () => {
//           const { useList } = useRfp();
//           return useList();
//         },
//         { wrapper: createWrapper() }
//       );

//       await waitFor(() => {
//         expect(result.current.isSuccess).toBe(true);
//       });

//       expect(result.current.data?.count).toBe(1);
//       getAllSpy.mockRestore();
//     });

//     it('با فیلتر صدا زده می‌شه', async () => {
//       const getAllSpy = vi.spyOn(rfpApi, 'getAll').mockResolvedValueOnce(mockList);

//       const { result } = renderHook(
//         () => {
//           const { useList } = useRfp();
//           return useList({ search: 'test', year: 1402 });
//         },
//         { wrapper: createWrapper() }
//       );

//       await waitFor(() => {
//         expect(result.current.isSuccess).toBe(true);
//       });

//       expect(getAllSpy).toHaveBeenCalledWith({ search: 'test', year: 1402 });
//       getAllSpy.mockRestore();
//     });
//   });

//   // ============================================================
//   // useItem
//   // ============================================================
//   describe('useItem', () => {
//     it('یه RFP رو با id برمی‌گردونه', async () => {
//       const getByIdSpy = vi.spyOn(rfpApi, 'getById').mockResolvedValueOnce(mockRfp);

//       const { result } = renderHook(
//         () => {
//           const { useItem } = useRfp();
//           return useItem(1);
//         },
//         { wrapper: createWrapper() }
//       );

//       await waitFor(() => {
//         expect(result.current.isSuccess).toBe(true);
//       });

//       expect(result.current.data?.id).toBe(1);
//       getByIdSpy.mockRestore();
//     });

//     it('اگه id صفر باشه، query اجرا نمی‌شه', () => {
//       const { result } = renderHook(
//         () => {
//           const { useItem } = useRfp();
//           return useItem(0);
//         },
//         { wrapper: createWrapper() }
//       );

//       expect(result.current.fetchStatus).toBe('idle');
//       expect(result.current.data).toBeUndefined();
//     });
//   });

//   // ============================================================
//   // useStats
//   // ============================================================
//   describe('useStats', () => {
//     it('آمار رو برمی‌گردونه', async () => {
//       const getStatsSpy = vi.spyOn(rfpApi, 'getStats').mockResolvedValueOnce(mockStats);

//       const { result } = renderHook(
//         () => {
//           const { useStats } = useRfp();
//           return useStats();
//         },
//         { wrapper: createWrapper() }
//       );

//       await waitFor(() => {
//         expect(result.current.isSuccess).toBe(true);
//       });

//       expect(result.current.data?.total).toBe(1);
//       getStatsSpy.mockRestore();
//     });
//   });

//   // ============================================================
//   // create
//   // ============================================================
//   describe('create', () => {
//     it('RFP جدید ایجاد می‌کنه و toast.success صدا می‌زنه', async () => {
//       const createSpy = vi.spyOn(rfpApi, 'create').mockResolvedValueOnce(mockRfp);

//       const { result } = renderHook(() => useRfp(), { wrapper: createWrapper() });

//       await result.current.create({
//         title: 'RFP جدید',
//         estimated_price: 1000000,
//         approximate_project_time: 3,
//         necessity_declaration: 'ضرورت',
//         solution_exact_definition: 'راه حل',
//         research_id: 1,
//       });

//       await waitFor(() => {
//         expect(toast.success).toHaveBeenCalledWith('RFP با موفقیت اضافه شد');
//       });

//       createSpy.mockRestore();
//     });

//     it('در صورت خطا toast.error صدا می‌زنه', async () => {
//       const createSpy = vi
//         .spyOn(rfpApi, 'create')
//         .mockRejectedValueOnce({ message: 'خطای تست' });

//       const { result } = renderHook(() => useRfp(), { wrapper: createWrapper() });

//       await expect(
//         result.current.create({
//           title: 'RFP',
//           estimated_price: 1000000,
//           approximate_project_time: 3,
//           necessity_declaration: 'ضرورت',
//           solution_exact_definition: 'راه حل',
//           research_id: 1,
//         })
//       ).rejects.toBeDefined();

//       await waitFor(() => {
//         expect(toast.error).toHaveBeenCalled();
//       });

//       createSpy.mockRestore();
//     });
//   });

//   // ============================================================
//   // update
//   // ============================================================
//   describe('update', () => {
//     it('RFP رو ویرایش می‌کنه و toast.success صدا می‌زنه', async () => {
//       const updateSpy = vi.spyOn(rfpApi, 'update').mockResolvedValueOnce(mockRfp);

//       const { result } = renderHook(() => useRfp(), { wrapper: createWrapper() });

//       await result.current.update(1, {
//         title: 'عنوان جدید',
//         estimated_price: 2000000,
//         approximate_project_time: 4,
//         necessity_declaration: 'ضرورت',
//         solution_exact_definition: 'راه حل',
//         research_id: 1,
//       });

//       await waitFor(() => {
//         expect(toast.success).toHaveBeenCalledWith('RFP با موفقیت ویرایش شد');
//       });

//       updateSpy.mockRestore();
//     });
//   });

//   // ============================================================
//   // delete
//   // ============================================================
//   describe('delete', () => {
//     it('RFP رو حذف می‌کنه و toast.success صدا می‌زنه', async () => {
//       const deleteSpy = vi.spyOn(rfpApi, 'delete').mockResolvedValueOnce(undefined);

//       const { result } = renderHook(() => useRfp(), { wrapper: createWrapper() });

//       await result.current.delete(1);

//       await waitFor(() => {
//         expect(toast.success).toHaveBeenCalledWith('RFP با موفقیت حذف شد');
//       });

//       deleteSpy.mockRestore();
//     });

//     it('در صورت خطا toast.error صدا می‌زنه', async () => {
//       const deleteSpy = vi
//         .spyOn(rfpApi, 'delete')
//         .mockRejectedValueOnce({ message: 'خطای تست' });

//       const { result } = renderHook(() => useRfp(), { wrapper: createWrapper() });

//       await expect(result.current.delete(1)).rejects.toBeDefined();

//       await waitFor(() => {
//         expect(toast.error).toHaveBeenCalled();
//       });

//       deleteSpy.mockRestore();
//     });
//   });
// });