// services/contractDelayApi.ts
import { BaseApiService } from './baseApi';
import type { ContractDelay, ContractDelayFormData } from '../types';

const toFormData = (data: ContractDelayFormData): FormData => {
  const formData = new FormData();
  formData.append('delayend', data.delayend);
  formData.append('delaytime', data.delaytime.toString());
  formData.append('isallowed', data.isallowed.toString());
  formData.append('contractId', data.contractId.toString());
  return formData;
};

class ContractDelayApiService extends BaseApiService<ContractDelay, ContractDelayFormData, ContractDelayFormData> {
  constructor() {
    super({
      endpoint: '/contractdelays/',
      transformFormData: toFormData,
    });
  }
}

export const contractDelayApi = new ContractDelayApiService();