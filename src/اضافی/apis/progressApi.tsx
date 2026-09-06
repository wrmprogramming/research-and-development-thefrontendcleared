// services/progressApi.ts
import { BaseApiService } from './baseApi';
import type { Progress, ProgressFormData } from '../types';

const toFormData = (data: ProgressFormData): FormData => {
  const formData = new FormData();
  if (data.notes) formData.append('notes', data.notes);
  formData.append('physicalprogresspercentage', data.physicalprogresspercentage.toString());
  formData.append('registereddate', data.registereddate);
  formData.append('steeringcommitteeId', data.steeringcommitteeId.toString());
  formData.append('contractId', data.contractId.toString());
  return formData;
};

class ProgressApiService extends BaseApiService<Progress, ProgressFormData, ProgressFormData> {
  constructor() {
    super({
      endpoint: '/progresses/',
      transformFormData: toFormData,
    });
  }
}

export const progressApi = new ProgressApiService();