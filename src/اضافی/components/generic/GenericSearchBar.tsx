// src/components/generic/GenericSearchBar.tsx

import React, { useState, useMemo } from 'react';
import { Search, X, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import type { FilterConfig } from '../../types/page';

interface GenericSearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filters?: FilterConfig[];
  activeFilters: Record<string, any>;
  onFilterChange: (filters: Record<string, any>) => void;
  onClearFilters: () => void;
  filterData?: any[];
}

export const GenericSearchBar: React.FC<GenericSearchBarProps> = ({
  searchTerm,
  onSearchChange,
  filters = [],
  activeFilters,
  onFilterChange,
  onClearFilters,
  filterData = [],
}) => {
  const [showFilters, setShowFilters] = useState(false);
  
  // ========== محاسبه آپشن‌های فیلترهای وابسته ==========
  const dynamicFilterOptions = useMemo(() => {
    const result: Record<string, any[]> = {};
    
    filters.forEach(filter => {
      if (filter.type === 'select') {
        if (filter.key === 'typeId' || filter.key === 'type') {
          // استخراج انواع دانشگاه از داده‌ها
          const types: any[] = [];
          const seenIds = new Set();
          filterData.forEach((item: any) => {
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
          result[filter.key] = types;
        } else if (filter.key === 'provinceId' || filter.key === 'province') {
          // استخراج استان‌ها از داده‌ها
          const provinces = filterData.map((item: any) => ({
            value: item.id,
            label: item.name
          }));
          result[filter.key] = provinces;
        } else if (filter.key === 'cityId' || filter.key === 'city') {
          // استخراج شهرها بر اساس استان انتخاب شده
          const selectedProvinceId = activeFilters.provinceId || activeFilters.province;
          const cities: any[] = [];
          const seenIds = new Set();
          
          filterData.forEach((item: any) => {
            if (selectedProvinceId && item.id === Number(selectedProvinceId)) {
              if (item.children) {
                item.children.forEach((child: any) => {
                  if (!seenIds.has(child.id)) {
                    seenIds.add(child.id);
                    cities.push({ value: child.id, label: child.name });
                  }
                });
              }
            } else if (!selectedProvinceId) {
              if (item.children) {
                item.children.forEach((child: any) => {
                  if (!seenIds.has(child.id)) {
                    seenIds.add(child.id);
                    cities.push({ value: child.id, label: child.name });
                  }
                });
              }
            }
          });
          result[filter.key] = cities;
        }
      }
    });
    
    return result;
  }, [filters, filterData, activeFilters]);

  const hasActiveFilters = searchTerm !== '' || Object.values(activeFilters).some(v => v && v !== 'all' && v !== '');

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...activeFilters };
    if (value === 'all' || value === '' || value === null || value === undefined) {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
    }
    
    // اگر استان تغییر کرد، شهر را ریست کن
    if (key === 'provinceId' || key === 'province') {
      delete newFilters.cityId;
      delete newFilters.city;
    }
    
    onFilterChange(newFilters);
  };

  const getFilterOptions = (filter: FilterConfig) => {
    if (dynamicFilterOptions[filter.key]) {
      return dynamicFilterOptions[filter.key];
    }
    return filter.options || [];
  };

  return (
    <div className="search-wrapper">
      <div className="search-bar">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="🔍 جستجو..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => onSearchChange('')}>
              <X size={16} />
            </button>
          )}
        </div>

        <div className="search-actions">
          {filters.length > 0 && (
            <button 
              className={`filter-toggle ${showFilters ? 'active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={16} />
              <span>فیلترها</span>
              {Object.keys(activeFilters).length > 0 && (
                <span className="filter-badge">{Object.keys(activeFilters).length}</span>
              )}
              {showFilters ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          )}

          {hasActiveFilters && (
            <button className="clear-filters" onClick={onClearFilters}>
              <X size={14} />
              پاک کردن همه
            </button>
          )}
        </div>
      </div>

      {/* ===== Filter Panel ===== */}
      {filters.length > 0 && (
        <div className={`filter-panel ${showFilters ? 'open' : ''}`}>
          <div className="filter-grid">
            {filters.map((filter) => {
              const options = getFilterOptions(filter);
              const currentValue = activeFilters[filter.key] || 'all';
              
              const isCityFilter = filter.key === 'cityId' || filter.key === 'city';
              const hasProvinceSelected = activeFilters.provinceId || activeFilters.province;
              const isDisabled = isCityFilter && !hasProvinceSelected;
              
              return (
                <div key={filter.key} className="filter-group">
                  <label>{filter.label}</label>
                  {filter.type === 'select' ? (
                    <select
                      className="filter-select"
                      value={currentValue}
                      onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                      disabled={isDisabled}
                    >
                      <option value="all">همه</option>
                      {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : filter.type === 'text' ? (
                    <input
                      type="text"
                      className="filter-input"
                      placeholder={`جستجو در ${filter.label}...`}
                      value={currentValue === 'all' ? '' : currentValue}
                      onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                    />
                  ) : filter.type === 'date' ? (
                    <input
                      type="date"
                      className="filter-input"
                      value={currentValue === 'all' ? '' : currentValue}
                      onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                    />
                  ) : null}
                  {isCityFilter && !hasProvinceSelected && (
                    <small className="filter-hint">لطفاً ابتدا استان را انتخاب کنید</small>
                  )}
                </div>
              );
            })}
          </div>
          {hasActiveFilters && (
            <div className="filter-actions">
              <button className="btn btn-sm btn-outline-secondary" onClick={onClearFilters}>
                <X size={14} />
                پاک کردن همه
              </button>
            </div>
          )}
        </div>
      )}

      <style>{`
        .search-wrapper {
          background: white;
          border-radius: 12px;
          padding: 14px 18px;
          border: 1px solid #e9ecef;
          margin-bottom: 18px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        }

        .search-bar {
          display: flex;
          gap: 10px;
          align-items: center;
          flex-wrap: wrap;
        }

        .search-input-wrapper {
          flex: 1;
          min-width: 200px;
          position: relative;
        }

        .search-input-wrapper .search-icon {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
        }

        .search-input {
          width: 100%;
          padding: 8px 38px 8px 12px;
          border: 1.5px solid #e9ecef;
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.2s ease;
          background: #f8fafc;
        }

        .search-input:focus {
          outline: none;
          border-color: #4f46e5;
          background: white;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }

        .clear-search {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #9ca3af;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .clear-search:hover {
          color: #ef4444;
          background: #f3f4f6;
        }

        .search-actions {
          display: flex;
          gap: 6px;
          align-items: center;
          flex-wrap: wrap;
        }

        .filter-toggle {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border: 1.5px solid #e9ecef;
          border-radius: 8px;
          background: #f8fafc;
          color: #6b7280;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }

        .filter-toggle:hover {
          background: #f3f4f6;
          border-color: #4f46e5;
          color: #4f46e5;
        }

        .filter-toggle.active {
          background: #eef2ff;
          border-color: #4f46e5;
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
        }

        .clear-filters {
          display: flex;
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
          transition: all 0.2s ease;
        }

        .clear-filters:hover {
          background: #fecaca;
        }

        .filter-panel {
          overflow: hidden;
          max-height: 0;
          opacity: 0;
          transition: max-height 0.3s ease, opacity 0.3s ease, padding 0.3s ease, margin 0.3s ease;
          padding: 0;
          margin: 0;
        }

        .filter-panel.open {
          max-height: 500px;
          opacity: 1;
          padding-top: 14px;
          margin-top: 14px;
          border-top: 1px solid #e9ecef;
        }

        .filter-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 14px;
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

        .filter-select,
        .filter-input {
          padding: 8px 12px;
          border: 1.5px solid #d1d5db;
          border-radius: 8px;
          font-size: 13px;
          background: white;
          transition: all 0.2s ease;
          width: 100%;
        }

        .filter-select:focus,
        .filter-input:focus {
          outline: none;
          border-color: #4f46e5;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }

        .filter-select:disabled {
          background: #f3f4f6;
          cursor: not-allowed;
          opacity: 0.7;
        }

        .filter-hint {
          font-size: 11px;
          color: #ef4444;
          margin-top: 2px;
        }

        .filter-actions {
          display: flex;
          justify-content: flex-end;
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #f3f4f6;
        }

        .filter-actions .btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1px solid #e9ecef;
          background: transparent;
          color: #6b7280;
        }

        .filter-actions .btn:hover {
          background: #f3f4f6;
          border-color: #dc2626;
          color: #dc2626;
        }

        @media (max-width: 768px) {
          .search-wrapper {
            padding: 12px 14px;
          }

          .search-bar {
            flex-direction: column;
            align-items: stretch;
          }

          .search-input-wrapper {
            width: 100%;
          }

          .search-actions {
            width: 100%;
            justify-content: stretch;
          }

          .search-actions .filter-toggle,
          .search-actions .clear-filters {
            flex: 1;
            justify-content: center;
          }

          .filter-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};
//