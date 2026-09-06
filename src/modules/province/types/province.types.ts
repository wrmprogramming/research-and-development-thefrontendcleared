// src/modules/province/types/province.types.ts

import type { IBaseModel } from '../../../types/common.types';

// ========== Province Model ==========
export interface Province extends IBaseModel {
  name: string;
  cities_count?: number;
}

// ========== Province Form Data ==========
export interface ProvinceFormData {
  name: string;
}

// ========== Province Filters ==========
export interface ProvinceFilters {
  search?: string;
}
