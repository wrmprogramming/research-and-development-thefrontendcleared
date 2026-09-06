// src/modules/company/types/company.types.ts

import type { IBaseModel } from '../../../types/common.types';

// ========== Company Model ==========
export interface Company extends IBaseModel {
  name: string;
  economic_code: string | null;
  registration_number: string | null;
  national_id: string | null;
  address: string | null;
  phone: string | null;
  fax: string | null;
  email: string | null;
  website: string | null;
  province: number | Province | null;
  province_name?: string;
  postal_code: string | null;
  contracts_count?: number;
}

// ========== Company Form Data ==========
export interface CompanyFormData {
  name: string;
  economic_code?: string;
  registration_number?: string;
  national_id?: string;
  address?: string;
  phone?: string;
  fax?: string;
  email?: string;
  website?: string;
  province_id?: number | null;
  postal_code?: string;
}

// ========== Company Filters ==========
export interface CompanyFilters {
  search?: string;
  province?: number;
}

// ========== Company Stats ==========
export interface CompanyStats {
  total: number;
  with_contract: number;
  without_contract: number;
  with_email: number;
  with_phone: number;
  by_province: {
    province_id?: number;
    province_name: string;
    count: number;
  }[];
}

// ========== Province ==========
export interface Province {
  id: number;
  name: string;
}
