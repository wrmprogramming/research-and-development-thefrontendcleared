// services/paymentTypeApi.ts
import { BaseApiService } from './baseApi';
import type { PaymentType, PaymentTypeFormData } from '../types';

const toFormData = (data: PaymentTypeFormData): FormData => {
  const formData = new FormData();
  formData.append('name', data.name);
  return formData;
};

class PaymentTypeApiService extends BaseApiService<PaymentType, PaymentTypeFormData, PaymentTypeFormData> {
  constructor() {
    super({
      endpoint: '/paymenttypes/',
      transformFormData: toFormData,
    });
  }
}

export const paymentTypeApi = new PaymentTypeApiService();