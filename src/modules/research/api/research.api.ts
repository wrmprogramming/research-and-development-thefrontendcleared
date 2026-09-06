// src/modules/research/api/research.api.ts

// ============================================================
// 1. ایمپورت‌ها
// ============================================================
// کلاینت محوری Axios برای درخواست‌های HTTP
// توجه: این axiosClient قبلاً با interceptors پیکربندی شده است 
// و مستقیماً data را برمی‌گرداند (نه کل response)
import { axiosClient } from '../../../api/client/axiosClient';
// آبجکت حاوی آدرس‌های API (ثابت‌های endpoints)
import { API_ENDPOINTS } from '../../../api/endpoints';
// انواع داده‌ای تعریف شده در فایل types
import type {
  Research,
  ResearchFormData,
  ResearchStats,
  ResearchFilters,
  ResearchStatus
} from '../types/research.types';
// نوع پاسخ صفحه‌بندی شده (برای لیست‌ها)
import type { PaginatedResponse } from '../../../types/common.types';
//  ایمپورت توابع تبدیل تاریخ از dateUtils
// import { 
//   jalaliToGregorian, 
//   formatJalaliDate,
//   isValidJalaliDate 
// } from '../../../utils/dateUtils';
// ============================================================
// 2. کلاس API
// ============================================================
// این کلاس تمام تعاملات با سرور را مدیریت می‌کند
// 
//  نکته مهم: axiosClient ما قبلاً با interceptor پیکربندی شده 
// و مستقیماً response.data را برمی‌گرداند. بنابراین نیازی به 
// نوشتن response.data در اینجا نیست.
// ============================================================
class ResearchApi {
  
  // ==========================================================
  // 2.1. عملیات‌های CRUD اصلی (ایجاد، خواندن، بروزرسانی، حذف)
  // ==========================================================

  /**
   * دریافت لیست پژوهش‌ها با قابلیت اعمال فیلتر
   * @param params - فیلترهای جستجو (اختیاری) مانند status, year, search و ...
   * @returns لیست صفحه‌بندی شده از پژوهش‌ها (PaginatedResponse<Research>)
   * 
   *  کاربرد: در صفحه لیست پژوهش‌ها برای نمایش همه موارد با فیلترهای مختلف
   */
  async getAll(params?: ResearchFilters): Promise<PaginatedResponse<Research>> {
    // ارسال درخواست GET به آدرس پایه پژوهش‌ها با پارامترهای فیلتر
    // axiosClient مستقیماً data را برمی‌گرداند
    const response = await axiosClient.get<PaginatedResponse<Research>>(
      API_ENDPOINTS.RESEARCH.BASE, 
      { params }
    );
    return response; // ← اینجا response همان data است (به دلیل interceptor)
  }

  /**
   * دریافت لیست پژوهش‌ها با صفحه‌بندی (مشابه getAll ولی با تأکید بر page و pageSize)
   * @param params - فیلترها + شماره صفحه و تعداد آیتم در هر صفحه
   * @returns لیست صفحه‌بندی شده
   * 
   *  کاربرد: زمانی که نیاز به کنترل دقیق صفحه‌بندی داریم
   */
  async getPaginated(params?: ResearchFilters & { page?: number; pageSize?: number }): Promise<PaginatedResponse<Research>> {
    const response = await axiosClient.get<PaginatedResponse<Research>>(
      API_ENDPOINTS.RESEARCH.BASE, 
      { params }
    );
    return response;
  }

  /**
   * دریافت اطلاعات یک پژوهش با شناسه
   * @param id - شناسه عددی پژوهش
   * @returns آبجکت کامل پژوهش
   * 
   *  کاربرد: برای نمایش جزییات یک پژوهش یا ویرایش آن
   */
  async getById(id: number): Promise<Research> {
    // ارسال درخواست GET به آدرس جزییات (که شامل id در مسیر است)
    const response = await axiosClient.get<Research>(API_ENDPOINTS.RESEARCH.DETAIL(id));
    return response;
  }

  /**
   * ایجاد یک پژوهش جدید
   * @param data - داده‌های فرم (شامل فیلدهای متنی و فایل‌ها)
   * @param onProgress - تابع callback برای گزارش پیشرفت آپلود (دریافت درصد)
   * @returns آبجکت پژوهش ایجاد شده
   * 
   *  نکات مهم:
   * 1. از FormData استفاده می‌شود چون امکان ارسال فایل را دارد
   * 2. هدر 'Content-Type': 'multipart/form-data' برای ارسال فایل ضروری است
   * 3. onUploadProgress برای نمایش نوار پیشرفت آپلود استفاده می‌شود
   */
  async create(data: ResearchFormData, onProgress?: (progress: number) => void): Promise<Research> {
    // تبدیل داده‌ها به FormData برای ارسال فایل
    const formData = this.toFormData(data);
    // ارسال درخواست POST با هدر multipart/form-data
    const response = await axiosClient.post<Research>(
      API_ENDPOINTS.RESEARCH.BASE,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        // گزارش پیشرفت آپلود
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            // محاسبه درصد پیشرفت
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percent); // صدا زدن تابع callback با درصد
          }
        },
      }
    );
    return response;
  }

  /**
   * ویرایش کامل یک پژوهش (PUT)
   * @param id - شناسه پژوهش
   * @param data - داده‌های جدید (همانند create)
   * @param onProgress - تابع callback برای گزارش پیشرفت
   * @returns آبجکت پژوهش ویرایش شده
   * 
   *  تفاوت PUT با PATCH:
   * PUT کل شیء را جایگزین می‌کند (همه فیلدها باید ارسال شوند)
   * PATCH فقط فیلدهای مشخص شده را به‌روز می‌کند
   */
  async update(id: number, data: ResearchFormData, onProgress?: (progress: number) => void): Promise<Research> {
    const formData = this.toFormData(data);
    const response = await axiosClient.put<Research>(
      API_ENDPOINTS.RESEARCH.DETAIL(id),
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
   * ویرایش جزئی یک پژوهش (PATCH)
   * @param id - شناسه پژوهش
   * @param data - بخشی از داده‌ها برای به‌روزرسانی
   * @returns آبجکت پژوهش ویرایش شده
   * 
   *  کاربرد: زمانی که فقط می‌خواهیم یک یا چند فیلد خاص را تغییر دهیم
   * مثلاً فقط تغییر وضعیت پژوهش
   */
  async patch(id: number, data: Partial<ResearchFormData>): Promise<Research> {
    // PATCH معمولاً برای تغییرات جزئی استفاده می‌شود و نیازی به FormData ندارد
    const response = await axiosClient.patch<Research>(API_ENDPOINTS.RESEARCH.DETAIL(id), data);
    return response;
  }

  /**
   * حذف یک پژوهش
   * @param id - شناسه پژوهش
   * 
   *  توجه: این عملیات غیرقابل بازگشت است (در صورت نیاز باید از کاربر تأیید بگیرید)
   */
  async delete(id: number): Promise<void> {
    await axiosClient.delete<void>(API_ENDPOINTS.RESEARCH.DETAIL(id));
  }

  // ==========================================================
  // 2.2. عملیات‌های سفارشی (Custom Operations)
  // ==========================================================
  // این متدها برای نیازهای خاص طراحی شده‌اند

  /**
   * دریافت آمار پژوهش‌ها
   * @returns آبجکت آمار شامل: total, draft, active, completed, by_status, by_year, ...
   * 
   *  کاربرد: در داشبورد و صفحه آمار برای نمایش نمودارها و کارت‌های آماری
   */
  async getStats(): Promise<ResearchStats> {
    // ارسال درخواست GET به آدرس stats/ (که در انتهای مسیر BASE قرار دارد)
    const response = await axiosClient.get<ResearchStats>(`${API_ENDPOINTS.RESEARCH.BASE}stats/`);
    return response;
  }

  /**
   * دریافت پژوهش‌ها بر اساس وضعیت
   * @param status - وضعیت مورد نظر (DRAFT, IN_PROGRESS, COMPLETED)
   * @returns آرایه‌ای از پژوهش‌ها با آن وضعیت خاص
   * 
   *  کاربرد: فیلتر کردن سریع بر اساس وضعیت
   */
  async getByStatus(status: ResearchStatus): Promise<Research[]> {
    const response = await axiosClient.get<Research[]>(API_ENDPOINTS.RESEARCH.BY_STATUS(status));
    return response;
  }

  /**
   * دریافت پژوهش‌ها بر اساس سال
   * @param year - سال مورد نظر (مثلاً 1404)
   * @returns آرایه‌ای از پژوهش‌های آن سال
   * 
   *  کاربرد: فیلتر کردن پژوهش‌های یک سال خاص
   */
  async getByYear(year: number): Promise<Research[]> {
    const response = await axiosClient.get<Research[]>(API_ENDPOINTS.RESEARCH.BY_YEAR(year));
    return response;
  }

  /**
   * دریافت RFPهای مرتبط با یک پژوهش
   * @param researchId - شناسه پژوهش
   * @returns آرایه‌ای از RFPها
   * 
   *  کاربرد: در صفحه جزییات پژوهش برای نمایش RFPهای مرتبط
   */
  async getRFPs(researchId: number): Promise<any[]> {
    const response = await axiosClient.get<any[]>(API_ENDPOINTS.RESEARCH.RFPS(researchId));
    return response;
  }

  // ==========================================================
  // 2.3. متدهای کمکی (Helper Methods)
  // ==========================================================

  /**
   * تبدیل داده‌های فرم به FormData برای ارسال فایل
   * @param data - داده‌های فرم (ResearchFormData)
   * @returns آبجکت FormData آماده برای ارسال
   *
   *  چرا FormData؟
   * وقتی می‌خواهیم فایل (مثلاً تصویر یا PDF) را به سرور ارسال کنیم، 
   * باید از multipart/form-data استفاده کنیم. FormData این امکان را 
   * به ما می‌دهد که هم فایل و هم فیلدهای متنی را با هم ارسال کنیم.
   * 
   *  نحوه کار:
   * 1. یک نمونه FormData جدید می‌سازیم
   * 2. همه فیلدهای متنی را با append اضافه می‌کنیم
   * 3. همه فایل‌ها را با append اضافه می‌کنیم
   * 4. FormData نهایی را برمی‌گردانیم
   */
  private toFormData(data: ResearchFormData): FormData {
    const formData = new FormData();

    // لاگ برای دیباگ (در محیط توسعه)
    console.log('📤 ResearchApi - toFormData input:', data);

    // --- فیلدهای متنی ---
    // همه فیلدها را با append به FormData اضافه می‌کنیم
    
    // کد پژوهش (اختیاری)
    if (data.code) formData.append('code', data.code);
    
    // عنوان پژوهش (اجباری)
    formData.append('title', data.title);
    
    // توضیحات (اختیاری)
    if (data.description) formData.append('description', data.description);
   

     //  تاریخ‌ها - حتی اگر null باشند، ارسال کن
    // برای پاک کردن تاریخ، باید رشته خالی ارسال شود
  if (data.approve_date !== undefined && data.approve_date !== null) {
    formData.append('approve_date', data.approve_date);
  } else {
    //  اگر null است، رشته خالی ارسال کن تا بک‌اند مقدار را پاک کند
    formData.append('approve_date', '');
  }
  
  if (data.start_date !== undefined && data.start_date !== null) {
    formData.append('start_date', data.start_date);
  } else {
    formData.append('start_date', '');
  }
  
  if (data.end_date !== undefined && data.end_date !== null) {
    formData.append('end_date', data.end_date);
  } else {
    //  این کلید است! برای پاک کردن تاریخ پایان، رشته خالی ارسال کن
    formData.append('end_date', '');
  }
  
    
    // بودجه (اختیاری) - فقط اگر مقدار داشته باشد و بزرگتر از صفر باشد
    if (data.budget !== undefined && data.budget !== null && data.budget > 0) {
      formData.append('budget', String(data.budget));
    }
    
    // وضعیت (اجباری)
    formData.append('status', data.status);
    
    // پژوهشگر اصلی (اختیاری) - فقط اگر شناسه داشته باشد
    if (data.primary_researcher_id && data.primary_researcher_id > 0) {
      console.log('📤 Adding primary_researcher:', data.primary_researcher_id);
      formData.append('primary_researcher_id', String(data.primary_researcher_id));
      formData.append('primary_researcher', String(data.primary_researcher_id));
    }
    
    // همکاران (اختیاری) - به صورت رشته با کاما جدا شده
    if (data.researchers) {
      formData.append('researchers', data.researchers);
    }
    
    // نوع همکار (اجباری) - UNIVERSITY یا COMPANY
    formData.append('affiliation_type', data.affiliation_type || 'UNIVERSITY');

    // سال (اختیاری)
    if (data.year) formData.append('year', String(data.year));
    
    // شناسه شرکت (اختیاری) - فقط زمانی که affiliation_type === 'COMPANY'
    if (data.company_id) formData.append('company', String(data.company_id));
    
    // شناسه دانشگاه (اختیاری) - فقط زمانی که affiliation_type === 'UNIVERSITY'
    if (data.university_id) formData.append('university', String(data.university_id));

    // --- فایل‌های پیوست جدید ---
    // حلقه روی لیست فایل‌ها و اضافه کردن هر کدام
    // در بک‌اند، این فایل‌ها به صورت لیست (List) دریافت می‌شوند
    if (data.attachment_files && data.attachment_files.length > 0) {
      data.attachment_files.forEach((file) => {
        formData.append('attachment_files', file);
      });
    }

    // --- شناسه فایل‌های حذف‌شده ---
    // این لیست برای حذف فایل‌های قبلی در زمان ویرایش استفاده می‌شود
    // در بک‌اند، این شناسه‌ها را دریافت کرده و فایل‌های مربوطه را حذف می‌کند
    if (data.deleted_attachment_ids && data.deleted_attachment_ids.length > 0) {
      data.deleted_attachment_ids.forEach((id) => {
        formData.append('deleted_attachment_ids', String(id));
      });
    }

    // لاگ نهایی برای دیباگ (مشاهده محتویات FormData)
    console.log('📤 Final FormData entries:');
    for (const pair of formData.entries()) {
      console.log(pair[0], ':', pair[1]);
    }

    return formData;
  }
}

// ============================================================
// 3. نمونه (instance) از کلاس برای استفاده در کل برنامه
// ============================================================
// با این کار نیازی به new کردن در جای دیگر نیست
// و همه جای برنامه می‌توانیم از researchApi استفاده کنیم
// 
//  مثال استفاده:
// import { researchApi } from './api/research.api';
// const researches = await researchApi.getAll({ status: 'IN_PROGRESS' });
// ============================================================
export const researchApi = new ResearchApi();
