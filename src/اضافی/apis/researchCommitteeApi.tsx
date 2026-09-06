// services/researchCommitteeApi.ts
import { BaseApiService } from './baseApi';
import type { ResearchCommittee, ResearchCommitteeFormData } from '../types';

const toFormData = (data: ResearchCommitteeFormData): FormData => {
  const formData = new FormData();
  formData.append('committeesessionnumber', data.committeesessionnumber);
  formData.append('date', data.date);
  formData.append('researchId', data.researchId.toString());
  
  if (data.attachment === null) {
    formData.append('attachment', '');
  } else if (data.attachment instanceof File) {
    formData.append('attachment', data.attachment);
  }
  
  return formData;
};

class ResearchCommitteeApiService extends BaseApiService<ResearchCommittee, ResearchCommitteeFormData, ResearchCommitteeFormData> {
  constructor() {
    super({
      endpoint: '/researchcommittees/',
      transformFormData: toFormData,
    });
  }
}

export const researchCommitteeApi = new ResearchCommitteeApiService();