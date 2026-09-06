// src/modules/research-committee/types/researchCommittee.types.ts

import type { IBaseModel } from '../../../types/common.types';

// ========== Research Committee Status ==========
export type ResearchCommitteeStatus = 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export const RESEARCH_COMMITTEE_STATUSES: Record<ResearchCommitteeStatus, { label: string; color: string }> = {
  DRAFT: { label: 'پیش‌نویس', color: '#6b7280' },
  IN_PROGRESS: { label: 'در حال برگزاری', color: '#2563eb' },
  COMPLETED: { label: 'تکمیل شده', color: '#059669' },
  CANCELLED: { label: 'لغو شده', color: '#dc2626' },
};

// ========== Research Committee Model ==========
export interface ResearchCommittee extends IBaseModel {
  session_number: string;
  date: string;
  order: string;
  minutes_file?: string | null;
  attachment?: string | null;
  approvements?: ResearchApprovement[];
}

// ========== Research Approvement ==========
export interface ResearchApprovement extends IBaseModel {
  description: string;
  deadline_date?: string | null;
  responsible: string;
  committees: number;
  committees_session?: string;
  committees_date?: string;
}

// ========== Research Committee Form Data ==========
export interface ResearchCommitteeFormData {
  session_number: string;
  date: string;
  order: string;
  minutes_file?: File | string | null;
  attachment?: File | string | null;
  approvements?: Array<{
    description: string;
    deadline_date: string | null;
    responsible: string;
  }>;
}

// ========== Research Committee Filters ==========
export interface ResearchCommitteeFilters {
  search?: string;
  year?: number;
  from_date?: string;
  to_date?: string;
  page?: number;
  page_size?: number;
  ordering?: string;
}

// ========== Research Committee Statistics ==========
export interface ResearchCommitteeStats {
  total: number;
  total_approvements: number;
  by_year: Record<number, { year: number; count: number }>;
  by_month: Record<string, { month_name: string; count: number }>;
  approvements_by_year: Record<number, { year: number; count: number }>;
  available_years: number[];
}

// ========== Research Committee Paginated Response ==========
export interface ResearchCommitteePaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ResearchCommittee[];
}

