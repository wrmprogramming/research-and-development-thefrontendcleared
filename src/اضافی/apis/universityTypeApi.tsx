// src/services/universityTypeApi.ts

import { BaseApiService } from './baseApi';
import type { UniversityType, UniversityTypeFormData } from '../types';

const toFormData = (data: UniversityTypeFormData): FormData => {
  const formData = new FormData();
  if (data.name) formData.append('name', data.name);
  if (data.code) formData.append('code', data.code);
  if (data.description) formData.append('description', data.description);
  return formData;
};

class UniversityTypeApiService extends BaseApiService<UniversityType, UniversityTypeFormData, UniversityTypeFormData> {
  constructor() {
    super({
      endpoint: '/university-types/',
      transformFormData: toFormData,
    });
  }
}

export const universityTypeApi = new UniversityTypeApiService();
