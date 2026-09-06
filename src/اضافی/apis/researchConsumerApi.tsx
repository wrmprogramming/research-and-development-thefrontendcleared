// services/researchConsumerApi.ts
import { BaseApiService } from './baseApi';
import type { ResearchConsumer, ResearchConsumerFormData } from '../types';

const toFormData = (data: ResearchConsumerFormData): FormData => {
  const formData = new FormData();
  formData.append('name', data.name);
  formData.append('rfpId', data.rfpId.toString());
  return formData;
};

class ResearchConsumerApiService extends BaseApiService<ResearchConsumer, ResearchConsumerFormData, ResearchConsumerFormData> {
  constructor() {
    super({
      endpoint: '/researchconsumers/',
      transformFormData: toFormData,
    });
  }
}

export const researchConsumerApi = new ResearchConsumerApiService();