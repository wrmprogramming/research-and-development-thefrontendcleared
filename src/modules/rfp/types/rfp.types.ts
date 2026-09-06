// src/modules/rfp/types/rfp.types.ts

import type { IBaseModel } from '../../../types/common.types';

// ========== RFP Attachment ==========
export interface RfpAttachment {
  id: number;
  file: string;
  filename: string;
  uploaded_at: string;
  size: number;
}

// ========== Basic Question ==========
export interface BasicQuestion {
  id?: number;
  question: string;
  order?: number;
}

// ========== Consumer ==========
export interface Consumer {
  id?: number;
  name: string;
  description?: string;
}

// ========== RFP Model ==========
export interface Rfp extends IBaseModel {
  code: string;
  title: string;
  description?: string;
  estimated_price: number;
  approximate_project_time: number;
  necessity_declaration: string;
  solution_exact_definition: string;
  publish_date: string; // تاریخ انتشار
  // deadline_date: string; // کامنت شده
  research: number | Research | null;
  research_code?: string;
  research_title?: string;
  attachments?: RfpAttachment[];
  research_year?: number; //اضافه شد: سال پژوهش مرتبط
  // is_active حذف شد
  basic_questions?: BasicQuestion[];
  consumers?: Consumer[];
}

// ========== RFP Form Data ==========
export interface RfpFormData {
  code?: string;
  title: string;
  description?: string;
  estimated_price: number;
  approximate_project_time: number;
  necessity_declaration: string;
  solution_exact_definition: string;
  // deadline_date: string;
  research_id: number | null;
  attachment_files?: File[];
  deleted_attachment_ids?: number[];
  // is_active حذف شد
  basic_questions?: BasicQuestion[];
  consumers?: Consumer[];
}

// ========== RFP Filters ==========
export interface RfpFilters {
  search?: string;
  research?: number;
  // is_active حذف شد
  year?: number; // فیلتر بر اساس سال
  start_date?: string; // فیلتر تاریخ شروع
  end_date?: string; // فیلتر تاریخ پایان
  page?: number;
  page_size?: number;
  ordering?: string;
}

// ========== Research ==========
export interface Research {
  id: number;
  code: string;
  title: string;
}

// ========== RFP Stats ==========
export interface RfpStats {
  total: number;
  total_estimated_price: number;
  average_estimated_price: number;
  by_year: {
    year: number;
    count: number;
    total_price: number;
    average_price: number;
  }[]; // تغییر از by_research به by_year
  monthly_stats?: {
    month: string;
    count: number;
    total_price: number;
  }[]; // آمار ماهانه (اختیاری)
  date_range?: {
    start_date: string;
    end_date: string;
  }; // بازه تاریخی
}
