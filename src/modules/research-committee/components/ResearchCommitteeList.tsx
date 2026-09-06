// src/modules/research-committee/components/ResearchCommitteeList.tsx

import React, { useState, useEffect } from 'react';
import { useResearchCommittee } from '../hooks/useResearchCommittee';
import type { ResearchCommittee } from '../types/researchCommittee.types';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Eye,
  Filter,
  X,
  FileText,
  Calendar,
  File,
  Download,
} from 'lucide-react';
import {
  Pagination,
  FilterPanel,
  DataTable,
  type Column,
  type FilterField,
} from '../../../components/common';

interface ResearchCommitteeListProps {
  onEdit?: (item: ResearchCommittee) => void;
  onDelete?: (id: number) => void;
  onView?: (item: ResearchCommittee) => void;
  onAdd?: () => void;
}

export const ResearchCommitteeList: React.FC<ResearchCommitteeListProps> = ({
  onEdit,
  onDelete,
  onView,
  onAdd,
}) => {
  const { useList, delete: deleteCommittee, isDeleting } = useResearchCommittee();

  // ========== State ==========
  const [filters, setFilters] = useState<{
    search?: string;
    year?: number;
  }>({});

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState<string>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // ========== Debounce ==========
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // ========== Get Data ==========
  const { data, isLoading, refetch } = useList({
    search: debouncedSearchTerm || undefined,
    year: filters.year,  // ✅ سال از فیلترها میاد
    page: currentPage,
    page_size: pageSize,
    ordering: sortOrder === 'desc' ? `-${sortField}` : sortField,
  });

  const committees = data?.results || [];
  const totalCount = data?.count || 0;

  // ========== Handlers ==========
  const handleDelete = async (id: number) => {
    if (window.confirm('آیا از حذف این کمیته تحقیقات مطمئن هستید؟')) {
      await deleteCommittee(id);
      refetch();
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    let finalValue = value;
    if (key === 'year' && value) {
      const numValue = Number(value);
      finalValue = !isNaN(numValue) && numValue > 0 ? numValue : undefined;
    }
    setFilters(prev => ({
      ...prev,
      [key]: finalValue === '' ? undefined : finalValue,
    }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm || Object.values(filters).some(v => v !== undefined && v !== '' && v !== null);

  // ========== Columns ==========
  const columns: Column<ResearchCommittee>[] = [
    {
      key: 'session_number',
      title: 'شماره جلسه',
      render: (item) => (
        <div className="session-cell">
          <span className="session-badge">{item.session_number}</span>
        </div>
      ),
    },
    {
      key: 'date',
      title: 'تاریخ جلسه',
      render: (item) => (
        <div className="date-cell">
          <Calendar size={14} className="date-icon" />
          <span className="date-text">{item.date}</span>
        </div>
      ),
    },
    {
      key: 'order',
      title: 'دستور کار',
      render: (item) => (
        <div className="order-cell">
          <span className="order-text">
            {item.order && item.order.length > 50 
              ? `${item.order.substring(0, 50)}...` 
              : item.order || '—'}
          </span>
        </div>
      ),
    },
    {
      key: 'approvements',
      title: 'تعداد مصوبات',
      render: (item) => (
        <div className="approvements-cell">
          <span className="approvements-count">
            {item.approvements?.length || 0}
          </span>
          {item.approvements && item.approvements.length > 0 && (
            <span className="approvements-label">مصوبه</span>
          )}
        </div>
      ),
    },
    {
      key: 'attachments',
      title: 'فایل‌ها',
      render: (item) => (
        <div className="attachments-cell">
          {item.minutes_file && (
            <a href={item.minutes_file} target="_blank" rel="noopener noreferrer" className="file-link" title="صورتجلسه">
              <File size={14} />
            </a>
          )}
          {item.attachment && (
            <a href={item.attachment} target="_blank" rel="noopener noreferrer" className="file-link" title="فایل پیوست">
              <Download size={14} />
            </a>
          )}
          {!item.minutes_file && !item.attachment && <span className="text-muted">—</span>}
        </div>
      ),
    },
    {
      key: 'actions',
      title: 'عملیات',
      width: 120,
      render: (item) => (
        <div className="actions">
          <button className="action-btn view" onClick={() => onView?.(item)} title="مشاهده">
            <Eye size={16} />
          </button>
          <button className="action-btn edit" onClick={() => onEdit?.(item)} title="ویرایش">
            <Pencil size={16} />
          </button>
          <button className="action-btn delete" onClick={() => handleDelete(item.id)} disabled={isDeleting} title="حذف">
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  // ========== Filter Fields ==========
  const filterFields: FilterField[] = [
    {
      key: 'year',
      label: 'سال',
      type: 'number',
      placeholder: 'سال را وارد کنید...',
    },
  ];

  // ========== Render ==========
  return (
    <div className="research-committee-list">
      {/* Header */}
      <div className="list-header">
        <div className="header-title">
          <FileText size={24} />
          <h2>کمیته‌های تحقیقات</h2>
          <span className="badge">{totalCount}</span>
        </div>
        {onAdd && (
          <button className="btn-primary" onClick={onAdd}>
            <Plus size={18} />
            افزودن جلسه
          </button>
        )}
      </div>

      {/* Search & Filters */}
      <div className="search-section">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="جستجو در شماره جلسه، دستور کار..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button className="clear-btn" onClick={() => setSearchTerm('')}>
              <X size={16} />
            </button>
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

      {/* Filter Panel */}
      {showFilters && (
        <FilterPanel
          fields={filterFields}
          values={filters}
          onChange={handleFilterChange}
        />
      )}

      {/* Data Table */}
      <DataTable
        data={committees}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        emptyMessage={hasActiveFilters ? 'با فیلترهای انتخاب شده موردی پیدا نشد' : 'هنوز جلسه‌ای ثبت نشده است'}
      />

      {/* Pagination */}
      <Pagination
        totalItems={totalCount}
        pageSize={pageSize}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
      />

      <style>{`
        .research-committee-list {
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

        .search-section {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }

        .search-input-wrapper {
          flex: 1;
          position: relative;
          min-width: 200px;
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
          flex-shrink: 0;
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

        .session-cell {
          display: flex;
          align-items: center;
        }

        .session-badge {
          background: #eef2ff;
          color: #4f46e5;
          padding: 2px 10px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          display: inline-block;
        }

        .date-cell {
          display: flex;
          align-items: center;
          gap: 6px;
          direction: rtl;
          justify-content: flex-start;
          font-size: 13px;
          color: #6b7280;
        }

        .order-cell {
          max-width: 200px;
        }

        .order-text {
          font-size: 13px;
          color: #374151;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .approvements-cell {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .approvements-count {
          font-size: 16px;
          font-weight: 700;
          color: #4f46e5;
        }

        .approvements-label {
          font-size: 11px;
          color: #6b7280;
        }

        .attachments-cell {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .file-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 4px;
          color: #4f46e5;
          background: #eef2ff;
          transition: all 0.2s;
          text-decoration: none;
        }

        .file-link:hover {
          background: #dbeafe;
          color: #4338ca;
        }

        .text-muted {
          color: #9ca3af;
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

        @media (max-width: 768px) {
          .research-committee-list {
            padding: 12px;
          }

          .search-section {
            flex-direction: column;
          }

          .search-input-wrapper {
            flex: 1;
            min-width: 100%;
          }

          .filter-actions {
            width: 100%;
          }

          .filter-actions button {
            flex: 1;
            justify-content: center;
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

export default ResearchCommitteeList;
