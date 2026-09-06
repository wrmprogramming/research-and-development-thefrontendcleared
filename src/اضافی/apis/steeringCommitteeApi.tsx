// services/steeringCommitteeApi.ts
import { BaseApiService } from './baseApi';
import type { SteeringCommittee, SteeringCommitteeFormData } from '../types';

const toFormData = (data: SteeringCommitteeFormData): FormData => {
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

class SteeringCommitteeApiService extends BaseApiService<SteeringCommittee, SteeringCommitteeFormData, SteeringCommitteeFormData> {
  constructor() {
    super({
      endpoint: '/steeringcommittees/',
      transformFormData: toFormData,
    });
  }
}

export const steeringCommitteeApi = new SteeringCommitteeApiService();