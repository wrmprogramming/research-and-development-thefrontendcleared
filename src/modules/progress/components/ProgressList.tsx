// src/modules/progress/components/ProgressList.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProgress } from '../hooks/useProgress';
import type { Progress, ProgressFilters } from '../types/progress.types';
import { toPersianNumber } from '../../../utils/formatter.utils';

import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  TrendingUp,
  Calendar,
  FileText,
  Building2,
  Filter,
  X,
  Percent,
  Clock,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

import {
  Pagination,
  SearchBar,
  FilterPanel,
  DataTable,
  type Column,
  type FilterField,
} from '../../../components/common';

// ✅ فیلترهای سفارشی
import { ContractSelect } from '../../contract/components/ContractSelect';
import JalaliDatePicker from '../../../components/JalaliDatePicker';

interface ProgressListProps {
  contractId?: number;
  onEdit?: (item: Progress) => void;
  onDelete?: (id: number) => void;
  onAdd?: () => void;
  readOnly?: boolean;
}

export const ProgressList: React.FC<ProgressListProps> = ({
  contractId,
  onEdit,
  onDelete,
  onAdd,
  readOnly = false,
}) => {
  const navigate = useNavigate();
  const { useList, delete: deleteProgress, isDeleting } = useProgress();

  // ========== State ==========
  const [filters, setFilters] = useState<ProgressFilters>(
    contractId ? { contract: contractId } : {}
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState<string>('registered_date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // ========== Query ==========
  const { data, isLoading, refetch } = useList({
    ...filters,
    search: searchTerm || undefined,
    page: currentPage,
    page_size: pageSize,
    ordering: sortOrder === 'desc' ? `-${sortField}` : sortField,
  });

  const progressList = data?.results || [];
  const totalCount = data?.count || 0;

  // ========== Handlers ==========
  const handleView = (item: Progress) => {
    navigate(`/progress/${item.id}`);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('آیا از حذف این رکورد پیشرفت مطمئن هستید؟')) {
      if (onDelete) onDelete(id);
      else {
        await deleteProgress(id);
        refetch();
      }
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (key: string, value: any) => {
    let finalValue = value;

    // اعداد
    if (
      (key === 'min_percentage' || key === 'max_percentage' || key === 'year') &&
      value !== undefined && value !== null && value !== ''
    ) {
      const numValue = Number(value);
      finalValue = !isNaN(numValue) ? numValue : undefined;
    }

    setFilters((prev) => ({
      ...prev,
      [key]: finalValue === '' ? undefined : finalValue,
    }));

    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters(contractId ? { contract: contractId } : {});
    setSearchTerm('');
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchTerm ||
    Object.values(filters).some((v) => v !== undefined && v !== '' && v !== null);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  // ========== Status helper ==========
  const getStatusDisplay = (percentage: number) => {
    if (percentage >= 100) {
      return { label: 'تکمیل شده', color: '#059669', bgColor: '#d1fae5', icon: CheckCircle };
    } else if (percentage >= 70) {
      return { label: 'پیشرفت خوب', color: '#2563eb', bgColor: '#dbeafe', icon: TrendingUp };
    } else if (percentage >= 40) {
      return { label: 'در حال اجرا', color: '#d97706', bgColor: '#fef3c7', icon: Clock };
    } else {
      return { label: 'آغاز شده', color: '#6b7280', bgColor: '#f3f4f6', icon: AlertCircle };
    }
  };

  // ========== Columns ==========
  const columns: Column<Progress>[] = [
    {
      key: 'physical_progress_percentage',
      title: 'درصد پیشرفت',
      sortable: true,
      render: (item) => {
        const percentage = Number(item.physical_progress_percentage) || 0;
        const status = getStatusDisplay(percentage);
        const StatusIcon = status.icon;
        return (
          <div className="progress-cell">
            <span className="progress-value" style={{ color: status.color }}>
              {toPersianNumber(percentage)}%
            </span>
            <span
              className="status-badge-mini"
              style={{ backgroundColor: status.bgColor, color: status.color }}
            >
              <StatusIcon size={12} />
              {status.label}
            </span>
            <div className="progress-mini">
              <div
                className="progress-fill-mini"
                style={{ width: `${Math.min(percentage, 100)}%`, backgroundColor: status.color }}
              />
            </div>
          </div>
        );
      },
    },
    {
      key: 'contract_number',
      title: 'قرارداد',
      render: (item) => (
        <div className="contract-cell">
          <Building2 size={14} />
          <div>
            <div className="contract-number">{item.contract_number || '—'}</div>
            {item.contract_subject && (
              <div className="contract-subject">{item.contract_subject}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'registered_date',
      title: 'تاریخ ثبت',
      sortable: true,
      render: (item) => (
        <div className="date-cell">
          <Calendar size={14} />
          {item.registered_date ? toPersianNumber(item.registered_date) : '—'}
        </div>
      ),
    },
    {
      key: 'notes',
      title: 'توضیحات',
      render: (item) => (
        <div className="notes-cell" title={item.notes || ''}>
          {item.notes ? (
            <span className="notes-text">
              <FileText size={12} />
              {item.notes.length > 50 ? `${item.notes.substring(0, 50)}...` : item.notes}
            </span>
          ) : (
            <span className="text-muted">—</span>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      title: 'عملیات',
      width: 120,
      render: (item) => (
        <div className="actions">
          <button
            className="action-btn view"
            onClick={() => handleView(item)}
            title="مشاهده"
          >
            <Eye size={16} />
          </button>
          {!readOnly && (
            <>
              <button
                className="action-btn edit"
                onClick={() => onEdit?.(item)}
                title="ویرایش"
              >
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
            </>
          )}
        </div>
      ),
    },
  ];

  // ========== Filter Fields ==========
  const filterFields: FilterField[] = [
    // قرارداد (فقط اگه در حالت standalone)
    ...(!contractId
      ? [
          {
            key: 'contract',
            label: 'قرارداد',
            type: 'custom' as const,
            customComponent: (
              <ContractSelect
                value={filters.contract ?? null}
                onChange={(id) => handleFilterChange('contract', id)}
                placeholder="انتخاب قرارداد..."
                label=""
              />
            ),
          },
        ]
      : []),
    {
      key: 'year',
      label: 'سال',
      type: 'number',
      placeholder: 'مثال: 1405',
    },
    {
      key: 'min_percentage',
      label: 'حداقل درصد',
      type: 'number',
      placeholder: 'از 0',
    },
    {
      key: 'max_percentage',
      label: 'حداکثر درصد',
      type: 'number',
      placeholder: 'تا 100',
    },
    {
      key: 'date_group',
      label: '',
      type: 'fieldset',
      fieldsetTitle: '📅 بازه تاریخ ثبت',
      fieldsetFields: [
        {
          key: 'from_date',
          label: 'از تاریخ',
          type: 'custom',
          customComponent: (
            <JalaliDatePicker
              value={(filters.from_date as string) || null}
              onChange={(date) => handleFilterChange('from_date', date)}
              placeholder="1405/01/01"
              label=""
            />
          ),
        },
        {
          key: 'to_date',
          label: 'تا تاریخ',
          type: 'custom',
          customComponent: (
            <JalaliDatePicker
              value={(filters.to_date as string) || null}
              onChange={(date) => handleFilterChange('to_date', date)}
              placeholder="1405/12/29"
              label=""
            />
          ),
        },
      ],
    },
  ];

  return (
    <div className="progress-list">
      {/* Header */}
      <div className="progress-list-header">
        <div className="header-title">
          <TrendingUp size={22} />
          <h3>پیشرفت فیزیکی</h3>
          <span className="badge">{toPersianNumber(totalCount)}</span>
        </div>
        {!readOnly && onAdd && (
          <button className="btn-primary" onClick={onAdd}>
            <Plus size={18} />
            ثبت پیشرفت جدید
          </button>
        )}
      </div>

      {/* Search & Filters */}
      <div className="search-section">
        <SearchBar
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="جستجو در شماره قرارداد، موضوع و توضیحات..."
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
        data={progressList}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        emptyMessage={
          hasActiveFilters
            ? 'با فیلترهای انتخاب شده موردی پیدا نشد'
            : 'هنوز رکورد پیشرفتی ثبت نشده است'
        }
        sortField={sortField}
        sortOrder={sortOrder}
        onSort={handleSort}
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
        .progress-list { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
        .progress-list-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .header-title { display: flex; align-items: center; gap: 12px; }
        .header-title h3 { margin: 0; font-size: 20px; font-weight: 600; color: #1a1a2e; }
        .header-title .badge { background: #eef2ff; color: #4f46e5; padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; }
        .btn-primary { display: inline-flex; align-items: center; gap: 8px; padding: 8px 20px; background: #4f46e5; color: white; border: none; border-radius: 8px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
        .btn-primary:hover { background: #4338ca; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3); }
        .search-section { display: flex; gap: 12px; margin-bottom: 16px; }
        .filter-actions { display: flex; gap: 8px; flex-shrink: 0; }
        .filter-toggle { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border: 1.5px solid #e9ecef; border-radius: 8px; background: white; color: #6b7280; font-size: 14px; cursor: pointer; transition: all 0.2s; }
        .filter-toggle:hover { border-color: #4f46e5; color: #4f46e5; }
        .filter-toggle.active { border-color: #4f46e5; background: #eef2ff; color: #4f46e5; }
        .badge-filter { color: #4f46e5; font-size: 18px; }
        .clear-filters { display: inline-flex; align-items: center; gap: 4px; padding: 8px 12px; border: none; background: #fee2e2; color: #dc2626; border-radius: 8px; font-size: 13px; cursor: pointer; transition: all 0.2s; }
        .clear-filters:hover { background: #fecaca; }
        .progress-cell { display: flex; flex-direction: column; gap: 4px; }
        .progress-value { font-size: 16px; font-weight: 700; }
        .status-badge-mini { display: inline-flex; align-items: center; gap: 4px; font-size: 10px; font-weight: 500; padding: 1px 8px; border-radius: 10px; width: fit-content; }
        .progress-mini { width: 80px; height: 4px; background: #e9ecef; border-radius: 2px; overflow: hidden; }
        .progress-fill-mini { height: 100%; border-radius: 2px; transition: width 0.6s ease; }
        .contract-cell { display: flex; align-items: flex-start; gap: 6px; font-size: 13px; color: #374151; }
        .contract-number { font-weight: 600; color: #4f46e5; }
        .contract-subject { font-size: 11px; color: #6b7280; max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .date-cell { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #6b7280; }
        .notes-cell { font-size: 12px; color: #374151; }
        .notes-text { display: inline-flex; align-items: center; gap: 4px; }
        .text-muted { color: #9ca3af; }
        .actions { display: flex; gap: 4px; }
        .action-btn { width: 32px; height: 32px; border: none; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; background: transparent; color: #6b7280; }
        .action-btn:hover { background: #f3f4f6; }
        .action-btn.view:hover { background: #d1fae5; color: #059669; }
        .action-btn.edit:hover { background: #eef2ff; color: #4f46e5; }
        .action-btn.delete:hover { background: #fee2e2; color: #dc2626; }
        .action-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        @media (max-width: 768px) {
          .progress-list { padding: 12px; }
          .search-section { flex-direction: column; }
          .filter-actions { width: 100%; }
          .filter-actions button { flex: 1; justify-content: center; }
          .actions { flex-direction: column; gap: 2px; }
        }
      `}</style>
    </div>
  );
};

export default ProgressList;

// // src/modules/progress/components/ProgressList.tsx

// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useProgress } from '../hooks/useProgress';
// import type { Progress } from '../types/progress.types';
// import {
//   Plus,
//   Pencil,
//   Trash2,
//   Eye,
//   TrendingUp,
//   Calendar,
//   FileText,
//   Building2,
//   Search,
//   X,
//   Filter,
//   Percent,
//   Clock,
//   AlertCircle,
//   CheckCircle,
// } from 'lucide-react';
// import JalaliDatePicker from '../../../components/JalaliDatePicker';

// interface ProgressListProps {
//   contractId?: number;
//   onEdit?: (item: Progress) => void;
//   onDelete?: (id: number) => void;
//   onAdd?: () => void;
//   readOnly?: boolean;
// }

// export const ProgressList: React.FC<ProgressListProps> = ({
//   contractId,
//   onEdit,
//   onDelete,
//   onAdd,
//   readOnly = false,
// }) => {
//   const navigate = useNavigate();
//   const { useByContract, useList, delete: deleteProgress, isDeleting } = useProgress();
//   const [currentPage, setCurrentPage] = useState(1);
//   const [pageSize, setPageSize] = useState(10);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
//   const [showFilters, setShowFilters] = useState(false);
//   const [filters, setFilters] = useState<{
//     min_percentage?: number;
//     max_percentage?: number;
//     from_date?: string;
//     to_date?: string;
//   }>({});

//   // ✅ Debounce جستجو
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setDebouncedSearchTerm(searchTerm);
//       setCurrentPage(1);
//     }, 500);
//     return () => clearTimeout(timer);
//   }, [searchTerm]);

//   // ========== دریافت داده‌ها ==========
//   const { data, isLoading, refetch } = contractId
//     ? useByContract(contractId, { page: currentPage, pageSize })
//     : useList({
//         search: debouncedSearchTerm || undefined,
//         page: currentPage,
//         page_size: pageSize,
//         min_percentage: filters.min_percentage,
//         max_percentage: filters.max_percentage,
//         from_date: filters.from_date,
//         to_date: filters.to_date,
//       });

//   const progressList = data?.results || [];
//   const totalCount = data?.count || 0;
//   const totalPages = Math.ceil(totalCount / pageSize);

//   // ========== Handle View - رفتن به صفحه جزئیات ==========
//   const handleView = (item: Progress) => {
//     navigate(`/progress/${item.id}`);
//   };

//   const handleDelete = async (id: number) => {
//     if (window.confirm('آیا از حذف این رکورد پیشرفت مطمئن هستید؟')) {
//       await deleteProgress(id);
//       refetch();
//     }
//   };

//   const goToPage = (page: number) => {
//     if (page >= 1 && page <= totalPages) {
//       setCurrentPage(page);
//       window.scrollTo({ top: 0, behavior: 'smooth' });
//     }
//   };

//   const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     setPageSize(Number(e.target.value));
//     setCurrentPage(1);
//   };

//   const clearFilters = () => {
//     setFilters({});
//     setSearchTerm('');
//     setDebouncedSearchTerm('');
//     setCurrentPage(1);
//   };

//   const hasActiveFilters = searchTerm || Object.values(filters).some(v => v !== undefined);

//   // ========== دریافت وضعیت نمایشی ==========
//   const getStatusDisplay = (percentage: number) => {
//     if (percentage >= 100) {
//       return { label: 'تکمیل شده', color: '#059669', bgColor: '#d1fae5', icon: CheckCircle };
//     } else if (percentage >= 70) {
//       return { label: 'پیشرفت خوب', color: '#2563eb', bgColor: '#dbeafe', icon: TrendingUp };
//     } else if (percentage >= 40) {
//       return { label: 'در حال اجرا', color: '#d97706', bgColor: '#fef3c7', icon: Clock };
//     } else {
//       return { label: 'آغاز شده', color: '#6b7280', bgColor: '#f3f4f6', icon: AlertCircle };
//     }
//   };

//   // ========== رندر صفحه‌بندی ==========
//   const renderPagination = () => {
//     if (totalPages <= 1) return null;

//     const pages = [];
//     const maxVisible = 5;
//     let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
//     let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
//     if (endPage - startPage < maxVisible - 1) {
//       startPage = Math.max(1, endPage - maxVisible + 1);
//     }

//     for (let i = startPage; i <= endPage; i++) {
//       pages.push(i);
//     }

//     return (
//       <div className="pagination-container">
//         <div className="pagination-info">
//           نمایش {((currentPage - 1) * pageSize) + 1} تا{' '}
//           {Math.min(currentPage * pageSize, totalCount)} از {totalCount} مورد
//         </div>
//         <div className="pagination-controls">
//           <button className="pagination-btn" onClick={() => goToPage(1)} disabled={currentPage === 1}>
//             <span className="double-chevron-left">«</span>
//           </button>
//           <button className="pagination-btn" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
//             <span className="single-chevron-left">‹</span>
//           </button>
//           {pages.map((page) => (
//             <button key={page} className={`pagination-btn ${page === currentPage ? 'active' : ''}`} onClick={() => goToPage(page)}>
//               {page}
//             </button>
//           ))}
//           <button className="pagination-btn" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
//             <span className="single-chevron-right">›</span>
//           </button>
//           <button className="pagination-btn" onClick={() => goToPage(totalPages)} disabled={currentPage === totalPages}>
//             <span className="double-chevron-right">»</span>
//           </button>
//         </div>
//         <div className="page-size-selector">
//           <label>تعداد در صفحه:</label>
//           <select value={pageSize} onChange={handlePageSizeChange}>
//             <option value={5}>۵</option>
//             <option value={10}>۱۰</option>
//             <option value={20}>۲۰</option>
//             <option value={50}>۵۰</option>
//           </select>
//         </div>
//       </div>
//     );
//   };

//   if (isLoading) {
//     return (
//       <div className="text-center py-5">
//         <div className="spinner-border text-primary" role="status">
//           <span className="visually-hidden">در حال بارگذاری...</span>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="progress-list">
//       <div className="progress-list-header">
//         <div className="header-title">
//           <TrendingUp size={20} />
//           <h3>پیشرفت فیزیکی</h3>
//           <span className="badge">{totalCount}</span>
//         </div>
//         {!readOnly && onAdd && (
//           <button className="btn-add" onClick={onAdd}>
//             <Plus size={16} />
//             ثبت پیشرفت جدید
//           </button>
//         )}
//       </div>

//       {/* ========== جستجو و فیلتر ========== */}
//       {!contractId && (
//         <div className="search-section">
//           <div className="search-input-wrapper">
//             <Search size={18} className="search-icon" />
//             <input
//               type="text"
//               placeholder="جستجو در شماره قرارداد، موضوع و توضیحات..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="search-input"
//             />
//             {searchTerm && (
//               <button className="clear-btn" onClick={() => setSearchTerm('')}>
//                 <X size={16} />
//               </button>
//             )}
//           </div>

//           <div className="filter-actions">
//             <button
//               className={`filter-toggle ${showFilters ? 'active' : ''}`}
//               onClick={() => setShowFilters(!showFilters)}
//             >
//               <Filter size={16} />
//               فیلترها
//               {hasActiveFilters && <span className="badge-filter">•</span>}
//             </button>
//             {hasActiveFilters && (
//               <button className="clear-filters" onClick={clearFilters}>
//                 <X size={14} />
//                 پاک کردن
//               </button>
//             )}
//           </div>
//         </div>
//       )}

//       {showFilters && !contractId && (
//         <div className="filter-panel">
//           <div className="filter-grid">
//             <div className="filter-group">
//               <label>درصد پیشرفت</label>
//               <div className="filter-range">
//                 <input
//                   type="number"
//                   min="0"
//                   max="100"
//                   placeholder="از"
//                   value={filters.min_percentage || ''}
//                   onChange={(e) => setFilters(prev => ({ ...prev, min_percentage: e.target.value ? Number(e.target.value) : undefined }))}
//                 />
//                 <span>تا</span>
//                 <input
//                   type="number"
//                   min="0"
//                   max="100"
//                   placeholder="تا"
//                   value={filters.max_percentage || ''}
//                   onChange={(e) => setFilters(prev => ({ ...prev, max_percentage: e.target.value ? Number(e.target.value) : undefined }))}
//                 />
//               </div>
//             </div>
//             <div className="filter-group">
//               <label>بازه تاریخ ثبت</label>
//               <div className="filter-range-date">
//                 <div className="date-picker-wrapper">
//                   <JalaliDatePicker
//                     value={filters.from_date || null}
//                     onChange={(date) => {
//                       setFilters(prev => ({ 
//                         ...prev, 
//                         from_date: date || undefined 
//                       }));
//                     }}
//                     placeholder="از تاریخ"
//                     label=""
//                   />
//                 </div>
//                 <span>تا</span>
//                 <div className="date-picker-wrapper">
//                   <JalaliDatePicker
//                     value={filters.to_date || null}
//                     onChange={(date) => {
//                       setFilters(prev => ({ 
//                         ...prev, 
//                         to_date: date || undefined 
//                       }));
//                     }}
//                     placeholder="تا تاریخ"
//                     label=""
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {progressList.length === 0 ? (
//         <div className="empty-state">
//           <TrendingUp size={40} />
//           <p>هیچ رکورد پیشرفتی ثبت نشده است</p>
//           {!readOnly && onAdd && (
//             <button className="btn-add-primary" onClick={onAdd}>
//               <Plus size={16} />
//               ثبت اولین پیشرفت
//             </button>
//           )}
//         </div>
//       ) : (
//         <>
//           <div className="progress-timeline">
//             {progressList.map((progress: Progress, index: number) => {
//               const isLatest = index === 0;
//               const status = getStatusDisplay(progress.physical_progress_percentage);
//               const StatusIcon = status.icon;

//               return (
//                 <div key={progress.id} className={`progress-item ${isLatest ? 'latest' : ''}`}>
//                   <div className="progress-item-header">
//                     <div className="progress-item-left">
//                       {isLatest && <span className="latest-badge">آخرین</span>}
//                       <span className="progress-percentage" style={{ color: status.color }}>
//                         {progress.physical_progress_percentage}%
//                       </span>
//                       <span
//                         className="status-badge"
//                         style={{
//                           backgroundColor: status.bgColor,
//                           color: status.color,
//                         }}
//                       >
//                         <StatusIcon size={12} />
//                         {status.label}
//                       </span>
//                       <span className="progress-date">
//                         <Calendar size={14} />
//                         {progress.registered_date}
//                       </span>
//                     </div>
//                     <div className="progress-item-actions">
//                       {/* ✅ دکمه مشاهده - رفتن به صفحه جزئیات */}
//                       <button
//                         className="action-btn view"
//                         onClick={() => handleView(progress)}
//                         title="مشاهده"
//                       >
//                         <Eye size={14} />
//                       </button>
//                       {!readOnly && (
//                         <>
//                           <button
//                             className="action-btn edit"
//                             onClick={() => onEdit?.(progress)}
//                             title="ویرایش"
//                           >
//                             <Pencil size={14} />
//                           </button>
//                           <button
//                             className="action-btn delete"
//                             onClick={() => handleDelete(progress.id)}
//                             disabled={isDeleting}
//                             title="حذف"
//                           >
//                             <Trash2 size={14} />
//                           </button>
//                         </>
//                       )}
//                     </div>
//                   </div>

//                   <div className="progress-bar-container">
//                     <div className="progress-bar">
//                       <div
//                         className={`progress-fill ${progress.physical_progress_percentage >= 100 ? 'complete' : ''}`}
//                         style={{ width: `${Math.min(progress.physical_progress_percentage, 100)}%` }}
//                       />
//                     </div>
//                   </div>

//                   {progress.notes && (
//                     <div className="progress-notes">
//                       <FileText size={14} />
//                       <p>{progress.notes}</p>
//                     </div>
//                   )}

//                   {!contractId && progress.contract_number && (
//                     <div className="progress-contract">
//                       <Building2 size={14} />
//                       <span>{progress.contract_number}</span>
//                       {progress.contract_subject && (
//                         <span className="contract-subject">- {progress.contract_subject}</span>
//                       )}
//                     </div>
//                   )}

//                   {progress.steering_committee_session && (
//                     <div className="progress-committee">
//                       <span className="committee-label">کمیته راهبری:</span>
//                       <span>{progress.steering_committee_session}</span>
//                     </div>
//                   )}
//                 </div>
//               );
//             })}
//           </div>
//           {renderPagination()}
//         </>
//       )}

//       <style>{`
//         .progress-list {
//           background: white;
//           border-radius: 12px;
//           border: 1px solid #e9ecef;
//           overflow: hidden;
//           padding: 16px;
//         }

//         .progress-list-header {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           margin-bottom: 16px;
//         }

//         .header-title {
//           display: flex;
//           align-items: center;
//           gap: 10px;
//         }

//         .header-title h3 {
//           margin: 0;
//           font-size: 18px;
//           font-weight: 600;
//           color: #1a1a2e;
//         }

//         .badge {
//           background: #eef2ff;
//           color: #4f46e5;
//           padding: 0 10px;
//           border-radius: 12px;
//           font-size: 12px;
//           font-weight: 600;
//         }

//         .btn-add {
//           display: inline-flex;
//           align-items: center;
//           gap: 6px;
//           padding: 6px 16px;
//           background: #4f46e5;
//           color: white;
//           border: none;
//           border-radius: 6px;
//           font-size: 13px;
//           font-weight: 500;
//           cursor: pointer;
//           transition: all 0.2s;
//         }

//         .btn-add:hover {
//           background: #4338ca;
//           transform: translateY(-1px);
//         }

//         .btn-add-primary {
//           display: inline-flex;
//           align-items: center;
//           gap: 6px;
//           padding: 8px 20px;
//           background: #4f46e5;
//           color: white;
//           border: none;
//           border-radius: 6px;
//           font-size: 14px;
//           font-weight: 500;
//           cursor: pointer;
//           transition: all 0.2s;
//           margin-top: 8px;
//         }

//         .btn-add-primary:hover {
//           background: #4338ca;
//         }

//         .search-section {
//           display: flex;
//           gap: 12px;
//           margin-bottom: 16px;
//         }

//         .search-input-wrapper {
//           flex: 1;
//           position: relative;
//         }

//         .search-input {
//           width: 100%;
//           padding: 8px 40px 8px 12px;
//           border: 1.5px solid #e9ecef;
//           border-radius: 8px;
//           font-size: 14px;
//           transition: all 0.2s;
//         }

//         .search-input:focus {
//           border-color: #4f46e5;
//           outline: none;
//           box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
//         }

//         .search-icon {
//           position: absolute;
//           right: 12px;
//           top: 50%;
//           transform: translateY(-50%);
//           color: #9ca3af;
//         }

//         .clear-btn {
//           position: absolute;
//           left: 12px;
//           top: 50%;
//           transform: translateY(-50%);
//           background: none;
//           border: none;
//           color: #9ca3af;
//           cursor: pointer;
//           padding: 4px;
//         }

//         .clear-btn:hover {
//           color: #ef4444;
//         }

//         .filter-actions {
//           display: flex;
//           gap: 8px;
//         }

//         .filter-toggle {
//           display: inline-flex;
//           align-items: center;
//           gap: 6px;
//           padding: 8px 16px;
//           border: 1.5px solid #e9ecef;
//           border-radius: 8px;
//           background: white;
//           color: #6b7280;
//           font-size: 14px;
//           cursor: pointer;
//           transition: all 0.2s;
//         }

//         .filter-toggle:hover {
//           border-color: #4f46e5;
//           color: #4f46e5;
//         }

//         .filter-toggle.active {
//           border-color: #4f46e5;
//           background: #eef2ff;
//           color: #4f46e5;
//         }

//         .badge-filter {
//           color: #4f46e5;
//           font-size: 18px;
//         }

//         .clear-filters {
//           display: inline-flex;
//           align-items: center;
//           gap: 4px;
//           padding: 8px 12px;
//           border: none;
//           background: #fee2e2;
//           color: #dc2626;
//           border-radius: 8px;
//           font-size: 13px;
//           cursor: pointer;
//           transition: all 0.2s;
//         }

//         .clear-filters:hover {
//           background: #fecaca;
//         }

//         .filter-panel {
//           padding: 16px;
//           margin-bottom: 16px;
//           background: #f8fafc;
//           border-radius: 8px;
//         }

//         .filter-grid {
//           display: grid;
//           grid-template-columns: 1fr 1fr;
//           gap: 16px;
//         }

//         .filter-group {
//           display: flex;
//           flex-direction: column;
//           gap: 4px;
//         }

//         .filter-group label {
//           font-size: 12px;
//           font-weight: 500;
//           color: #374151;
//         }

//         .filter-range {
//           display: flex;
//           align-items: center;
//           gap: 8px;
//         }

//         .filter-range input {
//           flex: 1;
//           padding: 6px 10px;
//           border: 1.5px solid #d1d5db;
//           border-radius: 6px;
//           font-size: 13px;
//           min-width: 60px;
//         }

//         .filter-range input:focus {
//           border-color: #4f46e5;
//           outline: none;
//           box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
//         }

//         .filter-range span {
//           color: #6b7280;
//           font-size: 13px;
//         }

//         .filter-range-date {
//           display: flex;
//           align-items: center;
//           gap: 8px;
//           width: 100%;
//         }

//         .date-picker-wrapper {
//           flex: 1;
//           min-width: 120px;
//         }

//         .date-picker-wrapper .position-relative {
//           width: 100%;
//         }

//         .date-picker-wrapper input {
//           width: 100% !important;
//           padding: 6px 10px !important;
//           font-size: 13px !important;
//           min-width: 0 !important;
//         }

//         .empty-state {
//           text-align: center;
//           padding: 30px 20px;
//           color: #6b7280;
//         }

//         .empty-state p {
//           margin: 8px 0;
//         }

//         .progress-timeline {
//           display: flex;
//           flex-direction: column;
//           gap: 12px;
//           max-height: 500px;
//           overflow-y: auto;
//         }

//         .progress-timeline::-webkit-scrollbar {
//           width: 4px;
//         }

//         .progress-timeline::-webkit-scrollbar-track {
//           background: #f1f1f1;
//           border-radius: 4px;
//         }

//         .progress-timeline::-webkit-scrollbar-thumb {
//           background: #c1c7cd;
//           border-radius: 4px;
//         }

//         .progress-item {
//           padding: 14px 16px;
//           background: #f8fafc;
//           border-radius: 8px;
//           border: 1px solid #e9ecef;
//           transition: all 0.2s;
//         }

//         .progress-item:hover {
//           border-color: #d1d5db;
//         }

//         .progress-item.latest {
//           border-color: #4f46e5;
//           background: #eef2ff;
//         }

//         .progress-item-header {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           margin-bottom: 8px;
//           flex-wrap: wrap;
//           gap: 8px;
//         }

//         .progress-item-left {
//           display: flex;
//           align-items: center;
//           gap: 12px;
//           flex-wrap: wrap;
//         }

//         .latest-badge {
//           font-size: 10px;
//           font-weight: 700;
//           color: #4f46e5;
//           background: #c7d2fe;
//           padding: 1px 8px;
//           border-radius: 12px;
//           text-transform: uppercase;
//         }

//         .progress-percentage {
//           font-size: 18px;
//           font-weight: 700;
//         }

//         .status-badge {
//           display: inline-flex;
//           align-items: center;
//           gap: 4px;
//           font-size: 11px;
//           font-weight: 500;
//           padding: 2px 12px;
//           border-radius: 12px;
//         }

//         .progress-date {
//           display: flex;
//           align-items: center;
//           gap: 4px;
//           font-size: 13px;
//           color: #6b7280;
//         }

//         .progress-item-actions {
//           display: flex;
//           gap: 4px;
//         }

//         .action-btn {
//           width: 28px;
//           height: 28px;
//           border: none;
//           border-radius: 4px;
//           display: inline-flex;
//           align-items: center;
//           justify-content: center;
//           cursor: pointer;
//           transition: all 0.2s;
//           background: transparent;
//           color: #6b7280;
//         }

//         .action-btn:hover {
//           background: #f3f4f6;
//         }

//         .action-btn.view:hover {
//           background: #d1fae5;
//           color: #059669;
//         }

//         .action-btn.edit:hover {
//           background: #eef2ff;
//           color: #4f46e5;
//         }

//         .action-btn.delete:hover {
//           background: #fee2e2;
//           color: #dc2626;
//         }

//         .action-btn:disabled {
//           opacity: 0.5;
//           cursor: not-allowed;
//         }

//         .progress-bar-container {
//           margin: 8px 0;
//         }

//         .progress-bar {
//           height: 6px;
//           background: #e9ecef;
//           border-radius: 4px;
//           overflow: hidden;
//         }

//         .progress-fill {
//           height: 100%;
//           background: linear-gradient(90deg, #4f46e5, #7c3aed);
//           border-radius: 4px;
//           transition: width 0.6s ease;
//         }

//         .progress-fill.complete {
//           background: linear-gradient(90deg, #059669, #10b981);
//         }

//         .progress-notes {
//           display: flex;
//           align-items: flex-start;
//           gap: 6px;
//           margin-top: 6px;
//           font-size: 13px;
//           color: #374151;
//         }

//         .progress-notes p {
//           margin: 0;
//           line-height: 1.5;
//         }

//         .progress-contract {
//           display: flex;
//           align-items: center;
//           gap: 6px;
//           margin-top: 6px;
//           font-size: 12px;
//           color: #6b7280;
//           padding-top: 6px;
//           border-top: 1px solid #e9ecef;
//         }

//         .contract-subject {
//           color: #4f46e5;
//         }

//         .progress-committee {
//           display: flex;
//           align-items: center;
//           gap: 4px;
//           margin-top: 4px;
//           font-size: 12px;
//           color: #6b7280;
//         }

//         .committee-label {
//           font-weight: 500;
//           color: #374151;
//         }

//         .pagination-container {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           flex-wrap: wrap;
//           gap: 16px;
//           padding: 16px 0;
//           border-top: 1px solid #e9ecef;
//           margin-top: 16px;
//         }

//         .pagination-info {
//           font-size: 14px;
//           color: #6b7280;
//         }

//         .pagination-controls {
//           display: flex;
//           align-items: center;
//           gap: 4px;
//         }

//         .pagination-btn {
//           display: inline-flex;
//           align-items: center;
//           justify-content: center;
//           min-width: 36px;
//           height: 36px;
//           padding: 0 8px;
//           border: 1px solid #e9ecef;
//           border-radius: 6px;
//           background: white;
//           color: #374151;
//           font-size: 14px;
//           cursor: pointer;
//           transition: all 0.2s;
//         }

//         .pagination-btn:hover:not(:disabled) {
//           background: #f3f4f6;
//           border-color: #d1d5db;
//         }

//         .pagination-btn.active {
//           background: #4f46e5;
//           border-color: #4f46e5;
//           color: white;
//           font-weight: 600;
//         }

//         .pagination-btn:disabled {
//           opacity: 0.4;
//           cursor: not-allowed;
//         }

//         .page-size-selector {
//           display: flex;
//           align-items: center;
//           gap: 8px;
//           font-size: 14px;
//           color: #6b7280;
//         }

//         .page-size-selector select {
//           padding: 4px 8px;
//           border: 1px solid #e9ecef;
//           border-radius: 4px;
//           font-size: 14px;
//           background: white;
//           cursor: pointer;
//         }

//         .double-chevron-right,
//         .double-chevron-left,
//         .single-chevron-right,
//         .single-chevron-left {
//           font-size: 18px;
//           font-weight: 700;
//           line-height: 1;
//           display: inline-block;
//           color: inherit;
//         }

//         .double-chevron-right,
//         .double-chevron-left {
//           font-size: 16px;
//         }

//         .single-chevron-right,
//         .single-chevron-left {
//           font-size: 20px;
//         }

//         @media (max-width: 768px) {
//           .progress-list {
//             padding: 12px;
//           }

//           .progress-item-header {
//             flex-direction: column;
//             align-items: stretch;
//           }

//           .progress-item-left {
//             flex-wrap: wrap;
//           }

//           .progress-item-actions {
//             justify-content: flex-end;
//           }

//           .search-section {
//             flex-direction: column;
//           }

//           .filter-actions {
//             width: 100%;
//           }

//           .filter-actions button {
//             flex: 1;
//             justify-content: center;
//           }

//           .filter-grid {
//             grid-template-columns: 1fr;
//           }

//           .filter-range {
//             flex-wrap: wrap;
//           }

//           .filter-range input {
//             min-width: 40px;
//           }

//           .filter-range-date {
//             flex-direction: column;
//             align-items: stretch;
//           }

//           .date-picker-wrapper {
//             min-width: 100%;
//           }

//           .pagination-container {
//             flex-direction: column;
//             align-items: center;
//           }

//           .pagination-info {
//             text-align: center;
//           }

//           .pagination-controls {
//             flex-wrap: wrap;
//             justify-content: center;
//           }
//         }
//       `}</style>
//     </div>
//   );
// };

// export default ProgressList;
