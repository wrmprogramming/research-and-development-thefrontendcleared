// src/modules/settlement/types/settlement.types.ts

import type { IBaseModel } from '../../../types/common.types';

// ========== Settlement Model ==========
export interface Settlement extends IBaseModel {
  certificate_number: string;
  date: string;
  description: string;
  certificate_file: string | null;
  contract: number | Contract;
  contract_number?: string;
  contract_subject?: string;
}

// ========== Settlement Form Data ==========
// ✅ فقط contract_id برای استفاده در فرم
export interface SettlementFormData {
  certificate_number: string;
  date: string;
  description?: string;
  certificate_file?: File | string | null;
  contract_id: number;  // ← فقط contract_id
  // contract در API استفاده می‌شود
}

// ========== Settlement Filters ==========
export interface SettlementFilters {
  contract?: number;
  search?: string;
}

// ========== Related Types ==========
export interface Contract {
  id: number;
  contract_number: string;
  subject: string;
  total_amount: number;
}