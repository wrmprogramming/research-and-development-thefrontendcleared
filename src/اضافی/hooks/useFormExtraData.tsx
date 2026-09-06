// src/hooks/useFormExtraData.ts

import { useMemo } from 'react';
import { useUniversityType } from './useUniversityType';

export interface FormExtraData {
  [key: string]: any[];
}

interface UseFormExtraDataOptions {
  data: any[];
  config: {
    fields: string[];
    extractors: Record<string, (items: any[]) => any[]>;
    dependencies: Record<string, string>;
  };
}

export function useFormExtraData({ data, config }: UseFormExtraDataOptions): FormExtraData {
  // ✅ دریافت انواع دانشگاه‌ها
  const { data: universityTypes = [], isLoading } = useUniversityType().useItems?.() || { data: [], isLoading: false };
  
  return useMemo(() => {
    const result: FormExtraData = {};

    // ✅ اضافه کردن typeId (نوع دانشگاه)
    if (universityTypes && universityTypes.length > 0) {
      result.typeId = universityTypes.map((type: any) => ({
        value: type.id,
        label: type.name,
      }));
      console.log('✅ typeId options loaded:', result.typeId);
    }

    // ✅ اضافه کردن provinceId (استان)
    if (data && data.length > 0) {
      result.provinceId = data.map((item: any) => ({
        value: item.id,
        label: item.name,
      }));
      console.log('✅ provinceId options loaded:', result.provinceId);
    }

    // ✅ اضافه کردن cityId (شهر) با parentId
    if (data && data.length > 0) {
      const cities: any[] = [];
      data.forEach((province: any) => {
        if (province.children && province.children.length > 0) {
          province.children.forEach((city: any) => {
            cities.push({
              value: city.id,
              label: city.name,
              parentId: province.id,
              province: province.id,
            });
          });
        }
      });
      result.cityId = cities;
      console.log('✅ cityId options loaded:', result.cityId);
    }

    // ✅ استفاده از extractors اگر تعریف شده باشند
    if (config && config.extractors) {
      config.fields.forEach((fieldName) => {
        const extractor = config.extractors[fieldName];
        if (extractor && !result[fieldName]) {
          result[fieldName] = extractor(data);
        }
      });
    }

    return result;
  }, [data, config, universityTypes]);
}
//