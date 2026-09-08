// src/modules/city/components/CityTreeList.tsx

import React, { useState, useEffect, useCallback, useMemo, forwardRef, useImperativeHandle } from 'react';
import { useCity } from '../hooks/useCity';
import { useProvince } from '../../province/hooks/useProvince';
import type { TreeNode } from '../types/city.types';
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
  RefreshCw,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface CityTreeListProps {
  onEdit?: (item: any) => void;
  onDelete?: (id: number) => void;
  onView?: (item: any) => void;
  onAdd?: () => void;
  onAddCity?: (provinceId: number, provinceName: string) => void;
  onEditProvince?: (item: any) => void;
  onEditCity?: (item: any) => void;
}

export const CityTreeList = forwardRef<any, CityTreeListProps>(({
  onEdit,
  onDelete,
  onView,
  onAdd,
  onAddCity,
  onEditProvince,
  onEditCity,
}, ref) => {
  const { useTree, delete: deleteCity, isDeleting, refetch, useStats } = useCity();
  const { useList: useProvinceList, delete: deleteProvince, refetch: refetchProvince } = useProvince();

  // ========== State ==========
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [showProvinceSelector, setShowProvinceSelector] = useState(false);
  const [selectedProvinceId, setSelectedProvinceId] = useState<number | ''>('');
  const [selectedProvinceName, setSelectedProvinceName] = useState('');

  const { data: provinces = [], isLoading: provincesLoading } = useProvinceList();
  const { data: stats } = useStats();

  // ========== Debounce ==========
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
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

  // ========== متد refresh برای استفاده از parent ==========
  useImperativeHandle(ref, () => ({
    refresh: async () => {
      console.log('🔄 CityTreeList: Manual refresh called');
      setIsRefreshing(true);
      try {
        await refetchTree();
        await refetch();
        await refetchProvince();
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
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [refetchTree, refetch, refetchProvince]);

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

  // ========== Apply Search Filter ==========
  const filteredData = useMemo(() => {
    return debouncedSearchTerm ? filterTree(treeData, debouncedSearchTerm) : treeData;
  }, [treeData, debouncedSearchTerm, filterTree]);

  // ========== ✅ Handle Delete اصلاح‌شده با پشتیبانی از استان ==========
  const handleDelete = useCallback(async (id: number, name: string, type: string) => {
    // پیدا کردن استان برای شمارش شهرها (اگر نوع استان باشد)
    let cityCount = 0;
    if (type === 'province') {
      const province = treeData.find(p => p.id === id);
      cityCount = province?.children?.length || 0;
    }

    // پیام تایید بر اساس نوع
    let confirmMessage = '';
    if (type === 'province') {
      confirmMessage = cityCount > 0
        ? `آیا از حذف استان "${name}" و ${cityCount} شهر زیرمجموعه آن مطمئن هستید؟`
        : `آیا از حذف استان "${name}" مطمئن هستید؟`;
    } else {
      confirmMessage = `آیا از حذف شهر "${name}" مطمئن هستید؟`;
    }
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      if (type === 'province') {
        // ✅ حذف استان با استفاده از API استان
        console.log(`🗑️ Deleting province: ${id} - ${name}`);
        await deleteProvince(id);
        toast.success(`استان "${name}" با موفقیت حذف شد`);
      } else {
        // ✅ حذف شهر با استفاده از API شهر
        console.log(`🗑️ Deleting city: ${id} - ${name}`);
        await deleteCity(id);
        toast.success(`شهر "${name}" با موفقیت حذف شد`);
      }
      
      // ✅ رفرش همه داده‌ها
      await refetchTree();
      await refetch();
      await refetchProvince();
      
    } catch (error: any) {
      console.error('❌ Delete error:', error);
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message || 'خطا در حذف';
      toast.error(errorMessage);
    }
  }, [deleteCity, deleteProvince, refetchTree, refetch, refetchProvince, treeData]);

  // ========== Handle Edit Province ==========
  const handleEditProvince = useCallback((node: TreeNode) => {
    if (onEditProvince) {
      onEditProvince(node);
    } else if (onEdit) {
      onEdit(node);
    }
  }, [onEditProvince, onEdit]);

  // ========== Handle Edit City ==========
  const handleEditCity = useCallback((node: TreeNode) => {
    if (onEditCity) {
      onEditCity(node);
    } else if (onEdit) {
      onEdit(node);
    }
  }, [onEditCity, onEdit]);

  // ========== Handle Add City ==========
  const handleAddCity = useCallback((node: TreeNode) => {
    if (onAddCity) {
      onAddCity(node.id, node.name);
    }
  }, [onAddCity]);

  // ========== باز کردن مودال انتخاب استان ==========
  const openProvinceSelector = useCallback(() => {
    setShowProvinceSelector(true);
    setSelectedProvinceId('');
    setSelectedProvinceName('');
  }, []);

  // ========== بستن مودال انتخاب استان ==========
  const closeProvinceSelector = useCallback(() => {
    setShowProvinceSelector(false);
    setSelectedProvinceId('');
    setSelectedProvinceName('');
  }, []);

  // ========== تغییر استان در dropdown ==========
  const handleProvinceChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value) {
      const province = provinces.find(p => p.id === Number(value));
      setSelectedProvinceId(Number(value));
      setSelectedProvinceName(province?.name || '');
    } else {
      setSelectedProvinceId('');
      setSelectedProvinceName('');
    }
  }, [provinces]);

  // ========== تایید و رفتن به فرم افزودن شهر ==========
  const confirmAddCity = useCallback(() => {
    if (selectedProvinceId && selectedProvinceName) {
      closeProvinceSelector();
      if (onAddCity) {
        onAddCity(Number(selectedProvinceId), selectedProvinceName);
      }
    }
  }, [selectedProvinceId, selectedProvinceName, closeProvinceSelector, onAddCity]);

  // ========== Render Tree Node ==========
  const renderTreeNode = useCallback((node: TreeNode, level: number = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const isProvince = node.type === 'province';
    const isCity = node.type === 'city';

    return (
      <React.Fragment key={node.id}>
        <tr 
          className={`tree-row level-${level} ${isProvince ? 'province-row' : 'city-row'}`}
          onClick={() => {
            if (isProvince && hasChildren) {
              toggleExpand(node.id);
            }
          }}
          style={{ cursor: isProvince && hasChildren ? 'pointer' : 'default' }}
        >
          <td className="expand-cell" style={{ paddingRight: `${level * 20 + 10}px` }}>
            {isProvince && hasChildren && (
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
              <div className={`node-icon-wrapper ${isProvince ? 'province-icon-wrapper' : 'city-icon-wrapper'}`}>
                {isProvince ? (
                  <Building2 size={16} className="node-icon province-icon" />
                ) : (
                  <MapPin size={16} className="node-icon city-icon" />
                )}
              </div>
              <span className="node-name">{node.name}</span>
              {isProvince && node.cities_count !== undefined && (
                <span className="node-badge province-badge">
                  {node.cities_count} شهر
                </span>
              )}
              {/* {isCity && node.universities_count !== undefined && (
                <span className="node-badge city-badge">
                  {node.universities_count} دانشگاه
                </span>
              )} */}
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
              ) : (
                <button
                  className="action-btn edit"
                  onClick={() => handleEditCity(node)}
                  title="ویرایش شهر"
                >
                  <Pencil size={16} />
                </button>
              )}

              {isProvince && (
                <button
                  className="action-btn add-city"
                  onClick={() => handleAddCity(node)}
                  title="افزودن شهر به این استان"
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
    handleAddCity, 
    handleDelete
  ]);

  // ========== Loading State ==========
  if (isLoading) {
    return (
      <div className="city-tree-loading">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">در حال بارگذاری...</span>
        </div>
        <p className="mt-3 text-muted">در حال بارگذاری داده‌ها...</p>
      </div>
    );
  }

  return (
    <div className="city-tree-list">
      {/* ========== Header ========== */}
      <div className="city-tree-header">
        <div className="header-title">
          <MapPin size={24} />
          <h2>مدیریت شهرها</h2>
          <span className="badge">{treeData.length} استان</span>
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
            className="btn-primary btn-add-city" 
            onClick={openProvinceSelector}
            title="افزودن شهر جدید"
          >
            <Plus size={18} /> افزودن شهر
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
      </div>

      {/* ========== Search ========== */}
      <div className="search-section">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="جستجو در نام استان یا شهر..."
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

        {debouncedSearchTerm && (
          <button className="clear-search-btn" onClick={() => setSearchTerm('')}>
            <X size={14} /> پاک کردن جستجو
          </button>
        )}
      </div>

      {/* ========== Tree Table ========== */}
      {filteredData.length === 0 ? (
        <div className="empty-state">
          <MapPin size={48} />
          <h5>هیچ داده‌ای یافت نشد</h5>
          <p className="text-muted">
            {debouncedSearchTerm
              ? `نتیجه‌ای برای "${debouncedSearchTerm}" پیدا نشد`
              : 'هنوز استانی ثبت نشده است'}
          </p>
          {debouncedSearchTerm ? (
            <button className="btn-outline-primary" onClick={() => setSearchTerm('')}>
              پاک کردن جستجو
            </button>
          ) : (
            <button className="btn-primary" onClick={openProvinceSelector}>
              <Plus size={16} /> افزودن اولین شهر
            </button>
          )}
        </div>
      ) : (
        <div className="table-responsive">
          <table className="city-tree-table">
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

      {/* ========== مودال انتخاب استان ========== */}
      {showProvinceSelector && (
        <div className="modal-overlay" onClick={closeProvinceSelector}>
          <div className="modal-content selector-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>انتخاب استان</h3>
              <button className="close-btn" onClick={closeProvinceSelector}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p className="modal-description">
                لطفاً استانی را که می‌خواهید شهر جدید به آن اضافه شود انتخاب کنید:
              </p>

              {provincesLoading ? (
                <div className="loading-spinner">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">در حال بارگذاری...</span>
                  </div>
                </div>
              ) : provinces.length === 0 ? (
                <div className="empty-provinces">
                  <p>هیچ استانی ثبت نشده است. ابتدا یک استان ایجاد کنید.</p>
                  <button 
                    className="btn-primary" 
                    onClick={() => {
                      closeProvinceSelector();
                      if (onAdd) onAdd();
                    }}
                  >
                    <Plus size={16} /> افزودن استان
                  </button>
                </div>
              ) : (
                <>
                  <div className="form-group">
                    <label htmlFor="province-select">استان مقصد</label>
                    <div className="select-wrapper">
                      <Building2 size={18} className="select-icon" />
                      <select
                        id="province-select"
                        value={selectedProvinceId}
                        onChange={handleProvinceChange}
                        className="province-select-dropdown"
                      >
                        <option value="">انتخاب استان...</option>
                        {provinces.map((province) => (
                          <option key={province.id} value={province.id}>
                            {province.name}
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
                      onClick={closeProvinceSelector}
                    >
                      انصراف
                    </button>
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={confirmAddCity}
                      disabled={!selectedProvinceId}
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

      <style>{`
        .city-tree-list {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
          border: 1px solid #e9ecef;
        }

        .city-tree-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          background: white;
          border-radius: 12px;
          border: 1px solid #e9ecef;
        }

        .city-tree-header {
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
          background: #dbeafe;
          color: #2563eb;
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
          border-color: #2563eb;
          color: #2563eb;
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

        .btn-add-city {
          background: #059669;
        }

        .btn-add-city:hover {
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

        .search-section {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
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

        .clear-search-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 8px 14px;
          border: none;
          background: #fee2e2;
          color: #dc2626;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .clear-search-btn:hover {
          background: #fecaca;
        }

        .table-responsive {
          overflow-x: auto;
        }

        .city-tree-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }

        .city-tree-table thead th {
          padding: 12px 16px;
          text-align: right;
          font-weight: 600;
          font-size: 13px;
          color: #6b7280;
          border-bottom: 2px solid #e9ecef;
          background: #fafbfc;
        }

        .city-tree-table tbody td {
          padding: 8px 12px;
          border-bottom: 1px solid #f3f4f6;
          vertical-align: middle;
        }

        .city-tree-table tbody tr {
          transition: background 0.2s;
        }

        .city-tree-table tbody tr:hover {
          background: #f8fafc;
        }

        .city-tree-table tbody tr.province-row {
          background: linear-gradient(90deg, #f8fafc 0%, #ffffff 100%);
        }

        .city-tree-table tbody tr.province-row:hover {
          background: linear-gradient(90deg, #eef2ff 0%, #ffffff 100%);
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
          color: #2563eb;
        }

        .expand-btn.expanded {
          background: #e9ecef;
          color: #2563eb;
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

        .node-icon {
          flex-shrink: 0;
        }

        .province-icon {
          color: white;
        }

        .city-icon {
          color: #2563eb;
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

        .action-btn.add-city:hover {
          background: #dbeafe;
          color: #2563eb;
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

        .loading-spinner {
          text-align: center;
          padding: 30px 0;
        }

        .empty-provinces {
          text-align: center;
          padding: 20px 0;
        }

        .empty-provinces p {
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
          color: #4f46e5;
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

        .province-select-dropdown {
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

        .province-select-dropdown:focus {
          border-color: #4f46e5;
          outline: none;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }

        .province-select-dropdown:hover {
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

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        @media (max-width: 768px) {
          .city-tree-list {
            padding: 12px;
          }

          .city-tree-header {
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

          .clear-search-btn {
            width: 100%;
            justify-content: center;
          }

          .city-tree-table {
            font-size: 13px;
          }

          .city-tree-table thead th,
          .city-tree-table tbody td {
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
          .city-tree-list {
            padding: 8px;
          }

          .city-tree-table thead th,
          .city-tree-table tbody td {
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

CityTreeList.displayName = 'CityTreeList';

export default CityTreeList;
