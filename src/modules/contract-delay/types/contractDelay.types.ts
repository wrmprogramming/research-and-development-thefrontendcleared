// src/modules/contract-delay/types/contractDelay.types.ts

import type { IBaseModel } from '../../../types/common.types';

// ========== Contract Delay Attachment ==========
export interface ContractDelayAttachment {
  id: number;
  file: string;
  filename: string;
  uploaded_at: string;
  size: number;
}

// ========== Contract Delay Model ==========
export interface ContractDelay extends IBaseModel {
  delay_end_date: string;
  delay_days: number;
  reason?: string;
  is_allowed: boolean;
  contract: number | Contract;
  contract_number?: string;
  contract_subject?: string;
  attachments?: ContractDelayAttachment[];
}

// ========== Contract Delay Form Data ==========
export interface ContractDelayFormData {
  delay_end_date: string;
  delay_days: number;
  reason?: string;
  is_allowed: boolean;
  contract_id: number;
  attachment_files?: File[];
  deleted_attachment_ids?: number[];
}

// ========== Contract Delay Filters ==========
export interface ContractDelayFilters {
  contract?: number;
  is_allowed?: boolean;
  search?: string;
  from_date?: string;
  to_date?: string;
  min_days?: number;
  max_days?: number;
  page?: number;
  page_size?: number;
  ordering?: string;
}

// ========== Related Types ==========
export interface Contract {
  id: number;
  contract_number: string;
  subject: string;
  total_amount: number;
}

// import type { IBaseModel } from '../../../types/common.types';

// // ========== Contract Delay Model ==========
// export interface ContractDelay extends IBaseModel {
//   delay_end_date: string;
//   delay_days: number;
//   reason: string;
//   is_allowed: boolean;
//   contract: number | Contract;
//   contract_number?: string;
//   contract_subject?: string;
// }

// // ========== Contract Delay Form Data ==========
// export interface ContractDelayFormData {
//   delay_end_date: string;
//   delay_days: number;
//   reason?: string;
//   is_allowed: boolean;
//   contract_id: number;  // ← فقط contract_id برای استفاده در فرم
//   // contract در API استفاده می‌شود
// }

// // ========== Contract Delay Filters ==========
// export interface ContractDelayFilters {
//   contract?: number;
//   is_allowed?: boolean;
//   search?: string;
// }

// // ========== Related Types ==========
// export interface Contract {
//   id: number;
//   contract_number: string;
//   subject: string;
//   total_amount: number;
// }