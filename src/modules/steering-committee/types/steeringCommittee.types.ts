// src/modules/steering-committee/types/steeringCommittee.types.ts

import type { IBaseModel } from '../../../types/common.types';

// ========== Steering Committee Status ==========
export type SteeringCommitteeStatus = 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export const STEERING_COMMITTEE_STATUSES: Record<SteeringCommitteeStatus, { label: string; color: string }> = {
  DRAFT: { label: 'پیش‌نویس', color: '#6b7280' },
  IN_PROGRESS: { label: 'در حال برگزاری', color: '#2563eb' },
  COMPLETED: { label: 'تکمیل شده', color: '#059669' },
  CANCELLED: { label: 'لغو شده', color: '#dc2626' },
};

// ========== Steering Committee Model ==========
export interface SteeringCommittee extends IBaseModel {
  session_number: string;
  date: string;
  description: string;
  minutes_file?: string | null;
  attachment?: string | null;
  research: number | Research | null;  // ✅ اختیاری
  research_code?: string;
  research_title?: string;
  approvements?: SteeringApprovement[];
}

// ========== Steering Approvement ==========
export interface SteeringApprovement extends IBaseModel {
  description: string;
  deadline_date?: string | null;
  responsible: string;
  committees: number;
  committees_session?: string;
  committees_date?: string;
}

// ========== Steering Committee Form Data ==========
export interface SteeringCommitteeFormData {
  session_number: string;
  date: string;
  description: string;
  minutes_file?: File | string | null;
  attachment?: File | string | null;
  research_id?: number | null;  // ✅ اختیاری
  approvements?: Array<{
    description: string;
    deadline_date: string | null;
    responsible: string;
  }>;
}

// ========== Steering Committee Filters ==========
export interface SteeringCommitteeFilters {
  search?: string;
  research?: number;
  year?: number;
  from_date?: string;
  to_date?: string;
  page?: number;
  page_size?: number;
  ordering?: string;
}

// ========== Steering Committee Statistics ==========
export interface SteeringCommitteeStats {
  total: number;
  total_approvements: number;
  by_year: Record<number, { year: number; count: number }>;
  by_month: Record<string, { month_name: string; count: number }>;
  by_research: Array<{
    research_id: number;
    research_title: string;
    count: number;
  }>;
  approvements_by_year: Record<number, { year: number; count: number }>;
  available_years: number[];
}

// ========== Steering Committee Paginated Response ==========
export interface SteeringCommitteePaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: SteeringCommittee[];
}

// ========== Related Types ==========
export interface Research {
  id: number;
  code: string;
  title: string;
  status: string;
}

