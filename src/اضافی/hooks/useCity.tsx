// src/hooks/useCity.ts
import { useGenericCrud } from './useGenericCrud';
import { cityApi } from '../apis/cityApi';
import type { City, CityFormData } from '../types';

export const useCity = () => {
  const base = useGenericCrud<City, CityFormData, CityFormData>(
    cityApi,
    'cities',
    {
      successMessages: {
        create: 'شهر با موفقیت اضافه شد',
        update: 'شهر با موفقیت ویرایش شد',
        delete: 'شهر با موفقیت حذف شد',
      },
      staleTime: 5 * 60 * 1000,
      retry: 2,
    }
  );

  const useCitiesByProvince = (provinceId: number | null) => {
    return base.useItems({ province: provinceId });
  };

  return {
    ...base,
    useCitiesByProvince,
  };
};
