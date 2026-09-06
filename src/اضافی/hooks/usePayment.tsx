// hooks/usePayment.ts
import { useGenericCrud } from './useGenericCrud';
import { paymentApi } from 'src/apis/paymentApi';
import type { Payment, PaymentFormData } from '../types';

export const usePayment = () => {
  return useGenericCrud<Payment, PaymentFormData, PaymentFormData>(
    paymentApi,
    'payments',
    {
      successMessages: {
        create: 'پرداخت با موفقیت اضافه شد',
        update: 'پرداخت با موفقیت ویرایش شد',
        delete: 'پرداخت با موفقیت حذف شد',
      },
      staleTime: 2 * 60 * 1000,
      retry: 2,
    }
  );
};