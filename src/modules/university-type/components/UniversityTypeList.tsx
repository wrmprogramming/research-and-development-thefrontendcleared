// src/modules/university-type/components/UniversityTypeList.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useUniversityType } from '../hooks/useUniversityType';
import type { UniversityType } from '../types/university-type.types';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Eye,
  X,
  Building2,
  GraduationCap,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface UniversityTypeListProps {
  onEdit?: (item: UniversityType) => void;
  onDelete?: (id: number) => void;
  onView?: (item: UniversityType) => void;
  onAdd?: () => void;
}

export const UniversityTypeList: React.FC<UniversityTypeListProps> = ({
  onEdit,
  onDelete,
  onView,
  onAdd,
}) => {
  const { useList, useStats, delete: deleteType, isDeleting, refetch } = useUniversityType();

  // ========== State ==========
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // ========== Debounce ==========
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // ========== دریافت لیست انواع دانشگاه ==========
  const { 
    data: types = [], 
    isLoading, 
    refetch: refetchList,
    error,
    isError 
  } = useList({
    search: debouncedSearchTerm || undefined,
  });

  // ========== دریافت آمار ==========
  const { data: stats, refetch: refetchStats } = useStats();

  // ========== محاسبه تعداد کل دانشگاه‌ها ==========
  const totalUniversities = stats?.by_type?.reduce((acc, t) => acc + (t.universities_count || 0), 0) || 0;

  // ========== مدیریت خطا ==========
  if (isError) {
    console.error('❌ UniversityTypeList Error:', error);
    return (
      <div className="university-type-list">
        <div className="error-state">
          <p>خطا در بارگذاری داده‌ها</p>
          <button className="btn-primary" onClick={() => refetch()}>
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  // ========== Handle Delete ==========
  const handleDelete = useCallback(async (id: number, name: string) => {
    if (window.confirm(`آیا از حذف نوع دانشگاه "${name}" مطمئن هستید؟`)) {
      try {
        await deleteType(id);
        await refetch();
        toast.success(`نوع دانشگاه "${name}" با موفقیت حذف شد`);
      } catch (error: any) {
        toast.error(error.response?.data?.message || error.message || 'خطا در حذف');
      }
    }
  }, [deleteType, refetch]);

  // ========== Clear Search ==========
  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
  }, []);

  const hasActiveSearch = searchTerm !== '';

  // ========== Loading State ==========
  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">در حال بارگذاری...</span>
        </div>
      </div>
    );
  }

  const typesList = Array.isArray(types) ? types : [];

  return (
    <div className="university-type-list">
      {/* ========== Header ========== */}
      <div className="university-type-list-header">
        <div className="header-title">
          <Building2 size={24} />
          <h2>انواع دانشگاه</h2>
          <span className="badge">{typesList.length} نوع</span>
        </div>
        {onAdd && (
          <button className="btn-primary" onClick={onAdd}>
            <Plus size={18} />
            افزودن نوع
          </button>
        )}
      </div>

      {/* ========== Stats Grid ========== */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#eef2ff', color: '#4f46e5' }}>
            <Building2 size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{typesList.length}</span>
            <span className="stat-label">کل انواع</span>
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

      {/* ========== Search ========== */}
      <div className="search-section">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="جستجو در نام یا کد..."
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
      {typesList.length === 0 ? (
        <div className="empty-state">
          <Building2 size={48} />
          <h5>هیچ نوع دانشگاهی یافت نشد</h5>
          <p className="text-muted">
            {hasActiveSearch
              ? `نتیجه‌ای برای "${searchTerm}" پیدا نشد`
              : 'هنوز نوع دانشگاهی ثبت نشده است'}
          </p>
          {hasActiveSearch ? (
            <button className="btn-outline-primary" onClick={clearSearch}>
              پاک کردن جستجو
            </button>
          ) : (
            onAdd && (
              <button className="btn-primary" onClick={onAdd}>
                <Plus size={16} />
                افزودن اولین نوع
              </button>
            )
          )}
        </div>
      ) : (
        <div className="table-responsive">
          <table className="university-type-table">
            <thead>
              <tr>
                <th style={{ width: 60 }}>#</th>
                <th>نام</th>
                <th>کد</th>
                <th>توضیحات</th>
                <th style={{ width: 140 }}>تعداد دانشگاه‌ها</th>
                <th style={{ width: 120 }}>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {typesList.map((type, index) => (
                <tr key={type.id}>
                  <td>{index + 1}</td>
                  <td>
                    <div className="type-name-cell">
                      <div className="type-icon-wrapper">
                        <Building2 size={16} className="type-icon" />
                      </div>
                      <span className="type-name">{type.name}</span>
                    </div>
                  </td>
                  <td>
                    <span className="code-badge">{type.code || '—'}</span>
                  </td>
                  <td>
                    <span className="description-text">
                      {type.description || '—'}
                    </span>
                  </td>
                  <td>
                    <div className="university-count-wrapper">
                      <GraduationCap size={14} className="university-count-icon" />
                      <span className="university-count">
                        {type.universities_count || 0}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="actions">
                      <button
                        className="action-btn view"
                        onClick={() => onView?.(type)}
                        title="مشاهده"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="action-btn edit"
                        onClick={() => onEdit?.(type)}
                        title="ویرایش"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        className="action-btn delete"
                        onClick={() => handleDelete(type.id, type.name)}
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
        .university-type-list {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
          border: 1px solid #e9ecef;
        }

        .university-type-list-header {
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
          background: #eef2ff;
          color: #4f46e5;
          padding: 2px 10px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }

        /* ========== Stats Grid ========== */
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

        /* ========== Search ========== */
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

        /* ========== Table ========== */
        .table-responsive {
          overflow-x: auto;
        }

        .university-type-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }

        .university-type-table thead th {
          padding: 12px 16px;
          text-align: right;
          font-weight: 600;
          font-size: 13px;
          color: #6b7280;
          border-bottom: 2px solid #e9ecef;
          background: #fafbfc;
        }

        .university-type-table tbody td {
          padding: 12px 16px;
          border-bottom: 1px solid #f3f4f6;
          vertical-align: middle;
        }

        .university-type-table tbody tr:hover {
          background: #f8fafc;
        }

        .type-name-cell {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .type-icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: #eef2ff;
          border-radius: 8px;
          flex-shrink: 0;
        }

        .type-icon {
          color: #4f46e5;
        }

        .type-name {
          font-weight: 500;
          color: #1a1a2e;
        }

        .code-badge {
          display: inline-block;
          padding: 2px 10px;
          background: #f3f4f6;
          color: #6b7280;
          border-radius: 12px;
          font-size: 12px;
          font-family: monospace;
        }

        .description-text {
          color: #6b7280;
          font-size: 13px;
          max-width: 200px;
          display: block;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .university-count-wrapper {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .university-count-icon {
          color: #059669;
        }

        .university-count {
          display: inline-block;
          padding: 2px 12px;
          background: #d1fae5;
          color: #059669;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
          min-width: 30px;
          text-align: center;
        }

        /* ========== Actions ========== */
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

        /* ========== Empty State ========== */
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

        /* ========== Responsive ========== */
        @media (max-width: 768px) {
          .university-type-list {
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

          .university-type-table {
            font-size: 13px;
          }

          .university-type-table thead th,
          .university-type-table tbody td {
            padding: 8px 10px;
          }

          .university-type-list-header {
            flex-direction: column;
            align-items: stretch;
          }

          .stats-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 480px) {
          .university-type-list {
            padding: 8px;
          }

          .university-type-table thead th,
          .university-type-table tbody td {
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

          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default UniversityTypeList;
