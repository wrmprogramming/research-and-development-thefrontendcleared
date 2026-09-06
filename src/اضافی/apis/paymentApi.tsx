// services/paymentApi.ts
import { BaseApiService } from './baseApi';
import type { Payment, PaymentFormData } from '../types';

const toFormData = (data: PaymentFormData): FormData => {
  const formData = new FormData();
  formData.append('percentagepaid', data.percentagepaid.toString());
  formData.append('amountpaid', data.amountpaid.toString());
  if (data.description) formData.append('description', data.description);
  formData.append('paymentdate', data.paymentdate);
  formData.append('transactionnumber', data.transactionnumber);
  formData.append('paymentTypeId', data.paymentTypeId.toString());
  formData.append('contractId', data.contractId.toString());
  
  if (data.attachment === null) {
    formData.append('attachment', '');
  } else if (data.attachment instanceof File) {
    formData.append('attachment', data.attachment);
  }
  
  return formData;
};

class PaymentApiService extends BaseApiService<Payment, PaymentFormData, PaymentFormData> {
  constructor() {
    super({
      endpoint: '/payments/',
      transformFormData: toFormData,
    });
  }
}

export const paymentApi = new PaymentApiService();