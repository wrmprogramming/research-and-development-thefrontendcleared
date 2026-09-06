// src/modules/project-subject/types/project-subject.types.ts

import type { IBaseModel } from '../../../types/common.types';

// ========== Project Subject Model ==========
export interface ProjectSubject extends IBaseModel {
  name: string;
  description?: string;
  // is_active?: boolean;
}

// ========== Project Subject Form Data ==========
export interface ProjectSubjectFormData {
  name: string;
  description?: string;
}

// ========== Project Subject Filters ==========
export interface ProjectSubjectFilters {
  search?: string;
}