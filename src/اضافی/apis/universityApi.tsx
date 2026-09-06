// src/services/universityApi.ts

import { BaseApiService } from './baseApi';
import type { University, UniversityFormData } from '../types';

const toFormData = (data: UniversityFormData): FormData => {
  const formData = new FormData();
  
  if (data.name) formData.append('name', data.name);
  if (data.address) formData.append('address', data.address);
  if (data.phone) formData.append('phone', data.phone);
  if (data.email) formData.append('email', data.email);
  if (data.website) formData.append('website', data.website);
  if (data.cityId) formData.append('city', String(data.cityId));
  if (data.typeId) formData.append('type', String(data.typeId));
  
  return formData;
};

class UniversityApiService extends BaseApiService<University, UniversityFormData, UniversityFormData> {
  constructor() {
    super({
      endpoint: '/universities/',
      transformFormData: toFormData,
    });
  }

  async getByCity(cityId: number): Promise<University[]> {
    const response = await this.getAll({ city: cityId });
    return response;
  }

  async getByProvince(provinceId: number): Promise<University[]> {
    const response = await this.getAll({ province: provinceId });
    return response;
  }
}

export const universityApi = new UniversityApiService();

