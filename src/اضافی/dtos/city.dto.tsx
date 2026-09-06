// src/dtos/city.dto.ts

import type { BaseDTO } from './base.dto';

// ========== DTO برای نمایش شهر ==========
export interface CityResponseDTO extends BaseDTO {
  id: number;
  name: string;
  province: number | { id: number; name: string };
  provinceId?: number;
  province_name?: string;
  code?: string;
  created_at?: string;
  updated_at?: string;
}

// ========== DTO برای ایجاد شهر ==========
export interface CityCreateDTO {
  name: string;
  province: number; // provinceId
  code?: string;
}

// ========== DTO برای ویرایش شهر ==========
export interface CityUpdateDTO {
  name?: string;
  province?: number;
  code?: string;
}

// ========== DTO برای فرم شهر ==========
export interface CityFormDTO {
  name: string;
  provinceId: number | null;
  code?: string;
}

// ========== تبدیل Form به Create DTO ==========
export const toCityCreateDTO = (formData: CityFormDTO): CityCreateDTO => {
  if (!formData.provinceId) {
    throw new Error('Province ID is required');
  }
  return {
    name: formData.name.trim(),
    province: formData.provinceId,
    code: formData.code,
  };
};

// ========== تبدیل Form به Update DTO ==========
export const toCityUpdateDTO = (formData: Partial<CityFormDTO>): CityUpdateDTO => {
  const result: CityUpdateDTO = {};
  if (formData.name !== undefined) result.name = formData.name.trim();
  if (formData.provinceId !== undefined) result.province = formData.provinceId;
  if (formData.code !== undefined) result.code = formData.code;
  return result;
};

// ========== تبدیل Response به Form ==========
export const toCityFormDTO = (response: CityResponseDTO): CityFormDTO => {
  const provinceId = typeof response.province === 'object' 
    ? response.province.id 
    : response.province;
  return {
    name: response.name,
    provinceId: provinceId || response.provinceId || null,
    code: response.code,
  };
};