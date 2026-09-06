// src/core/services/ProvinceService.ts

import { provinceApi } from '../apis/provinceApi';
import { GenericCrudService } from './GenericCrudService';
import type { Province } from '../types';

export class ProvinceService extends GenericCrudService<Province> {
  protected endpoint = '/provinces/';
  protected apiService = provinceApi;
  protected queryKey = 'provinces';

  protected transformCreateData(data: any): any {
    return { name: data.name };
  }

  protected transformUpdateData(data: any): any {
    return { name: data.name };
  }

  protected transformResponse(data: any): Province {
    return data;
  }

  async refetch(): Promise<void> {
    // منطق بروزرسانی - توسط hook مدیریت می‌شود
  }
}
//