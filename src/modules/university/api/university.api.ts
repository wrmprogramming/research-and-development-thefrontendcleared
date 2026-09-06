// src/modules/university/api/university.api.ts
import { axiosClient } from '../../../api/client/axiosClient';
import { API_ENDPOINTS } from '../../../api/endpoints';
import type { 
  University, 
  UniversityFormData, 
  UniversityFilters, 
  TreeNode 
} from '../types/university.types';

class UniversityApi {
  // ========== CRUD Operations ==========

  async getAll(params?: UniversityFilters): Promise<University[]> {
    const cleanParams: Record<string, any> = {};
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key as keyof UniversityFilters];
        if (value !== undefined && value !== null && value !== '') {
          cleanParams[key] = value;
        }
      });
    }
    
    const response = await axiosClient.get<University[]>(API_ENDPOINTS.UNIVERSITY.BASE, { 
      params: cleanParams 
    });
    return response;
  }

  async getById(id: number): Promise<University> {
    const response = await axiosClient.get<University>(API_ENDPOINTS.UNIVERSITY.DETAIL(id));
    return response;
  }

  async create(data: UniversityFormData): Promise<University> {
    // بک‌اند فیلدهای 'city' و 'type' را می‌خواهد
    const payload: any = {
      name: data.name,
      city: data.city_id,
      type: data.type_id,
    };
    
    if (data.address) payload.address = data.address;
    if (data.phone) payload.phone = data.phone;
    if (data.email) payload.email = data.email;
    if (data.website) payload.website = data.website;

    console.log('📤 UniversityApi.create - payload:', payload);

    const response = await axiosClient.post<University>(API_ENDPOINTS.UNIVERSITY.BASE, payload);
    return response;
  }

  async update(id: number, data: UniversityFormData): Promise<University> {
    const payload: any = {
      name: data.name,
    };
    
    if (data.city_id && data.city_id > 0) {
      payload.city = data.city_id;
    }
    if (data.type_id && data.type_id > 0) {
      payload.type = data.type_id;
    }
    if (data.address !== undefined) payload.address = data.address;
    if (data.phone !== undefined) payload.phone = data.phone;
    if (data.email !== undefined) payload.email = data.email;
    if (data.website !== undefined) payload.website = data.website;

    console.log('📤 UniversityApi.update - payload:', payload);

    const response = await axiosClient.put<University>(API_ENDPOINTS.UNIVERSITY.DETAIL(id), payload);
    return response;
  }

  async patch(id: number, data: Partial<UniversityFormData>): Promise<University> {
    const response = await axiosClient.patch<University>(API_ENDPOINTS.UNIVERSITY.DETAIL(id), data);
    return response;
  }

  async delete(id: number): Promise<void> {
    await axiosClient.delete<void>(API_ENDPOINTS.UNIVERSITY.DETAIL(id));
  }

  // ========== دریافت داده‌های درختی ==========
  async getTreeData(): Promise<TreeNode[]> {
    try {
      console.log('🔍 ===== START getTreeData (University) =====');
      
      const rawAxios = axiosClient.getClient();
      
      // دریافت استان‌ها
      console.log('🔍 Fetching provinces...');
      const provincesResponse = await rawAxios.get(API_ENDPOINTS.PROVINCE.BASE);
      const provincesData: any = provincesResponse.data;
      
      let provinces: any[] = [];
      if (Array.isArray(provincesData)) {
        provinces = provincesData;
      } else if (provincesData?.results) {
        provinces = provincesData.results;
      } else if (provincesData?.data) {
        provinces = provincesData.data;
      } else if (typeof provincesData === 'object' && provincesData !== null) {
        for (const key in provincesData) {
          if (Array.isArray(provincesData[key])) {
            provinces = provincesData[key];
            break;
          }
        }
      }
      
      console.log('✅ Provinces count:', provinces.length);

      // دریافت شهرها
      console.log('🔍 Fetching cities...');
      const citiesResponse = await rawAxios.get(API_ENDPOINTS.CITY.BASE);
      const citiesData: any = citiesResponse.data;
      
      let cities: any[] = [];
      if (Array.isArray(citiesData)) {
        cities = citiesData;
      } else if (citiesData?.results) {
        cities = citiesData.results;
      } else if (citiesData?.data) {
        cities = citiesData.data;
      } else if (typeof citiesData === 'object' && citiesData !== null) {
        for (const key in citiesData) {
          if (Array.isArray(citiesData[key])) {
            cities = citiesData[key];
            break;
          }
        }
      }
      
      console.log('✅ Cities count:', cities.length);

      // دریافت دانشگاه‌ها
      console.log('🔍 Fetching universities...');
      const universitiesResponse = await rawAxios.get(API_ENDPOINTS.UNIVERSITY.BASE);
      const universitiesData: any = universitiesResponse.data;
      
      let universities: any[] = [];
      if (Array.isArray(universitiesData)) {
        universities = universitiesData;
      } else if (universitiesData?.results) {
        universities = universitiesData.results;
      } else if (universitiesData?.data) {
        universities = universitiesData.data;
      } else if (typeof universitiesData === 'object' && universitiesData !== null) {
        for (const key in universitiesData) {
          if (Array.isArray(universitiesData[key])) {
            universities = universitiesData[key];
            break;
          }
        }
      }
      
      console.log('✅ Universities count:', universities.length);

      if (!provinces.length || !cities.length) {
        console.warn('⚠️ No provinces or cities found');
        return [];
      }

      // دریافت انواع دانشگاه (برای نمایش نام نوع)
      const typesResponse = await rawAxios.get('/university-types/');
      const typesData = typesResponse.data || [];
      const typeMap = new Map();
      if (Array.isArray(typesData)) {
        typesData.forEach((t: any) => typeMap.set(t.id, t.name));
      } else if (typesData?.results) {
        typesData.results.forEach((t: any) => typeMap.set(t.id, t.name));
      }

      // ساخت درخت: استان > شهر > دانشگاه
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
          children: provinceCities.map((city: any) => {
            const cityUniversities = universities.filter((uni: any) => {
              const cityId = typeof uni.city === 'object' 
                ? uni.city?.id 
                : uni.city;
              return cityId === city.id;
            });

            return {
              id: city.id,
              name: city.name || 'بدون نام',
              type: 'city',
              data: city,
              parentId: province.id,
              universities_count: cityUniversities.length || 0,
              expanded: false,
              children: cityUniversities.map((uni: any) => {
                const typeName = uni.type ? typeMap.get(
                  typeof uni.type === 'object' ? uni.type.id : uni.type
                ) : null;

                return {
                  id: uni.id,
                  name: uni.name || 'بدون نام',
                  type: 'university',
                  data: uni,
                  parentId: city.id,
                  expanded: false,
                };
              }),
            };
          }),
        };
      });

      console.log('✅ ===== END getTreeData (University) =====');
      console.log('✅ Tree data built:', treeData.length, 'provinces');
      return treeData;
      
    } catch (error: any) {
      console.error('❌ Error fetching tree data:', error.message);
      return [];
    }
  }
}

export const universityApi = new UniversityApi();

