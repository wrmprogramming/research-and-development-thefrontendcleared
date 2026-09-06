// src/modules/city/api/city.api.ts

import { axiosClient } from '../../../api/client/axiosClient';
import { API_ENDPOINTS } from '../../../api/endpoints';
import type { City, CityFormData, CityFilters, TreeNode } from '../types/city.types';

class CityApi {
  // ========== CRUD Operations ==========

  async getAll(params?: CityFilters): Promise<City[]> {
    const cleanParams: Record<string, any> = {};
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key as keyof CityFilters];
        if (value !== undefined && value !== null && value !== '') {
          cleanParams[key] = value;
        }
      });
    }
    
    const response = await axiosClient.get<City[]>(API_ENDPOINTS.CITY.BASE, { 
      params: cleanParams 
    });
    return response;
  }

  async getById(id: number): Promise<City> {
    const response = await axiosClient.get<City>(API_ENDPOINTS.CITY.DETAIL(id));
    return response;
  }

  // ✅ اصلاح create - بک‌اند 'province' را می‌خواهد
  async create(data: CityFormData): Promise<City> {
    // ⚠️ مهم: بک‌اند فیلد 'province' را می‌خواهد، نه 'province_id'
    const payload: any = {
      name: data.name,
      province: data.province_id,  // ← اینجا 'province' است
    };
    
    if (data.code) {
      payload.code = data.code;
    }

    console.log('📤 CityApi.create - payload:', payload);

    const response = await axiosClient.post<City>(API_ENDPOINTS.CITY.BASE, payload);
    return response;
  }

  // ✅ اصلاح update - بک‌اند 'province' را می‌خواهد
  async update(id: number, data: CityFormData): Promise<City> {
    const payload: any = {
      name: data.name,
    };
    
    // ⚠️ مهم: بک‌اند 'province' را می‌خواهد
    if (data.province_id && data.province_id > 0) {
      payload.province = data.province_id;
    }

    if (data.code !== undefined) {
      payload.code = data.code;
    }

    console.log('📤 CityApi.update - payload:', payload);

    const response = await axiosClient.put<City>(API_ENDPOINTS.CITY.DETAIL(id), payload);
    return response;
  }

  async patch(id: number, data: Partial<CityFormData>): Promise<City> {
    const response = await axiosClient.patch<City>(API_ENDPOINTS.CITY.DETAIL(id), data);
    return response;
  }

  async delete(id: number): Promise<void> {
    await axiosClient.delete<void>(API_ENDPOINTS.CITY.DETAIL(id));
  }

  // ========== دریافت داده‌های درختی ==========
  async getTreeData(): Promise<TreeNode[]> {
    try {
      console.log('🔍 ===== START getTreeData =====');
      
      const rawAxios = axiosClient.getClient();
      
      // دریافت استان‌ها
      console.log('🔍 Fetching provinces...');
      const provincesResponse = await rawAxios.get(API_ENDPOINTS.PROVINCE.BASE);
      console.log('✅ Provinces response status:', provincesResponse.status);
      
      const provincesData: any = provincesResponse.data;
      
      let provinces: any[] = [];
      if (Array.isArray(provincesData)) {
        provinces = provincesData;
      } else if (provincesData?.results && Array.isArray(provincesData.results)) {
        provinces = provincesData.results;
      } else if (provincesData?.data && Array.isArray(provincesData.data)) {
        provinces = provincesData.data;
      } else if (typeof provincesData === 'object' && provincesData !== null) {
        for (const key in provincesData) {
          if (Array.isArray(provincesData[key])) {
            provinces = provincesData[key];
            console.log('✅ Found provinces in key:', key);
            break;
          }
        }
      }
      
      console.log('✅ Provinces count:', provinces.length);

      // دریافت شهرها
      console.log('🔍 Fetching cities...');
      const citiesResponse = await rawAxios.get(API_ENDPOINTS.CITY.BASE);
      console.log('✅ Cities response status:', citiesResponse.status);
      
      const citiesData: any = citiesResponse.data;
      
      let cities: any[] = [];
      if (Array.isArray(citiesData)) {
        cities = citiesData;
      } else if (citiesData?.results && Array.isArray(citiesData.results)) {
        cities = citiesData.results;
      } else if (citiesData?.data && Array.isArray(citiesData.data)) {
        cities = citiesData.data;
      } else if (typeof citiesData === 'object' && citiesData !== null) {
        for (const key in citiesData) {
          if (Array.isArray(citiesData[key])) {
            cities = citiesData[key];
            console.log('✅ Found cities in key:', key);
            break;
          }
        }
      }
      
      console.log('✅ Cities count:', cities.length);

      if (!provinces.length) {
        console.warn('⚠️ No provinces found');
        return [];
      }

      // ساخت درخت
      const treeData: TreeNode[] = provinces.map((province: any) => {
        const provinceCities = cities.filter((city: any) => {
          const provinceId = typeof city.province === 'object' 
            ? city.province?.id 
            : city.province;
          return provinceId === province.id;
        });

        return {
          id: province.id,
          name: province.name || 'بدون نام',
          type: 'province',
          data: province,
          cities_count: provinceCities.length || 0,
          expanded: false,
          children: provinceCities.map((city: any) => ({
            id: city.id,
            name: city.name || 'بدون نام',
            type: 'city',
            data: city,
            parentId: province.id,
            expanded: false,
            universities_count: city.universities_count || 0,
          })),
        };
      });

      console.log('✅ ===== END getTreeData =====');
      console.log('✅ Tree data built:', treeData.length, 'provinces');
      return treeData;
      
    } catch (error: any) {
      console.error('❌ Error fetching tree data:', error.message);
      console.error('❌ Error details:', error);
      return [];
    }
  }
}

export const cityApi = new CityApi();