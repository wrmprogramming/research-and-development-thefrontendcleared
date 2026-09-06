// services/productApi.ts
import { BaseApiService } from './baseApi';
import type { Product, ProductFormData } from '../types';

const toFormData = (data: ProductFormData): FormData => {
  const formData = new FormData();
  formData.append('name', data.name);
  formData.append('price', data.price.toString());
  if (data.description) {
    formData.append('description', data.description);
  }
  return formData;
};

class ProductApiService extends BaseApiService<Product, ProductFormData, ProductFormData> {
  constructor() {
    super({
      endpoint: '/products/',
      transformFormData: toFormData,
    });
  }
}

export const productApi = new ProductApiService();