// services/researchApi.ts
import { BaseApiService } from './baseApi';
import type { Research, ResearchFormData } from '../types';

const toFormData = (data: ResearchFormData): FormData => {
  const formData = new FormData();
  formData.append('topic', data.topic);
  if (data.description) formData.append('description', data.description);
  formData.append('approvedate', data.approvedate);
  formData.append('year', data.year.toString());
  formData.append('statusId', data.statusId.toString());
  
  if (data.attachment === null) {
    formData.append('attachment', '');
  } else if (data.attachment instanceof File) {
    formData.append('attachment', data.attachment);
  }
  
  return formData;
};

class ResearchApiService extends BaseApiService<Research, ResearchFormData, ResearchFormData> {
  constructor() {
    super({
      endpoint: '/researches/',
      transformFormData: toFormData,
    });
  }
}

export const researchApi = new ResearchApiService();