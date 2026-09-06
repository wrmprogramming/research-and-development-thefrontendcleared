// hooks/useContract.ts
import { useGenericCrud } from './useGenericCrud';
import { contractApi } from 'src/apis/contractApi';
import type { Contract, ContractFormData } from '../types';

export const useContract = () => {
  return useGenericCrud<Contract, ContractFormData, ContractFormData>(
    contractApi,
    'contracts',
    {
      successMessages: {
        create: 'قرارداد با موفقیت اضافه شد',
        update: 'قرارداد با موفقیت ویرایش شد',
        delete: 'قرارداد با موفقیت حذف شد',
      },
      staleTime: 2 * 60 * 1000,
      retry: 2,
    }
  );
};