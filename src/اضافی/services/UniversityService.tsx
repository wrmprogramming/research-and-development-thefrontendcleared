// src/core/services/UniversityService.ts

import { universityApi } from '../apis/universityApi';
import { GenericCrudService } from './GenericCrudService';
import type { University } from '../types';

export class UniversityService extends GenericCrudService<University> {
  protected endpoint = '/universities/';
  protected apiService = universityApi;
  protected queryKey = 'universities';

  protected transformCreateData(data: any): any {
    const result: any = { name: data.name };
    if (data.address) result.address = data.address;
    if (data.phone) result.phone = data.phone;
    if (data.email) result.email = data.email;
    if (data.website) result.website = data.website;
    if (data.cityId) result.city = Number(data.cityId);
    if (data.typeId) result.type = Number(data.typeId);
    return result;
  }

  protected transformUpdateData(data: any): any {
    const result: any = {};
    if (data.name) result.name = data.name;
    if (data.address !== undefined) result.address = data.address;
    if (data.phone !== undefined) result.phone = data.phone;
    if (data.email !== undefined) result.email = data.email;
    if (data.website !== undefined) result.website = data.website;
    if (data.cityId) result.city = Number(data.cityId);
    if (data.typeId) result.type = Number(data.typeId);
    return result;
  }

  protected transformResponse(data: any): University {
    return data;
  }

  async refetch(): Promise<void> {
    // منطق بروزرسانی - توسط hook مدیریت می‌شود
  }

  async getByCity(cityId: number): Promise<University[]> {
    const response = await this.apiService.getAll({ city: cityId });
    return response;
  }

  async getByProvince(provinceId: number): Promise<University[]> {
    const response = await this.apiService.getAll({ province: provinceId });
    return response;
  }
}
//