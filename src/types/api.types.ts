// src/core/types/api.types.ts

/**
 * نوع پاسخ استاندارد API
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

/**
 * نوع خطای API
 */
export interface ApiError {
  success: false;
  message: string;
  status: number;
  errors?: Record<string, string[]>;
  detail?: string;
}


export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
/**
 * پارامترهای Pagination
 */
export interface PaginationParams {
  page?: number;
  page_size?: number;
  ordering?: string;
  search?: string;
}

/**
 * وضعیت‌های پژوهش
 */
export type ResearchStatus = 
  | 'DRAFT'
  | 'IN_PROGRESS'
  | 'COMPLETED';
 

/**
 * وضعیت‌های قرارداد
 */
export type ContractStatus = 
  | 'DRAFT'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'TERMINATED'
  | 'EXPIRED';

/**
 * جنسیت
 */
export type Gender = 'M' | 'F' | 'O';

/**
 * مدارک تحصیلی
 */
export type EducationalDegree = 
  | 'DIPLOMA'
  | 'ASSOCIATE'
  | 'BACHELOR'
  | 'MASTER'
  | 'DOCTORATE';
  
