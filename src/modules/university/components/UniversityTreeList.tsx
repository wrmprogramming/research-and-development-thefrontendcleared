// src/modules/university/components/UniversityTreeList.tsx
import React, { useState, useEffect, useCallback, useMemo, forwardRef, useImperativeHandle } from 'react';
import { useUniversity } from '../hooks/useUniversity';
import { useProvince } from '../../province/hooks/useProvince';
import { useCity } from '../../city/hooks/useCity';
import { useUniversityType } from '../../university-type/hooks/useUniversityType';
import type { TreeNode } from '../types/university.types';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Eye,
  X,
  ChevronDown,
  ChevronLeft,
  Building2,
  MapPin,
  GraduationCap,
  RefreshCw,
  Filter,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface UniversityTreeListProps {
  onEdit?: (item: any) => void;
  onDelete?: (id: number) => void;
  onView?: (item: any) => void;
  onAdd?: () => void;
  onAddUniversity?: (cityId: number, cityName: string) => void;
  onEditProvince?: (item: any) => void;
  onEditCity?: (item: any) => void;
  onEditUniversity?: (item: any) => void;
}

export const UniversityTreeList = forwardRef<any, UniversityTreeListProps>(({
  onEdit,
  onDelete,
  onView,
  onAdd,
  onAddUniversity,
  onEditProvince,
  onEditCity,
  onEditUniversity,
}, ref) => {
  const { useTree, delete: deleteUniversity, isDeleting, refetch, useStats } = useUniversity();
  const { delete: deleteProvince, refetch: refetchProvince } = useProvince();
  const { delete: deleteCity, refetch: refetchCity } = useCity();
  const { useList: useUniversityTypeList } = useUniversityType();
  const { data: provinceList = [] } = useProvince().useList({});
  const { data: universityTypes = [] } = useUniversityTypeList({});

  // ========== State ==========
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // ✅ فیلترهای جدید
  const [filters, setFilters] = useState<{
    provinceId?: number | '';
    typeId?: number | '';
  }>({
    provinceId: '',
    typeId: '',
  });

  const [showCitySelector, setShowCitySelector] = useState(false);
  const [selectedCityId, setSelectedCityId] = useState<number | ''>('');
  const [selectedCityName, setSelectedCityName] = useState('');

  const { data: stats } = useStats();

  // ========== Debounce ==========
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // ========== دریافت داده‌های درختی ==========
  const { 
    data: treeData = [], 
    isLoading, 
    refetch: refetchTree,
    isFetching,
  } = useTree();

  // ========== آمار ==========
  const totalProvinces = treeData.length;
  const totalCities = treeData.reduce((acc, p) => acc + (p.children?.length || 0), 0);
  const totalUniversities = treeData.reduce(
    (acc, p) => acc + (p.children?.reduce((acc2, c) => acc2 + (c.children?.length || 0), 0) || 0),
    0
  );

  // ========== متد refresh برای استفاده از parent ==========
  useImperativeHandle(ref, () => ({
    refresh: async () => {
      console.log('🔄 UniversityTreeList: Manual refresh called');
      setIsRefreshing(true);
      try {
        await refetchTree();
        await refetch();
        await refetchProvince();
        await refetchCity();
      } catch (error) {
        console.error('Error refreshing:', error);
      } finally {
        setIsRefreshing(false);
      }
    }
  }));

  // ========== Handle Refresh ==========
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetchTree();
      await refetch();
      await refetchProvince();
      await refetchCity();
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [refetchTree, refetch, refetchProvince, refetchCity]);

  // ========== Toggle Expand ==========
  const toggleExpand = useCallback((nodeId: number) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  }, []);

  // ========== Expand All ==========
  const expandAll = useCallback(() => {
    const allIds = new Set<number>();
    treeData.forEach((node: TreeNode) => {
      allIds.add(node.id);
      if (node.children) {
        node.children.forEach((child: TreeNode) => {
          allIds.add(child.id);
          if (child.children) {
            child.children.forEach((uni: TreeNode) => {
              allIds.add(uni.id);
            });
          }
        });
      }
    });
    setExpandedNodes(allIds);
  }, [treeData]);

  // ========== Collapse All ==========
  const collapseAll = useCallback(() => {
    setExpandedNodes(new Set());
  }, []);

  // ========== Filter Tree ==========
  const filterTree = useCallback((nodes: TreeNode[], search: string): TreeNode[] => {
    if (!search) return nodes;
    const searchLower = search.toLowerCase().trim();
    
    return nodes.reduce((acc: TreeNode[], node: TreeNode) => {
      const matches = node.name.toLowerCase().includes(searchLower);
      
      if (matches) {
        acc.push({ ...node, children: node.children || [] });
        return acc;
      }

      if (node.children && node.children.length > 0) {
        const filteredChildren = filterTree(node.children, search);
        if (filteredChildren.length > 0) {
          acc.push({ ...node, children: filteredChildren });
        }
      }

      return acc;
    }, []);
  }, []);

  // ========== اعمال فیلترها روی درخت ==========
  const applyFilters = useCallback((nodes: TreeNode[]): TreeNode[] => {
    let result = nodes;

    // فیلتر بر اساس استان
    if (filters.provinceId) {
      const provinceId = Number(filters.provinceId);
      result = result.filter(province => province.id === provinceId);
    }

    // فیلتر بر اساس نوع دانشگاه (برای گره‌های دانشگاه)
    if (filters.typeId) {
      const typeId = Number(filters.typeId);
      
      const filterByType = (items: TreeNode[]): TreeNode[] => {
        return items.map(province => {
          if (province.children) {
            const filteredCities = province.children.map(city => {
              if (city.children) {
                const filteredUniversities = city.children.filter(uni => {
                  const uniTypeId = typeof uni.data?.type === 'object' 
                    ? uni.data.type?.id 
                    : uni.data?.type;
                  return uniTypeId === typeId;
                });
                
                if (filteredUniversities.length > 0) {
                  return {
                    ...city,
                    children: filteredUniversities,
                  };
                }
                return null;
              }
              return city;
            }).filter(Boolean);
            
            if (filteredCities.length > 0) {
              return {
                ...province,
                children: filteredCities,
              };
            }
            return null;
          }
          return province;
        }).filter(Boolean) as TreeNode[];
      };
      
      result = filterByType(result);
    }

    return result;
  }, [filters]);

  // ========== Apply Search Filter ==========
  const filteredData = useMemo(() => {
    let data = treeData;
    
    // اعمال جستجو
    if (debouncedSearchTerm) {
      data = filterTree(treeData, debouncedSearchTerm);
    }
    
    // اعمال فیلترها
    data = applyFilters(data);
    
    return data;
  }, [treeData, debouncedSearchTerm, filterTree, applyFilters]);

  // ========== تعداد فیلترهای فعال ==========
  const activeFilterCount = Object.values(filters).filter(v => v && v !== '').length;

  // ========== Handle Filter Change ==========
  const handleFilterChange = useCallback((key: 'provinceId' | 'typeId', value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || '',
    }));
  }, []);

  // ========== Clear Filters ==========
  const clearFilters = useCallback(() => {
    setFilters({
      provinceId: '',
      typeId: '',
    });
  }, []);

  // ========== Handle Delete ==========
  const handleDelete = useCallback(async (id: number, name: string, type: string) => {
    let confirmMessage = '';
    
    if (type === 'province') {
      const province = treeData.find(p => p.id === id);
      const cityCount = province?.children?.length || 0;
      confirmMessage = cityCount > 0
        ? `آیا از حذف استان "${name}" و ${cityCount} شهر و تمام دانشگاه‌های زیرمجموعه آن مطمئن هستید؟`
        : `آیا از حذف استان "${name}" مطمئن هستید؟`;
    } else if (type === 'city') {
      const city = treeData.find(p => p.children?.find(c => c.id === id));
      const uniCount = city?.children?.length || 0;
      confirmMessage = uniCount > 0
        ? `آیا از حذف شهر "${name}" و ${uniCount} دانشگاه زیرمجموعه آن مطمئن هستید؟`
        : `آیا از حذف شهر "${name}" مطمئن هستید؟`;
    } else {
      confirmMessage = `آیا از حذف دانشگاه "${name}" مطمئن هستید؟`;
    }
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      if (type === 'province') {
        await deleteProvince(id);
        toast.success(`استان "${name}" با موفقیت حذف شد`);
      } else if (type === 'city') {
        await deleteCity(id);
        toast.success(`شهر "${name}" با موفقیت حذف شد`);
      } else {
        await deleteUniversity(id);
        toast.success(`دانشگاه "${name}" با موفقیت حذف شد`);
      }
      
      await refetchTree();
      await refetch();
      await refetchProvince();
      await refetchCity();
      
    } catch (error: any) {
      console.error('❌ Delete error:', error);
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message || 'خطا در حذف';
      toast.error(errorMessage);
    }
  }, [deleteProvince, deleteCity, deleteUniversity, refetchTree, refetch, refetchProvince, refetchCity, treeData]);

  // ========== Handle Edit Functions ==========
  const handleEditProvince = useCallback((node: TreeNode) => {
    if (onEditProvince) {
      onEditProvince(node);
    } else if (onEdit) {
      onEdit(node);
    }
  }, [onEditProvince, onEdit]);

  const handleEditCity = useCallback((node: TreeNode) => {
    if (onEditCity) {
      onEditCity(node);
    } else if (onEdit) {
      onEdit(node);
    }
  }, [onEditCity, onEdit]);

  const handleEditUniversity = useCallback((node: TreeNode) => {
    if (onEditUniversity) {
      onEditUniversity(node);
    } else if (onEdit) {
      onEdit(node);
    }
  }, [onEditUniversity, onEdit]);

  // ========== Handle Add University ==========
  const handleAddUniversity = useCallback((node: TreeNode) => {
    if (onAddUniversity) {
      onAddUniversity(node.id, node.name);
    }
  }, [onAddUniversity]);

  // ========== انتخاب شهر برای افزودن دانشگاه ==========
  const openCitySelector = useCallback(() => {
    setShowCitySelector(true);
    setSelectedCityId('');
    setSelectedCityName('');
  }, []);

  const closeCitySelector = useCallback(() => {
    setShowCitySelector(false);
    setSelectedCityId('');
    setSelectedCityName('');
  }, []);

  // ========== دریافت لیست شهرها از درخت ==========
  const getCitiesList = useCallback((): { id: number; name: string; provinceName: string }[] => {
    const cities: { id: number; name: string; provinceName: string }[] = [];
    treeData.forEach(province => {
      if (province.children) {
        province.children.forEach(city => {
          cities.push({
            id: city.id,
            name: city.name,
            provinceName: province.name,
          });
        });
      }
    });
    return cities;
  }, [treeData]);

  const citiesList = getCitiesList();

  // ========== Render Tree Node ==========
  const renderTreeNode = useCallback((node: TreeNode, level: number = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const isProvince = node.type === 'province';
    const isCity = node.type === 'city';
    const isUniversity = node.type === 'university';

    return (
      <React.Fragment key={node.id}>
        <tr 
          className={`tree-row level-${level} ${isProvince ? 'province-row' : isCity ? 'city-row' : 'university-row'}`}
          onClick={() => {
            if ((isProvince || isCity) && hasChildren) {
              toggleExpand(node.id);
            }
          }}
          style={{ cursor: (isProvince || isCity) && hasChildren ? 'pointer' : 'default' }}
        >
          <td className="expand-cell" style={{ paddingRight: `${level * 20 + 10}px` }}>
            {(isProvince || isCity) && hasChildren && (
              <button
                className={`expand-btn ${isExpanded ? 'expanded' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand(node.id);
                }}
              >
                {isExpanded ? <ChevronDown size={16} /> : <ChevronLeft size={16} />}
              </button>
            )}
          </td>

          <td>
            <div className="node-name-cell">
              <div className={`node-icon-wrapper ${isProvince ? 'province-icon-wrapper' : isCity ? 'city-icon-wrapper' : 'university-icon-wrapper'}`}>
                {isProvince ? (
                  <Building2 size={16} className="node-icon province-icon" />
                ) : isCity ? (
                  <MapPin size={16} className="node-icon city-icon" />
                ) : (
                  <GraduationCap size={16} className="node-icon university-icon" />
                )}
              </div>
              <span className="node-name">{node.name}</span>
              {isProvince && node.cities_count !== undefined && (
                <span className="node-badge province-badge">
                  {node.cities_count} شهر
                </span>
              )}
              {isCity && node.universities_count !== undefined && (
                <span className="node-badge city-badge">
                  {node.universities_count} دانشگاه
                </span>
              )}
            </div>
          </td>

          <td className="actions-cell">
            <div className="actions">
              {/* <button
                className="action-btn view"
                onClick={() => onView?.(node)}
                title="مشاهده"
              >
                <Eye size={16} />
              </button> */}

              {isProvince ? (
                <button
                  className="action-btn edit"
                  onClick={() => handleEditProvince(node)}
                  title="ویرایش استان"
                >
                  <Pencil size={16} />
                </button>
              ) : isCity ? (
                <button
                  className="action-btn edit"
                  onClick={() => handleEditCity(node)}
                  title="ویرایش شهر"
                >
                  <Pencil size={16} />
                </button>
              ) : (
                <button
                  className="action-btn edit"
                  onClick={() => handleEditUniversity(node)}
                  title="ویرایش دانشگاه"
                >
                  <Pencil size={16} />
                </button>
              )}

              {isCity && (
                <button
                  className="action-btn add-university"
                  onClick={() => handleAddUniversity(node)}
                  title="افزودن دانشگاه به این شهر"
                >
                  <Plus size={16} />
                </button>
              )}

              <button
                className="action-btn delete"
                onClick={() => handleDelete(node.id, node.name, node.type)}
                disabled={isDeleting}
                title="حذف"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </td>
        </tr>

        {isExpanded && hasChildren && node.children && (
          node.children.map((child: TreeNode) => renderTreeNode(child, level + 1))
        )}
      </React.Fragment>
    );
  }, [
    expandedNodes, 
    toggleExpand, 
    isDeleting, 
    onView, 
    handleEditProvince, 
    handleEditCity, 
    handleEditUniversity, 
    handleAddUniversity, 
    handleDelete
  ]);

  // ========== Loading State ==========
  if (isLoading) {
    return (
      <div className="university-tree-loading">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">در حال بارگذاری...</span>
        </div>
        <p className="mt-3 text-muted">در حال بارگذاری داده‌ها...</p>
      </div>
    );
  }

  return (
    <div className="university-tree-list">
      {/* ========== Header ========== */}
      <div className="university-tree-header">
        <div className="header-title">
          <GraduationCap size={24} />
          <h2>مدیریت دانشگاه‌ها</h2>
          <span className="badge">{totalUniversities} دانشگاه</span>
          {isFetching && (
            <span className="badge badge-refreshing">در حال بروزرسانی...</span>
          )}
        </div>
        <div className="header-actions">
          <button className="btn-expand" onClick={expandAll} title="باز کردن همه">
            <ChevronDown size={16} /> باز کردن همه
          </button>
          <button className="btn-collapse" onClick={collapseAll} title="بستن همه">
            <ChevronLeft size={16} /> بستن همه
          </button>
          <button
            className="btn-refresh"
            onClick={handleRefresh}
            disabled={isRefreshing}
            title="بروزرسانی"
          >
            <RefreshCw size={16} className={isRefreshing ? 'spin' : ''} />
          </button>
          <button 
            className="btn-primary btn-add-university" 
            onClick={openCitySelector}
            title="افزودن دانشگاه جدید"
          >
            <Plus size={18} /> افزودن دانشگاه
          </button>
          {onAdd && (
            <button 
              className="btn-add-province" 
              onClick={onAdd}
              title="افزودن استان جدید"
              style={{ display: 'none' }}
            >
              <Plus size={18} /> افزودن استان
            </button>
          )}
        </div>
      </div>

      {/* ========== Stats Grid ========== */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#eef2ff', color: '#4f46e5' }}>
            <Building2 size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{totalProvinces}</span>
            <span className="stat-label">کل استان‌ها</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dbeafe', color: '#2563eb' }}>
            <MapPin size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{totalCities}</span>
            <span className="stat-label">کل شهرها</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#d1fae5', color: '#059669' }}>
            <GraduationCap size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{totalUniversities}</span>
            <span className="stat-label">کل دانشگاه‌ها</span>
          </div>
        </div>
      </div>

      {/* ========== Search & Filters ========== */}
      <div className="search-section">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="جستجو در نام استان، شهر یا دانشگاه..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button className="clear-btn" onClick={() => setSearchTerm('')}>
              <X size={16} />
            </button>
          )}
          {searchTerm && searchTerm !== debouncedSearchTerm && (
            <span className="search-loading">⏳</span>
          )}
        </div>

        <div className="filter-actions">
          <button
            className={`filter-toggle ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={16} />
            فیلترها
            {activeFilterCount > 0 && (
              <span className="filter-badge">{activeFilterCount}</span>
            )}
          </button>
          {activeFilterCount > 0 && (
            <button className="clear-filters" onClick={clearFilters}>
              <X size={14} />
              پاک کردن
            </button>
          )}
        </div>
      </div>

      {/* ========== Filter Panel ========== */}
      {showFilters && (
        <div className="filter-panel">
          <div className="filter-grid">
            <div className="filter-group">
              <label>استان</label>
              <select
                value={filters.provinceId || ''}
                onChange={(e) => handleFilterChange('provinceId', e.target.value)}
                className="filter-select"
              >
                <option value="">همه استان‌ها</option>
                {provinceList.map((province) => (
                  <option key={province.id} value={province.id}>
                    {province.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>نوع دانشگاه</label>
              <select
                value={filters.typeId || ''}
                onChange={(e) => handleFilterChange('typeId', e.target.value)}
                className="filter-select"
              >
                <option value="">همه انواع</option>
                {universityTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* ========== Tree Table ========== */}
      {filteredData.length === 0 ? (
        <div className="empty-state">
          <GraduationCap size={48} />
          <h5>هیچ داده‌ای یافت نشد</h5>
          <p className="text-muted">
            {debouncedSearchTerm || activeFilterCount > 0
              ? `نتیجه‌ای با فیلترهای انتخاب شده پیدا نشد`
              : 'هنوز دانشگاهی ثبت نشده است'}
          </p>
          {debouncedSearchTerm || activeFilterCount > 0 ? (
            <button className="btn-outline-primary" onClick={() => {
              setSearchTerm('');
              clearFilters();
            }}>
              پاک کردن همه فیلترها
            </button>
          ) : (
            <button className="btn-primary" onClick={openCitySelector}>
              <Plus size={16} /> افزودن اولین دانشگاه
            </button>
          )}
        </div>
      ) : (
        <div className="table-responsive">
          <table className="university-tree-table">
            <thead>
              <tr>
                <th style={{ width: 50 }}></th>
                <th>نام</th>
                <th style={{ width: 220 }}>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((node: TreeNode) => renderTreeNode(node, 0))}
            </tbody>
          </table>
        </div>
      )}

      {/* ========== مودال انتخاب شهر ========== */}
      {showCitySelector && (
        <div className="modal-overlay" onClick={closeCitySelector}>
          <div className="modal-content selector-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>انتخاب شهر</h3>
              <button className="close-btn" onClick={closeCitySelector}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p className="modal-description">
                لطفاً شهری را که می‌خواهید دانشگاه جدید به آن اضافه شود انتخاب کنید:
              </p>

              {citiesList.length === 0 ? (
                <div className="empty-cities">
                  <p>هیچ شهری ثبت نشده است. ابتدا یک شهر ایجاد کنید.</p>
                </div>
              ) : (
                <>
                  <div className="form-group">
                    <label htmlFor="city-select">شهر مقصد</label>
                    <div className="select-wrapper">
                      <MapPin size={18} className="select-icon" />
                      <select
                        id="city-select"
                        value={selectedCityId}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value) {
                            const city = citiesList.find(c => c.id === Number(value));
                            setSelectedCityId(Number(value));
                            setSelectedCityName(city?.name || '');
                          } else {
                            setSelectedCityId('');
                            setSelectedCityName('');
                          }
                        }}
                        className="city-select-dropdown"
                      >
                        <option value="">انتخاب شهر...</option>
                        {citiesList.map((city) => (
                          <option key={city.id} value={city.id}>
                            {city.name} ({city.provinceName})
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={16} className="chevron-icon" />
                    </div>
                  </div>

                  <div className="modal-actions">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={closeCitySelector}
                    >
                      انصراف
                    </button>
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => {
                        if (selectedCityId && selectedCityName) {
                          closeCitySelector();
                          if (onAddUniversity) {
                            onAddUniversity(Number(selectedCityId), selectedCityName);
                          }
                        }
                      }}
                      disabled={!selectedCityId}
                    >
                      <Plus size={16} /> ادامه
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========== Styles ========== */}
      <style>{`
        .university-tree-list {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
          border: 1px solid #e9ecef;
        }

        .university-tree-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          background: white;
          border-radius: 12px;
          border: 1px solid #e9ecef;
        }

        .university-tree-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .header-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .header-title h2 {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
          color: #1a1a2e;
        }

        .badge {
          background: #d1fae5;
          color: #059669;
          padding: 2px 10px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }

        .badge-refreshing {
          background: #fef3c7;
          color: #d97706;
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .header-actions {
          display: flex;
          gap: 8px;
          align-items: center;
          flex-wrap: wrap;
        }

        .btn-expand,
        .btn-collapse,
        .btn-refresh {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 8px 14px;
          border: 1.5px solid #e9ecef;
          border-radius: 8px;
          background: #f8fafc;
          color: #6b7280;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .btn-expand:hover,
        .btn-collapse:hover,
        .btn-refresh:hover {
          border-color: #4f46e5;
          color: #4f46e5;
          background: #f8fafc;
        }

        .btn-refresh:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 20px;
          background: #4f46e5;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary:hover {
          background: #4338ca;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
        }

        .btn-add-university {
          background: #059669;
        }

        .btn-add-university:hover {
          background: #047857;
          box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
        }

        .btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 20px;
          border: 1.5px solid #e9ecef;
          border-radius: 8px;
          background: white;
          color: #6b7280;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-secondary:hover {
          background: #f8fafc;
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-outline-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 20px;
          border: 1.5px solid #4f46e5;
          border-radius: 8px;
          background: transparent;
          color: #4f46e5;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-outline-primary:hover {
          background: #eef2ff;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 12px;
          margin-bottom: 16px;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 18px;
          background: #f8fafc;
          border-radius: 12px;
          border: 1px solid #e9ecef;
          transition: all 0.2s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
        }

        .stat-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          flex-shrink: 0;
        }

        .stat-info {
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-size: 20px;
          font-weight: 700;
          color: #1a1a2e;
          line-height: 1.2;
        }

        .stat-label {
          font-size: 12px;
          color: #6b7280;
        }

        /* ========== Search & Filters ========== */
        .search-section {
          display: flex;
          gap: 12px;
          margin-bottom: 12px;
          flex-wrap: wrap;
          align-items: center;
        }

        .search-input-wrapper {
          flex: 1;
          min-width: 200px;
          position: relative;
        }

        .search-input {
          width: 100%;
          padding: 8px 40px 8px 12px;
          border: 1.5px solid #e9ecef;
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.2s;
          background: #f8fafc;
        }

        .search-input:focus {
          border-color: #4f46e5;
          outline: none;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
          background: white;
        }

        .search-icon {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
        }

        .search-loading {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 16px;
          animation: spin 1s linear infinite;
        }

        .clear-btn {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #9ca3af;
          cursor: pointer;
          padding: 4px;
          z-index: 2;
        }

        .clear-btn:hover {
          color: #ef4444;
        }

        .filter-actions {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .filter-toggle {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border: 1.5px solid #e9ecef;
          border-radius: 8px;
          background: white;
          color: #6b7280;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .filter-toggle:hover {
          border-color: #4f46e5;
          color: #4f46e5;
        }

        .filter-toggle.active {
          border-color: #4f46e5;
          background: #eef2ff;
          color: #4f46e5;
        }

        .filter-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 18px;
          height: 18px;
          padding: 0 5px;
          background: #4f46e5;
          color: white;
          border-radius: 50%;
          font-size: 10px;
          font-weight: 600;
          margin-right: 2px;
        }

        .clear-filters {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 8px 12px;
          border: none;
          background: #fee2e2;
          color: #dc2626;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .clear-filters:hover {
          background: #fecaca;
        }

        .filter-panel {
          margin-bottom: 16px;
          padding: 16px;
          background: #f8fafc;
          border-radius: 8px;
          border: 1px solid #e9ecef;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .filter-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .filter-group label {
          font-size: 12px;
          font-weight: 500;
          color: #374151;
        }

        .filter-select {
          padding: 8px 12px;
          border: 1.5px solid #d1d5db;
          border-radius: 6px;
          font-size: 13px;
          background: white;
          width: 100%;
          transition: all 0.2s;
        }

        .filter-select:focus {
          border-color: #4f46e5;
          outline: none;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }

        /* ========== Table ========== */
        .table-responsive {
          overflow-x: auto;
        }

        .university-tree-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }

        .university-tree-table thead th {
          padding: 12px 16px;
          text-align: right;
          font-weight: 600;
          font-size: 13px;
          color: #6b7280;
          border-bottom: 2px solid #e9ecef;
          background: #fafbfc;
        }

        .university-tree-table tbody td {
          padding: 8px 12px;
          border-bottom: 1px solid #f3f4f6;
          vertical-align: middle;
        }

        .university-tree-table tbody tr {
          transition: background 0.2s;
        }

        .university-tree-table tbody tr:hover {
          background: #f8fafc;
        }

        .university-tree-table tbody tr.province-row {
          background: linear-gradient(90deg, #f8fafc 0%, #ffffff 100%);
        }

        .university-tree-table tbody tr.province-row:hover {
          background: linear-gradient(90deg, #eef2ff 0%, #ffffff 100%);
        }

        .university-tree-table tbody tr.city-row {
          background: #ffffff;
        }

        .university-tree-table tbody tr.city-row:hover {
          background: #f8fafc;
        }

        .university-tree-table tbody tr.university-row {
          background: #fafbfd;
        }

        .university-tree-table tbody tr.university-row:hover {
          background: #f3f4f6;
        }

        .expand-cell {
          text-align: center;
          vertical-align: middle;
          width: 50px;
        }

        .expand-btn {
          width: 28px;
          height: 28px;
          border: none;
          border-radius: 6px;
          background: transparent;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          color: #6b7280;
        }

        .expand-btn:hover {
          background: #e9ecef;
          color: #4f46e5;
        }

        .expand-btn.expanded {
          background: #e9ecef;
          color: #4f46e5;
        }

        .node-name-cell {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .node-icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          flex-shrink: 0;
        }

        .province-icon-wrapper {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
        }

        .city-icon-wrapper {
          background: #dbeafe;
        }

        .university-icon-wrapper {
          background: #d1fae5;
        }

        .node-icon {
          flex-shrink: 0;
        }

        .province-icon {
          color: white;
        }

        .city-icon {
          color: #2563eb;
        }

        .university-icon {
          color: #059669;
        }

        .node-name {
          font-weight: 500;
          color: #1a1a2e;
        }

        .node-badge {
          font-size: 11px;
          padding: 2px 10px;
          border-radius: 12px;
          font-weight: 500;
        }

        .province-badge {
          background: #eef2ff;
          color: #4f46e5;
        }

        .city-badge {
          background: #dbeafe;
          color: #2563eb;
        }

        .actions-cell {
          text-align: center;
        }

        .actions {
          display: flex;
          gap: 4px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .action-btn {
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 6px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          background: transparent;
          color: #6b7280;
        }

        .action-btn:hover:not(:disabled) {
          background: #f3f4f6;
        }

        .action-btn.view:hover {
          background: #d1fae5;
          color: #059669;
        }

        .action-btn.edit:hover {
          background: #eef2ff;
          color: #4f46e5;
        }

        .action-btn.add-university:hover {
          background: #d1fae5;
          color: #059669;
        }

        .action-btn.delete:hover:not(:disabled) {
          background: #fee2e2;
          color: #dc2626;
        }

        .action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
        }

        .empty-state svg {
          color: #d1d5db;
          margin-bottom: 12px;
        }

        .empty-state h5 {
          margin-bottom: 4px;
          color: #374151;
          font-size: 18px;
        }

        .text-muted {
          color: #6b7280;
        }

        /* ========== Modal ========== */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          z-index: 1050;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: fadeIn 0.2s ease;
        }

        .modal-content.selector-modal {
          max-width: 450px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: slideUp 0.3s ease;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid #e9ecef;
        }

        .modal-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #1a1a2e;
        }

        .close-btn {
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
          transition: all 0.2s;
        }

        .close-btn:hover {
          background: #f3f4f6;
          color: #1a1a2e;
        }

        .modal-body {
          padding: 20px 24px;
        }

        .modal-description {
          color: #6b7280;
          font-size: 14px;
          margin-bottom: 16px;
        }

        .empty-cities {
          text-align: center;
          padding: 20px 0;
        }

        .empty-cities p {
          color: #6b7280;
          margin-bottom: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 20px;
        }

        .form-group label {
          font-size: 13px;
          font-weight: 500;
          color: #374151;
        }

        .select-wrapper {
          position: relative;
        }

        .select-icon {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #2563eb;
          z-index: 1;
          pointer-events: none;
        }

        .chevron-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          z-index: 1;
          pointer-events: none;
        }

        .city-select-dropdown {
          width: 100%;
          padding: 10px 40px 10px 14px;
          border: 1.5px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          background: white;
          appearance: none;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
          padding-right: 36px;
        }

        .city-select-dropdown:focus {
          border-color: #4f46e5;
          outline: none;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }

        .city-select-dropdown:hover {
          border-color: #4f46e5;
        }

        .modal-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 8px;
        }

        .modal-actions button {
          padding: 10px 24px;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .modal-actions .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        /* ========== Responsive ========== */
        @media (max-width: 768px) {
          .university-tree-list {
            padding: 12px;
          }

          .university-tree-header {
            flex-direction: column;
            align-items: stretch;
          }

          .header-actions {
            flex-wrap: wrap;
          }

          .header-actions button {
            flex: 1;
            justify-content: center;
          }

          .search-section {
            flex-direction: column;
            align-items: stretch;
          }

          .search-input-wrapper {
            width: 100%;
          }

          .filter-actions {
            width: 100%;
          }

          .filter-actions button {
            flex: 1;
            justify-content: center;
          }

          .filter-grid {
            grid-template-columns: 1fr;
          }

          .university-tree-table {
            font-size: 13px;
          }

          .university-tree-table thead th,
          .university-tree-table tbody td {
            padding: 6px 8px;
          }

          .node-name-cell {
            gap: 6px;
          }

          .node-icon-wrapper {
            width: 26px;
            height: 26px;
          }

          .node-icon-wrapper svg {
            width: 14px;
            height: 14px;
          }

          .node-name {
            font-size: 13px;
          }

          .node-badge {
            font-size: 10px;
            padding: 1px 8px;
          }

          .actions {
            gap: 2px;
          }

          .action-btn {
            width: 28px;
            height: 28px;
          }

          .action-btn svg {
            width: 14px;
            height: 14px;
          }

          .modal-content.selector-modal {
            margin: 10px;
            max-width: 100%;
          }

          .modal-actions {
            flex-direction: column;
          }

          .modal-actions button {
            width: 100%;
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .university-tree-list {
            padding: 8px;
          }

          .university-tree-table thead th,
          .university-tree-table tbody td {
            padding: 4px 6px;
            font-size: 12px;
          }

          .node-name {
            font-size: 12px;
          }

          .expand-cell {
            width: 30px;
          }

          .expand-btn {
            width: 22px;
            height: 22px;
          }

          .expand-btn svg {
            width: 12px;
            height: 12px;
          }
        }
      `}</style>
    </div>
  );
});

UniversityTreeList.displayName = 'UniversityTreeList';

export default UniversityTreeList;
