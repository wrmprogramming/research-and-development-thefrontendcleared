// src/modules/contract/types/contract.types.ts

import type { IBaseModel } from '../../../types/common.types';

// ========== Contract Status ==========
export type ContractStatus = 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'TERMINATED';

export const CONTRACT_STATUSES: Record<ContractStatus, { label: string; color: string }> = {
  DRAFT: { label: 'پیش‌نویس', color: '#6b7280' },
  IN_PROGRESS: { label: 'جاری', color: '#2563eb' },
  COMPLETED: { label: 'خاتمه یافته', color: '#059669' },
  TERMINATED: { label: 'فسخ شده', color: '#dc2626' },
};

export const ACTIVITY_STATUSES: Record<string, { label: string; color: string }> = {
  PLANNED: { label: 'برنامه‌ریزی شده', color: '#6b7280' },
  IN_PROGRESS: { label: 'در حال اجرا', color: '#2563eb' },
  COMPLETED: { label: 'تکمیل شده', color: '#059669' },
  CANCELLED: { label: 'لغو شده', color: '#dc2626' },
  DELAYED: { label: 'تأخیر خورده', color: '#d97706' },
};

// ========== Contract Attachment ==========
export interface ContractAttachment {
  id: number;
  file: string;
  filename: string;
  uploaded_at: string;
  size: number;
}

// src/modules/contract/types/contract.types.ts

// ========== Contract Model ==========
export interface Contract extends IBaseModel {
  contract_number: string;
  subject: string;
  date: string;
  start_date: string;
  end_date: string;
  financial_progress: number;
  physical_progress: number;
  contract_duration_months: number;
  total_amount: number;
  //  حذف paid_amount
  // paid_amount: number;
  //  حذف remaining_amount
  // remaining_amount: number;
  commitments?: string;
  services_description?: string;
  documents?: string;
  contractor_address?: string;
  status: ContractStatus;
  status_display?: string;
  version: number;
  is_archived: boolean;
  affiliation_type: 'UNIVERSITY' | 'COMPANY';
  contractor?: string | null;
  company: number | Company | null;
  company_name?: string;
  university: number | University | null;
  university_name?: string;
  research?: number | Research | null;
  research_code?: string;
  attachments?: ContractAttachment[];
  activities?: ContractActivity[];
}

// ========== Contract Form Data ==========
export interface ContractFormData {
  contract_number?: string;
  subject: string;
  date: string;
  start_date: string;
  end_date: string;
  total_amount: number;
  //  حذف paid_amount
  commitments?: string;
  services_description?: string;
  documents?: string;
  contractor_address?: string;
  status: ContractStatus;
  version?: number;
  is_archived?: boolean;
  affiliation_type: 'UNIVERSITY' | 'COMPANY';
  company_id?: number | null;
  university_id?: number | null;
  research_id?: number | null;
  attachment_files?: File[];
  deleted_attachment_ids?: number[];
  activities?: Array<{
    title: string;
    description?: string;
    start_date?: string | null;
    end_date?: string | null;
    progress?: number;
    status?: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'DELAYED';
  }>;
}



// ========== Contract Filters ==========
// ========== Contract Filters ==========
export interface ContractFilters {
  status?: ContractStatus;
  company?: number;
  university?: number;
  is_archived?: boolean;
  search?: string;
  year?: number;
  contractor?: string;
  affiliation_type?: 'UNIVERSITY' | 'COMPANY';

  // ✅ فیلترهای جدید: بازه مبلغ
  total_amount_min?: number;
  total_amount_max?: number;

  // ✅ فیلترهای جدید: بازه پیشرفت مالی
  financial_progress_min?: number;
  financial_progress_max?: number;

  // ✅ فیلترهای جدید: بازه پیشرفت فیزیکی
  physical_progress_min?: number;
  physical_progress_max?: number;

  // ✅ فیلترهای جدید: بازه تاریخ قرارداد
  date_from?: string;
  date_to?: string;

  // ✅ فیلترهای جدید: بازه تاریخ شروع
  start_date_from?: string;
  start_date_to?: string;

  // ✅ فیلترهای جدید: بازه تاریخ پایان
  end_date_from?: string;
  end_date_to?: string;

  page?: number;
  page_size?: number;
  ordering?: string;
}
// ========== Contract Activity ==========
export interface ContractActivity extends IBaseModel {
  title: string;
  description?: string;
  start_date?: string | null;
  end_date?: string | null;
  progress: number;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'DELAYED';
  contract: number;
  contract_number?: string;
}

export interface ContractActivityFormData {
  title: string;
  description?: string;
  start_date?: string | null;
  end_date?: string | null;
  progress?: number;
  status?: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'DELAYED';
  contract_id: number;
}

// ========== Payment ==========
export interface Payment extends IBaseModel {
  payment_number: string;
  amount: number;
  payment_date: string;
  due_date?: string | null;
  description?: string;
  receipt_file?: string | null;
  is_paid: boolean;
  is_verified: boolean;
  payment_type: number | PaymentType;
  payment_type_name?: string;
  payment_type_code?: string;
  contract: number;
  contract_number?: string;
  receiver: number | Person;
  receiver_name?: string;
  verified_at?: string | null;
  verified_by?: number | null;
  verified_by_name?: string;
}

export interface PaymentFormData {
  payment_number?: string;
  amount: number;
  payment_date: string;
  due_date?: string | null;
  description?: string;
  receipt_file?: File | string | null;
  is_paid?: boolean;
  is_verified?: boolean;
  payment_type_id: number;
  contract_id: number;
  receiver_id: number;
}

export interface PaymentType {
  id: number;
  name: string;
  code: string;
  description?: string;
}

// ========== Settlement ==========
export interface Settlement extends IBaseModel {
  certificate_number?: string;
  date: string;
  description?: string;
  total_amount: number;
  remaining_amount: number;
  certificate_file?: string | null;
  contract: number;
  contract_number?: string;
}

export interface SettlementFormData {
  certificate_number?: string;
  date: string;
  description?: string;
  total_amount: number;
  remaining_amount?: number;
  certificate_file?: File | string | null;
  contract_id: number;
}

// ========== Progress ==========
export interface Progress extends IBaseModel {
  notes?: string;
  physical_progress_percentage: number;
  registered_date: string;
  steering_committee?: number | null;
  steering_committee_session?: string;
  contract: number;
  contract_number?: string;
}

export interface ProgressFormData {
  notes?: string;
  physical_progress_percentage: number;
  registered_date: string;
  steering_committee_id?: number | null;
  contract_id: number;
}

// ========== Communication ==========
export interface Communication extends IBaseModel {
  title: string;
  description?: string;
  sender: string;
  receiver: string;
  date: string;
  send_date?: string | null;
  receive_date?: string | null;
  attachment?: string | null;
  letter_file?: string | null;
  contract?: number | null;
  contract_number?: string;
  research?: number | null;
  research_code?: string;
}

export interface CommunicationFormData {
  title: string;
  description?: string;
  sender: string;
  receiver: string;
  date: string;
  send_date?: string | null;
  receive_date?: string | null;
  attachment?: File | string | null;
  letter_file?: File | string | null;
  contract_id?: number | null;
  research_id?: number | null;
}

// ========== Related Types ==========
export interface Company {
  id: number;
  name: string;
  economic_code?: string;
}

export interface University {
  id: number;
  name: string;
}

export interface Research {
  id: number;
  code: string;
  title: string;
}

export interface Person {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
}
