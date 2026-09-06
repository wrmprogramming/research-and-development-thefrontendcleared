// src/modules/city/components/CityList.tsx

import React, { useState, useEffect } from 'react';
import { useCity } from '../hooks/useCity';
import type { City } from '../types/city.types';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Eye,
  X,
  MapPin,
  Building2,
} from 'lucide-react';

interface CityListProps {
  onEdit?: (item: City) => void;
  onDelete?: (id: number) => void;
  onView?: (item: City) => void;
  onAdd?: () => void;
}

export const CityList: React.FC<CityListProps> = ({
  onEdit,
  onDelete,
  onView,
  onAdd,
}) => {
  const { useList, delete: deleteCity, isDeleting } = useCity();

  // ========== State ==========
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // ========== Debounce ==========
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // ========== دریافت لیست شهرها ==========
  const { 
    data: cities = [], 
    isLoading, 
    refetch, 
    error: cityError,
    isError 
  } = useList({
    search: debouncedSearchTerm || undefined,
  });

  // ========== مدیریت خطا ==========
  if (isError) {
    console.error('❌ CityList Error:', cityError);
    return (
      <div className="city-list">
        <div className="error-state">
          <p>خطا در بارگذاری داده‌ها</p>
          <button className="btn-primary" onClick={() => refetch()}>
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  // ========== Handlers ==========
  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`آیا از حذف شهر "${name}" مطمئن هستید؟`)) {
      await deleteCity(id);
      refetch();
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
  };

  const hasActiveSearch = searchTerm !== '';

  // ========== Render ==========
  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">در حال بارگذاری...</span>
        </div>
      </div>
    );
  }

  const citiesList = Array.isArray(cities) ? cities : [];

  return (
    <div className="city-list">
      {/* ========== Header ========== */}
      <div className="city-list-header">
        <div className="header-title">
          <MapPin size={24} />
          <h2>شهرها</h2>
          <span className="badge">{citiesList.length}</span>
        </div>
        {onAdd && (
          <button className="btn-primary" onClick={onAdd}>
            <Plus size={18} />
            افزودن شهر
          </button>
        )}
      </div>

      {/* ========== Search ========== */}
      <div className="search-section">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="جستجو در نام شهر..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button className="clear-btn" onClick={clearSearch}>
              <X size={16} />
            </button>
          )}
          {searchTerm && searchTerm !== debouncedSearchTerm && (
            <span className="search-loading">⏳</span>
          )}
        </div>

        {hasActiveSearch && (
          <button className="clear-search-btn" onClick={clearSearch}>
            <X size={14} />
            پاک کردن جستجو
          </button>
        )}
      </div>

      {/* ========== Table ========== */}
      {citiesList.length === 0 ? (
        <div className="empty-state">
          <MapPin size={48} />
          <h5>هیچ شهری یافت نشد</h5>
          <p className="text-muted">
            {hasActiveSearch
              ? `نتیجه‌ای برای "${searchTerm}" پیدا نشد`
              : 'هنوز شهری ثبت نشده است'}
          </p>
          {hasActiveSearch ? (
            <button className="btn-outline-primary" onClick={clearSearch}>
              پاک کردن جستجو
            </button>
          ) : (
            onAdd && (
              <button className="btn-primary" onClick={onAdd}>
                <Plus size={16} />
                افزودن اولین شهر
              </button>
            )
          )}
        </div>
      ) : (
        <div className="table-responsive">
          <table className="city-table">
            <thead>
              <tr>
                <th style={{ width: 60 }}>#</th>
                <th>نام شهر</th>
                <th>استان</th>
                <th style={{ width: 120 }}>تعداد دانشگاه‌ها</th>
                <th style={{ width: 140 }}>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {citiesList.map((city, index) => (
                <tr key={city.id}>
                  <td>{index + 1}</td>
                  <td>
                    <div className="city-name-cell">
                      <div className="city-icon-wrapper">
                        <MapPin size={16} className="city-icon" />
                      </div>
                      <span className="city-name">{city.name}</span>
                    </div>
                  </td>
                  <td>
                    <div className="province-cell">
                      <Building2 size={14} className="province-icon-small" />
                      <span>{city.province_name || '—'}</span>
                    </div>
                  </td>
                  <td>
                    <span className="universities-count">
                      {city.universities_count || 0}
                    </span>
                  </td>
                  <td>
                    <div className="actions">
                      <button
                        className="action-btn view"
                        onClick={() => onView?.(city)}
                        title="مشاهده"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="action-btn edit"
                        onClick={() => onEdit?.(city)}
                        title="ویرایش"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        className="action-btn delete"
                        onClick={() => handleDelete(city.id, city.name)}
                        disabled={isDeleting}
                        title="حذف"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ========== Styles ========== */}
      <style>{`
        .city-list {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
          border: 1px solid #e9ecef;
        }

        .city-list-header {
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

        .header-title .badge {
          background: #dbeafe;
          color: #2563eb;
          padding: 2px 10px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
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

        @keyframes spin {
          from { transform: translateY(-50%) rotate(0deg); }
          to { transform: translateY(-50%) rotate(360deg); }
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

        .city-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }

        .city-table thead th {
          padding: 12px 16px;
          text-align: right;
          font-weight: 600;
          font-size: 13px;
          color: #6b7280;
          border-bottom: 2px solid #e9ecef;
          background: #fafbfc;
        }

        .city-table tbody td {
          padding: 12px 16px;
          border-bottom: 1px solid #f3f4f6;
          vertical-align: middle;
        }

        .city-table tbody tr:hover {
          background: #f8fafc;
        }

        .city-name-cell {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .city-icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: #dbeafe;
          border-radius: 8px;
          flex-shrink: 0;
        }

        .city-icon {
          color: #2563eb;
        }

        .city-name {
          font-weight: 500;
          color: #1a1a2e;
        }

        .province-cell {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #6b7280;
        }

        .province-icon-small {
          color: #4f46e5;
        }

        .universities-count {
          display: inline-block;
          padding: 2px 12px;
          background: #dbeafe;
          color: #2563eb;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
        }

        .actions {
          display: flex;
          gap: 4px;
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

        .error-state {
          text-align: center;
          padding: 40px;
          color: #dc2626;
        }

        .error-state .btn-primary {
          margin-top: 12px;
        }

        @media (max-width: 768px) {
          .city-list {
            padding: 12px;
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

          .city-table {
            font-size: 13px;
          }

          .city-table thead th,
          .city-table tbody td {
            padding: 8px 10px;
          }

          .city-list-header {
            flex-direction: column;
            align-items: stretch;
          }
        }

        @media (max-width: 480px) {
          .city-list {
            padding: 8px;
          }

          .city-table thead th,
          .city-table tbody td {
            padding: 6px 8px;
            font-size: 12px;
          }

          .action-btn {
            width: 28px;
            height: 28px;
          }

          .action-btn svg {
            width: 14px;
            height: 14px;
          }
        }
      `}</style>
    </div>
  );
};

export default CityList;