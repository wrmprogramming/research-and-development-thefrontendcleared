// src/services/provinceApi.ts

import { BaseApiService } from './baseApi';
import type { Province, ProvinceFormData } from '../types';

const toFormData = (data: ProvinceFormData): FormData => {
  const formData = new FormData();
  formData.append('name', data.name);
  return formData;
};

class ProvinceApiService extends BaseApiService<Province, ProvinceFormData, ProvinceFormData> {
  constructor() {
    super({
      endpoint: '/provinces/',
      transformFormData: toFormData,
    });
  }
}

export const provinceApi = new ProvinceApiService();
