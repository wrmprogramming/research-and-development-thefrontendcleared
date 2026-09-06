// src/modules/university/types/university.types.ts
import type { IBaseModel } from '../../../types/common.types';

// ========== University Type Model ==========
export interface UniversityType extends IBaseModel {
  name: string;
  code: string | null;
  description: string | null;
  universities_count?: number;
}

// ========== University Model ==========
export interface University extends IBaseModel {
  name: string;
  type: number | UniversityType;
  type_name?: string;
  city: number | City;
  city_name?: string;
  address: string | null;
  phone: string | null;
  email?: string;
  website?: string;
  province_name?: string;
}

// ========== University Form Data ==========
export interface UniversityFormData {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  city_id: number;
  type_id: number;
}

// ========== University Filters ==========
export interface UniversityFilters {
  search?: string;
  city?: number;
  type?: number;
  province?: number;
}

// ========== City ==========
export interface City extends IBaseModel {
  name: string;
  province: number | Province;
  province_name?: string;
}

// ========== Province ==========
export interface Province extends IBaseModel {
  name: string;
}

// ========== Tree Node ==========
export interface TreeNode {
  id: number;
  name: string;
  type: 'province' | 'city' | 'university';
  data: any;
  children?: TreeNode[];
  parentId?: number | null;
  expanded?: boolean;
  cities_count?: number;
  universities_count?: number;
}
