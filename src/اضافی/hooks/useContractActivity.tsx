// hooks/useContractActivity.ts
import { useGenericCrud } from './useGenericCrud';
import { contractActivityApi } from 'src/apis/contractActivityApi';
import type { ContractActivity, ContractActivityFormData } from '../types';

export const useContractActivity = () => {
  return useGenericCrud<ContractActivity, ContractActivityFormData, ContractActivityFormData>(
    contractActivityApi,
    'contractactivities',
    {
      successMessages: {
        create: 'فعالیت قرارداد با موفقیت اضافه شد',
        update: 'فعالیت قرارداد با موفقیت ویرایش شد',
        delete: 'فعالیت قرارداد با موفقیت حذف شد',
      },
      staleTime: 2 * 60 * 1000,
      retry: 2,
    }
  );
};