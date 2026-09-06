// src/modules/payment/types/paymentType.types.ts
import type { IBaseModel } from '../../../types/common.types';

// ========== Payment Type Model ==========
export interface PaymentType extends IBaseModel {
  name: string;
  code: string;
  description?: string;
  is_active?: boolean;
}

// ========== Payment Type Form Data ==========
export interface PaymentTypeFormData {
  name: string;
  code: string;
  description?: string;
  is_active?: boolean;
}

// ========== Payment Type Filters ==========
export interface PaymentTypeFilters {
  search?: string;
  is_active?: boolean;
}