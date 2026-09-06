// services/settlementApi.ts
import { BaseApiService } from './baseApi';
import type { Settlement, SettlementFormData } from '../types';

const toFormData = (data: SettlementFormData): FormData => {
  const formData = new FormData();
  formData.append('certificate', data.certificate.toString());
  formData.append('date', data.date);
  if (data.description) formData.append('description', data.description);
  formData.append('contractId', data.contractId.toString());
  return formData;
};

class SettlementApiService extends BaseApiService<Settlement, SettlementFormData, SettlementFormData> {
  constructor() {
    super({
      endpoint: '/settlements/',
      transformFormData: toFormData,
    });
  }
}

export const settlementApi = new SettlementApiService();