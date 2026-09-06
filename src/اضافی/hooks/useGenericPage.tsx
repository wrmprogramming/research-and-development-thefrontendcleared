// src/hooks/useGenericPage.tsx

import { useMemo, useState } from 'react';
import type { PageConfig } from '../types/page';
import { ServiceFactory } from '../core/factories/ServiceFactory';
import { useProvince } from './useProvince';
import { useCity } from './useCity';
import { useUniversity } from './useUniversity';
import { useUniversityType } from './useUniversityType';
import { toast } from 'react-hot-toast';

export function useGenericPage(config: PageConfig<any>) {
  // ========== هوک اصلی ==========
  const mainHook = config.useHook();

  // ========== هوک‌های کمکی برای صفحات درختی ==========
  const provinceHook = useProvince();
  const cityHook = useCity();
  const universityHook = useUniversity();
  const universityTypeHook = useUniversityType();

  // ========== State ==========
  const [isDeleting, setIsDeleting] = useState(false);

  // ========== برای صفحات ساده (غیر Tree) ==========
  if (config.type !== 'tree') {
    const { data = [], isLoading, isFetching } = mainHook.useItems?.() || { 
      data: [], 
      isLoading: false, 
      isFetching: false 
    };

    const create = (data: any, onProgress?: (p: number) => void) => 
      mainHook.create?.(data, onProgress);

    const update = (id: number, data: any, onProgress?: (p: number) => void) => {
      console.log('🔥🔥🔥🔥🔥 useGenericPage.update (simple) CALLED');
      console.log('📤 id:', id);
      console.log('📤 data:', data);
      console.log('📤 data.attachment:', data?.attachment);
      console.log('📤 data.attachment === null:', data?.attachment === null);
      console.log('📤 data.letter_file:', data?.letter_file);
      console.log('📤 data.letter_file === null:', data?.letter_file === null);
      console.log('📤 mainHook.update exists?', typeof mainHook.update);
      return mainHook.update?.(id, data, onProgress);
    };

    const removeItem = async (id: number) => {
      try {
        setIsDeleting(true);
        await mainHook.delete?.(id);
        await refetch();
        toast.success('با موفقیت حذف شد');
      } catch (error: any) {
        console.error('Delete error:', error);
        toast.error(error.response?.data?.message || 'خطا در حذف');
        throw error;
      } finally {
        setIsDeleting(false);
      }
    };

    const refetch = () => mainHook.refetch?.();

    return {
      data,
      isLoading,
      isFetching,
      create,
      update,
      delete: removeItem,
      refetch,
      isCreating: mainHook.isCreating || false,
      isUpdating: mainHook.isUpdating || false,
      isDeleting,
    };
  }

  // ========== برای صفحات Tree ==========

  // دریافت داده‌های مورد نیاز
  const { data: provinces = [], isLoading: pLoading, isFetching: pFetching } = 
    provinceHook.useItems?.() || { data: [], isLoading: false, isFetching: false };
  
  const { data: cities = [], isLoading: cLoading, isFetching: cFetching } = 
    cityHook.useItems?.() || { data: [], isLoading: false, isFetching: false };
  
  const { data: universities = [], isLoading: uLoading, isFetching: uFetching } = 
    universityHook.useItems?.() || { data: [], isLoading: false, isFetching: false };
  
  const { data: universityTypes = [], isLoading: tLoading, isFetching: tFetching } = 
    universityTypeHook.useItems?.() || { data: [], isLoading: false, isFetching: false };

  // ========== ساخت درخت ==========
  const treeData = useMemo(() => {
    if (!provinces || provinces.length === 0) return [];

    const isUniversityTree = config.title?.includes('دانشگاه') || false;

    const typesMap = new Map();
    universityTypes.forEach((type: any) => {
      typesMap.set(type.id, type);
    });

    return provinces.map((province: any) => {
      const provinceCities = cities.filter((city: any) => {
        const provinceId = typeof city.province === 'object' ? city.province?.id : city.province;
        return provinceId === province.id;
      });

      return {
        id: province.id,
        name: province.name,
        data: {
          type: 'province',
          data: province
        },
        children: provinceCities.map((city: any) => {
          let cityUniversities: any[] = [];

          if (isUniversityTree) {
            cityUniversities = universities.filter((uni: any) => {
              const cityId = typeof uni.city === 'object' ? uni.city?.id : uni.city;
              return cityId === city.id;
            });
          }

          return {
            id: city.id,
            name: city.name,
            data: {
              type: 'city',
              data: city,
              provinceId: province.id
            },
            children: cityUniversities.map((uni: any) => {
              const typeData = uni.type ? typesMap.get(
                typeof uni.type === 'object' ? uni.type.id : uni.type
              ) : null;

              return {
                id: uni.id,
                name: uni.name,
                data: {
                  type: 'university',
                  data: {
                    ...uni,
                    type: typeData || uni.type
                  },
                  cityId: city.id,
                  provinceId: province.id
                },
                children: []
              };
            }),
            universities_count: cityUniversities.length
          };
        }),
        cities_count: provinceCities.length
      };
    });
  }, [provinces, cities, universities, universityTypes, config.title]);

  // ========== متدهای کمکی ==========
  const getCitiesByProvince = (provinceId: number): any[] => {
    return cities.filter((city: any) => {
      const cityProvinceId = typeof city.province === 'object' ? city.province?.id : city.province;
      return cityProvinceId === provinceId;
    });
  };

  const getUniversitiesByCity = (cityId: number): any[] => {
    return universities.filter((uni: any) => {
      const uniCityId = typeof uni.city === 'object' ? uni.city?.id : uni.city;
      return uniCityId === cityId;
    });
  };

  // ========== تشخیص نوع داده ==========
  const detectCreateType = (data: any): 'province' | 'city' | 'university' | 'unknown' => {
    if (data.typeId !== undefined && data.typeId !== null) {
      return 'university';
    }
    if (data.cityId !== undefined && data.cityId !== null) {
      return 'university';
    }
    if (data.provinceId !== undefined && data.provinceId !== null) {
      return 'city';
    }
    if (data.name && Object.keys(data).length === 1) {
      return 'province';
    }
    return 'unknown';
  };

  const detectUpdateType = (data: any, itemData?: any): 'province' | 'city' | 'university' | 'unknown' => {
    if (data.typeId !== undefined && data.typeId !== null) {
      return 'university';
    }
    if (data.cityId !== undefined && data.cityId !== null) {
      return 'university';
    }
    if (data.address !== undefined || data.phone !== undefined || data.email !== undefined || data.website !== undefined) {
      return 'university';
    }
    if (data.provinceId !== undefined && data.provinceId !== null) {
      return 'city';
    }
    if (data.name && Object.keys(data).length === 1) {
      return 'province';
    }
    
    if (itemData) {
      if (itemData.data?.type === 'university' || itemData.type === 'university') {
        return 'university';
      }
      if (itemData.data?.type === 'city' || itemData.type === 'city') {
        return 'city';
      }
      if (itemData.data?.type === 'province' || itemData.type === 'province') {
        return 'province';
      }
    }
    
    return 'unknown';
  };

  // ========== حذف آبشاری استان ==========
  const deleteProvinceWithChildren = async (provinceId: number) => {
    console.log(`🗑️ Starting cascade delete for province: ${provinceId}`);
    
    const province = treeData.find((p: any) => p.id === provinceId);
    if (!province) {
      console.error(`Province ${provinceId} not found`);
      throw new Error('استان مورد نظر یافت نشد');
    }

    const provinceCities = province.children || [];
    console.log(`📋 Found ${provinceCities.length} cities in province`);

    for (const city of provinceCities) {
      const cityUniversities = city.children || [];
      console.log(`📋 City ${city.id} (${city.name}) has ${cityUniversities.length} universities`);

      for (const uni of cityUniversities) {
        try {
          await universityHook.delete(uni.id);
          console.log(`✅ Deleted university: ${uni.id} - ${uni.name}`);
        } catch (error) {
          console.error(`❌ Failed to delete university ${uni.id}:`, error);
        }
      }

      try {
        await cityHook.delete(city.id);
        console.log(`✅ Deleted city: ${city.id} - ${city.name}`);
      } catch (error: any) {
        console.error(`❌ Failed to delete city ${city.id}:`, error);
        if (error.response?.status !== 404) {
          throw error;
        }
      }
    }

    try {
      await provinceHook.delete(provinceId);
      console.log(`✅ Deleted province: ${provinceId}`);
    } catch (error: any) {
      console.error(`❌ Failed to delete province ${provinceId}:`, error);
      if (error.response?.status !== 404) {
        throw error;
      }
    }

    await refetch();
    console.log('✅ Cascade delete completed successfully');
  };

  // ========== حذف آبشاری شهر ==========
  const deleteCityWithChildren = async (cityId: number) => {
    console.log(`🗑️ Starting cascade delete for city: ${cityId}`);
    
    let foundCity: any = null;
    const findCity = (nodes: any[]): any => {
      for (const node of nodes) {
        if (node.id === cityId) {
          return node;
        }
        if (node.children && node.children.length > 0) {
          const found = findCity(node.children);
          if (found) return found;
        }
      }
      return null;
    };
    
    foundCity = findCity(treeData);
    if (!foundCity) {
      console.error(`City ${cityId} not found`);
      throw new Error('شهر مورد نظر یافت نشد');
    }

    const cityUniversities = foundCity.children || [];
    console.log(`📋 Found ${cityUniversities.length} universities in city`);

    for (const uni of cityUniversities) {
      try {
        await universityHook.delete(uni.id);
        console.log(`✅ Deleted university: ${uni.id} - ${uni.name}`);
      } catch (error) {
        console.error(`❌ Failed to delete university ${uni.id}:`, error);
      }
    }

    try {
      await cityHook.delete(cityId);
      console.log(`✅ Deleted city: ${cityId}`);
    } catch (error: any) {
      console.error(`❌ Failed to delete city ${cityId}:`, error);
      if (error.response?.status !== 404) {
        throw error;
      }
    }

    await refetch();
    console.log('✅ Cascade delete completed successfully');
  };

  // ========== CRUD Operations ==========
  
  const create = async (data: any, onProgress?: (p: number) => void) => {
    const type = detectCreateType(data);
    console.log('🔍 Create type detected:', type, data);

    try {
      let result;
      switch (type) {
        case 'province':
          result = await provinceHook.create({ name: data.name }, onProgress);
          break;
        case 'city':
          result = await cityHook.create({
            name: data.name,
            provinceId: Number(data.provinceId)
          }, onProgress);
          break;
        case 'university':
          { const universityData: any = {
            name: data.name,
          };
          if (data.address) universityData.address = data.address;
          if (data.phone) universityData.phone = data.phone;
          if (data.email) universityData.email = data.email;
          if (data.website) universityData.website = data.website;
          if (data.cityId) universityData.cityId = Number(data.cityId);
          if (data.typeId) universityData.typeId = Number(data.typeId);
          result = await universityHook.create(universityData, onProgress);
          break; }
        default:
          result = await mainHook.create(data, onProgress);
      }
      
      await refetch();
      return result;
    } catch (error) {
      console.error('Create error:', error);
      throw error;
    }
  };

  const update = async (id: number, data: any, onProgress?: (p: number) => void) => {
    console.log('🔥🔥🔥🔥🔥 useGenericPage.update (tree) CALLED');
    console.log('📤 id:', id);
    console.log('📤 data:', data);
    console.log('📤 data.attachment:', data?.attachment);
    console.log('📤 data.attachment === null:', data?.attachment === null);
    console.log('📤 data.letter_file:', data?.letter_file);
    console.log('📤 data.letter_file === null:', data?.letter_file === null);
    
    // پیدا کردن آیتم اصلی
    let itemData: any = null;
    const findItem = (nodes: any[], targetId: number): any => {
      for (const node of nodes) {
        if (node.id === targetId) {
          return node;
        }
        if (node.children && node.children.length > 0) {
          const found = findItem(node.children, targetId);
          if (found) return found;
        }
      }
      return null;
    };
    
    itemData = findItem(treeData, id);
    console.log('🔍 Found item for update:', itemData);
    
    const type = detectUpdateType(data, itemData);
    console.log('🔍 Update type detected:', type, 'ID:', id, data);

    try {
      let result;
      switch (type) {
        case 'province':
          result = await provinceHook.update(id, { name: data.name }, onProgress);
          break;
        case 'city':
          { const cityData: any = { name: data.name };
          if (data.provinceId) {
            cityData.provinceId = Number(data.provinceId);
          }
          result = await cityHook.update(id, cityData, onProgress);
          break; }
        case 'university':
          { const universityData: any = {};
          if (data.name) universityData.name = data.name;
          if (data.address !== undefined && data.address !== null) universityData.address = data.address;
          if (data.phone !== undefined && data.phone !== null) universityData.phone = data.phone;
          if (data.email !== undefined && data.email !== null) universityData.email = data.email;
          if (data.website !== undefined && data.website !== null) universityData.website = data.website;
          if (data.cityId) universityData.cityId = Number(data.cityId);
          if (data.typeId) universityData.typeId = Number(data.typeId);
          
          console.log('📤 University update data:', universityData);
          result = await universityHook.update(id, universityData, onProgress);
          break; }
        default:
          console.log('🔥🔥🔥🔥🔥 DEFAULT: calling mainHook.update');
          console.log('📤 mainHook.update exists?', typeof mainHook.update);
          result = await mainHook.update(id, data, onProgress);
          console.log('🔥🔥🔥🔥🔥 mainHook.update RESULT:', result);
      }
      
      await refetch();
      return result;
    } catch (error) {
      console.error('Update error:', error);
      throw error;
    }
  };

  const removeItem = async (id: number) => {
    try {
      setIsDeleting(true);
      
      let foundItem: any = null;
      const findInTree = (nodes: any[], targetId: number): any => {
        for (const node of nodes) {
          if (node.id === targetId) {
            return node;
          }
          if (node.children && node.children.length > 0) {
            const found = findInTree(node.children, targetId);
            if (found) return found;
          }
        }
        return null;
      };

      foundItem = findInTree(treeData, id);
      
      if (foundItem) {
        const foundType = foundItem.data?.type || 'unknown';
        console.log(`🔍 Found item type: ${foundType}`, foundItem);

        if (foundType === 'province') {
          await deleteProvinceWithChildren(id);
          toast.success('استان و تمام شهرهای زیرمجموعه با موفقیت حذف شدند');
        } else if (foundType === 'city') {
          await deleteCityWithChildren(id);
          toast.success('شهر و تمام دانشگاه‌های زیرمجموعه با موفقیت حذف شدند');
        } else if (foundType === 'university') {
          await universityHook.delete(id);
          await refetch();
          toast.success('دانشگاه با موفقیت حذف شد');
        } else {
          throw new Error('نوع آیتم قابل تشخیص نیست');
        }
      } else {
        try {
          await universityHook.delete(id);
        } catch {
          try {
            await cityHook.delete(id);
          } catch {
            try {
              await provinceHook.delete(id);
            } catch {
              throw new Error('نوع آیتم قابل تشخیص نیست');
            }
          }
        }
        await refetch();
        toast.success('آیتم با موفقیت حذف شد');
      }
    } catch (error: any) {
      console.error('❌ Delete error:', error);
      toast.error(error.message || 'خطا در حذف آیتم');
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  const refetch = async () => {
    await Promise.all([
      mainHook.refetch?.(),
      provinceHook.refetch?.(),
      cityHook.refetch?.(),
      universityHook.refetch?.(),
      universityTypeHook.refetch?.(),
    ]);
  };

  const isLoading = pLoading || cLoading || uLoading || tLoading;
  const isFetching = pFetching || cFetching || uFetching || tFetching;

  return {
    data: treeData,
    isLoading,
    isFetching,
    create,
    update,
    delete: removeItem,
    refetch,
    isCreating: mainHook.isCreating || false,
    isUpdating: mainHook.isUpdating || false,
    isDeleting,
  };
}

// 