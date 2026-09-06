// src/modules/research/components/ResearchList.tsx

import React, { useState, useEffect } from 'react';
import { useResearch } from '../hooks/useResearch';
import { RESEARCH_STATUSES, type Research, type ResearchFilters } from '../types/research.types';
import { formatCurrency } from '../../../utils/formatter.utils';
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  Filter,
  X,
  FileText,
  DollarSign,
  User,
  Building2,
  Paperclip,
  GraduationCap,
} from 'lucide-react';
import {
  Pagination,
  SearchBar,
  FilterPanel,
  DataTable,
  StatusBadge,
  type Column,
  type FilterField,
} from '../../../components/common';

interface ResearchListProps {
  onEdit?: (item: Research) => void;
  onDelete?: (id: number) => void;
  onView?: (item: Research) => void;
  onAdd?: () => void;
}

export const ResearchList: React.FC<ResearchListProps> = ({
  onEdit,
  onDelete,
  onView,
  onAdd,
}) => {
  const { useList, delete: deleteResearch, isDeleting } = useResearch();

  const [filters, setFilters] = useState<ResearchFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [yearInput, setYearInput] = useState<string>('');
  const [debouncedYear, setDebouncedYear] = useState<number | undefined>(undefined);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Debounce for search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Debounce for year
  useEffect(() => {
    const timer = setTimeout(() => {
      const yearValue = filters.year;
      setDebouncedYear(yearValue);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [filters.year]);

  const { data, isLoading, refetch } = useList({
    ...filters,
    year: debouncedYear,
    search: debouncedSearchTerm || undefined,
    page: currentPage,
    page_size: pageSize,
    ordering: sortOrder === 'desc' ? `-${sortField}` : sortField,
  });

  const researches = data?.results || [];
  const totalCount = data?.count || 0;

  const handleDelete = async (id: number) => {
    if (window.confirm('آیا از حذف این پژوهش مطمئن هستید؟')) {
      await deleteResearch(id);
      refetch();
    }
  };

  const handleFilterChange = (key: keyof ResearchFilters, value: any) => {
    let finalValue = value;
    
    if (key === 'year' && value) {
      const numValue = Number(value);
      finalValue = !isNaN(numValue) && numValue > 0 ? numValue : undefined;
    }
    
    setFilters((prev) => ({
      ...prev,
      [key]: finalValue || undefined,
    }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setYearInput('');
    setDebouncedYear(undefined);
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm || 
    Object.values(filters).some(v => v !== undefined && v !== '' && v !== null);

  // تعریف ستون‌های جدول
  const columns: Column<Research>[] = [
    {
      key: 'code',
      title: 'کد / عنوان',
      render: (item) => (
        <div className="code-title">
          <span className="code-badge">{item.code}</span>
          <span className="title">{item.title}</span>
        </div>
      ),
    },
    {
      key: 'status',
      title: 'وضعیت',
      render: (item) => (
        <StatusBadge status={item.status} config={RESEARCH_STATUSES} />
      ),
    },
    {
      key: 'year',
      title: 'سال',
    },
    {
      key: 'budget',
      title: 'مبلغ',
      render: (item) => (
        <div className="budget-cell">
          {item.budget ? formatCurrency(item.budget) : '—'}
        </div>
      ),
    },
    {
      key: 'primary_researcher_name',
      title: 'پژوهشگر اصلی',
      render: (item) => (
        <div className="researcher-cell">
          <User size={14} />
          {item.primary_researcher_name || '—'}
        </div>
      ),
    },
    {
      key: 'researchers',
      title: 'همکاران',
      render: (item) => (
        <div className="researchers-cell" title={item.researchers || ''}>
          {item.researchers_display || item.researchers || '—'}
        </div>
      ),
    },
    {
      key: 'affiliation_type',
      title: 'نوع همکار',
      render: (item) => (
        <div className="affiliation-cell">
          {item.affiliation_type === 'UNIVERSITY' ? (
            <GraduationCap size={14} />
          ) : (
            <Building2 size={14} />
          )}
          {item.affiliation_type === 'UNIVERSITY'
            ? item.university_name || '—'
            : item.company_name || '—'}
        </div>
      ),
    },
    {
      key: 'attachments',
      title: 'فایل‌ها',
      render: (item) => (
        <>
          {item.attachments && item.attachments.length > 0 ? (
            <div className="attachments-cell">
              <span className="attachment-count">{item.attachments.length} فایل</span>
              <div className="attachment-icons">
                {item.attachments.slice(0, 3).map((att) => (
                  <a
                    key={att.id}
                    href={att.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="attachment-link"
                    title={att.filename}
                  >
                    <Paperclip size={12} />
                  </a>
                ))}
                {item.attachments.length > 3 && (
                  <span className="more-files">+{item.attachments.length - 3}</span>
                )}
              </div>
            </div>
          ) : (
            <span className="text-muted">—</span>
          )}
        </>
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
          <button
            className="action-btn delete"
            onClick={() => handleDelete(item.id)}
            disabled={isDeleting}
            title="حذف"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  // تعریف فیلدهای فیلتر
  const filterFields: FilterField[] = [
    {
      key: 'status',
      label: 'وضعیت',
      type: 'select',
      options: Object.entries(RESEARCH_STATUSES).map(([key, { label }]) => ({
        value: key,
        label,
      })),
    },
    {
      key: 'year',
      label: 'سال',
      type: 'number',
      placeholder: 'سال را وارد کنید...',
    },
    {
      key: 'affiliation_type',
      label: 'نوع همکار',
      type: 'select',
      options: [
        { value: 'UNIVERSITY', label: 'دانشگاه' },
        { value: 'COMPANY', label: 'شرکت' },
      ],
    },
  ];

  return (
    <div className="research-list">
      {/* Header */}
      <div className="research-list-header">
        <div className="header-title">
          <FileText size={24} />
          <h2>پژوهش‌ها</h2>
          <span className="badge">{totalCount}</span>
        </div>
        {onAdd && (
          <button className="btn-primary" onClick={onAdd}>
            <Plus size={18} />
            افزودن پژوهش
          </button>
        )}
      </div>

      {/* Search & Filters */}
      <div className="search-section">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="جستجو در کد، عنوان و توضیحات..."
        />

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
        data={researches}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        emptyMessage={hasActiveFilters ? 'با فیلترهای انتخاب شده موردی پیدا نشد' : 'هنوز پژوهشی ثبت نشده است'}
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

      {/* ==========================================================
          فقط استایل‌های مختص ResearchList
          (استایل‌های عمومی در کامپوننت‌های خودشان هستند)
          ========================================================== */}
      <style>{`
        /* --- کانتینر اصلی لیست --- */
        .research-list {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
        }

        /* --- هدر لیست --- */
        .research-list-header {
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

        /* --- دکمه افزودن --- */
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

        /* --- بخش جستجو و فیلتر --- */
        .search-section {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
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

        /* --- استایل‌های داخل سلول‌های جدول (مخصوص Research) --- */
        .code-title {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .code-badge {
          background: #eef2ff;
          color: #4f46e5;
          padding: 2px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          display: inline-block;
          width: fit-content;
        }

        .title {
          font-weight: 500;
          font-size: 14px;
          color: #1a1a2e;
        }

        .budget-cell {
          display: flex;
          align-items: center;
          gap: 4px;
          font-weight: 500;
        }

        .researcher-cell {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #374151;
        }

        .researchers-cell {
          font-size: 13px;
          color: #374151;
          max-width: 150px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .affiliation-cell {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #374151;
          font-size: 13px;
        }

        .attachments-cell {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .attachment-count {
          font-size: 12px;
          color: #6b7280;
        }

        .attachment-icons {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .attachment-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border-radius: 4px;
          color: #4f46e5;
          background: #eef2ff;
          transition: all 0.2s;
          text-decoration: none;
        }

        .attachment-link:hover {
          background: #dbeafe;
          color: #4338ca;
        }

        .more-files {
          font-size: 11px;
          color: #6b7280;
          background: #f3f4f6;
          padding: 0 6px;
          border-radius: 10px;
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

        /* --- واکنش‌گرایی --- */
        @media (max-width: 768px) {
          .research-list {
            padding: 12px;
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

          .actions {
            flex-direction: column;
            gap: 2px;
          }
        }
      `}</style>
    </div>
  );
};

export default ResearchList;