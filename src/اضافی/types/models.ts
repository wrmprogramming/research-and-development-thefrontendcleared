// ==================== Base Types ====================
export interface IBaseModel {
  id: number;
  created_at?: string;
  updated_at?: string;
}

//==================== مدل‌های پایه ====================
export interface Province extends IBaseModel {
  name: string;
  // is_active?: boolean;
  cities_count?: number;
  created_at?: string;
}

export interface ProvinceFormData {
  name: string;
}

export interface City extends IBaseModel {
  name: string;
  province: number | Province;
  province_name?: string;
  code?: string;
  // is_active?: boolean;
}

export interface CityFormData {
  name: string;
  provinceId: number;
  code?: string;
}

export interface Company extends IBaseModel {
  name: string;
  economic_code: string | null;
  registration_number: string | null;
  national_id: string | null;
  address: string | null;
  phone: string | null;
  fax: string | null;
  email: string | null;
  website: string | null;
  city: number | City | null;
  city_name?: string;
  postal_code: string | null;
  // is_active?: boolean;
  contracts_count?: number;
}

export interface CompanyFormData {
  name: string;
  economic_code?: string;
  registration_number?: string;
  national_id?: string;
  address?: string;
  phone?: string;
  fax?: string;
  email?: string;
  website?: string;
  cityId?: number;
  postal_code?: string;
}

export interface UniversityType extends IBaseModel {
  name: string;
  code: string | null;
  description: string | null;
  // is_active?: boolean;
  universities_count?: number;
}

export interface UniversityTypeFormData {
  name: string;
  code?: string;
  description?: string;
}


export interface University extends IBaseModel {
  name: string;
  type: number | UniversityType;
  city: number | City;
  address: string | null;
  phone: string | null;
  email?: string;
  website?: string;
  city_name?: string;
  province_name?: string;
  type_name?: string;
  is_active?: boolean;
}

export interface UniversityFormData {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  cityId: number;
  typeId: number;
}


export interface Person extends IBaseModel {
  first_name: string;
  last_name: string;
  full_name: string;
  father_name?: string;
  national_code: string;
  birth_date?: string;
  jalali_birth_date?: string;
  gender: 'M' | 'F' | 'O';
  mobile_phone: string;
  home_phone?: string;
  work_phone?: string;
  email?: string;
  educational_degree?: string;
  field_of_study?: string;
  job_position?: string;
  home_address?: string;
  work_address?: string;
  profile_image?: string | null;
  // is_active?: boolean;
}

export interface PersonFormData {
  first_name: string;
  last_name: string;
  father_name?: string;
  national_code: string;
  birth_date?: string;
  gender: 'M' | 'F' | 'O';
  mobile_phone: string;
  home_phone?: string;
  work_phone?: string;
  email?: string;
  educational_degree?: string;
  field_of_study?: string;
  job_position?: string;
  home_address?: string;
  work_address?: string;
  profile_image?: File | string | null;
}

// ==================== مدل‌های پژوهشی ====================

export type ResearchStatus = 
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'COMPLETED'
  | 'CANCELED';

export const ResearchStatusLabels: Record<ResearchStatus, string> = {
  DRAFT: 'پیش‌نویس',
  SUBMITTED: 'ارسال شده',
  UNDER_REVIEW: 'در حال بررسی',
  APPROVED: 'تصویب شده',
  REJECTED: 'رد شده',
  COMPLETED: 'تکمیل شده',
  CANCELED: 'لغو شده',
};
export interface Research extends IBaseModel {
  code: string;
  title: string;
  description?: string;
  approve_date: string;
  jalali_approve_date?: string;
  start_date?: string;
  end_date?: string;
  year: number;
  budget: number;
  status: ResearchStatus;
  status_display?: string;
  primary_researcher: number | Person;
  primary_researcher_name?: string;
  researchers?: number[] | Person[];
  company: number | Company | null;
  company_name?: string;
  university: number | University | null;
  university_name?: string;
  attachment?: string | null;
  is_confidential?: boolean;
  is_active?: boolean;
}

export interface ResearchFormData {
  code?: string;
  title: string;
  description?: string;
  approve_date: string;
  start_date?: string;
  end_date?: string;
  year?: number;
  budget: number;
  status: ResearchStatus;
  primary_researcher_id: number;
  researcher_ids?: number[];
  company_id?: number | null;
  university_id?: number | null;
  attachment?: File | string | null;
  is_confidential?: boolean;
}

export interface RFP extends IBaseModel {
  code: string;
  title: string;
  description: string;
  estimated_price: number;
  approximate_project_time: number;
  necessity_declaration: string;
  solution_exact_definition: string;
  publish_date: string;
  deadline_date: string;
  research: number | Research;
  research_code?: string;
  research_title?: string;
  attachment?: string | null;
  is_active?: boolean;
}

export interface RFPFormData {
  code?: string;
  title: string;
  description?: string;
  estimated_price: number;
  approximate_project_time: number;
  necessity_declaration: string;
  solution_exact_definition: string;
  deadline_date: string;
  research_id: number;
  attachment?: File | string | null;
}
export interface Proposal extends IBaseModel {
  code: string;
  title_farsi: string;
  title_english?: string;
  submit_date: string;
  approved_date?: string;
  execution_location: string;
  execution_time: number;
  is_winner: boolean;
  keywords?: string;
  project_subject: number | ProjectSubject;
  project_subject_name?: string;
  university: number | University;
  university_name?: string;
  primary_researcher: number | Person;
  primary_researcher_name?: string;
  company: number | Company | null;
  company_name?: string;
  rfp: number | RFP;
  rfp_code?: string;
  attachment?: string | null;
}

export interface ProposalFormData {
  code?: string;
  title_farsi: string;
  title_english?: string;
  approved_date?: string;
  execution_location: string;
  execution_time: number;
  is_winner?: boolean;
  keywords?: string;
  project_subject_id: number;
  university_id: number;
  primary_researcher_id: number;
  company_id?: number | null;
  rfp_id: number;
  attachment?: File | string | null;
}

//==================== مدل‌های کمکی ====================

export interface ProjectKeywordFormData {
  farsiname: string;
  englishname?: string;
  proposalId: number;
}
export interface ProjectKeyword extends IBaseModel {
  farsi_name: string;
  english_name?: string;
  proposal: number | Proposal;
}

export interface ProjectSubject extends IBaseModel {
  name: string;
  description?: string;
  // is_active?: boolean;
}

export interface ProjectSubjectFormData {
  name: string;
  description?: string;
}

export interface PaymentTypeFormData {
  name: string;
  code: string;
  description?: string;
}
export interface PaymentType extends IBaseModel {
  name: string;
  code: string;
  description?: string;
  // is_active?: boolean;
}
export interface ResearchBasicQuestion {
  id: number;
  name: string;
  rfpid: RFP | number;
}

export interface ResearchBasicQuestionFormData {
  name: string;
  rfpId: number;
}
export interface ResearchConsumer {
  id: number;
  name: string;
  rfpid: RFP | number;
}

export interface ResearchConsumerFormData {
  name: string;
  rfpId: number;
}

//==================== مدل‌های قرارداد ====================

export type ContractStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'TERMINATED' | 'EXPIRED';

export const ContractStatusLabels: Record<ContractStatus, string> = {
  DRAFT: 'پیش‌نویس',
  ACTIVE: 'فعال',
  COMPLETED: 'تکمیل شده',
  TERMINATED: 'فسخ شده',
  EXPIRED: 'منقضی شده',
};
export interface Contract extends IBaseModel {
  contract_number: string;
  subject: string;
  date: string;
  start_date: string;
  end_date: string;
  effective_date?: string;
  total_amount: number;
  paid_amount: number;
  remaining_amount: number;
  description?: string;
  commitments?: string;
  services_description?: string;
  status: ContractStatus;
  version: number;
  is_archived: boolean;
  contract_file?: string | null;
  certificate_file?: string | null;
  declaration_file?: string | null;
  company: number | Company;
  company_name?: string;
  university: number | University;
  university_name?: string;
  research: number | Research | null;
  research_code?: string;
}

export interface ContractFormData {
  contract_number?: string;
  subject: string;
  date: string;
  start_date: string;
  end_date: string;
  effective_date?: string;
  total_amount: number;
  description?: string;
  commitments?: string;
  services_description?: string;
  status?: ContractStatus;
  company_id: number;
  university_id: number;
  research_id?: number | null;
  contract_file?: File | string | null;
  certificate_file?: File | string | null;
  declaration_file?: File | string | null;
}

export interface ContractActivity extends IBaseModel {
  title: string;
  description?: string;
  percentage: number;
  contract: number | Contract;
}
export interface ContractActivity extends IBaseModel {
  title: string;
  description?: string;
  percentage: number;
  contract_id: number;
}


export interface ContractDelay extends IBaseModel {
  delay_end_date: string;
  delay_days: number;
  reason?: string;
  is_allowed: boolean;
  contract: number | Contract;
}
export interface ContractDelayFormData {
  delay_end_date: string;
  delay_days: number;
  reason?: string;
  is_allowed: boolean;
  contract_id: number;
}

export interface Payment extends IBaseModel {
  payment_number: string;
  amount: number;
  payment_date: string;
  due_date?: string;
  description?: string;
  receipt_file?: string | null;
  is_paid: boolean;
  is_verified: boolean;
  payment_type: number | PaymentType;
  payment_type_name?: string;
  contract: number | Contract;
  contract_number?: string;
  receiver: number | Person;
  receiver_name?: string;
  verified_at?: string;
  verified_by: number | Person;
  verified_by_name?: string;
}

export interface PaymentFormData {
  payment_number?: string;
  amount: number;
  payment_date: string;
  due_date?: string;
  description?: string;
  receipt_file?: File | string | null;
  is_paid?: boolean;
  payment_type_id: number;
  contract_id: number;
  receiver_id: number;
  verified_by_id: number;

}

export interface Communication extends IBaseModel {
  title: string;
  description?: string;
  sender: string;
  receiver: string;
  date: string;
  send_date?: string;
  receive_date?: string;
  attachment: string | null;
  letter_file: string | null;
  contract?: number | Contract;
  research?: number | Research;
}

export interface CommunicationFormData {
  title: string;
  description?: string;
  sender: string;
  receiver: string;
  date: string;
  send_date?: string;
  receive_date?: string;
  attachment?: File | string | null;
  letter_file?: File | string | null;
  contractId?: number;
  researchId?: number;
}
//==================== مدل‌های کمیته ====================


export interface ResearchCommittee extends IBaseModel {
  session_number: string;
  date: string;
  order?: string;
  minutes_file?: string | null;
  attachment?: string | null;
  research: number | Research;
  research_code?: string;
}
export interface ResearchCommitteeFormData {
  session_number: string;
  date: string;
  order?: string;
  minutes_file?: string | null;
  attachment?: string | null;
  research_id: number;
}
export interface SteeringCommittee extends IBaseModel {
  session_number: string;
  date: string;
  description?: string;
  minutes_file?: string | null;
  attachment?: string | null;
  research: number | Research;
  research_code?: string;
}
export interface SteeringCommitteeFormData {
  session_number: string;
  date: string;
  description?: string;
  minutes_file?: string | null;
  attachment?: string | null;
  research_id : number;
}

export interface Progress extends IBaseModel {
  notes?: string;
  physical_progress_percentage: number;
  registered_date: string;
  steering_committee?: number | SteeringCommittee;
  contract: number | Contract;
  contract_number?: string;
}

export interface ProgressFormData {
  notes?: string;
  physical_progress_percentage: number;
  registered_date: string;
  steering_committee_id?: number;
  contract_id: number;
}

export interface Settlement extends IBaseModel {
  certificate_number?: string;
  date: string;
  description?: string;
  total_amount: number;
  remaining_amount: number;
  certificate_file?: string | null;
  contract: number | Contract;
}
export interface SettlementFormData {
  certificate_number?: string;
  date: string;
  description?: string;
  total_amount: number;
  remaining_amount: number;
  certificate_file?: string | null;
  contract_id: number;
}

// ==================== داشبورد و گزارش ها ====================
export interface DashboardStats {
  total_researches: number;
  active_researches: number;
  completed_researches: number;
  total_contracts: number;
  active_contracts: number;
  total_budget: number;
  total_payments: number;
  remaining_budget: number;
}

export interface ResearchStats {
  year: number;
  count: number;
  total_budget: number;
}

export interface ContractStats {
  status: string;
  status_display: string;
  count: number;
  total_amount: number;
}

