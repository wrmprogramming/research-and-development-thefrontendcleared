// src/components/generic/GenericPage.tsx

import React, { useState, useMemo, useCallback } from 'react';
import type { PageConfig } from '../../types/page';
import type { FieldConfig } from '../../types/generic';
import { GenericDataTable } from './GenericDataTable';
import { GenericTreeTable } from './GenericTreeTable';
import { GenericFormModal } from './GenericFormModal';
import { GenericDeleteModal } from './GenericDeleteModal';
import { GenericPageHeader } from './GenericPageHeader';
import { GenericStats } from './GenericStats';
import { GenericSearchBar } from './GenericSearchBar';
import { useGenericPage } from '../../hooks/useGenericPage';
import { useFormExtraData, type FormExtraData } from '../../hooks/useFormExtraData';
import {
  Pencil,
  Trash2,
  Eye,
  Plus,
  RefreshCw,
  Building2,
  MapPin,
  GraduationCap,
  Phone,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { FileManager } from '../../core/managers/FileManager';
import communicationsApi from '../../apis/communicationApi';

interface GenericPageProps {
  config: PageConfig<any>;
}

export function GenericPage({ config }: GenericPageProps) {
  const {
    data,
    isLoading,
    isFetching,
    create,
    update,
    delete: deleteItem,
    refetch,
    isCreating,
    isUpdating,
    isDeleting,
  } = useGenericPage(config);

  // ========== State ==========
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ 
    id: number; 
    name: string; 
    type?: string; 
    childrenCount?: number; 
    childrenLabel?: string; 
    deleteMessage?: string 
  } | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentFiles, setCurrentFiles] = useState<Record<string, string | null>>({});
  const [modalKey, setModalKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});

  // ========== تابع تشخیص نوع آیتم ==========
  const getItemType = useCallback((item: any): string => {
    if (!item) return 'unknown';

    if (config.getItemType) {
      return config.getItemType(item);
    }

    if (item.data?.type) return item.data.type;
    if (item.type) return item.type;

    const actualItem = item.data?.data || item;
    if (actualItem.provinceId !== undefined || actualItem.province !== undefined) return 'city';
    if (actualItem.cityId !== undefined || actualItem.city !== undefined) return 'university';

    return 'unknown';
  }, [config]);

  // ========== تابع دریافت فرم مناسب بر اساس نوع آیتم ==========
  const getFormConfigByType = useCallback((itemType: string) => {
    if (config.formTypes) {
      const formConfig = config.formTypes.find(f => f.type === itemType);
      if (formConfig) {
        return formConfig;
      }
    }

    return {
      type: 'default',
      title: editingItem ? 'ویرایش' : 'افزودن جدید',
      fields: config.formFields,
      getInitialData: (item: any) => {
        const actualItem = item?.data?.data || item || {};
        const result: Record<string, any> = {};
        config.formFields.forEach((field: FieldConfig) => {
          const value = actualItem[field.name];
          if (value !== undefined && value !== null) {
            if (field.type === 'select' && typeof value === 'object' && value !== null) {
              result[field.name] = value.id || value;
            } else {
              result[field.name] = value;
            }
          }
        });
        return result;
      }
    };
  }, [config.formTypes, config.formFields, editingItem]);

  // ========== به‌روزرسانی فیلترها با داده‌های واقعی ==========
  const updatedFilterConfigs = useMemo(() => {
    if (!config.filterConfigs) return [];

    return config.filterConfigs.map(filter => {
      if (filter.type === 'select' && (!filter.options || filter.options.length === 0)) {
        if (filter.key === 'provinceId' || filter.key === 'province') {
          const provinces = data.map((item: any) => ({
            value: item.id,
            label: item.name
          }));
          return { ...filter, options: provinces };
        }

        if (filter.key === 'cityId' || filter.key === 'city') {
          const cities: any[] = [];
          const seenIds = new Set();
          data.forEach((item: any) => {
            if (item.children) {
              item.children.forEach((child: any) => {
                if (!seenIds.has(child.id)) {
                  seenIds.add(child.id);
                  cities.push({
                    value: child.id,
                    label: child.name
                  });
                }
              });
            }
          });
          return { ...filter, options: cities };
        }

        if (filter.key === 'typeId' || filter.key === 'type') {
          const types: any[] = [];
          const seenIds = new Set();
          data.forEach((item: any) => {
            if (item.children) {
              item.children.forEach((child: any) => {
                if (child.children) {
                  child.children.forEach((uni: any) => {
                    const typeData = uni.data?.data?.type;
                    if (typeData && typeData.id) {
                      const typeId = typeData.id;
                      const typeName = typeData.name || 'نوع نامشخص';
                      if (!seenIds.has(typeId)) {
                        seenIds.add(typeId);
                        types.push({ value: typeId, label: typeName });
                      }
                    }
                  });
                }
              });
            }
          });
          return { ...filter, options: types };
        }
      }
      return filter;
    });
  }, [config.filterConfigs, data]);

  // ========== Filtered Data ==========
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const deepCopy = (items: any[]): any[] => {
      return items.map(item => ({
        ...item,
        children: item.children ? deepCopy(item.children) : []
      }));
    };

    let result = deepCopy(data);

    if (config.type === 'tree') {
      if (searchTerm && config.searchFields) {
        const term = searchTerm.toLowerCase().trim();
        const filterTreeBySearch = (nodes: any[]): any[] => {
          return nodes.reduce((acc: any[], node: any) => {
            let matches = false;
            if (config.searchFields) {
              matches = config.searchFields.some((field: string) => {
                const value = node.data?.data?.[field] || node[field];
                return value && String(value).toLowerCase().includes(term);
              });
            }

            if (matches) {
              acc.push({ ...node, children: node.children ? deepCopy(node.children) : [] });
              return acc;
            }

            if (node.children && node.children.length > 0) {
              const filteredChildren = filterTreeBySearch(node.children);
              if (filteredChildren.length > 0) {
                acc.push({ ...node, children: filteredChildren });
              }
            }

            return acc;
          }, []);
        };
        result = filterTreeBySearch(result);
      }

      if (activeFilters.provinceId && activeFilters.provinceId !== 'all') {
        const provinceId = Number(activeFilters.provinceId);
        result = result.filter((node: any) => {
          if (node.id === provinceId) {
            return true;
          }
          if (node.children && node.children.length > 0) {
            const filteredChildren = node.children.filter((child: any) => {
              return child.data?.provinceId === provinceId;
            });
            if (filteredChildren.length > 0) {
              node.children = filteredChildren;
              return true;
            }
          }
          return false;
        });
      }

      if (activeFilters.cityId && activeFilters.cityId !== 'all') {
        const cityId = Number(activeFilters.cityId);
        const filterTreeByCity = (nodes: any[]): any[] => {
          return nodes.reduce((acc: any[], node: any) => {
            if (node.id === cityId) {
              acc.push({ ...node, children: node.children ? deepCopy(node.children) : [] });
              return acc;
            }

            if (node.children && node.children.length > 0) {
              const filteredChildren = filterTreeByCity(node.children);
              if (filteredChildren.length > 0) {
                acc.push({ ...node, children: filteredChildren });
              }
            }

            return acc;
          }, []);
        };
        result = filterTreeByCity(result);
      }

      if (activeFilters.typeId && activeFilters.typeId !== 'all') {
        const typeId = Number(activeFilters.typeId);
        const filterTreeByType = (nodes: any[]): any[] => {
          return nodes.reduce((acc: any[], node: any) => {
            if (node.data?.type === 'university') {
              const uniType = node.data?.data?.type;
              const uniTypeId = uniType?.id || node.data?.data?.typeId;
              if (uniTypeId === typeId) {
                acc.push({ ...node, children: [] });
                return acc;
              }
            }

            if (node.children && node.children.length > 0) {
              const filteredChildren = filterTreeByType(node.children);
              if (filteredChildren.length > 0) {
                acc.push({ ...node, children: filteredChildren });
              }
            }

            return acc;
          }, []);
        };
        result = filterTreeByType(result);
      }

      return result;
    }

    if (searchTerm && config.searchFields) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter((item: any) => {
        return config.searchFields!.some((field: string) => {
          const value = item[field];
          return value && String(value).toLowerCase().includes(term);
        });
      });
    }

    Object.entries(activeFilters).forEach(([key, value]) => {
      if (value && value !== 'all' && value !== '') {
        result = result.filter((item: any) => {
          const itemValue = item[key];
          return String(itemValue) === String(value);
        });
      }
    });

    return result;
  }, [data, searchTerm, activeFilters, config.searchFields, config.type]);

  // ========== Stats ==========
  const stats = useMemo(() => {
    if (!config.stats) return [];

    const countNodes = (items: any[], type: string): number => {
      let count = 0;
      const traverse = (nodes: any[]) => {
        for (const node of nodes) {
          if (node.data?.type === type) {
            count++;
          }
          if (node.children && node.children.length > 0) {
            traverse(node.children);
          }
        }
      };
      traverse(items);
      return count;
    };

    const countField = (items: any[], field: string): number => {
      let count = 0;
      const traverse = (nodes: any[]) => {
        for (const node of nodes) {
          if (node.data?.data && node.data.data[field]) {
            count++;
          }
          if (node.children && node.children.length > 0) {
            traverse(node.children);
          }
        }
      };
      traverse(items);
      return count;
    };

    return config.stats.map(stat => {
      let value = 0;

      if (config.type === 'tree') {
        if (stat.key === 'total' || stat.key === 'filtered') {
          value = filteredData.length;
        } else if (stat.key === 'provinces') {
          value = countNodes(filteredData, 'province');
        } else if (stat.key === 'cities') {
          value = countNodes(filteredData, 'city');
        } else if (stat.key === 'universities') {
          value = countNodes(filteredData, 'university');
        } else {
          value = countField(filteredData, stat.key);
        }
      } else {
        if (stat.key === 'total' || stat.key === 'filtered') {
          value = filteredData.length;
        } else if (stat.key === 'withAttachment') {
          value = filteredData.filter((item: any) => item.attachment).length;
        } else if (stat.key === 'withLetter') {
          value = filteredData.filter((item: any) => item.letter_file).length;
        } else {
          value = filteredData.filter((item: any) => item[stat.key]).length;
        }
      }

      return {
        ...stat,
        value
      };
    });
  }, [filteredData, config.stats, config.type]);

  // ========== Handlers ==========
  const handleAdd = useCallback(() => {
    setEditingItem(null);
    setCurrentFiles({});
    setModalKey(prev => prev + 1);
    setModalOpen(true);
  }, []);

  // ========== handleEdit با تنظیم currentFiles ==========
  const handleEdit = useCallback((item: any) => {
    const itemType = getItemType(item);
    const formConfig = getFormConfigByType(itemType);
    
    setEditingItem(item);
    
    const files: Record<string, string | null> = {};
    const actualItem = item.data?.data || item;
    
    formConfig.fields.forEach((field: FieldConfig) => {
      if (field.type === 'file') {
        const fileValue = actualItem[field.name];
        if (fileValue) {
          files[field.name] = fileValue;
        } else {
          files[field.name] = null;
        }
      }
    });
    
    setCurrentFiles(files);
    setModalKey(prev => prev + 1);
    setModalOpen(true);
  }, [getItemType, getFormConfigByType]);

  // ========== تابع حذف فایل ==========
  const handleFileRemove = useCallback((field: string) => {
    console.log(`🗑️ Removing file: ${field}`);
    setCurrentFiles(prev => ({
      ...prev,
      [field]: null
    }));
  }, []);

  // ========== handleDelete ==========
  const handleDelete = useCallback((item: any) => {
    const actualItem = item.data?.data || item;
    const itemName = actualItem.name || actualItem.title || item.name;
    const itemId = actualItem.id || item.id;
    const itemType = getItemType(item);
    
    let childrenCount = 0;
    let deleteMessage = '';
    
    if (itemType === 'province') {
      const children = item.children || [];
      childrenCount = children.length;
      deleteMessage = childrenCount > 0 
        ? 'آیا از حذف این استان و تمام شهرهای زیرمجموعه آن مطمئن هستید؟'
        : 'آیا از حذف این استان مطمئن هستید؟';
    } else if (itemType === 'city') {
      const children = item.children || [];
      childrenCount = children.length;
      deleteMessage = childrenCount > 0
        ? 'آیا از حذف این شهر و تمام دانشگاه‌های زیرمجموعه آن مطمئن هستید؟'
        : 'آیا از حذف این شهر مطمئن هستید؟';
    } else {
      deleteMessage = 'آیا از حذف این آیتم مطمئن هستید؟';
    }
    
    setDeleteTarget({ 
      id: itemId, 
      name: itemName,
      type: itemType,
      childrenCount,
      deleteMessage
    });
    setDeleteModalOpen(true);
  }, [getItemType]);

  // ========== handleConfirmDelete ==========
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    
    try {
      await deleteItem(deleteTarget.id);
      
      if (deleteTarget.type === 'province') {
        toast.success(`استان "${deleteTarget.name}" و ${deleteTarget.childrenCount} شهر زیرمجموعه با موفقیت حذف شدند`);
      } else if (deleteTarget.type === 'city') {
        toast.success(`شهر "${deleteTarget.name}" و ${deleteTarget.childrenCount} دانشگاه زیرمجموعه با موفقیت حذف شدند`);
      } else {
        toast.success(`"${deleteTarget.name}" با موفقیت حذف شد`);
      }
      
      await refetch();
      setDeleteModalOpen(false);
      setDeleteTarget(null);
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error(error.message || 'خطا در حذف');
    }
  };

  // ========== getInitialData ==========
  const getInitialData = useCallback(() => {
    if (!editingItem) return {};

    const itemType = getItemType(editingItem);
    const formConfig = getFormConfigByType(itemType);

    if (formConfig.getInitialData) {
      const initialData = formConfig.getInitialData(editingItem);

      if (itemType === 'university') {
        const actualItem = editingItem.data?.data || editingItem;
        const cityId = typeof actualItem.city === 'object' ? actualItem.city?.id : actualItem.city;

        if (cityId) {
          let provinceId = undefined;
          data.forEach((item: any) => {
            if (item.children) {
              item.children.forEach((child: any) => {
                if (child.id === cityId) {
                  provinceId = child.data?.provinceId || child.data?.data?.provinceId;
                }
              });
            }
          });
          initialData.provinceId = provinceId;
        }
      }

      return initialData;
    }

    const actualItem = editingItem.data?.data || editingItem;
    const result: Record<string, any> = {};
    formConfig.fields.forEach((field: FieldConfig) => {
      const value = actualItem[field.name];
      if (value !== undefined && value !== null) {
        result[field.name] = value;
      }
    });
    return result;
  }, [editingItem, getItemType, getFormConfigByType, data]);

  // ========== ✅ handleSubmit اصلاح شده ==========
  // src/components/generic/GenericPage.tsx - بخش handleSubmit

// src/components/generic/GenericPage.tsx - بخش handleSubmit

const handleSubmit = useCallback(async (formData: any) => {
  try {
    console.log('🔥🔥🔥 ===== HANDLE SUBMIT START =====');
    console.log('📤 formData:', formData);

    const itemType = editingItem ? getItemType(editingItem) : 'default';
    const formConfig = getFormConfigByType(itemType);

    if (formConfig.onSubmit) {
      await formConfig.onSubmit(formData, editingItem);
      return;
    }

    const submitData: Record<string, any> = {};

    formConfig.fields.forEach((field: FieldConfig) => {
      const value = formData[field.name];
      console.log(`📤 Processing field: ${field.name}`, value);

      if (field.type === 'file') {
        if (value === null) {
          submitData[field.name] = null;
          console.log(`📎 ${field.name}: DELETE (null)`);
        } else if (value instanceof File) {
          submitData[field.name] = value;
          console.log(`📎 ${field.name}: NEW FILE (${value.name})`);
        } else if (typeof value === 'string') {
          console.log(`📎 ${field.name}: EXISTING (keeping)`);
        } else {
          console.log(`📎 ${field.name}: SKIPPING (${typeof value})`);
        }
      } else {
        if (value !== undefined && value !== null && value !== '') {
          if (field.type === 'select' && typeof value === 'object' && value !== null) {
            submitData[field.name] = value.id || value;
          } else {
            submitData[field.name] = value;
          }
        }
      }
    });

    console.log('📤 FINAL submitData:', submitData);

    if (editingItem) {
      let id = editingItem.id;
      if (!id && editingItem.data?.data) id = editingItem.data.data.id;
      if (!id) id = editingItem.id || editingItem.data?.id;

      if (!id) {
        toast.error('شناسه آیتم یافت نشد');
        return;
      }

      console.log('🔥 EDITING MODE - ID:', id);
      console.log('🔥 CALLING communicationsApi.update DIRECTLY');
      console.log('📤 communicationsApi.update exists?', typeof communicationsApi.update);
      
      // ✅ مستقیماً communicationsApi.update رو صدا بزن
      const result = await communicationsApi.update(id, submitData, setUploadProgress);
      console.log('🔥 UPDATE RESULT:', result);
      
      toast.success('با موفقیت ویرایش شد');
    } else {
      console.log('🔥 CREATE MODE');
      await create(submitData, setUploadProgress);
      toast.success('با موفقیت اضافه شد');
    }

    await refetch();
    setModalOpen(false);
    setEditingItem(null);
    setCurrentFiles({});
    setUploadProgress(0);
    
    console.log('🔥🔥🔥 ===== HANDLE SUBMIT END =====');
  } catch (error: any) {
    console.error('🔥🔥🔥 SUBMIT ERROR:', error);
    console.error('🔥🔥🔥 ERROR RESPONSE:', error.response?.data);
    toast.error(error.response?.data?.message || 'خطا در انجام عملیات');
  }
}, [editingItem, create, refetch, getItemType, getFormConfigByType]);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setActiveFilters({});
  }, []);

  const hasActiveFilters = searchTerm !== '' || Object.values(activeFilters).some(v => v && v !== 'all' && v !== '');

  // ========== extraData ==========
  const formExtraData = useFormExtraData({
    data,
    config: {
      fields: config.formFields
        .filter((f: FieldConfig) => f.type === 'select' && f.isSearchable)
        .map((f: FieldConfig) => f.name),
      extractors: config.formFields
        .filter((f: FieldConfig) => f.type === 'select' && f.isSearchable)
        .reduce((acc: Record<string, any>, field: FieldConfig) => {
          acc[field.name] = (items: any[]) => {
            if (field.dependsOn) {
              const result: any[] = [];
              const seenIds = new Set();

              items.forEach((item: any) => {
                if (item.children) {
                  item.children.forEach((child: any) => {
                    if (!seenIds.has(child.id)) {
                      seenIds.add(child.id);
                      const parentId = child.data?.provinceId || child.data?.data?.provinceId;
                      result.push({
                        value: child.id,
                        label: child.name,
                        parentId: parentId
                      });
                    }
                  });
                }
              });
              return result;
            }

            return items.map((item: any) => ({
              value: item.id,
              label: item.name
            }));
          };
          return acc;
        }, {} as Record<string, (items: any[]) => any[]>),
      dependencies: config.formFields
        .filter((f: FieldConfig) => f.dependsOn)
        .reduce((acc: Record<string, string>, field: FieldConfig) => {
          acc[field.name] = field.dependsOn!;
          return acc;
        }, {} as Record<string, string>)
    }
  });

  // ========== getFieldOptions ==========
  const getFieldOptions = useCallback((field: FieldConfig, formData: Record<string, any>, extraData?: FormExtraData) => {
    if (field.options && field.options.length > 0) {
      return field.options;
    }

    if (extraData && extraData[field.name]) {
      if (field.dependsOn) {
        const parentValue = formData[field.dependsOn];
        if (parentValue) {
          return extraData[field.name].filter((item: any) =>
            item.parentId === parentValue || item.province === parentValue
          );
        }
        return [];
      }
      return extraData[field.name];
    }

    return [];
  }, []);

  const isFieldDisabled = useCallback((field: FieldConfig, formData: Record<string, any>) => {
    if (field.dependsOn) {
      return !formData[field.dependsOn];
    }
    return false;
  }, []);

  // ========== عنوان ==========
  const itemType = editingItem ? getItemType(editingItem) : 'default';
  const formConfig = getFormConfigByType(itemType);
  
  const getAddTitle = () => {
    const title = config.title.replace('مدیریت ', '').replace('ها', '');
    return `افزودن ${title} جدید`;
  };
  
  const currentTitle = editingItem
    ? formConfig.title
    : getAddTitle();

  // ========== Render Actions ==========
  const renderActions = useCallback((item: any) => {
    const actualItem = item.data?.data || item;
    const itemName = actualItem.name || actualItem.title || item.name;
    const itemId = actualItem.id || item.id;

    return (
      <div className="actions-wrapper">
        <button
          className="action-btn edit-btn"
          onClick={() => handleEdit(item)}
          title="ویرایش"
        >
          <Pencil size={15} />
        </button>
        <button
          className="action-btn delete-btn"
          onClick={() => handleDelete(item)}
          title="حذف"
        >
          <Trash2 size={15} />
        </button>
        <button
          className="action-btn view-btn"
          onClick={() => console.log('View:', actualItem)}
          title="مشاهده"
        >
          <Eye size={15} />
        </button>
      </div>
    );
  }, [handleEdit, handleDelete]);

  // ========== Render Tree Row ==========
  const renderTreeRow = useCallback((node: any, level: number) => {
    if (!node || !node.data) {
      return <div>Invalid node</div>;
    }

    const { data: nodeData } = node;
    const childrenCount = node.children?.length || 0;

    if (nodeData.type === 'province') {
      return (
        <div className="tree-row-content province-row">
          <div className="row-icon province-icon">
            <Building2 size={18} />
          </div>
          <div className="row-info">
            <span className="row-name fw-semibold">{nodeData.data?.name || node.name}</span>
            {childrenCount > 0 && (
              <span className="row-badge province-badge">
                {childrenCount} شهر
              </span>
            )}
          </div>
        </div>
      );
    }

    if (nodeData.type === 'city') {
      return (
        <div className="tree-row-content city-row" style={{ paddingRight: `${Math.min(level * 10, 40)}px` }}>
          <div className="row-icon city-icon">
            <MapPin size={16} />
          </div>
          <div className="row-info">
            <span className="row-name fw-medium">{nodeData.data?.name || node.name}</span>
            {childrenCount > 0 && (
              <span className="row-badge city-badge">
                {childrenCount} دانشگاه
              </span>
            )}
          </div>
        </div>
      );
    }

    if (nodeData.type === 'university') {
      const university = nodeData.data || {};
      const typeName = university.type?.name || '';

      return (
        <div className="tree-row-content university-row" style={{ paddingRight: `${Math.min(level * 10, 40)}px` }}>
          <div className="row-icon university-icon">
            <GraduationCap size={16} />
          </div>
          <div className="row-info">
            <span className="row-name">{university.name || node.name}</span>
            <div className="row-tags">
              {typeName && (
                <span className="row-tag type-tag">
                  {typeName}
                </span>
              )}
              {university.phone && (
                <span className="row-tag phone-tag">
                  <Phone size={10} /> {university.phone}
                </span>
              )}
            </div>
          </div>
        </div>
      );
    }

    return <div>{node.name}</div>;
  }, []);

  // ========== Render ==========
  if (isLoading) {
    return (
      <div className="generic-loading">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">در حال بارگذاری...</span>
        </div>
        <h5 className="mt-3">در حال بارگذاری اطلاعات...</h5>
        <p className="text-muted">لطفاً چند لحظه صبر کنید</p>
      </div>
    );
  }

  return (
    <div className="generic-page">
      <GenericPageHeader
        title={config.title}
        subtitle={config.subtitle}
        icon={config.icon}
        onAdd={handleAdd}
        onRefresh={refetch}
        addLabel={`افزودن ${config.title.replace('مدیریت ', '').replace('ها', ' جدید')}`}
      />

      {stats.length > 0 && <GenericStats stats={stats} />}

      <GenericSearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filters={updatedFilterConfigs}
        activeFilters={activeFilters}
        onFilterChange={setActiveFilters}
        onClearFilters={clearFilters}
        filterData={data}
      />

      {config.type === 'tree' ? (
        <GenericTreeTable
          nodes={filteredData}
          renderRow={renderTreeRow}
          renderActions={renderActions}
          columns={[{ field: 'name', header: 'لیست', width: 700 }]}
          isLoading={isLoading || isFetching}
          searchable={false}
          showPagination={false}
        />
      ) : (
        <GenericDataTable
          data={filteredData}
          columns={config.columns || []}
          onEdit={handleEdit}
          onDelete={(id) => {
            const item = data.find((d: any) => d.id === id);
            if (item) handleDelete(item);
          }}
          isLoading={isFetching || isDeleting}
          renderActions={renderActions}
          getItemName={(item) => item.name || item.title}
          searchable={false}
          showPagination={false}
          renderEmptyState={() => (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h5>هیچ موردی یافت نشد</h5>
              <p className="text-muted">
                {hasActiveFilters ? 'با فیلترهای انتخاب شده موردی پیدا نشد' : 'هنوز موردی ثبت نشده است'}
              </p>
              {hasActiveFilters ? (
                <button className="btn btn-outline-primary" onClick={clearFilters}>
                  پاک کردن فیلترها
                </button>
              ) : (
                <button className="btn btn-primary" onClick={handleAdd}>
                  <Plus size={16} />
                  افزودن اولین مورد
                </button>
              )}
            </div>
          )}
        />
      )}

      <GenericFormModal
        key={`form-${modalKey}`}
        isOpen={modalOpen}
        onClose={() => { 
          setModalOpen(false); 
          setEditingItem(null); 
          setCurrentFiles({}); 
        }}
        onSubmit={handleSubmit}
        title={currentTitle}
        fields={formConfig.fields}
        initialData={getInitialData()}
        isLoading={isCreating || isUpdating}
        uploadProgress={uploadProgress}
        isEditing={!!editingItem}
        currentFiles={currentFiles}
        onFileRemove={handleFileRemove}
        extraData={formExtraData}
        getFieldOptions={getFieldOptions}
        isFieldDisabled={isFieldDisabled}
      />

      <GenericDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => { 
          setDeleteModalOpen(false); 
          setDeleteTarget(null); 
        }}
        onConfirm={handleConfirmDelete}
        title={
          deleteTarget?.type === 'province' ? 'حذف استان' : 
          deleteTarget?.type === 'city' ? 'حذف شهر' : 
          deleteTarget?.type === 'university' ? 'حذف دانشگاه' : 
          'حذف'
        }
        message={deleteTarget?.deleteMessage || 'آیا از حذف این آیتم مطمئن هستید؟'}
        itemName={deleteTarget?.name}
        isLoading={isDeleting}
        itemType={deleteTarget?.type as any}
        childrenCount={deleteTarget?.childrenCount || 0}
      >
        {deleteTarget?.childrenCount && deleteTarget.childrenCount > 0 && (
          <div className="mt-2">
            <small className="text-muted">
              {deleteTarget.type === 'province' && `شهرهای زیرمجموعه: ${deleteTarget.childrenCount}`}
              {deleteTarget.type === 'city' && `دانشگاه‌های زیرمجموعه: ${deleteTarget.childrenCount}`}
            </small>
          </div>
        )}
      </GenericDeleteModal>
    </div>
  );
}

//