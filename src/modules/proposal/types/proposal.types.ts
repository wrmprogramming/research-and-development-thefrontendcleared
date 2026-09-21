// src/modules/proposal/types/proposal.types.ts

import type { IBaseModel } from '../../../types/common.types';

// ========== Proposal Attachment ==========
export interface ProposalAttachment {
  id: number;
  file: string;
  filename: string;
  uploaded_at: string;
  size: number;
}

// ========== Proposal Model ==========
export interface Proposal extends IBaseModel {
  code: string;
  title_farsi: string;
  title_english?: string;
  submit_date: string;
  approved_date?: string;
  execution_location: string;
  execution_time: number;
  is_winner: boolean;
  keywords?: string;
  project_subject: number | ProjectSubject;
  project_subject_name?: string;
  university: number | University;
  university_name?: string;
  primary_researcher: number | Person;
  primary_researcher_name?: string;
  company: number | Company | null;
  company_name?: string;
  rfp: number | Rfp;
  rfp_code?: string;
  rfp_title?: string;
  rfp_year?: number; // 🔥 سال از RFP مرتبط
  attachments?: ProposalAttachment[];
}

// ========== Proposal Form Data ==========
export interface ProposalFormData {
  code?: string;
  title_farsi: string;
  title_english?: string;
  approved_date?: string;
  execution_location: string;
  execution_time: number;
  is_winner?: boolean;
  keywords?: string;
  project_subject_id: number;
  university_id: number;
  primary_researcher_id: number;
  company_id?: number | null;
  rfp_id: number;
  attachment_files?: File[];
  deleted_attachment_ids?: number[];
}

// ========== Proposal Filters ==========
export interface ProposalFilters {
  search?: string;
  is_winner?: boolean;
  rfp?: number;
  university?: number;
  project_subject?: number;
  year?: number; //  فیلتر بر اساس سال
  primary_researcher?: number;        // پژوهشگر اصلی
  execution_time_min?: number;        // مدت اجرا از (ماه)
  execution_time_max?: number;        // مدت اجرا تا (ماه)
  approved_date_from?: string;        // تاریخ تصویب از (شمسی)
  approved_date_to?: string;          // تاریخ تصویب تا (شمسی)
  page?: number;
  page_size?: number;
  ordering?: string;
}

// ========== Proposal Stats ==========
export interface ProposalStats {
  total: number;
  winner_count: number;
  not_winner_count: number;
  total_by_rfp: {
    rfp_id: number;
    rfp_title: string;
    count: number;
  }[];
  total_by_university: {
    university_id: number;
    university_name: string;
    count: number;
  }[];
  //  total_by_researcher حذف شد
  by_year: {
    year: number;
    count: number;
    winner_count: number;
  }[]; //  آمار بر اساس سال
}

// ========== Related Types ==========
export interface ProjectSubject {
  id: number;
  name: string;
}

export interface University {
  id: number;
  name: string;
}

export interface Person {
  id: number;
  full_name: string;
}

export interface Company {
  id: number;
  name: string;
}

export interface Rfp {
  id: number;
  code: string;
  title: string;
  research_year?: number; // سال پژوهش مرتبط با RFP
}

