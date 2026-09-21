// src/test/msw/handlers.ts

import { http, HttpResponse } from 'msw';

const BASE = 'http://172.18.5.77:8000/api/v1';

// ============================================================
// Mock Data: Communication
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

export const mockCommunicationStats = {
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
// Mock Data: Persons
// ============================================================
export const mockPerson1 = {
  id: 1,
  first_name: 'علی',
  last_name: 'احمدی',
  full_name: 'علی احمدی',
  national_code: '0012345678',
  mobile_phone: '09123456789',
  email: 'ali@example.com',
  is_active: true,
};

export const mockPerson2 = {
  id: 2,
  first_name: 'سارا',
  last_name: 'رضایی',
  full_name: 'سارا رضایی',
  national_code: '0087654321',
  mobile_phone: '09987654321',
  email: 'sara@example.com',
  is_active: true,
};

export const mockPersonsList = {
  count: 2,
  next: null,
  previous: null,
  total_pages: 1,
  current_page: 1,
  page_size: 10,
  results: [mockPerson1, mockPerson2],
};

// ============================================================
// Mock Data: Universities
// ============================================================
export const mockUniversity1 = {
  id: 1,
  name: 'دانشگاه تهران',
  type: 1,
  type_name: 'دولتی',
  city: 1,
  city_name: 'تهران',
  phone: '02112345678',
  email: 'info@ut.ac.ir',
};

export const mockUniversity2 = {
  id: 2,
  name: 'دانشگاه صنعتی شریف',
  type: 1,
  type_name: 'دولتی',
  city: 1,
  city_name: 'تهران',
  phone: '02198765432',
  email: 'info@sharif.edu',
};

export const mockUniversitiesList = {
  count: 2,
  next: null,
  previous: null,
  total_pages: 1,
  current_page: 1,
  page_size: 10,
  results: [mockUniversity1, mockUniversity2],
};

// ============================================================
// Mock Data: Companies
// ============================================================
export const mockCompany1 = {
  id: 1,
  name: 'شرکت اول',
  economic_code: '123456789012',
  registration_number: '12345',
  national_id: '12345678901',
  phone: '02112345678',
  email: 'info@company1.ir',
};

export const mockCompany2 = {
  id: 2,
  name: 'شرکت دوم',
  economic_code: '987654321098',
  registration_number: '54321',
  national_id: '10987654321',
  phone: '02198765432',
  email: 'info@company2.ir',
};

export const mockCompaniesList = {
  count: 2,
  next: null,
  previous: null,
  total_pages: 1,
  current_page: 1,
  page_size: 10,
  results: [mockCompany1, mockCompany2],
};

// ============================================================
// Mock Data: Researches
// ============================================================
export const mockResearch1 = {
  id: 1,
  code: 'R-001',
  title: 'پژوهش اول',
  description: 'توضیحات پژوهش اول',
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

export const mockResearch2 = {
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

export const mockResearchesList = {
  count: 2,
  next: null,
  previous: null,
  total_pages: 1,
  current_page: 1,
  page_size: 10,
  results: [mockResearch1, mockResearch2],
};

export const mockResearchStats = {
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
// Mock Data: RFPs
// ============================================================
export const mockRfp1 = {
  id: 1,
  code: 'RFP-001',
  title: 'RFP اول',
  description: 'توضیحات RFP اول',
  estimated_price: 5000000,
  approximate_project_time: 6,
  necessity_declaration: 'ضرورت اول',
  solution_exact_definition: 'راه حل اول',
  publish_date: '1402/01/15',
  research: 1,
  research_code: 'R-001',
  research_title: 'پژوهش اول',
  research_year: 1402,
  attachments: [],
  basic_questions: [],
  consumers: [],
  created_at: '1402/01/01',
  updated_at: '1402/01/01',
};

export const mockRfp2 = {
  ...mockRfp1,
  id: 2,
  code: 'RFP-002',
  title: 'RFP دوم',
  estimated_price: 3000000,
  approximate_project_time: 3,
  research_title: 'پژوهش دوم',
  research_year: 1403,
};

export const mockRfpsList = {
  count: 2,
  next: null,
  previous: null,
  total_pages: 1,
  current_page: 1,
  page_size: 10,
  results: [mockRfp1, mockRfp2],
};

export const mockRfpStats = {
  total: 2,
  total_estimated_price: 8000000,
  average_estimated_price: 4000000,
  by_year: [
    { year: 1403, count: 1, total_price: 3000000, average_price: 3000000 },
    { year: 1402, count: 1, total_price: 5000000, average_price: 5000000 },
  ],
};

// ============================================================
// ✅ Mock Data: Project Subjects (اضافه شد)
// ============================================================
export const mockProjectSubject1 = {
  id: 1,
  name: 'موضوع اول',
  description: 'توضیحات موضوع اول',
  code: 'SUB-001',
  is_active: true,
};

export const mockProjectSubject2 = {
  id: 2,
  name: 'موضوع دوم',
  description: 'توضیحات موضوع دوم',
  code: 'SUB-002',
  is_active: true,
};

export const mockProjectSubjectsList = {
  count: 2,
  next: null,
  previous: null,
  total_pages: 1,
  current_page: 1,
  page_size: 10,
  results: [mockProjectSubject1, mockProjectSubject2],
};

// ============================================================
// Handlers
// ============================================================

export const handlers = [
  // ============================================================
  // Communications
  // ============================================================
  http.get(`${BASE}/communications/stats/`, () => {
    return HttpResponse.json(mockCommunicationStats);
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

  // ============================================================
  // Persons
  // ============================================================
  http.get(`${BASE}/persons/`, () => {
    return HttpResponse.json(mockPersonsList);
  }),

  http.get(`${BASE}/persons/stats/`, () => {
    return HttpResponse.json({
      total: 2,
      with_email: 2,
      with_mobile: 2,
      with_degree: 0,
      by_gender: { M: 1, F: 1 },
      by_degree: {},
    });
  }),

  http.get(`${BASE}/persons/:id/`, ({ params }) => {
    const id = Number(params.id);
    const person = mockPersonsList.results.find((p) => p.id === id);
    if (person) {
      return HttpResponse.json(person);
    }
    return new HttpResponse(null, { status: 404 });
  }),

  // ============================================================
  // Universities
  // ============================================================
  http.get(`${BASE}/universities/`, () => {
    return HttpResponse.json(mockUniversitiesList);
  }),

  http.get(`${BASE}/universities/:id/`, ({ params }) => {
    const id = Number(params.id);
    const uni = mockUniversitiesList.results.find((u) => u.id === id);
    if (uni) {
      return HttpResponse.json(uni);
    }
    return new HttpResponse(null, { status: 404 });
  }),

  // ============================================================
  // Companies
  // ============================================================
  http.get(`${BASE}/companies/`, () => {
    return HttpResponse.json(mockCompaniesList);
  }),

  http.get(`${BASE}/companies/:id/`, ({ params }) => {
    const id = Number(params.id);
    const comp = mockCompaniesList.results.find((c) => c.id === id);
    if (comp) {
      return HttpResponse.json(comp);
    }
    return new HttpResponse(null, { status: 404 });
  }),

  // ============================================================
  // ✅ Project Subjects (اضافه شد)
  // ⚠️ ترتیب مهم است: اگر endpoint خاصی مثل stats دارد، قبل از :id بیاید
  // ============================================================
  http.get(`${BASE}/project-subjects/`, () => {
    return HttpResponse.json(mockProjectSubjectsList);
  }),

  http.get(`${BASE}/project-subjects/:id/`, ({ params }) => {
    const id = Number(params.id);
    const subject = mockProjectSubjectsList.results.find((s) => s.id === id);
    if (subject) {
      return HttpResponse.json(subject);
    }
    return new HttpResponse(null, { status: 404 });
  }),

  // ============================================================
  // Researches
  // ⚠️ ترتیب مهم است: stats باید قبل از :id باشد
  // ============================================================
  http.get(`${BASE}/researches/stats/`, () => {
    return HttpResponse.json(mockResearchStats);
  }),

  http.get(`${BASE}/researches/`, () => {
    return HttpResponse.json(mockResearchesList);
  }),

  http.get(`${BASE}/researches/:id/`, ({ params }) => {
    const id = Number(params.id);
    const research = mockResearchesList.results.find((r) => r.id === id);
    if (research) {
      return HttpResponse.json(research);
    }
    return new HttpResponse(null, { status: 404 });
  }),

  http.post(`${BASE}/researches/`, async ({ request }) => {
    const formData = await request.formData();
    return HttpResponse.json(
      {
        ...mockResearch1,
        id: 99,
        title: String(formData.get('title') || ''),
      },
      { status: 201 }
    );
  }),

  http.delete(`${BASE}/researches/:id/`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // ============================================================
  // RFPs
  // ⚠️ ترتیب مهم است: stats باید قبل از :id باشد
  // ============================================================
  http.get(`${BASE}/rfps/stats/`, () => {
    return HttpResponse.json(mockRfpStats);
  }),

  http.get(`${BASE}/rfps/`, () => {
    return HttpResponse.json(mockRfpsList);
  }),

  http.get(`${BASE}/rfps/:id/`, ({ params }) => {
    const id = Number(params.id);
    const rfp = mockRfpsList.results.find((r) => r.id === id);
    if (rfp) {
      return HttpResponse.json(rfp);
    }
    return new HttpResponse(null, { status: 404 });
  }),

  http.post(`${BASE}/rfps/`, async ({ request }) => {
    const formData = await request.formData();
    return HttpResponse.json(
      {
        ...mockRfp1,
        id: 99,
        title: String(formData.get('title') || ''),
      },
      { status: 201 }
    );
  }),

  http.delete(`${BASE}/rfps/:id/`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // ============================================================
  // Proposals
  // ⚠️ ترتیب مهم است: stats باید قبل از :id باشد
  // ============================================================
  http.get(`${BASE}/proposals/stats/`, () => {
    return HttpResponse.json({
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
    });
  }),

  http.get(`${BASE}/proposals/`, () => {
    return HttpResponse.json({
      count: 2,
      next: null,
      previous: null,
      total_pages: 1,
      current_page: 1,
      page_size: 10,
      results: [
        {
          id: 1,
          code: 'PRO-001',
          title_farsi: 'پروپوزال اول',
          title_english: 'Proposal One',
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
      ],
    });
  }),

  http.get(`${BASE}/proposals/:id/`, ({ params }) => {
    const id = Number(params.id);
    if (id === 1) {
      return HttpResponse.json({
        id: 1,
        code: 'PRO-001',
        title_farsi: 'پروپوزال اول',
        title_english: 'Proposal One',
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
      });
    }
    return new HttpResponse(null, { status: 404 });
  }),

  http.post(`${BASE}/proposals/`, async ({ request }) => {
    const formData = await request.formData();
    return HttpResponse.json(
      {
        id: 99,
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
      },
      { status: 201 }
    );
  }),

  http.delete(`${BASE}/proposals/:id/`, () => {
    return new HttpResponse(null, { status: 204 });
  }),
];

// // src/test/msw/handlers.ts

// import { http, HttpResponse } from 'msw';

// const BASE = 'http://172.18.5.77:8000/api/v1';

// // ============================================================
// // Mock Data: Communication
// // ============================================================
// export const mockCommunication = {
//   id: 1,
//   letter_number: '1402/001',
//   title: 'مکاتبه تست',
//   description: 'توضیحات تست',
//   sender: 'احمد احمدی',
//   receiver: 'رضا رضایی',
//   date: '1402/01/15',
//   send_receive_date: '1402/01/20',
//   attachment: null,
//   letter_file: null,
//   research: 1,
//   research_code: 'R-001',
//   research_title: 'پژوهش تست',
//   created_at: '1402/01/15',
//   updated_at: '1402/01/15',
// };

// export const mockCommunicationsList = {
//   count: 2,
//   next: null,
//   previous: null,
//   total_pages: 1,
//   current_page: 1,
//   page_size: 10,
//   results: [
//     mockCommunication,
//     {
//       ...mockCommunication,
//       id: 2,
//       letter_number: '1402/002',
//       title: 'مکاتبه دوم',
//       sender: 'سارا سارایی',
//       receiver: 'مریم مریمی',
//     },
//   ],
// };

// export const mockCommunicationStats = {
//   total: 2,
//   total_with_research: 2,
//   by_research: [{ research_id: 1, research_code: 'R-001', count: 2 }],
//   by_month: {
//     '1402-01': { month_name: 'فروردین 1402', count: 2 },
//   },
//   by_year: {
//     '1402': { year: 1402, count: 2 },
//   },
//   available_years: [1402],
// };

// // ============================================================
// // Mock Data: Persons
// // ============================================================
// export const mockPerson1 = {
//   id: 1,
//   first_name: 'علی',
//   last_name: 'احمدی',
//   full_name: 'علی احمدی',
//   national_code: '0012345678',
//   mobile_phone: '09123456789',
//   email: 'ali@example.com',
//   is_active: true,
// };

// export const mockPerson2 = {
//   id: 2,
//   first_name: 'سارا',
//   last_name: 'رضایی',
//   full_name: 'سارا رضایی',
//   national_code: '0087654321',
//   mobile_phone: '09987654321',
//   email: 'sara@example.com',
//   is_active: true,
// };

// export const mockPersonsList = {
//   count: 2,
//   next: null,
//   previous: null,
//   total_pages: 1,
//   current_page: 1,
//   page_size: 10,
//   results: [mockPerson1, mockPerson2],
// };

// // ============================================================
// // Mock Data: Universities
// // ============================================================
// export const mockUniversity1 = {
//   id: 1,
//   name: 'دانشگاه تهران',
//   type: 1,
//   type_name: 'دولتی',
//   city: 1,
//   city_name: 'تهران',
//   phone: '02112345678',
//   email: 'info@ut.ac.ir',
// };

// export const mockUniversity2 = {
//   id: 2,
//   name: 'دانشگاه صنعتی شریف',
//   type: 1,
//   type_name: 'دولتی',
//   city: 1,
//   city_name: 'تهران',
//   phone: '02198765432',
//   email: 'info@sharif.edu',
// };

// export const mockUniversitiesList = {
//   count: 2,
//   next: null,
//   previous: null,
//   total_pages: 1,
//   current_page: 1,
//   page_size: 10,
//   results: [mockUniversity1, mockUniversity2],
// };

// // ============================================================
// // Mock Data: Companies
// // ============================================================
// export const mockCompany1 = {
//   id: 1,
//   name: 'شرکت اول',
//   economic_code: '123456789012',
//   registration_number: '12345',
//   national_id: '12345678901',
//   phone: '02112345678',
//   email: 'info@company1.ir',
// };

// export const mockCompany2 = {
//   id: 2,
//   name: 'شرکت دوم',
//   economic_code: '987654321098',
//   registration_number: '54321',
//   national_id: '10987654321',
//   phone: '02198765432',
//   email: 'info@company2.ir',
// };

// export const mockCompaniesList = {
//   count: 2,
//   next: null,
//   previous: null,
//   total_pages: 1,
//   current_page: 1,
//   page_size: 10,
//   results: [mockCompany1, mockCompany2],
// };

// // ============================================================
// // Mock Data: Researches
// // ============================================================
// export const mockResearch1 = {
//   id: 1,
//   code: 'R-001',
//   title: 'پژوهش اول',
//   description: 'توضیحات پژوهش اول',
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

// export const mockResearch2 = {
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

// export const mockResearchesList = {
//   count: 2,
//   next: null,
//   previous: null,
//   total_pages: 1,
//   current_page: 1,
//   page_size: 10,
//   results: [mockResearch1, mockResearch2],
// };

// export const mockResearchStats = {
//   total: 2,
//   draft: 1,
//   active: 1,
//   completed: 0,
//   by_status: { DRAFT: 1, IN_PROGRESS: 1, COMPLETED: 0 },
//   by_year: { 1402: 2 },
//   by_affiliation: [
//     { affiliation_type: 'UNIVERSITY', count: 1 },
//     { affiliation_type: 'COMPANY', count: 1 },
//   ],
// };

// // ============================================================
// // Mock Data: RFPs
// // ============================================================
// export const mockRfp1 = {
//   id: 1,
//   code: 'RFP-001',
//   title: 'RFP اول',
//   description: 'توضیحات RFP اول',
//   estimated_price: 5000000,
//   approximate_project_time: 6,
//   necessity_declaration: 'ضرورت اول',
//   solution_exact_definition: 'راه حل اول',
//   publish_date: '1402/01/15',
//   research: 1,
//   research_code: 'R-001',
//   research_title: 'پژوهش اول',
//   research_year: 1402,
//   attachments: [],
//   basic_questions: [],
//   consumers: [],
//   created_at: '1402/01/01',
//   updated_at: '1402/01/01',
// };

// export const mockRfp2 = {
//   ...mockRfp1,
//   id: 2,
//   code: 'RFP-002',
//   title: 'RFP دوم',
//   estimated_price: 3000000,
//   approximate_project_time: 3,
//   research_title: 'پژوهش دوم',
//   research_year: 1403,
// };

// export const mockRfpsList = {
//   count: 2,
//   next: null,
//   previous: null,
//   total_pages: 1,
//   current_page: 1,
//   page_size: 10,
//   results: [mockRfp1, mockRfp2],
// };

// export const mockRfpStats = {
//   total: 2,
//   total_estimated_price: 8000000,
//   average_estimated_price: 4000000,
//   by_year: [
//     { year: 1403, count: 1, total_price: 3000000, average_price: 3000000 },
//     { year: 1402, count: 1, total_price: 5000000, average_price: 5000000 },
//   ],
// };

// // ============================================================
// // Handlers
// // ============================================================

// export const handlers = [
//   // ============================================================
//   // Communications
//   // ============================================================
//   http.get(`${BASE}/communications/stats/`, () => {
//     return HttpResponse.json(mockCommunicationStats);
//   }),

//   http.get(`${BASE}/communications/`, () => {
//     return HttpResponse.json(mockCommunicationsList);
//   }),

//   http.get(`${BASE}/communications/:id/`, ({ params }) => {
//     const id = Number(params.id);
//     if (id === 1) {
//       return HttpResponse.json(mockCommunication);
//     }
//     return new HttpResponse(null, { status: 404 });
//   }),

//   http.post(`${BASE}/communications/`, async ({ request }) => {
//     const formData = await request.formData();
//     return HttpResponse.json(
//       {
//         ...mockCommunication,
//         id: 99,
//         title: String(formData.get('title') || ''),
//       },
//       { status: 201 }
//     );
//   }),

//   http.put(`${BASE}/communications/:id/`, async ({ params, request }) => {
//     const formData = await request.formData();
//     return HttpResponse.json({
//       ...mockCommunication,
//       id: Number(params.id),
//       title: String(formData.get('title') || mockCommunication.title),
//     });
//   }),

//   http.delete(`${BASE}/communications/:id/`, () => {
//     return new HttpResponse(null, { status: 204 });
//   }),

//   // ============================================================
//   // Persons
//   // ============================================================
//   http.get(`${BASE}/persons/`, () => {
//     return HttpResponse.json(mockPersonsList);
//   }),

//   http.get(`${BASE}/persons/stats/`, () => {
//     return HttpResponse.json({
//       total: 2,
//       with_email: 2,
//       with_mobile: 2,
//       with_degree: 0,
//       by_gender: { M: 1, F: 1 },
//       by_degree: {},
//     });
//   }),

//   http.get(`${BASE}/persons/:id/`, ({ params }) => {
//     const id = Number(params.id);
//     const person = mockPersonsList.results.find((p) => p.id === id);
//     if (person) {
//       return HttpResponse.json(person);
//     }
//     return new HttpResponse(null, { status: 404 });
//   }),

//   // ============================================================
//   // Universities
//   // ============================================================
//   http.get(`${BASE}/universities/`, () => {
//     return HttpResponse.json(mockUniversitiesList);
//   }),

//   http.get(`${BASE}/universities/:id/`, ({ params }) => {
//     const id = Number(params.id);
//     const uni = mockUniversitiesList.results.find((u) => u.id === id);
//     if (uni) {
//       return HttpResponse.json(uni);
//     }
//     return new HttpResponse(null, { status: 404 });
//   }),

//   // ============================================================
//   // Companies
//   // ============================================================
//   http.get(`${BASE}/companies/`, () => {
//     return HttpResponse.json(mockCompaniesList);
//   }),

//   http.get(`${BASE}/companies/:id/`, ({ params }) => {
//     const id = Number(params.id);
//     const comp = mockCompaniesList.results.find((c) => c.id === id);
//     if (comp) {
//       return HttpResponse.json(comp);
//     }
//     return new HttpResponse(null, { status: 404 });
//   }),

//   // ============================================================
//   // Researches
//   // ⚠️ ترتیب مهم است: stats باید قبل از :id باشد
//   // ============================================================
//   http.get(`${BASE}/researches/stats/`, () => {
//     return HttpResponse.json(mockResearchStats);
//   }),

//   http.get(`${BASE}/researches/`, () => {
//     return HttpResponse.json(mockResearchesList);
//   }),

//   http.get(`${BASE}/researches/:id/`, ({ params }) => {
//     const id = Number(params.id);
//     const research = mockResearchesList.results.find((r) => r.id === id);
//     if (research) {
//       return HttpResponse.json(research);
//     }
//     return new HttpResponse(null, { status: 404 });
//   }),

//   http.post(`${BASE}/researches/`, async ({ request }) => {
//     const formData = await request.formData();
//     return HttpResponse.json(
//       {
//         ...mockResearch1,
//         id: 99,
//         title: String(formData.get('title') || ''),
//       },
//       { status: 201 }
//     );
//   }),

//   http.delete(`${BASE}/researches/:id/`, () => {
//     return new HttpResponse(null, { status: 204 });
//   }),

//   // ============================================================
//   // RFPs
//   // ⚠️ ترتیب مهم است: stats باید قبل از :id باشد
//   // ============================================================
//   http.get(`${BASE}/rfps/stats/`, () => {
//     return HttpResponse.json(mockRfpStats);
//   }),

//   http.get(`${BASE}/rfps/`, () => {
//     return HttpResponse.json(mockRfpsList);
//   }),

//   http.get(`${BASE}/rfps/:id/`, ({ params }) => {
//     const id = Number(params.id);
//     const rfp = mockRfpsList.results.find((r) => r.id === id);
//     if (rfp) {
//       return HttpResponse.json(rfp);
//     }
//     return new HttpResponse(null, { status: 404 });
//   }),

//   http.post(`${BASE}/rfps/`, async ({ request }) => {
//     const formData = await request.formData();
//     return HttpResponse.json(
//       {
//         ...mockRfp1,
//         id: 99,
//         title: String(formData.get('title') || ''),
//       },
//       { status: 201 }
//     );
//   }),

//   http.delete(`${BASE}/rfps/:id/`, () => {
//     return new HttpResponse(null, { status: 204 });
//   }),
// ];

// // src/test/msw/handlers.ts

// import { http, HttpResponse } from 'msw';

// const BASE = 'http://172.18.5.77:8000/api/v1';

// // ============================================================
// // داده‌های نمونه
// // ============================================================
// export const mockCommunication = {
//   id: 1,
//   letter_number: '1402/001',
//   title: 'مکاتبه تست',
//   description: 'توضیحات تست',
//   sender: 'احمد احمدی',
//   receiver: 'رضا رضایی',
//   date: '1402/01/15',
//   send_receive_date: '1402/01/20',
//   attachment: null,
//   letter_file: null,
//   research: 1,
//   research_code: 'R-001',
//   research_title: 'پژوهش تست',
//   created_at: '1402/01/15',
//   updated_at: '1402/01/15',
// };

// export const mockCommunicationsList = {
//   count: 2,
//   next: null,
//   previous: null,
//   total_pages: 1,
//   current_page: 1,
//   page_size: 10,
//   results: [
//     mockCommunication,
//     {
//       ...mockCommunication,
//       id: 2,
//       letter_number: '1402/002',
//       title: 'مکاتبه دوم',
//       sender: 'سارا سارایی',
//       receiver: 'مریم مریمی',
//     },
//   ],
// };

// export const mockStats = {
//   total: 2,
//   total_with_research: 2,
//   by_research: [{ research_id: 1, research_code: 'R-001', count: 2 }],
//   by_month: {
//     '1402-01': { month_name: 'فروردین 1402', count: 2 },
//   },
//   by_year: {
//     '1402': { year: 1402, count: 2 },
//   },
//   available_years: [1402],
// };

// // ============================================================
// // Handlers
// // ⚠️ ترتیب مهمه: مسیرهای خاص‌تر (stats) باید قبل از :id بیان
// // ============================================================
// export const handlers = [
//   // ✅ stats باید قبل از :id باشه وگرنه msw اون رو به‌عنوان id می‌گیره
//   http.get(`${BASE}/communications/stats/`, () => {
//     return HttpResponse.json(mockStats);
//   }),

//   http.get(`${BASE}/communications/`, () => {
//     return HttpResponse.json(mockCommunicationsList);
//   }),

//   http.get(`${BASE}/communications/:id/`, ({ params }) => {
//     const id = Number(params.id);
//     if (id === 1) {
//       return HttpResponse.json(mockCommunication);
//     }
//     return new HttpResponse(null, { status: 404 });
//   }),

//   http.post(`${BASE}/communications/`, async ({ request }) => {
//     const formData = await request.formData();
//     return HttpResponse.json(
//       {
//         ...mockCommunication,
//         id: 99,
//         title: String(formData.get('title') || ''),
//       },
//       { status: 201 }
//     );
//   }),

//   http.put(`${BASE}/communications/:id/`, async ({ params, request }) => {
//     const formData = await request.formData();
//     return HttpResponse.json({
//       ...mockCommunication,
//       id: Number(params.id),
//       title: String(formData.get('title') || mockCommunication.title),
//     });
//   }),

//   http.delete(`${BASE}/communications/:id/`, () => {
//     return new HttpResponse(null, { status: 204 });
//   }),
// ];