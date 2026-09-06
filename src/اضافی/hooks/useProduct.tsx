// hooks/useProduct.ts
import { useGenericCrud } from './useGenericCrud';
import { productApi } from 'src/apis/productApi';
import type { Product, ProductFormData } from '../types';

export const useProduct = () => {
  return useGenericCrud<Product, ProductFormData, ProductFormData>(
    productApi,
    'products',
    {
      successMessages: {
        create: 'محصول با موفقیت اضافه شد',
        update: 'محصول با موفقیت ویرایش شد',
        delete: 'محصول با موفقیت حذف شد',
      },
      staleTime: 2 * 60 * 1000,
      retry: 2,
    }
  );
};