// src/modules/communication/api/communication.api.ts

import { axiosClient } from '../../../api/client/axiosClient';
import { API_ENDPOINTS } from '../../../api/endpoints';
import type {
  Communication,
  CommunicationFormData,
  CommunicationFilters,
  CommunicationStats,
} from '../types/communication.types';
import type { PaginatedResponse } from '../../../types/common.types';

class CommunicationApi {
  // ============================================================
  // CRUD Operations
  // ============================================================

  /**
   * دریافت لیست مکاتبات با قابلیت اعمال فیلتر و صفحه‌بندی
   */
  async getAll(params?: CommunicationFilters): Promise<PaginatedResponse<Communication>> {
    // پاکسازی پارامترهای خالی
    const cleanParams: Record<string, any> = {};
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key as keyof CommunicationFilters];
        if (value !== undefined && value !== null && value !== '' && value !== 'all') {
          cleanParams[key] = value;
        }
      });
    }
    
    const response = await axiosClient.get<PaginatedResponse<Communication>>(
      API_ENDPOINTS.COMMUNICATION.BASE,
      { params: cleanParams }
    );
    return response;
  }

  /**
   * دریافت یک مکاتبه با شناسه
   */
  async getById(id: number): Promise<Communication> {
    const response = await axiosClient.get<Communication>(
      API_ENDPOINTS.COMMUNICATION.DETAIL(id)
    );
    return response;
  }

  /**
   * ایجاد مکاتبه جدید با قابلیت آپلود فایل
   */
  async create(data: CommunicationFormData, onProgress?: (progress: number) => void): Promise<Communication> {
    const formData = this.toFormData(data);
    const response = await axiosClient.post<Communication>(
      API_ENDPOINTS.COMMUNICATION.BASE,
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

  /**
   * ویرایش کامل مکاتبه با قابلیت آپلود فایل
   */
  async update(id: number, data: Partial<CommunicationFormData>, onProgress?: (progress: number) => void): Promise<Communication> {
    const formData = this.toFormData(data as CommunicationFormData);
    const response = await axiosClient.put<Communication>(
      API_ENDPOINTS.COMMUNICATION.DETAIL(id),
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

  /**
   * ویرایش جزئی مکاتبه (بدون فایل)
   */
  async patch(id: number, data: Partial<CommunicationFormData>): Promise<Communication> {
    const response = await axiosClient.patch<Communication>(
      API_ENDPOINTS.COMMUNICATION.DETAIL(id),
      data
    );
    return response;
  }

  /**
   * حذف مکاتبه
   */
  async delete(id: number): Promise<void> {
    await axiosClient.delete<void>(
      API_ENDPOINTS.COMMUNICATION.DETAIL(id)
    );
  }

  // ============================================================
  // Stats
  // ============================================================

  /**
   * دریافت آمار مکاتبات با قابلیت فیلتر سال
   */
  async getStats(year?: number): Promise<CommunicationStats> {
    const params = year ? { year } : {};
    const response = await axiosClient.get<CommunicationStats>(
      API_ENDPOINTS.COMMUNICATION.STATS,
      { params }
    );
    return response;
  }

  // ============================================================
  // Helper Methods
  // ============================================================

  /**
   * تبدیل داده‌های فرم به FormData برای ارسال فایل
   */
  private toFormData(data: CommunicationFormData): FormData {
    const formData = new FormData();

    // فیلدهای متنی
    if (data.letter_number) formData.append('letter_number', data.letter_number);
    formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    formData.append('sender', data.sender);
    formData.append('receiver', data.receiver);
    if (data.date !== undefined && data.date !== null) {
    formData.append('date', data.date);
  } else {
    // ✅ اگر null است، رشته خالی ارسال کن تا بک‌اند مقدار را پاک کند
    formData.append('date', '');
  }
  if (data.send_receive_date !== undefined && data.send_receive_date !== null) {
    formData.append('send_receive_date', data.send_receive_date);
  } else {
    // ✅ اگر null است، رشته خالی ارسال کن تا بک‌اند مقدار را پاک کند
    formData.append('send_receive_date', '');
  }
    //  فقط research
    if (data.research_id) formData.append('research_id', String(data.research_id));
    // فایل‌ها
    // this.appendFile(formData, 'attachment', data.attachment);
    // this.appendFile(formData, 'letter_file', data.letter_file);

    if (data.attachment instanceof File) {
      formData.append('attachment', data.attachment);
    } else if (data.attachment === null || data.attachment === '') {
      // کاربر فایل رو حذف کرده → یه رشته خالی بفرست
      formData.append('attachment', '');
    }
    // else: اگه string (URL قبلی) باشه → هیچی نفرست

    if (data.letter_file instanceof File) {
      formData.append('letter_file', data.letter_file);
    } else if (data.letter_file === null || data.letter_file === '') {
      formData.append('letter_file', '');
    }
    return formData;
  }

  /**
   * اضافه کردن فایل به FormData
   */
  private appendFile(formData: FormData, key: string, value: File | string | null | undefined): void {
    if (value === null || value === '' || value === undefined) {
      // اگر مقدار خالی است، یک رشته خالی ارسال کن
      formData.append(key, '');
    } else if (value instanceof File) {
      // اگر فایل است، آن را اضافه کن
      formData.append(key, value);
    } else if (typeof value === 'string') {
      // اگر رشته است (URL موجود)، آن را ارسال کن
      formData.append(key, value);
    }
  }
}

// ============================================================
// نمونه (instance) از کلاس برای استفاده در کل برنامه
// ============================================================
export const communicationApi = new CommunicationApi();