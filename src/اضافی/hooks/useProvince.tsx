// src/hooks/useProvince.ts
import { useGenericCrud } from './useGenericCrud';
import { provinceApi } from '../apis/provinceApi';
import type { Province, ProvinceFormData } from '../types';

export const useProvince = () => {
  return useGenericCrud<Province, ProvinceFormData, ProvinceFormData>(
    provinceApi,
    'provinces',
    {
      successMessages: {
        create: 'استان با موفقیت اضافه شد',
        update: 'استان با موفقیت ویرایش شد',
        delete: 'استان با موفقیت حذف شد',
      },
      staleTime: 5 * 60 * 1000,
      retry: 2,
    }
  );
};
