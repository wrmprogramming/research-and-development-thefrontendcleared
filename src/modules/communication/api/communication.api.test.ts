// src/modules/communication/api/communication.api.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../../test/msw/server';
import { communicationApi } from './communication.api';
import {
  mockCommunication,
  mockCommunicationsList,
  mockStats,
} from '../../../test/msw/handlers';

const BASE = 'http://172.18.5.77:8000/api/v1';

describe('communicationApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================================
  // getAll
  // ============================================================
  describe('getAll', () => {
    it('لیست مکاتبات را بدون پارامتر برمی‌گرداند', async () => {
      const result = await communicationApi.getAll();
      expect(result.count).toBe(2);
      expect(result.results).toHaveLength(2);
      expect(result.results[0].title).toBe('مکاتبه تست');
    });

    it('پارامترهای خالی/undefined را حذف می‌کند', async () => {
      let receivedUrl = '';
      server.use(
        http.get(`${BASE}/communications/`, ({ request }) => {
          receivedUrl = request.url;
          return HttpResponse.json(mockCommunicationsList);
        })
      );

      await communicationApi.getAll({
        search: '',
        research: undefined,
        year: undefined,
        page: 1,
      });

      expect(receivedUrl).toContain('page=1');
      expect(receivedUrl).not.toContain('search=');
      expect(receivedUrl).not.toContain('research=');
      expect(receivedUrl).not.toContain('year=');
    });

    it('پارامترهای معتبر را ارسال می‌کند', async () => {
      let receivedUrl = '';
      server.use(
        http.get(`${BASE}/communications/`, ({ request }) => {
          receivedUrl = request.url;
          return HttpResponse.json(mockCommunicationsList);
        })
      );

      await communicationApi.getAll({
        search: 'test',
        research: 5,
        page: 2,
        page_size: 20,
      });

      expect(receivedUrl).toContain('search=test');
      expect(receivedUrl).toContain('research=5');
      expect(receivedUrl).toContain('page=2');
      expect(receivedUrl).toContain('page_size=20');
    });
  });

  // ============================================================
  // getById
  // ============================================================
  describe('getById', () => {
    it('مکاتبه را با id برمی‌گرداند', async () => {
      const result = await communicationApi.getById(1);
      expect(result.id).toBe(1);
      expect(result.title).toBe('مکاتبه تست');
    });

    it('در صورت 404 خطا پرتاب می‌کند', async () => {
      await expect(communicationApi.getById(999)).rejects.toMatchObject({
        status: 404,
      });
    });
  });

  // ============================================================
  // create
  // ============================================================
  describe('create', () => {
    it('مکاتبه جدید را با داده‌های متنی ایجاد می‌کند', async () => {
      const result = await communicationApi.create({
        title: 'مکاتبه جدید',
        sender: 'الف',
        receiver: 'ب',
        date: '2024-01-01',
        research_id: 1,
      });

      expect(result.id).toBe(99);
      expect(result.title).toBe('مکاتبه جدید');
    });

    // it('فایل attachment را در FormData قرار می‌دهد', async () => {
    //   const file = new File(['hello'], 'test.pdf', { type: 'application/pdf' });

    //   // ✅ spy روی FormData.append تا ببینیم کد چی append می‌کنه
    //   const appendSpy = vi.spyOn(FormData.prototype, 'append');

    //   server.use(
    //     http.post(`${BASE}/communications/`, () => {
    //       return HttpResponse.json(
    //         { ...mockCommunication, id: 100 },
    //         { status: 201 }
    //       );
    //     })
    //   );

    //   await communicationApi.create({
    //     title: 'تست فایل',
    //     sender: 'الف',
    //     receiver: 'ب',
    //     date: '2024-01-01',
    //     research_id: 1,
    //     attachment: file,
    //   });

    //   // چک کن append با کلید 'attachment' و مقدار File صدا زده شده
    //   const attachmentCall = appendSpy.mock.calls.find(
    //     (call) => call[0] === 'attachment'
    //   );

    //   expect(attachmentCall).toBeDefined();
    //   expect(attachmentCall![1]).toBeInstanceOf(File);
    //   expect((attachmentCall![1] as File).name).toBe('test.pdf');

    //   appendSpy.mockRestore();
    // });

    it('attachment خالی (null) را به صورت رشته خالی می‌فرستد', async () => {
      let receivedFormData: FormData | null = null;

      server.use(
        http.post(`${BASE}/communications/`, async ({ request }) => {
          receivedFormData = await request.formData();
          return HttpResponse.json({ ...mockCommunication }, { status: 201 });
        })
      );

      await communicationApi.create({
        title: 'تست حذف فایل',
        sender: 'الف',
        receiver: 'ب',
        date: '2024-01-01',
        research_id: 1,
        attachment: null,
      });

      expect(receivedFormData!.get('attachment')).toBe('');
    });
  });

  // ============================================================
  // update
  // ============================================================
  describe('update', () => {
    it('مکاتبه را ویرایش می‌کند', async () => {
      const result = await communicationApi.update(1, {
        title: 'عنوان ویرایش‌شده',
        sender: 'الف',
        receiver: 'ب',
        date: '2024-01-01',
        research_id: 1,
      });

      expect(result.id).toBe(1);
      expect(result.title).toBe('عنوان ویرایش‌شده');
    });
  });

  // ============================================================
  // delete
  // ============================================================
  describe('delete', () => {
    it('مکاتبه را حذف می‌کند', async () => {
      await expect(communicationApi.delete(1)).resolves.toBeUndefined();
    });

    it('در صورت خطای سرور، reject می‌کند', async () => {
      server.use(
        http.delete(`${BASE}/communications/:id/`, () => {
          return new HttpResponse(null, { status: 500 });
        })
      );

      await expect(communicationApi.delete(1)).rejects.toMatchObject({
        status: 500,
      });
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('آمار را بدون سال برمی‌گرداند', async () => {
      // ✅ صریحاً handler رو ست کن تا از override قبلی مطمئن شیم
      server.use(
        http.get(`${BASE}/communications/stats/`, () => {
          return HttpResponse.json(mockStats);
        })
      );

      const result = await communicationApi.getStats();
      expect(result.total).toBe(2);
      expect(result.total_with_research).toBe(2);
      expect(result.available_years).toEqual([1402]);
    });

    it('آمار را با فیلتر سال برمی‌گرداند', async () => {
      let receivedUrl = '';
      server.use(
        http.get(`${BASE}/communications/stats/`, ({ request }) => {
          receivedUrl = request.url;
          return HttpResponse.json(mockStats);
        })
      );

      await communicationApi.getStats(1402);
      expect(receivedUrl).toContain('year=1402');
    });
  });
});