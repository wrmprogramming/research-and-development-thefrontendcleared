// src/core/services/GenericCrudService.ts

import { BaseApiService } from '../apis/baseApi';
import type { IBaseModel } from '../types';
import { toast } from 'react-hot-toast';

// ✅ اینترفیس جدید برای API سرویس
export interface IApiService<T> {
  getAll(params?: Record<string, any>): Promise<T[]>;
  getById(id: number): Promise<T>;
  create(data: any, onProgress?: (p: number) => void): Promise<T>;
  update(id: number, data: any, onProgress?: (p: number) => void): Promise<T>;
  delete(id: number): Promise<void>;
}

export abstract class GenericCrudService<T extends IBaseModel> {
  protected abstract endpoint: string;
  protected abstract queryKey: string;
  // ✅ اینجا از IApiService استفاده کن
  protected apiService!: IApiService<T>;

  // ========== Template Methods ==========
  protected abstract transformCreateData(data: any): any;
  protected abstract transformUpdateData(data: any): any;
  protected abstract transformResponse(data: any): T;

  // ========== CRUD Operations ==========
  async getAll(params?: Record<string, any>): Promise<T[]> {
    console.log(`📤 GenericCrudService[${this.queryKey}].getAll:`, params);
    const response = await this.apiService.getAll(params);
    return response;
  }

  async getById(id: number): Promise<T> {
    console.log(`📤 GenericCrudService[${this.queryKey}].getById:`, id);
    const response = await this.apiService.getById(id);
    return this.transformResponse(response);
  }

  async create(data: any, onProgress?: (p: number) => void): Promise<T> {
    console.log(`📤 GenericCrudService[${this.queryKey}].create:`, data);
    const transformedData = this.transformCreateData(data);
    console.log('📤 transformedData:', transformedData);
    const response = await this.apiService.create(transformedData, onProgress);
    toast.success('با موفقیت اضافه شد');
    return this.transformResponse(response);
  }

  async update(id: number, data: any, onProgress?: (p: number) => void): Promise<T> {
    console.log(`📤 GenericCrudService[${this.queryKey}].update:`, { id, data });
    console.log('📤 data.attachment:', (data as any).attachment);
    console.log('📤 data.attachment === null:', (data as any).attachment === null);
    
    const transformedData = this.transformUpdateData(data);
    console.log('📤 transformedData:', transformedData);
    console.log('📤 transformedData.attachment:', (transformedData as any).attachment);
    
    const response = await this.apiService.update(id, transformedData, onProgress);
    toast.success('با موفقیت ویرایش شد');
    return this.transformResponse(response);
  }

  async delete(id: number): Promise<void> {
    console.log(`📤 GenericCrudService[${this.queryKey}].delete:`, id);
    await this.apiService.delete(id);
    toast.success('با موفقیت حذف شد');
  }

  abstract refetch(): Promise<void>;

  getQueryKey(): string {
    return this.queryKey;
  }

  getEndpoint(): string {
    return this.endpoint;
  }
}

// // src/core/services/GenericCrudService.ts

// import { BaseApiService } from '../apis/baseApi';
// import type { IBaseModel } from '../types';
// import { toast } from 'react-hot-toast';

// export abstract class GenericCrudService<T extends IBaseModel> {
//   protected abstract endpoint: string;
//   protected abstract queryKey: string;
//   protected apiService!: BaseApiService<T, any, any>;

//   // ========== Template Methods ==========
//   protected abstract transformCreateData(data: any): any;
//   protected abstract transformUpdateData(data: any): any;
//   protected abstract transformResponse(data: any): T;

//   // ========== CRUD Operations ==========
//   async getAll(params?: Record<string, any>): Promise<T[]> {
//     console.log(`📤 GenericCrudService[${this.queryKey}].getAll:`, params);
//     const response = await this.apiService.getAll(params);
//     return response;
//   }

//   async getById(id: number): Promise<T> {
//     console.log(`📤 GenericCrudService[${this.queryKey}].getById:`, id);
//     const response = await this.apiService.getById(id);
//     return this.transformResponse(response);
//   }

//   async create(data: any, onProgress?: (p: number) => void): Promise<T> {
//     console.log(`📤 GenericCrudService[${this.queryKey}].create:`, data);
//     const transformedData = this.transformCreateData(data);
//     console.log('📤 transformedData:', transformedData);
//     const response = await this.apiService.create(transformedData, onProgress);
//     toast.success('با موفقیت اضافه شد');
//     return this.transformResponse(response);
//   }

//   async update(id: number, data: any, onProgress?: (p: number) => void): Promise<T> {
//     console.log(`📤 GenericCrudService[${this.queryKey}].update:`, { id, data });
//     console.log('📤 data.attachment:', data.attachment);
//     console.log('📤 data.attachment === null:', data.attachment === null);
    
//     const transformedData = this.transformUpdateData(data);
//     console.log('📤 transformedData:', transformedData);
//     console.log('📤 transformedData.attachment:', transformedData.attachment);
    
//     const response = await this.apiService.update(id, transformedData, onProgress);
//     toast.success('با موفقیت ویرایش شد');
//     return this.transformResponse(response);
//   }

//   async delete(id: number): Promise<void> {
//     console.log(`📤 GenericCrudService[${this.queryKey}].delete:`, id);
//     await this.apiService.delete(id);
//     toast.success('با موفقیت حذف شد');
//   }

//   abstract refetch(): Promise<void>;

//   // ========== متدهای کمکی ==========
//   getQueryKey(): string {
//     return this.queryKey;
//   }

//   getEndpoint(): string {
//     return this.endpoint;
//   }
// }

// // src/core/services/GenericCrudService.ts

// import { BaseApiService } from '../apis/baseApi';
// import type { IBaseModel } from '../types';
// import { toast } from 'react-hot-toast';

// export abstract class GenericCrudService<T extends IBaseModel> {
//   protected abstract endpoint: string;
//   protected abstract queryKey: string;
//   protected apiService!: BaseApiService<T, any, any>;

//   // ========== Template Methods ==========
//   protected abstract transformCreateData(data: any): any;
//   protected abstract transformUpdateData(data: any): any;
//   protected abstract transformResponse(data: any): T;

//   // ========== CRUD Operations ==========
//   async getAll(params?: Record<string, any>): Promise<T[]> {
//     const response = await this.apiService.getAll(params);
//     return response;
//   }

//   async getById(id: number): Promise<T> {
//     const response = await this.apiService.getById(id);
//     return this.transformResponse(response);
//   }

//   async create(data: any, onProgress?: (p: number) => void): Promise<T> {
//     const transformedData = this.transformCreateData(data);
//     const response = await this.apiService.create(transformedData, onProgress);
//     toast.success('با موفقیت اضافه شد');
//     return this.transformResponse(response);
//   }

//   async update(id: number, data: any, onProgress?: (p: number) => void): Promise<T> {
//     console.log('🔥🔥🔥 GenericCrudService.update CALLED:', { id, data });
//     const transformedData = this.transformUpdateData(data);
//       console.log('🔥🔥🔥 Transformed data:', transformedData);
//     const response = await this.apiService.update(id, transformedData, onProgress);
//       console.log('🔥🔥🔥 Update response:', response);
//     toast.success('با موفقیت ویرایش شد');
//     return this.transformResponse(response);
//   }

//   async delete(id: number): Promise<void> {
//     await this.apiService.delete(id);
//     toast.success('با موفقیت حذف شد');
//   }

//   abstract refetch(): Promise<void>;

//   // ========== متدهای کمکی ==========
//   getQueryKey(): string {
//     return this.queryKey;
//   }

//   getEndpoint(): string {
//     return this.endpoint;
//   }
// }
