// src/modules/person/types/person.types.ts

import type { IBaseModel } from '../../../types/common.types';

// ========== Gender ==========
export type Gender = 'M' | 'F' | 'O';

export const GENDER_LABELS: Record<Gender, string> = {
  M: 'مرد',
  F: 'زن',
  O: 'سایر',
};

// ========== Educational Degree ==========
export type EducationalDegree = 
  | 'DIPLOMA'
  | 'ASSOCIATE'
  | 'BACHELOR'
  | 'MASTER'
  | 'DOCTORATE';

export const EDUCATIONAL_DEGREE_LABELS: Record<EducationalDegree, string> = {
  DIPLOMA: 'دیپلم',
  ASSOCIATE: 'کاردانی',
  BACHELOR: 'کارشناسی',
  MASTER: 'کارشناسی ارشد',
  DOCTORATE: 'دکتری',
};

// ========== Person Model ==========
export interface Person extends IBaseModel {
  first_name: string;
  last_name: string;
  full_name: string;
  father_name?: string;
  national_code: string;
  birth_year?: string;
  gender: Gender;
  gender_display?: string;
  mobile_phone: string;
  home_phone?: string;
  work_phone?: string;
  email?: string;
  educational_degree?: EducationalDegree;
  educational_degree_display?: string;
  field_of_study?: string;
  job_position?: string;
  home_address?: string;
  work_address?: string;
  profile_image?: string | null;
  is_active?: boolean;
}

// ========== Person Form Data ==========
export interface PersonFormData {
  first_name: string;
  last_name: string;
  father_name?: string;
  national_code: string;
  birth_year?: string;
  gender: Gender;
  mobile_phone: string;
  home_phone?: string;
  work_phone?: string;
  email?: string;
  educational_degree?: EducationalDegree;
  field_of_study?: string;
  job_position?: string;
  home_address?: string;
  work_address?: string;
  profile_image?: File | string | null;
}

// ========== Person Filters ==========
export interface PersonFilters {
  search?: string;
  gender?: Gender;
  educational_degree?: EducationalDegree;
  is_active?: boolean;
}

export interface PersonStats {
  total: number;
  with_email: number;
  with_mobile: number;
  with_degree: number;
  // primary_researchers: number;
  by_gender: Record<Gender, number>;
  by_degree: Record<EducationalDegree, number>;
}