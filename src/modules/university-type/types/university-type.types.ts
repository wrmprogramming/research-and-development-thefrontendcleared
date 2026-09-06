// src/modules/university-type/types/university-type.types.ts
import type { IBaseModel } from '../../../types/common.types';

// ========== University Type Model ==========
export interface UniversityType extends IBaseModel {
  name: string;
  code: string | null;
  description: string | null;
  universities_count?: number;
}

// ========== University Type Form Data ==========
export interface UniversityTypeFormData {
  name: string;
  code?: string;
  description?: string;
}

// ========== University Type Filters ==========
export interface UniversityTypeFilters {
  search?: string;
}