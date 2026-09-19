// src/modules/communication/types/communication.types.ts

import type { IBaseModel } from '../../../types/common.types';

// ============================================================
// Communication
// ============================================================
export interface Communication extends IBaseModel {
  letter_number?: string | null;
  title: string;
  description?: string;
  sender: string;
  receiver: string;
  date: string;
  send_receive_date?: string | null;
  attachment?: string | null;
  letter_file?: string | null;
  research?: number | { id: number; code: string; title: string } | null;
  research_code?: string | null;
  research_title?: string | null;
}

export interface CommunicationFormData {
  letter_number?: string | null;
  title: string;
  description?: string;
  sender: string;
  receiver: string;
  date: string;
  send_receive_date?: string | null;
  attachment?: File | string | null;
  letter_file?: File | string | null;
  research_id?: number | null;
}

export interface CommunicationFilters {
  research?: number;
  search?: string;
  year?: number;
  from_date?: string;
  to_date?: string;
  page?: number;
  page_size?: number;
  ordering?: string;
}

// ============================================================
// Communication Stats
// ============================================================
// ✅ by_year همیشه object یکسان با { year, count } — نه عدد
export interface CommunicationStats {
  total: number;
  total_with_research: number;
  by_research: Array<{
    research_id: number;
    research_code: string;
    count: number;
  }>;
  by_month: Record<
    string,
    {
      month_name: string;
      count: number;
    }
  >;
  by_year: Record<
    string,
    {
      year: number;
      count: number;
    }
  >;
  available_years: number[];
}

// ============================================================
// انواع کمکی
// ============================================================
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

// // src/modules/communication/types/communication.types.ts

// import type { IBaseModel } from '../../../types/common.types';

// // ========== Communication ==========
// export interface Communication extends IBaseModel {
//   letter_number?: string | null;
//   title: string;
//   description?: string;
//   sender: string;
//   receiver: string;
//   date: string;
//   send_receive_date?: string | null; 
//   attachment?: string | null;
//   letter_file?: string | null;
//   research?: number | { id: number; code: string; title: string } | null; 
//   research_code?: string | null;
//   research_title?: string | null;
// }

// export interface CommunicationFormData {
//   letter_number?: string | null;
//   title: string;
//   description?: string;
//   sender: string;
//   receiver: string;
//   date: string;
//   send_receive_date?: string | null;
//   attachment?: File | string | null;
//   letter_file?: File | string | null;
//   research_id?: number | null;
// }

// export interface CommunicationFilters {
//   research?: number;
//   search?: string;
//   year?: number;
//   from_date?: string;
//   to_date?: string;
//   page?: number;
//   page_size?: number;
//   ordering?: string;
// }

// // ========== Communication Stats ==========
// export interface CommunicationStats {
//   total: number;
//   total_with_research: number;
//   by_research: Array<{
//     research_id: number;
//     research_code: string;
//     count: number;
//   }>;
//   by_month: Record<string, {
//     month_name: string;
//     count: number;
//   }>;
//   by_year: Record<string, {
//     year: number;
//     count: number;
//   }>;
//   available_years: number[];
// }

// export interface Contract {
//   id: number;
//   contract_number: string;
//   subject: string;
// }

// export interface Research {
//   id: number;
//   code: string;
//   title: string;
// }

