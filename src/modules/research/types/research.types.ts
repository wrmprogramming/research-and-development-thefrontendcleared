// src/modules/research/types/research.types.ts

// ============================================================
// 1. ایمپورت‌ها
// ============================================================
// ایمپورت نوع پایه مدل‌ها از فایل مشترک
import type { IBaseModel } from '../../../types/common.types';
// ایمپورت نوع وضعیت پژوهش از فایل مشترک API
import type { ResearchStatus as CoreResearchStatus } from '../../../types/api.types';



// ============================================================
// 2. تعریف مجدد و صادرات انواع اصلی
// ============================================================

// وضعیت پژوهش را دوباره صادر می‌کنیم تا در کل ماژول یکپارچه باشد
export type ResearchStatus = CoreResearchStatus;

// ============================================================
// 3. آبجکت وضعیت‌ها با لیبل و رنگ
// ============================================================
// این آبجکت برای نمایش وضعیت در لیست و فرم استفاده می‌شود
export const RESEARCH_STATUSES: Record<ResearchStatus, { label: string; color: string }> = {
  DRAFT: { label: 'پیش‌نویس', color: '#6b7280' },      // خاکستری
  IN_PROGRESS: { label: 'در حال اجرا', color: '#2563eb' }, // آبی
  COMPLETED: { label: 'تکمیل شده', color: '#059669' },    // سبز
};

// ============================================================
// 4. مدل فایل پیوست
// ============================================================
// این مدل برای نمایش لیست فایل‌های آپلود شده استفاده می‌شود
export interface ResearchAttachment {
  id: number;             // شناسه یکتا
  file: string;           // آدرس فایل (URL)
  filename: string;       // نام فایل
  uploaded_at: string;    // تاریخ آپلود
  size: number;           // حجم فایل به بایت
}

// ============================================================
// 5. مدل اصلی پژوهش
// ============================================================
// این اینترفیس ساختار داده‌ای است که از بک‌اند دریافت می‌کنیم
export interface Research extends IBaseModel {
  code: string;                                 // کد پژوهش
  title: string;                                // عنوان
  description?: string;                         // توضیحات (اختیاری)
  approve_date?: string;                        // تاریخ تصویب (اختیاری)
  start_date?: string;                          // تاریخ شروع (اختیاری)
  end_date?: string;                            // تاریخ پایان (اختیاری)
  year: number;                                 // سال پژوهش
  budget?: number;                              // بودجه (اختیاری)
  status: ResearchStatus;                       // وضعیت
  status_display?: string;                      // نمایش فارسی وضعیت
  primary_researcher?: number | Person | null;  // شناسه یا آبجکت پژوهشگر اصلی
  primary_researcher_name?: string;             // نام پژوهشگر اصلی (از بک‌اند)
  researchers?: string;                         // لیست همکاران (رشته)
  researchers_display?: string;                 // نمایش همکاران
  affiliation_type: 'UNIVERSITY' | 'COMPANY';   // نوع همکار
  university: number | University | null;       // دانشگاه (شناسه یا آبجکت)
  university_name?: string;                     // نام دانشگاه
  company: number | Company | null;             // شرکت (شناسه یا آبجکت)
  company_name?: string;                        // نام شرکت
  attachments?: ResearchAttachment[];           // لیست فایل‌های پیوست
  is_active?: boolean;                          // فعال/غیرفعال
}

// ============================================================
// 6. مدل داده‌های فرم (برای ارسال به سرور)
// ============================================================
// این اینترفیس برای ارسال داده به API استفاده می‌شود
export interface ResearchFormData {
  code?: string;                                // کد (اختیاری)
  title: string;                                // عنوان (اجباری)
  description?: string;                         // توضیحات (اختیاری)
  approve_date?: string;                        // تاریخ تصویب (اختیاری)
  start_date?: string;                          // تاریخ شروع (اختیاری)
  end_date?: string;                            // تاریخ پایان (اختیاری)
  year?: number;                                // سال (اختیاری)
  budget?: number;                              // بودجه (اختیاری)
  status: ResearchStatus;                       // وضعیت (اجباری)
  primary_researcher_id: number | null;        // شناسه پژوهشگر اصلی (اجباری)
  researchers?: string;                         // همکاران (اختیاری)
  affiliation_type: 'UNIVERSITY' | 'COMPANY';   // نوع همکار (اجباری)
  university_id?: number | null;                // شناسه دانشگاه (شرطی)
  company_id?: number | null;                   // شناسه شرکت (شرطی)
  attachment_files?: File[];                    // لیست فایل‌های جدید برای آپلود
  deleted_attachment_ids?: number[];            // لیست شناسه فایل‌های حذف‌شده
}

// ============================================================
// 7. مدل آمار پژوهش‌ها (از بک‌اند)
// ============================================================
// این اینترفیس ساختار پاسخ endpoint آمار است
export interface ResearchStats {
  total: number;                                // تعداد کل
  draft: number;                                // تعداد پیش‌نویس‌ها
  active: number;                               // تعداد در حال اجرا
  completed: number;                            // تعداد خاتمه یافته
  by_status: Record<ResearchStatus, number>;    // توزیع بر اساس وضعیت
  by_year: Record<number, number>;              // توزیع بر اساس سال

  // بخش‌های زیر مطابق درخواست شما از استات حذف خواهند شد
  // by_university?: Array<{ university_name: string; count: number; }>;
  // by_company?: Array<{ company_name: string; count: number; }>;
  // by_researcher?: Array<{ researcher_name: string; count: number; }>;

  by_affiliation?: Array<{                       // توزیع بر اساس نوع همکار
    affiliation_type: string;
    count: number;
  }>;
}

// ============================================================
// 8. مدل فیلترهای جستجو
// ============================================================
// این اینترفیس برای ارسال پارامترهای کوئری به API استفاده می‌شود
// export interface ResearchFilters {
//   status?: ResearchStatus;                       // فیلتر بر اساس وضعیت
//   year?: number;                                 // فیلتر بر اساس سال
//   primary_researcher?: number;                   // فیلتر بر اساس پژوهشگر
//   company?: number;                              // فیلتر بر اساس شرکت
//   university?: number;                           // فیلتر بر اساس دانشگاه
//   search?: string;                               // جستجوی متنی
//   is_active?: boolean;                           // فیلتر فعال بودن
//   affiliation_type?: 'UNIVERSITY' | 'COMPANY';   // فیلتر نوع همکار
//   page?: number;                                 // شماره صفحه
//   page_size?: number;                            // تعداد آیتم در هر صفحه
//   ordering?: string;                             // مرتب‌سازی (مثلاً '-created_at')
// }

export interface ResearchFilters {
  status?: ResearchStatus;
  year?: number;
  primary_researcher?: number;
  company?: number;
  university?: number;
  search?: string;
  is_active?: boolean;
  affiliation_type?: 'UNIVERSITY' | 'COMPANY';
  page?: number;
  page_size?: number;
  ordering?: string;
  //  فیلترهای جدید
  budget_min?: number;
  budget_max?: number;
  approve_date_from?: string;
  approve_date_to?: string;
  start_date_from?: string;
  start_date_to?: string;
  end_date_from?: string;
  end_date_to?: string;
}

// ============================================================
// 9. مدل‌های مرتبط (برای وضوح بیشتر)
// ============================================================
// این مدل‌ها برای اشیاء تو در تو استفاده می‌شوند
export interface Person {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
}

export interface Company {
  id: number;
  name: string;
}

export interface University {
  id: number;
  name: string;
}
