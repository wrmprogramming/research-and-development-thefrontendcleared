// hooks/usePerson.ts
import { useGenericCrud } from './useGenericCrud';
import { personApi } from 'src/apis/personApi';
import type { Person, PersonFormData } from '../types';

export const usePerson = () => {
  return useGenericCrud<Person, PersonFormData, PersonFormData>(
    personApi,
    'persons',
    {
      successMessages: {
        create: 'فرد با موفقیت اضافه شد',
        update: 'فرد با موفقیت ویرایش شد',
        delete: 'فرد با موفقیت حذف شد',
      },
      staleTime: 2 * 60 * 1000,
      retry: 2,
    }
  );
};