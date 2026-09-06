// hooks/usePaymentType.ts
import { useGenericCrud } from './useGenericCrud';
import { paymentTypeApi } from 'src/apis/paymentTypeApi';
import type { PaymentType, PaymentTypeFormData } from '../types';

export const usePaymentType = () => {
  return useGenericCrud<PaymentType, PaymentTypeFormData, PaymentTypeFormData>(
    paymentTypeApi,
    'paymenttypes',
    {
      successMessages: {
        create: 'نوع پرداخت با موفقیت اضافه شد',
        update: 'نوع پرداخت با موفقیت ویرایش شد',
        delete: 'نوع پرداخت با موفقیت حذف شد',
      },
      staleTime: 2 * 60 * 1000,
      retry: 2,
    }
  );
};