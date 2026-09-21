// src/modules/research/api/research.api.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../../test/msw/server';
import { researchApi } from './research.api';

const BASE = 'http://172.18.5.77:8000/api/v1';

// ============================================================
// داده نمونه
// ============================================================
const mockResearch = {
  id: 1,
  code: 'R-001',
  title: 'پژوهش تست',
  description: 'توضیحات تست',
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

const mockResearchesList = {
  count: 2,
  next: null,
  previous: null,
  total_pages: 1,
  current_page: 1,
  page_size: 10,
  results: [
    mockResearch,
    { ...mockResearch, id: 2, code: 'R-002', title: 'پژوهش دوم' },
  ],
};

const mockStats = {
  total: 2,
  draft: 1,
  active: 1,
  completed: 0,
  by_status: { DRAFT: 1, IN_PROGRESS: 1, COMPLETED: 0 },
  by_year: { 1402: 2 },
  by_affiliation: [
    { affiliation_type: 'UNIVERSITY', count: 1 },
    { affiliation_type: 'COMPANY', count: 1 },
  ],
};

// ============================================================
// Tests
// ============================================================
describe('researchApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================================
  // getAll
  // ============================================================
  describe('getAll', () => {
    it('لیست پژوهش‌ها رو برمی‌گردونه', async () => {
      server.use(
        http.get(`${BASE}/researches/`, () => {
          return HttpResponse.json(mockResearchesList);
        })
      );

      const result = await researchApi.getAll();
      expect(result.count).toBe(2);
      expect(result.results).toHaveLength(2);
    });

    it('پارامترها رو ارسال می‌کنه', async () => {
      let receivedUrl = '';
      server.use(
        http.get(`${BASE}/researches/`, ({ request }) => {
          receivedUrl = request.url;
          return HttpResponse.json(mockResearchesList);
        })
      );

      await researchApi.getAll({ search: 'test', year: 1402, page: 2 });

      expect(receivedUrl).toContain('search=test');
      expect(receivedUrl).toContain('year=1402');
      expect(receivedUrl).toContain('page=2');
    });
  });

  // ============================================================
  // getById
  // ============================================================
  describe('getById', () => {
    it('پژوهش رو با id برمی‌گردونه', async () => {
      server.use(
        http.get(`${BASE}/researches/1/`, () => {
          return HttpResponse.json(mockResearch);
        })
      );

      const result = await researchApi.getById(1);
      expect(result.id).toBe(1);
      expect(result.code).toBe('R-001');
    });

    it('در صورت 404 خطا پرتاب می‌کنه', async () => {
      server.use(
        http.get(`${BASE}/researches/999/`, () => {
          return new HttpResponse(null, { status: 404 });
        })
      );

      await expect(researchApi.getById(999)).rejects.toMatchObject({
        status: 404,
      });
    });
  });

  // ============================================================
  // create
  // ============================================================
  describe('create', () => {
    it('پژوهش جدید رو ایجاد می‌کنه', async () => {
      server.use(
        http.post(`${BASE}/researches/`, () => {
          return HttpResponse.json({ ...mockResearch, id: 99 }, { status: 201 });
        })
      );

      const result = await researchApi.create({
        title: 'پژوهش جدید',
        status: 'DRAFT',
        primary_researcher_id: 1,
        affiliation_type: 'UNIVERSITY',
        university_id: 1,
      });

      expect(result.id).toBe(99);
    });

    // ✅ بدون server.use - فقط spy
    it('attachment_files رو به FormData اضافه می‌کنه', async () => {
      const file = new File(['hello'], 'test.pdf', { type: 'application/pdf' });

      // ✅ spy روی FormData.append
      const appendSpy = vi.spyOn(FormData.prototype, 'append');

      // ✅ mock axiosClient.post که درخواست نره
      const { axiosClient } = await import('../../../api/client/axiosClient');
      const postSpy = vi
        .spyOn(axiosClient, 'post')
        .mockResolvedValueOnce({ ...mockResearch, id: 100 } as any);

      await researchApi.create({
        title: 'تست فایل',
        status: 'DRAFT',
        primary_researcher_id: 1,
        affiliation_type: 'UNIVERSITY',
        university_id: 1,
        attachment_files: [file],
      });

      // ✅ چک کن append با کلید 'attachment_files' صدا زده شده
      const attachmentCall = appendSpy.mock.calls.find(
        (call) => call[0] === 'attachment_files'
      );

      expect(attachmentCall).toBeDefined();
      expect(attachmentCall![1]).toBeInstanceOf(File);
      expect((attachmentCall![1] as File).name).toBe('test.pdf');

      appendSpy.mockRestore();
      postSpy.mockRestore();
    });

    it('deleted_attachment_ids رو به FormData اضافه می‌کنه', async () => {
      const appendSpy = vi.spyOn(FormData.prototype, 'append');

      const { axiosClient } = await import('../../../api/client/axiosClient');
      const postSpy = vi
        .spyOn(axiosClient, 'post')
        .mockResolvedValueOnce({ ...mockResearch } as any);

      await researchApi.create({
        title: 'تست حذف',
        status: 'DRAFT',
        primary_researcher_id: 1,
        affiliation_type: 'UNIVERSITY',
        university_id: 1,
        deleted_attachment_ids: [5, 10],
      });

      const deletedCalls = appendSpy.mock.calls.filter(
        (call) => call[0] === 'deleted_attachment_ids'
      );

      expect(deletedCalls).toHaveLength(2);
      expect(deletedCalls[0][1]).toBe('5');
      expect(deletedCalls[1][1]).toBe('10');

      appendSpy.mockRestore();
      postSpy.mockRestore();
    });

    it('تاریخ‌های خالی رو به رشته خالی تبدیل می‌کنه', async () => {
      let receivedFormData: FormData | null = null;

      server.use(
        http.post(`${BASE}/researches/`, async ({ request }) => {
          receivedFormData = await request.formData();
          return HttpResponse.json({ ...mockResearch }, { status: 201 });
        })
      );

      await researchApi.create({
        title: 'تست',
        status: 'DRAFT',
        primary_researcher_id: 1,
        affiliation_type: 'UNIVERSITY',
        university_id: 1,
        approve_date: '',
        start_date: null as any,
        end_date: undefined,
      });

      expect(receivedFormData!.get('approve_date')).toBe('');
      expect(receivedFormData!.get('start_date')).toBe('');
      expect(receivedFormData!.get('end_date')).toBe('');
    });
  });

  // ============================================================
  // update
  // ============================================================
  describe('update', () => {
    it('پژوهش رو ویرایش می‌کنه', async () => {
      server.use(
        http.put(`${BASE}/researches/1/`, () => {
          return HttpResponse.json({ ...mockResearch, title: 'عنوان جدید' });
        })
      );

      const result = await researchApi.update(1, {
        title: 'عنوان جدید',
        status: 'DRAFT',
        primary_researcher_id: 1,
        affiliation_type: 'UNIVERSITY',
        university_id: 1,
      });

      expect(result.title).toBe('عنوان جدید');
    });
  });

  // ============================================================
  // delete
  // ============================================================
  describe('delete', () => {
    it('پژوهش رو حذف می‌کنه', async () => {
      server.use(
        http.delete(`${BASE}/researches/1/`, () => {
          return new HttpResponse(null, { status: 204 });
        })
      );

      await expect(researchApi.delete(1)).resolves.toBeUndefined();
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('آمار رو برمی‌گردونه', async () => {
      server.use(
        http.get(`${BASE}/researches/stats/`, () => {
          return HttpResponse.json(mockStats);
        })
      );

      const result = await researchApi.getStats();
      expect(result.total).toBe(2);
      expect(result.draft).toBe(1);
      expect(result.active).toBe(1);
    });
  });
});