// src/dtos/university.dto.ts

import type { BaseDTO } from './base.dto';

// ========== DTO برای نمایش دانشگاه ==========
export interface UniversityResponseDTO extends BaseDTO {
  id: number;
  name: string;
  type: number | { id: number; name: string };
  typeId?: number;
  city: number | { id: number; name: string };
  cityId?: number;
  provinceId?: number;
  address: string | null;
  phone: string | null;
  email?: string;
  website?: string;
  city_name?: string;
  province_name?: string;
  type_name?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

// ========== DTO برای ایجاد دانشگاه ==========
export interface UniversityCreateDTO {
  name: string;
  city: number; // cityId
  type: number; // typeId
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
}

// ========== DTO برای ویرایش دانشگاه ==========
export interface UniversityUpdateDTO {
  name?: string;
  city?: number;
  type?: number;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
}

// ========== DTO برای فرم دانشگاه ==========
export interface UniversityFormDTO {
  name: string;
  provinceId: number | null;
  cityId: number | null;
  typeId: number | null;
  address: string;
  phone: string;
  email: string;
  website: string;
}

// ========== تبدیل Form به Create DTO ==========
export const toUniversityCreateDTO = (formData: UniversityFormDTO): UniversityCreateDTO => {
  if (!formData.cityId) {
    throw new Error('City ID is required');
  }
  if (!formData.typeId) {
    throw new Error('Type ID is required');
  }
  return {
    name: formData.name.trim(),
    city: formData.cityId,
    type: formData.typeId,
    address: formData.address?.trim() || undefined,
    phone: formData.phone?.trim() || undefined,
    email: formData.email?.trim() || undefined,
    website: formData.website?.trim() || undefined,
  };
};

// ========== تبدیل Form به Update DTO ==========
export const toUniversityUpdateDTO = (formData: Partial<UniversityFormDTO>): UniversityUpdateDTO => {
  const result: UniversityUpdateDTO = {};
  if (formData.name !== undefined) result.name = formData.name.trim();
  if (formData.cityId !== undefined) result.city = formData.cityId;
  if (formData.typeId !== undefined) result.type = formData.typeId;
  if (formData.address !== undefined) result.address = formData.address?.trim() || null;
  if (formData.phone !== undefined) result.phone = formData.phone?.trim() || null;
  if (formData.email !== undefined) result.email = formData.email?.trim() || null;
  if (formData.website !== undefined) result.website = formData.website?.trim() || null;
  return result;
};

// ========== تبدیل Response به Form ==========
export const toUniversityFormDTO = (response: UniversityResponseDTO): UniversityFormDTO => {
  const typeId = typeof response.type === 'object' 
    ? response.type.id 
    : response.type;
  const cityId = typeof response.city === 'object' 
    ? response.city.id 
    : response.city;
  
  return {
    name: response.name,
    provinceId: response.provinceId || null,
    cityId: cityId || response.cityId || null,
    typeId: typeId || response.typeId || null,
    address: response.address || '',
    phone: response.phone || '',
    email: response.email || '',
    website: response.website || '',
  };
};