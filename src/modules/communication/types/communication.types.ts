// src/modules/communication/types/communication.types.ts

import type { IBaseModel } from '../../../types/common.types';

// ========== Communication ==========
export interface Communication extends IBaseModel {
  title: string;
  description?: string;
  sender: string;
  receiver: string;
  date: string;
  send_date?: string | null;
  receive_date?: string | null;
  attachment?: string | null;
  letter_file?: string | null;
  research?: number | { id: number; code: string; title: string } | null; 
  // contract?: number | null;
  // contract_number?: string | null;
  // contract_subject?: string | null;
  research_code?: string | null;
  research_title?: string | null;
}

export interface CommunicationFormData {
  title: string;
  description?: string;
  sender: string;
  receiver: string;
  date: string;
  send_date?: string | null;
  receive_date?: string | null;
  attachment?: File | string | null;
  letter_file?: File | string | null;
  // contract_id?: number | null;
  research_id?: number | null;
}

export interface CommunicationFilters {
  // contract?: number;
  research?: number;
  search?: string;
  year?: number;
  from_date?: string;
  to_date?: string;
  page?: number;
  page_size?: number;
  ordering?: string;
}

// ========== Communication Stats ==========
export interface CommunicationStats {
  total: number;
  // total_with_contract: number;
  total_with_research: number;
  // by_contract: Array<{
  //   contract_id: number;
  //   contract_number: string;
  //   count: number;
  // }>;
  by_research: Array<{
    research_id: number;
    research_code: string;
    count: number;
  }>;
  by_month: Record<string, {
    month_name: string;
    count: number;
  }>;
  by_year: Record<string, {
    year: number;
    count: number;
  }>;
  available_years: number[];
}

export interface Contract {
  id: number;
  contract_number: string;
  subject: string;
}

export interface Research {
  id: number;
  code: string;
  title: string;
}

