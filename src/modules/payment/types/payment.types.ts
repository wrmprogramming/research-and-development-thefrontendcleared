// src/modules/payment/types/payment.types.ts

import type { IBaseModel } from '../../../types/common.types';

export interface PaymentAttachment {
  id: number;
  file: string;
  filename: string;
  uploaded_at: string;
  size: number;
}

export interface Payment extends IBaseModel {
  payment_number: string;
  amount: number;
  payment_date: string;
  description?: string;
  is_paid: boolean;
  is_verified: boolean;
  payment_type: number | PaymentType;
  payment_type_name?: string;
  payment_type_code?: string;
  contract: number | Contract;
  contract_number?: string;
  contract_subject?: string;
  receiver?: number | Person | null;
  receiver_name?: string;
  verified_at?: string | null;
  verified_by?: number | null;
  verified_by_name?: string;
  attachments?: PaymentAttachment[];
}

export interface PaymentFormData {
  payment_number?: string;
  amount: number;
  payment_date: string;
  description?: string;
  is_paid?: boolean;
  is_verified?: boolean;
  contract_id: number | null;
  payment_type_id: number | null;
  attachment_files?: File[];
  deleted_attachment_ids?: number[];
}

// ✅ تایپ‌های منطبق با پاسخ بک‌اند
export interface PaymentTypeStat {
  payment_type__name: string;
  payment_type__code: string;
  count: number;
  total_amount: number;
}

export interface ContractStat {
  contract__id?: number;
  contract__contract_number: string;
  contract__subject: string;
  contract__total_amount: number;
  count: number;
  paid_amount: number;
}

export interface MonthStat {
  month_name: string;
  count: number;
  total_amount: number;
}

export interface YearStat {
  count: number;
  total_amount: number;
}

export interface VerificationStats {
  verified: number;
  unverified: number;
  verified_amount: number;
  unverified_amount: number;
}

export interface PaymentStats {
  total_payments: number;
  total_amount: number;
  paid_count: number;
  unpaid_count: number;
  verified_count: number;
  unverified_count: number;
  paid_amount: number;
  verified_amount: number;
  average_amount: number;
  verification_stats: VerificationStats;
  by_payment_type: PaymentTypeStat[];
  by_contract: ContractStat[];
  by_month: Record<string, MonthStat>;
  by_year: Record<string, YearStat>;
  contract_year_stats?: Record<number, Record<number, {
    year: number;
    total_amount: number;
    count: number;
  }>>;
}

export interface PaymentFilters {
  contract?: number;
  payment_type?: number;
  is_paid?: boolean;
  is_verified?: boolean;
  receiver?: number;
  search?: string;
  page?: number;
  page_size?: number;
}

export interface PaymentType {
  id: number;
  name: string;
  code: string;
  description?: string;
}

export interface Contract {
  id: number;
  contract_number: string;
  subject: string;
  total_amount: number;
}

export interface Person {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
}

