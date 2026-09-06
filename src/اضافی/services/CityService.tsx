// src/core/services/CityService.ts

import { cityApi } from '../apis/cityApi';
import { GenericCrudService } from './GenericCrudService';
import type { City } from '../types';

export class CityService extends GenericCrudService<City> {
  protected endpoint = '/cities/';
  protected apiService = cityApi;
  protected queryKey = 'cities';

  protected transformCreateData(data: any): any {
    return {
      name: data.name,
      province: Number(data.provinceId)
    };
  }

  protected transformUpdateData(data: any): any {
    const result: any = {};
    if (data.name) result.name = data.name;
    if (data.provinceId) result.province = Number(data.provinceId);
    return result;
  }

  protected transformResponse(data: any): City {
    return data;
  }

  async refetch(): Promise<void> {
    // منطق بروزرسانی - توسط hook مدیریت می‌شود
  }

  async getByProvince(provinceId: number): Promise<City[]> {
    const response = await this.apiService.getAll({ province: provinceId });
    return response;
  }
}
//