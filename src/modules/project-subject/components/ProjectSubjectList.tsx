// src/modules/project-subject/components/ProjectSubjectList.tsx

import React, { useState, useEffect } from 'react';
import { useProjectSubject } from '../hooks/useProjectSubject';
import { type ProjectSubject, type ProjectSubjectFilters } from '../types/project-subject.types';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Eye,
  Filter,
  X,
  BookOpen,
} from 'lucide-react';

interface ProjectSubjectListProps {
  onEdit?: (item: ProjectSubject) => void;
  onDelete?: (id: number) => void;
  onView?: (item: ProjectSubject) => void;
  onAdd?: () => void;
}

export const ProjectSubjectList: React.FC<ProjectSubjectListProps> = ({
  onEdit,
  onDelete,
  onView,
  onAdd,
}) => {
  const { useList, delete: deleteSubject, isDeleting } = useProjectSubject();
  const [filters, setFilters] = useState<ProjectSubjectFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // ========== Debounce برای جستجو ==========
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: subjects = [], isLoading, refetch } = useList({
    ...filters,
    search: debouncedSearchTerm || undefined,
  });

  // ========== Handlers ==========
  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`آیا از حذف موضوع "${name}" مطمئن هستید؟`)) {
      await deleteSubject(id);
      refetch();
    }
  };

  const handleFilterChange = (key: keyof ProjectSubjectFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
    setDebouncedSearchTerm('');
  };

  const hasActiveFilters = searchTerm || Object.values(filters).some(v => v !== undefined);

  // ========== Render ==========
  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">در حال بارگذاری...</span>
        </div>
        <p className="mt-3 text-muted">در حال بارگذاری موضوعات پروژه...</p>
      </div>
    );
  }

  return (
    <div className="project-subject-list">
      {/* Header */}
      <div className="list-header">
        <div className="header-title">
          <BookOpen size={24} />
          <h2>موضوعات پروژه</h2>
          <span className="badge">{subjects.length}</span>
        </div>
        {onAdd && (
          <button className="btn-primary" onClick={onAdd}>
            <Plus size={18} />
            افزودن موضوع
          </button>
        )}
      </div>

      {/* Search & Filters */}
      <div className="search-section">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="جستجو در نام یا توضیحات..."
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
            {hasActiveFilters && <span className="badge-filter">•</span>}
          </button>
          {hasActiveFilters && (
            <button className="clear-filters" onClick={clearFilters}>
              <X size={14} />
              پاک کردن
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      {subjects.length === 0 ? (
        <div className="empty-state">
          <BookOpen size={48} />
          <h5>هیچ موضوع پروژه‌ای یافت نشد</h5>
          <p className="text-muted">
            {hasActiveFilters ? 'با فیلترهای انتخاب شده موردی پیدا نشد' : 'هنوز موضوع پروژه‌ای ثبت نشده است'}
          </p>
          {hasActiveFilters ? (
            <button className="btn-outline-primary" onClick={clearFilters}>
              پاک کردن فیلترها
            </button>
          ) : (
            onAdd && (
              <button className="btn-primary" onClick={onAdd}>
                <Plus size={16} />
                افزودن اولین موضوع
              </button>
            )
          )}
        </div>
      ) : (
        <div className="table-responsive">
          <table className="subject-table">
            <thead>
              <tr>
                <th>شناسه</th>
                <th>نام موضوع</th>
                <th>توضیحات</th>
                <th style={{ width: 120 }}>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((subject) => (
                <tr key={subject.id}>
                  <td>{subject.id}</td>
                  <td>
                    <div className="subject-name-cell">
                      <BookOpen size={16} className="subject-icon" />
                      <span className="fw-semibold">{subject.name}</span>
                    </div>
                  </td>
                  <td>{subject.description || '—'}</td>
                  <td>
                    <div className="actions">
                      {/* <button
                        className="action-btn view"
                        onClick={() => onView?.(subject)}
                        title="مشاهده"
                      >
                        <Eye size={16} />
                      </button> */}
                      <button
                        className="action-btn edit"
                        onClick={() => onEdit?.(subject)}
                        title="ویرایش"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        className="action-btn delete"
                        onClick={() => handleDelete(subject.id, subject.name)}
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

      <style>{`
        .project-subject-list {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
        }

        .list-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
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
        }

        .header-title .badge {
          background: #eef2ff;
          color: #4f46e5;
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
        }

        .search-input-wrapper {
          flex: 1;
          position: relative;
        }

        .search-input {
          width: 100%;
          padding: 8px 40px 8px 12px;
          border: 1.5px solid #e9ecef;
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.2s;
        }

        .search-input:focus {
          border-color: #4f46e5;
          outline: none;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
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

        .filter-actions {
          display: flex;
          gap: 8px;
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
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
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

        .badge-filter {
          color: #4f46e5;
          font-size: 18px;
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
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .clear-filters:hover {
          background: #fecaca;
        }

        .subject-table {
          width: 100%;
          border-collapse: collapse;
        }

        .subject-table thead th {
          padding: 12px 16px;
          text-align: right;
          font-weight: 600;
          font-size: 13px;
          color: #6b7280;
          border-bottom: 2px solid #e9ecef;
        }

        .subject-table tbody td {
          padding: 12px 16px;
          border-bottom: 1px solid #f3f4f6;
          vertical-align: middle;
        }

        .subject-table tbody tr:hover {
          background: #f8fafc;
        }

        .subject-name-cell {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .subject-icon {
          color: #4f46e5;
        }

        .actions {
          display: flex;
          gap: 4px;
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

        .action-btn:hover {
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

        .action-btn.delete:hover {
          background: #fee2e2;
          color: #dc2626;
        }

        .action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .text-muted {
          color: #9ca3af;
        }

        .empty-state {
          text-align: center;
          padding: 40px;
        }

        .empty-state svg {
          color: #d1d5db;
          margin-bottom: 12px;
        }

        .empty-state h5 {
          margin-bottom: 4px;
          color: #374151;
        }

        @media (max-width: 768px) {
          .project-subject-list {
            padding: 12px;
          }

          .list-header {
            flex-direction: column;
            align-items: stretch;
          }

          .search-section {
            flex-direction: column;
          }

          .filter-actions {
            width: 100%;
          }

          .filter-actions button {
            flex: 1;
            justify-content: center;
          }

          .subject-table {
            font-size: 13px;
          }

          .subject-table thead th,
          .subject-table tbody td {
            padding: 8px 10px;
          }

          .actions {
            flex-direction: column;
            gap: 2px;
          }
        }
      `}</style>
    </div>
  );
};