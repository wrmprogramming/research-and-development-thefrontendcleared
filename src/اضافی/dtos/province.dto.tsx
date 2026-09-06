// src/dtos/province.dto.ts

import type { BaseDTO } from './base.dto';

// ========== DTO برای نمایش استان ==========
export interface ProvinceResponseDTO extends BaseDTO {
  id: number;
  name: string;
  cities_count?: number;
  created_at?: string;
  updated_at?: string;
}

// ========== DTO برای ایجاد استان ==========
export interface ProvinceCreateDTO {
  name: string;
}

// ========== DTO برای ویرایش استان ==========
export interface ProvinceUpdateDTO {
  name?: string;
}

// ========== DTO برای فرم استان ==========
export interface ProvinceFormDTO {
  name: string;
}

// ========== تبدیل Form به Create DTO ==========
export const toProvinceCreateDTO = (formData: ProvinceFormDTO): ProvinceCreateDTO => {
  return {
    name: formData.name.trim(),
  };
};

// ========== تبدیل Form به Update DTO ==========
export const toProvinceUpdateDTO = (formData: ProvinceFormDTO): ProvinceUpdateDTO => {
  return {
    name: formData.name.trim(),
  };
};

// ========== تبدیل Response به Form ==========
export const toProvinceFormDTO = (response: ProvinceResponseDTO): ProvinceFormDTO => {
  return {
    name: response.name,
  };
};