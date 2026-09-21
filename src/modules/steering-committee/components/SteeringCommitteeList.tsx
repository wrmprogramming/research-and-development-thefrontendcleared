// src/modules/steering-committee/components/SteeringCommitteeList.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSteeringCommittee } from '../hooks/useSteeringCommittee';
import type { SteeringCommittee, SteeringCommitteeFilters } from '../types/steeringCommittee.types';
import { toPersianNumber } from '../../../utils/formatter.utils';

import {
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
  SearchBar,
  FilterPanel,
  DataTable,
  type Column,
  type FilterField,
} from '../../../components/common';

import { ResearchSelect } from '../../research/components/ResearchSelect';
import JalaliDatePicker from '../../../components/JalaliDatePicker';

interface SteeringCommitteeListProps {
  onEdit?: (item: SteeringCommittee) => void;
  onDelete?: (id: number) => void;
  onAdd?: () => void;
}

export const SteeringCommitteeList: React.FC<SteeringCommitteeListProps> = ({
  onEdit,
  onDelete,
  onAdd,
}) => {
  const navigate = useNavigate();
  const { useList, delete: deleteCommittee, isDeleting } = useSteeringCommittee();

  const [filters, setFilters] = useState<SteeringCommitteeFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState<string>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const { data, isLoading, refetch } = useList({
    ...filters,
    search: searchTerm || undefined,
    page: currentPage,
    page_size: pageSize,
    ordering: sortOrder === 'desc' ? `-${sortField}` : sortField,
  });

  const committees = data?.results || [];
  const totalCount = data?.count || 0;

  const handleView = (item: SteeringCommittee) => {
    navigate(`/committees-steering/${item.id}`);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('آیا از حذف این کمیته راهبری مطمئن هستید؟')) {
      if (onDelete) onDelete(id);
      else {
        await deleteCommittee(id);
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
    if (key === 'year' && value !== undefined && value !== null && value !== '') {
      const numValue = Number(value);
      finalValue = !isNaN(numValue) && numValue > 0 ? numValue : undefined;
    }
    setFilters((prev) => ({
      ...prev,
      [key]: finalValue === '' ? undefined : finalValue,
    }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({});
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

  const columns: Column<SteeringCommittee>[] = [
    {
      key: 'session_number',
      title: 'شماره جلسه',
      sortable: true,
      render: (item) => (
        <span className="session-badge">{item.session_number}</span>
      ),
    },
    {
      key: 'date',
      title: 'تاریخ جلسه',
      sortable: true,
      render: (item) => (
        <div className="date-cell">
          <Calendar size={14} className="date-icon" />
          <span className="date-text">
            {item.date ? toPersianNumber(item.date) : '—'}
          </span>
        </div>
      ),
    },
    {
      key: 'research',
      title: 'پژوهش مرتبط',
      render: (item) =>
        item.research ? (
          <div className="research-cell">
            <span className="research-code">{item.research_code}</span>
            <span className="research-title">{item.research_title}</span>
          </div>
        ) : (
          <span className="text-muted">—</span>
        ),
    },
    {
      key: 'description',
      title: 'توضیحات',
      render: (item) => (
        <div className="description-cell">
          <span className="description-text">
            {item.description && item.description.length > 50
              ? `${item.description.substring(0, 50)}...`
              : item.description || '—'}
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
            {toPersianNumber(item.approvements?.length || 0)}
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
          {!item.minutes_file && !item.attachment && (
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
          <button className="action-btn view" onClick={() => handleView(item)} title="مشاهده">
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

  const filterFields: FilterField[] = [
    {
      key: 'year',
      label: 'سال',
      type: 'number',
      placeholder: 'مثال: 1405',
    },
    {
      key: 'research',
      label: 'پژوهش',
      type: 'custom',
      customComponent: (
        <ResearchSelect
          value={filters.research ?? null}
          onChange={(id) => handleFilterChange('research', id)}
          placeholder="انتخاب پژوهش..."
          label=""
        />
      ),
    },
    {
      key: 'date_group',
      label: '',
      type: 'fieldset',
      fieldsetTitle: '📅 بازه تاریخ جلسه',
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
    <div className="steering-committee-list">
      <div className="list-header">
        <div className="header-title">
          <FileText size={24} />
          <h2>کمیته‌های راهبری</h2>
          <span className="badge">{toPersianNumber(totalCount)}</span>
        </div>
        {onAdd && (
          <button className="btn-primary" onClick={onAdd}>
            <Plus size={18} />
            افزودن جلسه
          </button>
        )}
      </div>

      <div className="search-section">
        <SearchBar
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="جستجو در شماره جلسه، توضیحات..."
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

      {showFilters && (
        <FilterPanel
          fields={filterFields}
          values={filters}
          onChange={handleFilterChange}
        />
      )}

      <DataTable
        data={committees}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        emptyMessage={
          hasActiveFilters
            ? 'با فیلترهای انتخاب شده موردی پیدا نشد'
            : 'هنوز جلسه‌ای ثبت نشده است'
        }
        sortField={sortField}
        sortOrder={sortOrder}
        onSort={handleSort}
      />

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
        .steering-committee-list { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
        .list-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .header-title { display: flex; align-items: center; gap: 12px; }
        .header-title h2 { margin: 0; font-size: 20px; font-weight: 600; }
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
        .session-badge { background: #eef2ff; color: #4f46e5; padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; display: inline-block; }
        .date-cell { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #6b7280; }
        .date-icon { color: #9ca3af; }
        .research-cell { display: flex; flex-direction: column; gap: 2px; }
        .research-code { font-size: 11px; font-weight: 600; color: #4f46e5; }
        .research-title { font-size: 13px; color: #1a1a2e; }
        .description-cell { max-width: 200px; }
        .description-text { font-size: 13px; color: #374151; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .approvements-cell { display: flex; align-items: center; gap: 6px; }
        .approvements-count { font-size: 16px; font-weight: 700; color: #4f46e5; }
        .approvements-label { font-size: 11px; color: #6b7280; }
        .attachments-cell { display: flex; align-items: center; gap: 4px; }
        .file-link { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 4px; color: #4f46e5; background: #eef2ff; transition: all 0.2s; text-decoration: none; }
        .file-link:hover { background: #dbeafe; color: #4338ca; }
        .text-muted { color: #9ca3af; }
        .actions { display: flex; gap: 4px; }
        .action-btn { width: 32px; height: 32px; border: none; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; background: transparent; color: #6b7280; }
        .action-btn:hover { background: #f3f4f6; }
        .action-btn.view:hover { background: #d1fae5; color: #059669; }
        .action-btn.edit:hover { background: #eef2ff; color: #4f46e5; }
        .action-btn.delete:hover { background: #fee2e2; color: #dc2626; }
        .action-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        @media (max-width: 768px) {
          .steering-committee-list { padding: 12px; }
          .search-section { flex-direction: column; }
          .filter-actions { width: 100%; }
          .filter-actions button { flex: 1; justify-content: center; }
          .actions { flex-direction: column; gap: 2px; }
        }
      `}</style>
    </div>
  );
};

export default SteeringCommitteeList;
// // src/modules/steering-committee/components/SteeringCommitteeList.tsx

// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useSteeringCommittee } from '../hooks/useSteeringCommittee';
// import type { SteeringCommittee } from '../types/steeringCommittee.types';
// import {
//   Search,
//   Plus,
//   Pencil,
//   Trash2,
//   Eye,
//   Filter,
//   X,
//   FileText,
//   Calendar,
//   File,
//   Download,
//   GraduationCap,
// } from 'lucide-react';
// import {
//   Pagination,
//   FilterPanel,
//   DataTable,
//   type Column,
//   type FilterField,
// } from '../../../components/common';

// interface SteeringCommitteeListProps {
//   onEdit?: (item: SteeringCommittee) => void;
//   onDelete?: (id: number) => void;
//   onAdd?: () => void;
// }

// export const SteeringCommitteeList: React.FC<SteeringCommitteeListProps> = ({
//   onEdit,
//   onDelete,
//   onAdd,
// }) => {
//   const navigate = useNavigate();
//   const { useList, delete: deleteCommittee, isDeleting } = useSteeringCommittee();

//   // ========== State ==========
//   const [filters, setFilters] = useState<{
//     search?: string;
//     year?: number;
//     research?: number;
//   }>({});

//   const [searchTerm, setSearchTerm] = useState('');
//   const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
//   const [showFilters, setShowFilters] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [pageSize, setPageSize] = useState(10);
//   const [sortField, setSortField] = useState<string>('date');
//   const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

//   // ========== Handle View - رفتن به صفحه جزئیات ==========
//   const handleView = (item: SteeringCommittee) => {
//     navigate(`/committees-steering/${item.id}`);
//   };

//   // ========== Debounce ==========
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setDebouncedSearchTerm(searchTerm);
//       setCurrentPage(1);
//     }, 500);
//     return () => clearTimeout(timer);
//   }, [searchTerm]);

//   // ========== Get Data ==========
//   const { data, isLoading, refetch } = useList({
//     search: debouncedSearchTerm || undefined,
//     year: filters.year,
//     research: filters.research,
//     page: currentPage,
//     page_size: pageSize,
//     ordering: sortOrder === 'desc' ? `-${sortField}` : sortField,
//   });

//   const committees = data?.results || [];
//   const totalCount = data?.count || 0;

//   // ========== Handlers ==========
//   const handleDelete = async (id: number) => {
//     if (window.confirm('آیا از حذف این کمیته راهبری مطمئن هستید؟')) {
//       await deleteCommittee(id);
//       refetch();
//     }
//   };

//   const handleFilterChange = (key: string, value: any) => {
//     let finalValue = value;
//     if (key === 'year' && value) {
//       const numValue = Number(value);
//       finalValue = !isNaN(numValue) && numValue > 0 ? numValue : undefined;
//     }
//     setFilters(prev => ({
//       ...prev,
//       [key]: finalValue === '' ? undefined : finalValue,
//     }));
//     setCurrentPage(1);
//   };

//   const clearFilters = () => {
//     setFilters({});
//     setSearchTerm('');
//     setDebouncedSearchTerm('');
//     setCurrentPage(1);
//   };

//   const hasActiveFilters = searchTerm || Object.values(filters).some(v => v !== undefined && v !== '' && v !== null);

//   // ========== Columns ==========
//   const columns: Column<SteeringCommittee>[] = [
//     {
//       key: 'session_number',
//       title: 'شماره جلسه',
//       render: (item) => (
//         <div className="session-cell">
//           <span className="session-badge">{item.session_number}</span>
//         </div>
//       ),
//     },
//     {
//       key: 'date',
//       title: 'تاریخ جلسه',
//       render: (item) => (
//         <div className="date-cell">
//           <Calendar size={14} className="date-icon" />
//           <span className="date-text">{item.date}</span>
//         </div>
//       ),
//     },
//     {
//       key: 'research',
//       title: 'پژوهش مرتبط',
//       render: (item) => (
//         <div className="research-cell">
//           {item.research ? (
//             <>
//               <span className="research-code">{item.research_code}</span>
//               <span className="research-title">{item.research_title}</span>
//             </>
//           ) : (
//             <span className="text-muted">—</span>
//           )}
//         </div>
//       ),
//     },
//     {
//       key: 'description',
//       title: 'توضیحات',
//       render: (item) => (
//         <div className="description-cell">
//           <span className="description-text">
//             {item.description && item.description.length > 50 
//               ? `${item.description.substring(0, 50)}...` 
//               : item.description || '—'}
//           </span>
//         </div>
//       ),
//     },
//     {
//       key: 'approvements',
//       title: 'تعداد مصوبات',
//       render: (item) => (
//         <div className="approvements-cell">
//           <span className="approvements-count">
//             {item.approvements?.length || 0}
//           </span>
//           {item.approvements && item.approvements.length > 0 && (
//             <span className="approvements-label">مصوبه</span>
//           )}
//         </div>
//       ),
//     },
//     {
//       key: 'attachments',
//       title: 'فایل‌ها',
//       render: (item) => (
//         <div className="attachments-cell">
//           {item.minutes_file && (
//             <a href={item.minutes_file} target="_blank" rel="noopener noreferrer" className="file-link" title="صورتجلسه">
//               <File size={14} />
//             </a>
//           )}
//           {item.attachment && (
//             <a href={item.attachment} target="_blank" rel="noopener noreferrer" className="file-link" title="فایل پیوست">
//               <Download size={14} />
//             </a>
//           )}
//           {!item.minutes_file && !item.attachment && <span className="text-muted">—</span>}
//         </div>
//       ),
//     },
//     {
//       key: 'actions',
//       title: 'عملیات',
//       width: 120,
//       render: (item) => (
//         <div className="actions">
//           <button className="action-btn view" onClick={() => handleView(item)} title="مشاهده">
//             <Eye size={16} />
//           </button>
//           <button className="action-btn edit" onClick={() => onEdit?.(item)} title="ویرایش">
//             <Pencil size={16} />
//           </button>
//           <button className="action-btn delete" onClick={() => handleDelete(item.id)} disabled={isDeleting} title="حذف">
//             <Trash2 size={16} />
//           </button>
//         </div>
//       ),
//     },
//   ];

//   // ========== Filter Fields ==========
//   const filterFields: FilterField[] = [
//     {
//       key: 'year',
//       label: 'سال',
//       type: 'number',
//       placeholder: 'سال را وارد کنید...',
//     },
//     {
//       key: 'research',
//       label: 'پژوهش',
//       type: 'number',
//       placeholder: 'کد پژوهش را وارد کنید...',
//     },
//   ];

//   // ========== Render ==========
//   return (
//     <div className="steering-committee-list">
//       {/* Header */}
//       <div className="list-header">
//         <div className="header-title">
//           <FileText size={24} />
//           <h2>کمیته‌های راهبری</h2>
//           <span className="badge">{totalCount}</span>
//         </div>
//         {onAdd && (
//           <button className="btn-primary" onClick={onAdd}>
//             <Plus size={18} />
//             افزودن جلسه
//           </button>
//         )}
//       </div>

//       {/* Search & Filters */}
//       <div className="search-section">
//         <div className="search-input-wrapper">
//           <Search size={18} className="search-icon" />
//           <input
//             type="text"
//             placeholder="جستجو در شماره جلسه، توضیحات..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="search-input"
//           />
//           {searchTerm && (
//             <button className="clear-btn" onClick={() => setSearchTerm('')}>
//               <X size={16} />
//             </button>
//           )}
//         </div>

//         <div className="filter-actions">
//           <button
//             className={`filter-toggle ${showFilters ? 'active' : ''}`}
//             onClick={() => setShowFilters(!showFilters)}
//           >
//             <Filter size={16} />
//             فیلترها
//             {hasActiveFilters && <span className="badge-filter">•</span>}
//           </button>
//           {hasActiveFilters && (
//             <button className="clear-filters" onClick={clearFilters}>
//               <X size={14} />
//               پاک کردن
//             </button>
//           )}
//         </div>
//       </div>

//       {/* Filter Panel */}
//       {showFilters && (
//         <FilterPanel
//           fields={filterFields}
//           values={filters}
//           onChange={handleFilterChange}
//         />
//       )}

//       {/* Data Table */}
//       <DataTable
//         data={committees}
//         columns={columns}
//         rowKey="id"
//         loading={isLoading}
//         emptyMessage={hasActiveFilters ? 'با فیلترهای انتخاب شده موردی پیدا نشد' : 'هنوز جلسه‌ای ثبت نشده است'}
//       />

//       {/* Pagination */}
//       <Pagination
//         totalItems={totalCount}
//         pageSize={pageSize}
//         currentPage={currentPage}
//         onPageChange={setCurrentPage}
//         onPageSizeChange={(size) => {
//           setPageSize(size);
//           setCurrentPage(1);
//         }}
//       />

//       <style>{`
//         .steering-committee-list {
//           background: white;
//           border-radius: 12px;
//           padding: 20px;
//           box-shadow: 0 1px 3px rgba(0,0,0,0.06);
//         }

//         .list-header {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           margin-bottom: 20px;
//         }

//         .header-title {
//           display: flex;
//           align-items: center;
//           gap: 12px;
//         }

//         .header-title h2 {
//           margin: 0;
//           font-size: 20px;
//           font-weight: 600;
//         }

//         .header-title .badge {
//           background: #d1fae5;
//           color: #059669;
//           padding: 2px 10px;
//           border-radius: 12px;
//           font-size: 12px;
//           font-weight: 600;
//         }

//         .btn-primary {
//           display: inline-flex;
//           align-items: center;
//           gap: 8px;
//           padding: 8px 20px;
//           background: #059669;
//           color: white;
//           border: none;
//           border-radius: 8px;
//           font-weight: 500;
//           cursor: pointer;
//           transition: all 0.2s;
//         }

//         .btn-primary:hover {
//           background: #047857;
//           transform: translateY(-1px);
//           box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
//         }

//         .search-section {
//           display: flex;
//           gap: 12px;
//           margin-bottom: 16px;
//           flex-wrap: wrap;
//         }

//         .search-input-wrapper {
//           flex: 1;
//           position: relative;
//           min-width: 200px;
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
//           border-color: #059669;
//           outline: none;
//           box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
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
//           z-index: 2;
//         }

//         .clear-btn:hover {
//           color: #ef4444;
//         }

//         .filter-actions {
//           display: flex;
//           gap: 8px;
//           flex-shrink: 0;
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
//           border-color: #059669;
//           color: #059669;
//         }

//         .filter-toggle.active {
//           border-color: #059669;
//           background: #d1fae5;
//           color: #059669;
//         }

//         .badge-filter {
//           color: #059669;
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

//         .session-cell {
//           display: flex;
//           align-items: center;
//         }

//         .session-badge {
//           background: #d1fae5;
//           color: #059669;
//           padding: 2px 10px;
//           border-radius: 12px;
//           font-size: 12px;
//           font-weight: 600;
//           display: inline-block;
//         }

//         .date-cell {
//           display: flex;
//           align-items: center;
//           gap: 6px;
//           direction: rtl;
//           justify-content: flex-start;
//           font-size: 13px;
//           color: #6b7280;
//         }

//         .research-cell {
//           display: flex;
//           flex-direction: column;
//           gap: 2px;
//         }

//         .research-code {
//           font-size: 11px;
//           font-weight: 600;
//           color: #059669;
//         }

//         .research-title {
//           font-size: 13px;
//           color: #1a1a2e;
//         }

//         .description-cell {
//           max-width: 200px;
//         }

//         .description-text {
//           font-size: 13px;
//           color: #374151;
//           display: -webkit-box;
//           -webkit-line-clamp: 2;
//           -webkit-box-orient: vertical;
//           overflow: hidden;
//         }

//         .approvements-cell {
//           display: flex;
//           align-items: center;
//           gap: 6px;
//         }

//         .approvements-count {
//           font-size: 16px;
//           font-weight: 700;
//           color: #059669;
//         }

//         .approvements-label {
//           font-size: 11px;
//           color: #6b7280;
//         }

//         .attachments-cell {
//           display: flex;
//           align-items: center;
//           gap: 4px;
//         }

//         .file-link {
//           display: inline-flex;
//           align-items: center;
//           justify-content: center;
//           width: 28px;
//           height: 28px;
//           border-radius: 4px;
//           color: #059669;
//           background: #d1fae5;
//           transition: all 0.2s;
//           text-decoration: none;
//         }

//         .file-link:hover {
//           background: #a7f3d0;
//           color: #047857;
//         }

//         .text-muted {
//           color: #9ca3af;
//         }

//         .actions {
//           display: flex;
//           gap: 4px;
//           flex-wrap: wrap;
//         }

//         .action-btn {
//           width: 32px;
//           height: 32px;
//           border: none;
//           border-radius: 6px;
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
//           background: #d1fae5;
//           color: #059669;
//         }

//         .action-btn.delete:hover {
//           background: #fee2e2;
//           color: #dc2626;
//         }

//         .action-btn:disabled {
//           opacity: 0.5;
//           cursor: not-allowed;
//         }

//         @media (max-width: 768px) {
//           .steering-committee-list {
//             padding: 12px;
//           }

//           .search-section {
//             flex-direction: column;
//           }

//           .search-input-wrapper {
//             flex: 1;
//             min-width: 100%;
//           }

//           .filter-actions {
//             width: 100%;
//           }

//           .filter-actions button {
//             flex: 1;
//             justify-content: center;
//           }

//           .actions {
//             flex-direction: column;
//             gap: 2px;
//           }
//         }
//       `}</style>
//     </div>
//   );
// };

// export default SteeringCommitteeList;
