// services/researchStatusApi.ts
import { BaseApiService } from './baseApi';
import type { ResearchStatus, ResearchStatusFormData } from '../types';

const toFormData = (data: ResearchStatusFormData): FormData => {
  const formData = new FormData();
  formData.append('status', data.status);
  return formData;
};

class ResearchStatusApiService extends BaseApiService<ResearchStatus, ResearchStatusFormData, ResearchStatusFormData> {
  constructor() {
    super({
      endpoint: '/researchstatuses/',
      transformFormData: toFormData,
    });
  }
}

export const researchStatusApi = new ResearchStatusApiService();