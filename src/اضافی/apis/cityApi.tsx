// src/services/cityApi.ts

import { BaseApiService } from './baseApi';
import type { City, CityFormData } from '../types';

const toFormData = (data: CityFormData): FormData => {
  const formData = new FormData();
  formData.append('name', data.name);
  formData.append('province', String(data.provinceId));
  if (data.code) formData.append('code', data.code);
  return formData;
};

class CityApiService extends BaseApiService<City, CityFormData, CityFormData> {
  constructor() {
    super({
      endpoint: '/cities/',
      transformFormData: toFormData,
    });
  }

  async getByProvince(provinceId: number): Promise<City[]> {
    const response = await this.getAll({ province: provinceId });
    return response;
  }
}

export const cityApi = new CityApiService();

