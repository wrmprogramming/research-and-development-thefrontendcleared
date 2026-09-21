// src/modules/contract-delay/api/contractDelay.api.ts

import { axiosClient } from '../../../api/client/axiosClient';
import { API_ENDPOINTS } from '../../../api/endpoints';
import type {
  ContractDelay,
  ContractDelayFormData,
  ContractDelayFilters,
} from '../types/contractDelay.types';
import type { PaginatedResponse } from '../../../types/common.types';

class ContractDelayApi {
  // ==================== CRUD ====================
  async getAll(params?: ContractDelayFilters): Promise<PaginatedResponse<ContractDelay>> {
    const cleanParams: Record<string, any> = {};
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key as keyof ContractDelayFilters];
        if (value !== undefined && value !== null && value !== '') {
          cleanParams[key] = value;
        }
      });
    }

    const response = await axiosClient.get<PaginatedResponse<ContractDelay>>(
      '/contract-delays/',
      { params: cleanParams }
    );
    return response;
  }

  async getById(id: number): Promise<ContractDelay> {
    const response = await axiosClient.get<ContractDelay>(`/contract-delays/${id}/`);
    return response;
  }

  async getByContract(contractId: number): Promise<PaginatedResponse<ContractDelay>> {
    const response = await axiosClient.get<PaginatedResponse<ContractDelay>>(
      API_ENDPOINTS.CONTRACT.DELAYS(contractId)
    );
    return response;
  }

  async create(
    data: ContractDelayFormData,
    onProgress?: (progress: number) => void
  ): Promise<ContractDelay> {
    const formData = this.toFormData(data);
    const response = await axiosClient.post<ContractDelay>(
      '/contract-delays/',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percent);
          }
        },
      }
    );
    return response;
  }

  async update(
    id: number,
    data: Partial<ContractDelayFormData>,
    onProgress?: (progress: number) => void
  ): Promise<ContractDelay> {
    const formData = this.toFormData(data as ContractDelayFormData);
    const response = await axiosClient.put<ContractDelay>(
      `/contract-delays/${id}/`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percent);
          }
        },
      }
    );
    return response;
  }

  async delete(id: number): Promise<void> {
    await axiosClient.delete<void>(`/contract-delays/${id}/`);
  }

  // ==================== Helper ====================
  /**
   * تبدیل داده‌ها به FormData برای ارسال به سرور
   *
   * ✅ مطابق الگوی پژوهش:
   * - تاریخ‌ها قبلاً در Form (handleSubmit) به میلادی تبدیل شده‌اند
   * - اینجا فقط append می‌کنیم، بدون تبدیل دوباره
   */
  private toFormData(data: ContractDelayFormData): FormData {
    const formData = new FormData();

    // ✅ لاگ برای دیباگ
    console.log('📤 ContractDelayApi - toFormData input:', {
      delay_end_date: data.delay_end_date,
      delay_days: data.delay_days,
      contract_id: data.contract_id,
    });

    // ✅ تاریخ - بدون تبدیل (چون در Form تبدیل شده)
    // برای پاک کردن تاریخ، رشته خالی ارسال می‌شود
    if (data.delay_end_date !== undefined && data.delay_end_date !== null) {
      formData.append('delay_end_date', data.delay_end_date);
    } else {
      formData.append('delay_end_date', '');
    }

    // ✅ میزان تاخیر
    formData.append('delay_days', String(data.delay_days || 0));

    // ✅ دلیل تاخیر (اختیاری)
    if (data.reason) formData.append('reason', data.reason);

    // ✅ تمدید مجاز
    formData.append('is_allowed', String(data.is_allowed ?? false));

    // ✅ قرارداد (اجباری)
    if (data.contract_id) {
      formData.append('contract_id', String(data.contract_id));
    }

    // ✅ فایل‌های پیوست جدید
    if (data.attachment_files && data.attachment_files.length > 0) {
      data.attachment_files.forEach((file) => {
        formData.append('attachment_files', file);
      });
    }

    // ✅ شناسه فایل‌های حذف‌شده
    if (data.deleted_attachment_ids && data.deleted_attachment_ids.length > 0) {
      data.deleted_attachment_ids.forEach((id) => {
        formData.append('deleted_attachment_ids', String(id));
      });
    }

    // ✅ لاگ نهایی برای دیباگ
    console.log('📤 Final FormData entries:');
    for (const pair of formData.entries()) {
      console.log(pair[0], ':', pair[1]);
    }

    return formData;
  }
}

export const contractDelayApi = new ContractDelayApi();

// // src/modules/contract-delay/api/contractDelay.api.ts

// import { axiosClient } from '../../../api/client/axiosClient';
// import { API_ENDPOINTS } from '../../../api/endpoints';
// import type {
//   ContractDelay,
//   ContractDelayFormData,
//   ContractDelayFilters,
// } from '../types/contractDelay.types';
// import type { PaginatedResponse } from '../../../types/common.types';
// import { jalaliToGregorian } from '../../../utils/dateUtils';

// class ContractDelayApi {
//   // ==================== CRUD ====================
//   async getAll(params?: ContractDelayFilters): Promise<PaginatedResponse<ContractDelay>> {
//     const cleanParams: Record<string, any> = {};
//     if (params) {
//       Object.keys(params).forEach(key => {
//         const value = params[key as keyof ContractDelayFilters];
//         if (value !== undefined && value !== null && value !== '') {
//           cleanParams[key] = value;
//         }
//       });
//     }

//     const response = await axiosClient.get<PaginatedResponse<ContractDelay>>(
//       '/contract-delays/',
//       { params: cleanParams }
//     );
//     return response;
//   }

//   async getById(id: number): Promise<ContractDelay> {
//     const response = await axiosClient.get<ContractDelay>(`/contract-delays/${id}/`);
//     return response;
//   }

//   async getByContract(contractId: number): Promise<PaginatedResponse<ContractDelay>> {
//     const response = await axiosClient.get<PaginatedResponse<ContractDelay>>(
//       API_ENDPOINTS.CONTRACT.DELAYS(contractId)
//     );
//     return response;
//   }

//   async create(
//     data: ContractDelayFormData,
//     onProgress?: (progress: number) => void
//   ): Promise<ContractDelay> {
//     const formData = this.toFormData(data);
//     const response = await axiosClient.post<ContractDelay>(
//       '/contract-delays/',
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

//   async update(
//     id: number,
//     data: Partial<ContractDelayFormData>,
//     onProgress?: (progress: number) => void
//   ): Promise<ContractDelay> {
//     const formData = this.toFormData(data as ContractDelayFormData);
//     const response = await axiosClient.put<ContractDelay>(
//       `/contract-delays/${id}/`,
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

//   async delete(id: number): Promise<void> {
//     await axiosClient.delete<void>(`/contract-delays/${id}/`);
//   }

//   // ==================== Helper ====================
//   private toFormData(data: ContractDelayFormData): FormData {
//     const formData = new FormData();

//     // تاریخ - تبدیل به میلادی
//     if (data.delay_end_date !== undefined && data.delay_end_date !== null) {
//     formData.append('delay_end_date', data.delay_end_date);
//     } else {
//       formData.append('delay_end_date', '');
//     }

//     formData.append('delay_days', String(data.delay_days || 0));
//     if (data.reason) formData.append('reason', data.reason);
//     formData.append('is_allowed', String(data.is_allowed ?? false));
//     formData.append('contract_id', String(data.contract_id));

//     // فایل‌های پیوست جدید
//     if (data.attachment_files && data.attachment_files.length > 0) {
//       data.attachment_files.forEach((file) => {
//         formData.append('attachment_files', file);
//       });
//     }

//     // فایل‌های حذف‌شده
//     if (data.deleted_attachment_ids && data.deleted_attachment_ids.length > 0) {
//       data.deleted_attachment_ids.forEach((id) => {
//         formData.append('deleted_attachment_ids', String(id));
//       });
//     }

//     return formData;
//   }
// }

// export const contractDelayApi = new ContractDelayApi();

// // import { axiosClient } from '../../../api/client/axiosClient';
// // import { API_ENDPOINTS } from '../../../api/endpoints';
// // import type {
// //   ContractDelay,
// //   ContractDelayFormData,
// //   ContractDelayFilters,
// // } from '../types/contractDelay.types';

// // class ContractDelayApi {
// //   async getAll(params?: ContractDelayFilters): Promise<ContractDelay[]> {
// //     const cleanParams: Record<string, any> = {};
// //     if (params) {
// //       Object.keys(params).forEach(key => {
// //         const value = params[key as keyof ContractDelayFilters];
// //         if (value !== undefined && value !== null && value !== '') {
// //           cleanParams[key] = value;
// //         }
// //       });
// //     }

// //     const response = await axiosClient.get<ContractDelay[]>(
// //       '/contract-delays/',
// //       { params: cleanParams }
// //     );
// //     return response;
// //   }

// //   async getByContract(contractId: number): Promise<ContractDelay[]> {
// //     const response = await axiosClient.get<ContractDelay[]>(
// //       API_ENDPOINTS.CONTRACT.DELAYS(contractId)
// //     );
// //     return response;
// //   }

// //   async getById(id: number): Promise<ContractDelay> {
// //     const response = await axiosClient.get<ContractDelay>(
// //       `/contract-delays/${id}/`
// //     );
// //     return response;
// //   }

// //   // ✅ مثل مدل Progress: از contract استفاده می‌کنیم
// //   async create(data: ContractDelayFormData): Promise<ContractDelay> {
// //     // فقط فیلدهایی که بک‌اند نیاز دارد
// //     const payload = {
// //       delay_end_date: data.delay_end_date,
// //       delay_days: data.delay_days,
// //       reason: data.reason || '',
// //       is_allowed: data.is_allowed,
// //       contract: data.contract_id,  // ← contract_id را به contract تبدیل می‌کنیم
// //     };
    
// //     console.log('📤 Creating ContractDelay payload:', payload);
    
// //     const response = await axiosClient.post<ContractDelay>(
// //       '/contract-delays/',
// //       payload
// //     );
// //     return response;
// //   }

// //   async update(id: number, data: Partial<ContractDelayFormData>): Promise<ContractDelay> {
// //     const payload: Record<string, any> = {};
    
// //     if (data.delay_end_date !== undefined) payload.delay_end_date = data.delay_end_date;
// //     if (data.delay_days !== undefined) payload.delay_days = data.delay_days;
// //     if (data.reason !== undefined) payload.reason = data.reason;
// //     if (data.is_allowed !== undefined) payload.is_allowed = data.is_allowed;
// //     if (data.contract_id !== undefined) payload.contract = data.contract_id;  // ← تبدیل
    
// //     console.log('📤 Updating ContractDelay payload:', payload);
    
// //     const response = await axiosClient.patch<ContractDelay>(
// //       `/contract-delays/${id}/`,
// //       payload
// //     );
// //     return response;
// //   }

// //   async delete(id: number): Promise<void> {
// //     await axiosClient.delete<void>(`/contract-delays/${id}/`);
// //   }
// // }

// // export const contractDelayApi = new ContractDelayApi();