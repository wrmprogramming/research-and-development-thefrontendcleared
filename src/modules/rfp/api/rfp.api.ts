// src/modules/rfp/api/rfp.api.ts

import { axiosClient } from '../../../api/client/axiosClient';
import { API_ENDPOINTS } from '../../../api/endpoints';
import type { Rfp, RfpFormData, RfpFilters, RfpStats } from '../types/rfp.types';
import type { PaginatedResponse } from '../../../types/common.types';

class RfpApi {
  // ========== CRUD Operations ==========

  async getAll(params?: RfpFilters): Promise<PaginatedResponse<Rfp>> {
    const cleanParams: Record<string, any> = {};
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key as keyof RfpFilters];
        if (value !== undefined && value !== null && value !== '') {
          cleanParams[key] = value;
        }
      });
    }
    const response = await axiosClient.get<PaginatedResponse<Rfp>>(
      API_ENDPOINTS.RFP.BASE,
      { params: cleanParams }
    );
    return response;
  }

  async getById(id: number): Promise<Rfp> {
    return axiosClient.get<Rfp>(API_ENDPOINTS.RFP.DETAIL(id));
  }

  async create(data: RfpFormData, onProgress?: (progress: number) => void): Promise<Rfp> {
    const formData = this.toFormData(data);
    return axiosClient.post<Rfp>(API_ENDPOINTS.RFP.BASE, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    });
  }

  async update(id: number, data: RfpFormData, onProgress?: (progress: number) => void): Promise<Rfp> {
    const formData = this.toFormData(data);
    return axiosClient.put<Rfp>(API_ENDPOINTS.RFP.DETAIL(id), formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    });
  }

  async patch(id: number, data: Partial<RfpFormData>): Promise<Rfp> {
    return axiosClient.patch<Rfp>(API_ENDPOINTS.RFP.DETAIL(id), data);
  }

  async delete(id: number): Promise<void> {
    await axiosClient.delete<void>(API_ENDPOINTS.RFP.DETAIL(id));
  }

  // ========== Custom Operations ==========

  async getByResearch(researchId: number): Promise<Rfp[]> {
    const response = await this.getAll({ research: researchId });
    return response.results || [];
  }

  async getStats(): Promise<RfpStats> {
    return axiosClient.get<RfpStats>(API_ENDPOINTS.RFP.STATS);
  }

  async getStatsByYear(year: number): Promise<RfpStats> {
    return axiosClient.get<RfpStats>(`${API_ENDPOINTS.RFP.STATS}?year=${year}`);
  }

  // ========== Helper ==========

  private toFormData(data: RfpFormData): FormData {
    const formData = new FormData();

    if (data.code) formData.append('code', data.code);
    formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    formData.append('estimated_price', String(data.estimated_price));
    formData.append('approximate_project_time', String(data.approximate_project_time));
    formData.append('necessity_declaration', data.necessity_declaration);
    formData.append('solution_exact_definition', data.solution_exact_definition);

    if (data.research_id && data.research_id > 0) {
      formData.append('research', String(data.research_id));
    }

    // سوالات اساسی
    if (data.basic_questions && data.basic_questions.length > 0) {
      const validQuestions = data.basic_questions.filter(q => q.question?.trim());
      formData.append('basic_questions_data', JSON.stringify(validQuestions));
    } else {
      formData.append('basic_questions_data', JSON.stringify([]));
    }

    // مصرف‌کنندگان
    if (data.consumers && data.consumers.length > 0) {
      const validConsumers = data.consumers.filter(c => c.name?.trim());
      formData.append('consumers_data', JSON.stringify(validConsumers));
    } else {
      formData.append('consumers_data', JSON.stringify([]));
    }

    // فایل‌ها
    data.attachment_files?.forEach((file) => {
      formData.append('attachment_files', file);
    });

    data.deleted_attachment_ids?.forEach((id) => {
      formData.append('deleted_attachment_ids', String(id));
    });

    return formData;
  }
}

export const rfpApi = new RfpApi();

// // src/modules/rfp/api/rfp.api.ts

// import { axiosClient } from '../../../api/client/axiosClient';
// import { API_ENDPOINTS } from '../../../api/endpoints';
// import type { Rfp, RfpFormData, RfpFilters, RfpStats } from '../types/rfp.types';
// import type { PaginatedResponse } from '../../../types/common.types';

// class RfpApi {
//   // ========== CRUD Operations ==========

//   async getAll(params?: RfpFilters): Promise<PaginatedResponse<Rfp>> {
//     const cleanParams: Record<string, any> = {};
//     if (params) {
//       Object.keys(params).forEach(key => {
//         const value = params[key as keyof RfpFilters];
//         if (value !== undefined && value !== null && value !== '') {
//           cleanParams[key] = value;
//         }
//       });
//     }
//     const response = await axiosClient.get<PaginatedResponse<Rfp>>(
//       API_ENDPOINTS.RFP.BASE,
//       { params: cleanParams }
//     );
//     return response;
//   }

//   async getById(id: number): Promise<Rfp> {
//     const response = await axiosClient.get<Rfp>(API_ENDPOINTS.RFP.DETAIL(id));
//     return response;
//   }

//   async create(data: RfpFormData, onProgress?: (progress: number) => void): Promise<Rfp> {
//     const formData = this.toFormData(data);
//     const response = await axiosClient.post<Rfp>(
//       API_ENDPOINTS.RFP.BASE,
//       formData,
//       {
//         headers: { 'Content-Type': 'multipart/form-data' },
//         onUploadProgress: (progressEvent) => {
//           if (onProgress && progressEvent.total) {
//             const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
//             onProgress(percent);
//           }
//         },
//       }
//     );
//     return response;
//   }

//   async update(id: number, data: RfpFormData, onProgress?: (progress: number) => void): Promise<Rfp> {
//     const formData = this.toFormData(data);
//     const response = await axiosClient.put<Rfp>(
//       API_ENDPOINTS.RFP.DETAIL(id),
//       formData,
//       {
//         headers: { 'Content-Type': 'multipart/form-data' },
//         onUploadProgress: (progressEvent) => {
//           if (onProgress && progressEvent.total) {
//             const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
//             onProgress(percent);
//           }
//         },
//       }
//     );
//     return response;
//   }

//   async patch(id: number, data: Partial<RfpFormData>): Promise<Rfp> {
//     const response = await axiosClient.patch<Rfp>(API_ENDPOINTS.RFP.DETAIL(id), data);
//     return response;
//   }

//   async delete(id: number): Promise<void> {
//     await axiosClient.delete<void>(API_ENDPOINTS.RFP.DETAIL(id));
//   }

//   // ========== Custom Operations ==========

//   async getByResearch(researchId: number): Promise<Rfp[]> {
//     const response = await this.getAll({ research: researchId });
//     return response.results || [];
//   }

 

//    /**
//    * دریافت آمار RFPها با تفکیک بر اساس سال پژوهش مرتبط
//    */
//   async getStats(): Promise<RfpStats> {
//     const response = await axiosClient.get<RfpStats>(API_ENDPOINTS.RFP.STATS);
    
//     // 🔥 اگر بک‌اند سال رو برنمی‌گردونه، اینجا محاسبه کن
//     // اما بهتره بک‌اند این کار رو انجام بده
//     return response;
//   }

//   /**
//    * دریافت آمار RFPها بر اساس سال (با فیلتر سال پژوهش مرتبط)
//    */
//   async getStatsByYear(year: number): Promise<RfpStats> {
//     const response = await axiosClient.get<RfpStats>(`${API_ENDPOINTS.RFP.STATS}?year=${year}`);
//     return response;
//   }
  
//   // ========== Helper Methods ==========

//   private toFormData(data: RfpFormData): FormData {
//     const formData = new FormData();

//     if (data.code) formData.append('code', data.code);
//     formData.append('title', data.title);
//     if (data.description) formData.append('description', data.description);
//     formData.append('estimated_price', String(data.estimated_price));
//     formData.append('approximate_project_time', String(data.approximate_project_time));
//     formData.append('necessity_declaration', data.necessity_declaration);
//     formData.append('solution_exact_definition', data.solution_exact_definition);
//     // formData.append('deadline_date', data.deadline_date);
    
//     if (data.research_id && data.research_id > 0) {
//       formData.append('research', String(data.research_id));
//     }
    
  
//       // ✅ سوالات اساسی - با نام صحیح
//   if (data.basic_questions && data.basic_questions.length > 0) {
//     const validQuestions = data.basic_questions.filter(q => q.question?.trim());
//     if (validQuestions.length > 0) {
//       // ✅ اضافه کردن console.log برای دیباگ
//       console.log('📤 Sending basic_questions_data:', JSON.stringify(validQuestions));
//       formData.append('basic_questions_data', JSON.stringify(validQuestions));
//     }
//   } else {
//     // ✅ اگر لیست خالی است، یک آرایه خالی بفرست
//     formData.append('basic_questions_data', JSON.stringify([]));
//   }

//   // ✅ مصرف‌کنندگان - با نام صحیح
//   if (data.consumers && data.consumers.length > 0) {
//     const validConsumers = data.consumers.filter(c => c.name?.trim());
//     if (validConsumers.length > 0) {
//       console.log('📤 Sending consumers_data:', JSON.stringify(validConsumers));
//       formData.append('consumers_data', JSON.stringify(validConsumers));
//     }
//   } else {
//     // ✅ اگر لیست خالی است، یک آرایه خالی بفرست
//     formData.append('consumers_data', JSON.stringify([]));
//   }
  


//     // فایل‌های پیوست چندگانه
//     if (data.attachment_files && data.attachment_files.length > 0) {
//       data.attachment_files.forEach((file) => {
//         formData.append('attachment_files', file);
//       });
//     }

//     // آیدی فایل‌هایی که باید حذف شوند
//     if (data.deleted_attachment_ids && data.deleted_attachment_ids.length > 0) {
//       data.deleted_attachment_ids.forEach((id) => {
//         formData.append('deleted_attachment_ids', String(id));
//       });
//     }

//     return formData;
//   }




// /**
//  * دریافت آمار RFP بر اساس بازه تاریخی
//  * @param startDate - تاریخ شروع (اختیاری)
//  * @param endDate - تاریخ پایان (اختیاری)
//  * @returns آمار RFPها در بازه مشخص شده
//  */
// async getStatsByDateRange(startDate?: string, endDate?: string): Promise<RfpStats> {
//   const params = { start_date: startDate, end_date: endDate };
//   const response = await axiosClient.get<RfpStats>(`${API_ENDPOINTS.RFP.BASE}stats/date-range/`, { params });
//   return response;
// }

// }

// export const rfpApi = new RfpApi();