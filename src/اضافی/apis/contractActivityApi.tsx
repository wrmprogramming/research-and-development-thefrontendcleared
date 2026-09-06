// services/contractActivityApi.ts
import { BaseApiService } from './baseApi';
import type { ContractActivity, ContractActivityFormData } from '../types';

const toFormData = (data: ContractActivityFormData): FormData => {
  const formData = new FormData();
  formData.append('topic', data.topic);
  if (data.description) formData.append('description', data.description);
  formData.append('percentage', data.percentage.toString());
  formData.append('contractId', data.contractId.toString());
  return formData;
};

class ContractActivityApiService extends BaseApiService<ContractActivity, ContractActivityFormData, ContractActivityFormData> {
  constructor() {
    super({
      endpoint: '/contractactivities/',
      transformFormData: toFormData,
    });
  }
}

export const contractActivityApi = new ContractActivityApiService();