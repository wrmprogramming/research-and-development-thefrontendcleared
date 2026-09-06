// services/companyApi.ts
import { BaseApiService } from './baseApi';
import type { Company, CompanyFormData } from '../types';

const toFormData = (data: CompanyFormData): FormData => {
  const formData = new FormData();
  formData.append('name', data.name);
  if (data.address) formData.append('address', data.address);
  if (data.phone) formData.append('phone', data.phone);
  return formData;
};

class CompanyApiService extends BaseApiService<Company, CompanyFormData, CompanyFormData> {
  constructor() {
    super({
      endpoint: '/companies/',
      transformFormData: toFormData,
    });
  }
}

export const companyApi = new CompanyApiService();