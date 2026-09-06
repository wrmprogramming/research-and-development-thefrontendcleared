// hooks/useSettlement.ts
import { useGenericCrud } from './useGenericCrud';
import { settlementApi } from 'src/apis/settlementApi';
import type { Settlement, SettlementFormData } from '../types';

export const useSettlement = () => {
  return useGenericCrud<Settlement, SettlementFormData, SettlementFormData>(
    settlementApi,
    'settlements',
    {
      successMessages: {
        create: 'تسویه حساب با موفقیت اضافه شد',
        update: 'تسویه حساب با موفقیت ویرایش شد',
        delete: 'تسویه حساب با موفقیت حذف شد',
      },
      staleTime: 2 * 60 * 1000,
      retry: 2,
    }
  );
};