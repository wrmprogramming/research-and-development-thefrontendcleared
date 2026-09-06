// src/core/types/common.types.ts

export interface IBaseModel {
  id: number;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface SelectOption {
  value: string | number;
  label: string;
}
