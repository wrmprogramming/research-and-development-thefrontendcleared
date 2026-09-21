// src/modules/progress/types/progress.types.ts

import type { IBaseModel } from '../../../types/common.types';

export interface ProgressStatus {
  label: string;
  color: string;
  icon: string;
}

export interface Progress extends IBaseModel {
  notes?: string;
  physical_progress_percentage: number;
  registered_date: string;
  registered_date_display?: string;
  steering_committee?: number | null;
  steering_committee_session?: string;
  contract: number | Contract;
  contract_number?: string;
  contract_subject?: string;
  contract_total_amount?: string;
  status?: ProgressStatus;
}

export interface ProgressFormData {
  notes?: string;
  physical_progress_percentage: number;
  registered_date: string;
  contract_id: number;
}

export interface ProgressFilters {
  contract?: number;
  search?: string;
  // ✅ بازه تاریخ
  from_date?: string;
  to_date?: string;
  // ✅ بازه درصد
  min_percentage?: number;
  max_percentage?: number;
  // ✅ فیلتر سال
  year?: number;
  // صفحه‌بندی
  page?: number;
  page_size?: number;
  ordering?: string;
}


export interface YearStat {
  year: number;
  year_gregorian: number;
  count: number;
  average_progress: number;
  max_progress: number;
  min_progress: number;
}

export interface ContractStat {
  contract_id: number;
  contract_number: string;
  contract_subject: string;
  physical_progress: number;
  start_date?: string;
  end_date?: string;
  date?: string;
  status: string;
}

export interface ProgressStats {
  total_contracts: number;
  average_progress: number;
  max_progress: number;
  min_progress: number;
  by_contract: ContractStat[];
  contract_year_stats: Record<number, Record<number, {
    year: number;
    year_gregorian: number;
    physical_progress: number;
    status: string;
  }>>;
  stats_by_year: Record<number, YearStat>;
  available_years: number[];
}

export interface Contract {
  id: number;
  contract_number: string;
  subject: string;
}

export interface SteeringCommittee {
  id: number;
  session_number: string;
  date: string;
}

