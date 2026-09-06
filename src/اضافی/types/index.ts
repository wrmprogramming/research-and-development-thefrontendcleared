// src/types/index.ts

// ==================== Base Types ====================
export interface IBaseModel {
  id: number;
  created_at?: string;
  updated_at?: string;
}

// ==================== Province ====================
export interface Province extends IBaseModel {
  name: string;
  cities_count?: number;
}

export interface ProvinceFormData {
  name: string;
}

// ==================== City ====================
export interface City extends IBaseModel {
  name: string;
  province: number | Province;
  province_name?: string;
  code?: string;
}

export interface CityFormData {
  name: string;
  provinceId: number;
  code?: string;
}

// ==================== University ====================
export interface UniversityType extends IBaseModel {
  name: string;
  code: string | null;
  description: string | null;
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

// ==================== Communication ====================
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
  contract?: number | any;
  research?: number | any;
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

//