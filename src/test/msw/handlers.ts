// src/test/msw/handlers.ts

import { http, HttpResponse } from 'msw';

const BASE = 'http://172.18.5.77:8000/api/v1';

// ============================================================
// داده‌های نمونه
// ============================================================
export const mockCommunication = {
  id: 1,
  letter_number: '1402/001',
  title: 'مکاتبه تست',
  description: 'توضیحات تست',
  sender: 'احمد احمدی',
  receiver: 'رضا رضایی',
  date: '1402/01/15',
  send_receive_date: '1402/01/20',
  attachment: null,
  letter_file: null,
  research: 1,
  research_code: 'R-001',
  research_title: 'پژوهش تست',
  created_at: '1402/01/15',
  updated_at: '1402/01/15',
};

export const mockCommunicationsList = {
  count: 2,
  next: null,
  previous: null,
  total_pages: 1,
  current_page: 1,
  page_size: 10,
  results: [
    mockCommunication,
    {
      ...mockCommunication,
      id: 2,
      letter_number: '1402/002',
      title: 'مکاتبه دوم',
      sender: 'سارا سارایی',
      receiver: 'مریم مریمی',
    },
  ],
};

export const mockStats = {
  total: 2,
  total_with_research: 2,
  by_research: [{ research_id: 1, research_code: 'R-001', count: 2 }],
  by_month: {
    '1402-01': { month_name: 'فروردین 1402', count: 2 },
  },
  by_year: {
    '1402': { year: 1402, count: 2 },
  },
  available_years: [1402],
};

// ============================================================
// Handlers
// ⚠️ ترتیب مهمه: مسیرهای خاص‌تر (stats) باید قبل از :id بیان
// ============================================================
export const handlers = [
  // ✅ stats باید قبل از :id باشه وگرنه msw اون رو به‌عنوان id می‌گیره
  http.get(`${BASE}/communications/stats/`, () => {
    return HttpResponse.json(mockStats);
  }),

  http.get(`${BASE}/communications/`, () => {
    return HttpResponse.json(mockCommunicationsList);
  }),

  http.get(`${BASE}/communications/:id/`, ({ params }) => {
    const id = Number(params.id);
    if (id === 1) {
      return HttpResponse.json(mockCommunication);
    }
    return new HttpResponse(null, { status: 404 });
  }),

  http.post(`${BASE}/communications/`, async ({ request }) => {
    const formData = await request.formData();
    return HttpResponse.json(
      {
        ...mockCommunication,
        id: 99,
        title: String(formData.get('title') || ''),
      },
      { status: 201 }
    );
  }),

  http.put(`${BASE}/communications/:id/`, async ({ params, request }) => {
    const formData = await request.formData();
    return HttpResponse.json({
      ...mockCommunication,
      id: Number(params.id),
      title: String(formData.get('title') || mockCommunication.title),
    });
  }),

  http.delete(`${BASE}/communications/:id/`, () => {
    return new HttpResponse(null, { status: 204 });
  }),
];