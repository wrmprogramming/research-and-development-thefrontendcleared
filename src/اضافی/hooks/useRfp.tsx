// hooks/useRfp.ts
import { useGenericCrud } from './useGenericCrud';
import { rfpApi } from 'src/apis/rfpApi';
import type { Rfp, RfpFormData } from '../types';

export const useRfp = () => {
  return useGenericCrud<Rfp, RfpFormData, RfpFormData>(
    rfpApi,
    'rfps',
    {
      successMessages: {
        create: 'RFP با موفقیت اضافه شد',
        update: 'RFP با موفقیت ویرایش شد',
        delete: 'RFP با موفقیت حذف شد',
      },
      staleTime: 2 * 60 * 1000,
      retry: 2,
    }
  );
};