// src/types/api.ts

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: number;
  success: boolean;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
  status: number;
}