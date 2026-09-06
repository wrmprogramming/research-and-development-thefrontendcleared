// hooks/useSteeringCommittee.ts
import { useGenericCrud } from './useGenericCrud';
import { steeringCommitteeApi } from 'src/apis/steeringCommitteeApi';
import type { SteeringCommittee, SteeringCommitteeFormData } from '../types';

export const useSteeringCommittee = () => {
  return useGenericCrud<SteeringCommittee, SteeringCommitteeFormData, SteeringCommitteeFormData>(
    steeringCommitteeApi,
    'steeringcommittees',
    {
      successMessages: {
        create: 'کمیته راهبری با موفقیت اضافه شد',
        update: 'کمیته راهبری با موفقیت ویرایش شد',
        delete: 'کمیته راهبری با موفقیت حذف شد',
      },
      staleTime: 2 * 60 * 1000,
      retry: 2,
    }
  );
};