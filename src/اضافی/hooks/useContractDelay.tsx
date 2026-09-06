// hooks/useContractDelay.ts
import { useGenericCrud } from './useGenericCrud';
import { contractDelayApi } from 'src/apis/contractDelayApi';
import type { ContractDelay, ContractDelayFormData } from '../types';

export const useContractDelay = () => {
  return useGenericCrud<ContractDelay, ContractDelayFormData, ContractDelayFormData>(
    contractDelayApi,
    'contractdelays',
    {
      successMessages: {
        create: 'تاخیر قرارداد با موفقیت اضافه شد',
        update: 'تاخیر قرارداد با موفقیت ویرایش شد',
        delete: 'تاخیر قرارداد با موفقیت حذف شد',
      },
      staleTime: 2 * 60 * 1000,
      retry: 2,
    }
  );
};