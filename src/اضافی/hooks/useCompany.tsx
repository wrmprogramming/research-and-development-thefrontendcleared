// hooks/useCompany.ts
import { useGenericCrud } from './useGenericCrud';
import { companyApi } from 'src/apis/companyApi';
import type { Company, CompanyFormData } from '../types';

export const useCompany = () => {
  return useGenericCrud<Company, CompanyFormData, CompanyFormData>(
    companyApi,
    'companies',
    {
      successMessages: {
        create: 'شرکت با موفقیت اضافه شد',
        update: 'شرکت با موفقیت ویرایش شد',
        delete: 'شرکت با موفقیت حذف شد',
      },
      staleTime: 2 * 60 * 1000,
      retry: 2,
    }
  );
};