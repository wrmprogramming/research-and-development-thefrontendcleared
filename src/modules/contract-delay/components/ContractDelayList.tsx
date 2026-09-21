// src/modules/contract-delay/components/ContractDelayList.tsx

import React, { useState } from 'react';
import { useContractDelay } from '../hooks/useContractDelay';
import type { ContractDelay, ContractDelayFilters } from '../types/contractDelay.types';
import { toPersianNumber } from '../../../utils/formatter.utils';
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  Filter,
  X,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  FileText,
  Building2,
  Paperclip,
} from 'lucide-react';

import {
  Pagination,
  SearchBar,
  FilterPanel,
  DataTable,
  type Column,
  type FilterField,
} from '../../../components/common';

import { ContractSelect } from '../../contract/components/ContractSelect';
import JalaliDatePicker from '../../../components/JalaliDatePicker';

interface ContractDelayListProps {
  contractId?: number;
  onEdit?: (item: ContractDelay) => void;
  onDelete?: (id: number) => void;
  onView?: (item: ContractDelay) => void;
  onAdd?: () => void;
  readOnly?: boolean;
}

export const ContractDelayList: React.FC<ContractDelayListProps> = ({
  contractId,
  onEdit,
  onDelete,
  onView,
  onAdd,
  readOnly = false,
}) => {
  const { useList, delete: deleteDelay, isDeleting } = useContractDelay();

  // ========== State ==========
  const [filters, setFilters] = useState<ContractDelayFilters>(
    contractId ? { contract: contractId } : {}
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState<string>('delay_end_date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // ========== Query ==========
  const { data, isLoading, refetch } = useList({
    ...filters,
    search: searchTerm || undefined,
    page: currentPage,
    page_size: pageSize,
    ordering: sortOrder === 'desc' ? `-${sortField}` : sortField,
  });

  const delays = data?.results || [];
  const totalCount = data?.count || 0;

  // ========== Handlers ==========
  const handleDelete = async (id: number) => {
    if (window.confirm('آیا از حذف این تمدید مطمئن هستید؟')) {
      if (onDelete) onDelete(id);
      else {
        await deleteDelay(id);
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

    if (key === 'is_allowed') {
      if (value === 'true') finalValue = true;
      else if (value === 'false') finalValue = false;
      else finalValue = undefined;
    }

    if ((key === 'min_days' || key === 'max_days') && value !== '' && value !== null && value !== undefined) {
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

  // ========== Columns ==========
  const columns: Column<ContractDelay>[] = [
    {
      key: 'is_allowed',
      title: 'وضعیت',
      render: (item) =>
        item.is_allowed ? (
          <span className="badge-allowed">
            <CheckCircle size={12} />
            مجاز
          </span>
        ) : (
          <span className="badge-not-allowed">
            <AlertCircle size={12} />
            غیرمجاز
          </span>
        ),
    },
    {
      key: 'delay_days',
      title: 'میزان تاخیر',
      sortable: true,
      render: (item) => (
        <div className="days-cell">
          <Clock size={14} />
          {toPersianNumber(item.delay_days)} روز
        </div>
      ),
    },
    {
      key: 'delay_end_date',
      title: 'تاریخ پایان مهلت',
      sortable: true,
      render: (item) => (
        <div className="date-cell">
          <Calendar size={14} />
          {item.delay_end_date ? toPersianNumber(item.delay_end_date) : '—'}
        </div>
      ),
    },
    {
      key: 'contract_number',
      title: 'قرارداد',
      render: (item) => (
        <div className="contract-cell">
          <Building2 size={14} />
          <div className="contract-info">
            <span className="contract-number">{item.contract_number || '—'}</span>
            {item.contract_subject && (
              <span className="contract-subject">{item.contract_subject}</span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'reason',
      title: 'دلیل',
      render: (item) => (
        <div className="reason-cell" title={item.reason || ''}>
          {item.reason ? (
            <span className="reason-text">
              <FileText size={12} />
              {item.reason.length > 40 ? `${item.reason.substring(0, 40)}...` : item.reason}
            </span>
          ) : (
            <span className="text-muted">—</span>
          )}
        </div>
      ),
    },
    {
      key: 'attachments',
      title: 'فایل‌ها',
      render: (item) =>
        item.attachments && item.attachments.length > 0 ? (
          <div className="attachments-cell">
            <span className="attachment-count">
              {toPersianNumber(item.attachments.length)} فایل
            </span>
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
                <span className="more-files">
                  +{toPersianNumber(item.attachments.length - 3)}
                </span>
              )}
            </div>
          </div>
        ) : (
          <span className="text-muted">—</span>
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
            onClick={() => onView?.(item)}
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
    // قرارداد (فقط اگر standalone)
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
      key: 'is_allowed',
      label: 'وضعیت مجاز',
      type: 'select',
      options: [
        { value: 'true', label: 'مجاز' },
        { value: 'false', label: 'غیرمجاز' },
      ],
    },
    {
      key: 'min_days',
      label: 'حداقل روز',
      type: 'number',
      placeholder: 'از 0',
    },
    {
      key: 'max_days',
      label: 'حداکثر روز',
      type: 'number',
      placeholder: 'تا 365',
    },
    {
      key: 'date_group',
      label: '',
      type: 'fieldset',
      fieldsetTitle: '📅 بازه تاریخ پایان مهلت',
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
    <div className="contract-delay-list">
      {/* Header */}
      <div className="list-header">
        <div className="header-title">
          <Clock size={22} />
          <h3>تمدیدهای قرارداد</h3>
          <span className="badge">{toPersianNumber(totalCount)}</span>
        </div>
        {!readOnly && onAdd && (
          <button className="btn-primary" onClick={onAdd}>
            <Plus size={18} />
            ثبت تمدید جدید
          </button>
        )}
      </div>

      {/* Search & Filters */}
      <div className="search-section">
        <SearchBar
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="جستجو در شماره قرارداد، موضوع و دلیل..."
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
        data={delays}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        emptyMessage={
          hasActiveFilters
            ? 'با فیلترهای انتخاب شده موردی پیدا نشد'
            : 'هیچ تمدیدی ثبت نشده است'
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
        .contract-delay-list { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
        .list-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .header-title { display: flex; align-items: center; gap: 12px; }
        .header-title h3 { margin: 0; font-size: 20px; font-weight: 600; }
        .badge { background: #eef2ff; color: #4f46e5; padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; }
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
        .badge-allowed { display: inline-flex; align-items: center; gap: 4px; padding: 2px 10px; border-radius: 12px; background: #d1fae5; color: #059669; font-size: 12px; font-weight: 500; }
        .badge-not-allowed { display: inline-flex; align-items: center; gap: 4px; padding: 2px 10px; border-radius: 12px; background: #fee2e2; color: #dc2626; font-size: 12px; font-weight: 500; }
        .days-cell, .date-cell { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #374151; }
        .contract-cell { display: flex; align-items: flex-start; gap: 6px; }
        .contract-info { display: flex; flex-direction: column; gap: 2px; }
        .contract-number { font-family: monospace; font-size: 12px; color: #4f46e5; font-weight: 600; }
        .contract-subject { font-size: 12px; color: #6b7280; max-width: 150px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .reason-cell { font-size: 12px; color: #374151; }
        .reason-text { display: inline-flex; align-items: center; gap: 4px; }
        .attachments-cell { display: flex; align-items: center; gap: 6px; }
        .attachment-count { font-size: 12px; color: #6b7280; }
        .attachment-icons { display: flex; align-items: center; gap: 4px; }
        .attachment-link { display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 4px; color: #4f46e5; background: #eef2ff; transition: all 0.2s; text-decoration: none; }
        .attachment-link:hover { background: #dbeafe; color: #4338ca; }
        .more-files { font-size: 11px; color: #6b7280; background: #f3f4f6; padding: 0 6px; border-radius: 10px; }
        .text-muted { color: #9ca3af; }
        .actions { display: flex; gap: 4px; }
        .action-btn { width: 32px; height: 32px; border: none; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; background: transparent; color: #6b7280; }
        .action-btn:hover { background: #f3f4f6; }
        .action-btn.view:hover { background: #d1fae5; color: #059669; }
        .action-btn.edit:hover { background: #eef2ff; color: #4f46e5; }
        .action-btn.delete:hover { background: #fee2e2; color: #dc2626; }
        .action-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        @media (max-width: 768px) {
          .contract-delay-list { padding: 12px; }
          .search-section { flex-direction: column; }
          .filter-actions { width: 100%; }
          .filter-actions button { flex: 1; justify-content: center; }
          .actions { flex-direction: column; gap: 2px; }
        }
      `}</style>
    </div>
  );
};

export default ContractDelayList;
// import React, { useState, useEffect } from 'react';
// import { useContractDelay } from '../hooks/useContractDelay';
// import type { ContractDelay } from '../types/contractDelay.types';
// import dateUtils from '@utils/dateUtils';
// import {
//   Plus,
//   Pencil,
//   Trash2,
//   Eye,
//   X,
//   Calendar,
//   Clock,
//   AlertCircle,
//   CheckCircle,
//   FileText,
//   Building2,
//   Search,
// } from 'lucide-react';

// interface ContractDelayListProps {
//   contractId?: number;
//   onEdit?: (item: ContractDelay) => void;
//   onDelete?: (id: number) => void;
//   onView?: (item: ContractDelay) => void;
//   onAdd?: () => void;
//   readOnly?: boolean;
// }

// export const ContractDelayList: React.FC<ContractDelayListProps> = ({
//   contractId,
//   onEdit,
//   onDelete,
//   onView,
//   onAdd,
//   readOnly = false,
// }) => {
//   const { useByContract, useList, delete: deleteDelay, isDeleting } = useContractDelay();
//   const [searchTerm, setSearchTerm] = useState('');
//   const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

//   // ========== Debounce ==========
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setDebouncedSearchTerm(searchTerm);
//     }, 500);
//     return () => clearTimeout(timer);
//   }, [searchTerm]);

//   const { data: delays = [], isLoading, refetch } = contractId
//     ? useByContract(contractId)
//     : useList({ search: debouncedSearchTerm || undefined });

//   const handleDelete = async (id: number) => {
//     if (window.confirm('آیا از حذف این تمدید مطمئن هستید؟')) {
//       await deleteDelay(id);
//       refetch();
//     }
//   };

//   // ========== فیلتر بر اساس جستجو ==========
//   const filteredDelays = delays.filter((delay) => {
//     const search = debouncedSearchTerm.toLowerCase().trim();
//     if (!search) return true;
//     return (
//       delay.contract_number?.toLowerCase().includes(search) ||
//       delay.reason?.toLowerCase().includes(search) ||
//       delay.contract_subject?.toLowerCase().includes(search)
//     );
//   });

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
//     <div className="contract-delay-list">
//       <div className="list-header">
//         <div className="header-title">
//           <Clock size={20} />
//           <h3>تمدید قرارداد</h3>
//           <span className="badge">{delays.length}</span>
//         </div>
//         <div className="header-actions">
//           {!contractId && (
//             <div className="search-input-wrapper">
//               <Search size={16} className="search-icon" />
//               <input
//                 type="text"
//                 placeholder="جستجو در شماره قرارداد یا دلیل..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="search-input"
//               />
//               {searchTerm && (
//                 <button className="clear-btn" onClick={() => setSearchTerm('')}>
//                   <X size={14} />
//                 </button>
//               )}
//             </div>
//           )}
//           {!readOnly && onAdd && (
//             <button className="btn-add" onClick={onAdd}>
//               <Plus size={16} />
//               ثبت تمدید جدید
//             </button>
//           )}
//         </div>
//       </div>

//       {delays.length === 0 ? (
//         <div className="empty-state">
//           <Clock size={40} />
//           <p>هیچ تمدیدی ثبت نشده است</p>
//           {!readOnly && onAdd && (
//             <button className="btn-add-primary" onClick={onAdd}>
//               <Plus size={16} />
//               ثبت اولین تمدید
//             </button>
//           )}
//         </div>
//       ) : (
//         <div className="delays-list">
//           {filteredDelays.map((delay) => (
//             <div key={delay.id} className="delay-item">
//               <div className="delay-item-header">
//                 <div className="delay-item-left">
//                   <div className="delay-badge">
//                     {delay.is_allowed ? (
//                       <span className="badge-allowed">
//                         <CheckCircle size={14} />
//                         مجاز
//                       </span>
//                     ) : (
//                       <span className="badge-not-allowed">
//                         <AlertCircle size={14} />
//                         غیرمجاز
//                       </span>
//                     )}
//                   </div>
//                   <span className="delay-days">
//                     <Clock size={14} />
//                     {delay.delay_days} روز
//                   </span>
//                   <span className="delay-date">
//                     <Calendar size={14} />
//                     {delay.delay_end_date}
//                   </span>
//                 </div>
//                 <div className="delay-item-actions">
//                   <button
//                     className="action-btn view"
//                     onClick={() => onView?.(delay)}
//                     title="مشاهده"
//                   >
//                     <Eye size={14} />
//                   </button>
//                   {!readOnly && (
//                     <>
//                       <button
//                         className="action-btn edit"
//                         onClick={() => onEdit?.(delay)}
//                         title="ویرایش"
//                       >
//                         <Pencil size={14} />
//                       </button>
//                       <button
//                         className="action-btn delete"
//                         onClick={() => handleDelete(delay.id)}
//                         disabled={isDeleting}
//                         title="حذف"
//                       >
//                         <Trash2 size={14} />
//                       </button>
//                     </>
//                   )}
//                 </div>
//               </div>

//               {delay.reason && (
//                 <div className="delay-reason">
//                   <FileText size={14} />
//                   <p>{delay.reason}</p>
//                 </div>
//               )}

//               {!contractId && delay.contract_number && (
//                 <div className="delay-contract">
//                   <Building2 size={14} />
//                   <span>{delay.contract_number}</span>
//                   {delay.contract_subject && (
//                     <span className="contract-subject">- {delay.contract_subject}</span>
//                   )}
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>
//       )}

//       <style>{`
//         .contract-delay-list {
//           background: white;
//           border-radius: 12px;
//           border: 1px solid #e9ecef;
//           overflow: hidden;
//           padding: 16px;
//         }

//         .list-header {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           margin-bottom: 16px;
//           flex-wrap: wrap;
//           gap: 12px;
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

//         .header-actions {
//           display: flex;
//           align-items: center;
//           gap: 12px;
//           flex-wrap: wrap;
//         }

//         .search-input-wrapper {
//           position: relative;
//           width: 250px;
//         }

//         .search-input {
//           width: 100%;
//           padding: 6px 36px 6px 12px;
//           border: 1.5px solid #e9ecef;
//           border-radius: 6px;
//           font-size: 13px;
//           transition: all 0.2s;
//         }

//         .search-input:focus {
//           border-color: #4f46e5;
//           outline: none;
//           box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
//         }

//         .search-icon {
//           position: absolute;
//           right: 10px;
//           top: 50%;
//           transform: translateY(-50%);
//           color: #9ca3af;
//         }

//         .clear-btn {
//           position: absolute;
//           left: 8px;
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
//           white-space: nowrap;
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

//         .empty-state {
//           text-align: center;
//           padding: 30px 20px;
//           color: #6b7280;
//         }

//         .empty-state p {
//           margin: 8px 0;
//         }

//         .delays-list {
//           display: flex;
//           flex-direction: column;
//           gap: 10px;
//           max-height: 400px;
//           overflow-y: auto;
//         }

//         .delays-list::-webkit-scrollbar {
//           width: 4px;
//         }

//         .delays-list::-webkit-scrollbar-track {
//           background: #f1f1f1;
//           border-radius: 4px;
//         }

//         .delays-list::-webkit-scrollbar-thumb {
//           background: #c1c7cd;
//           border-radius: 4px;
//         }

//         .delay-item {
//           padding: 12px 16px;
//           background: #f8fafc;
//           border-radius: 8px;
//           border: 1px solid #e9ecef;
//           transition: all 0.2s;
//         }

//         .delay-item:hover {
//           border-color: #d1d5db;
//         }

//         .delay-item-header {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           flex-wrap: wrap;
//           gap: 8px;
//         }

//         .delay-item-left {
//           display: flex;
//           align-items: center;
//           gap: 12px;
//           flex-wrap: wrap;
//         }

//         .delay-badge {
//           display: flex;
//           align-items: center;
//         }

//         .badge-allowed {
//           display: inline-flex;
//           align-items: center;
//           gap: 4px;
//           padding: 2px 12px;
//           border-radius: 12px;
//           font-size: 12px;
//           font-weight: 500;
//           background: #d1fae5;
//           color: #059669;
//         }

//         .badge-not-allowed {
//           display: inline-flex;
//           align-items: center;
//           gap: 4px;
//           padding: 2px 12px;
//           border-radius: 12px;
//           font-size: 12px;
//           font-weight: 500;
//           background: #fee2e2;
//           color: #dc2626;
//         }

//         .delay-days {
//           display: flex;
//           align-items: center;
//           gap: 4px;
//           font-weight: 600;
//           font-size: 14px;
//           color: #1a1a2e;
//         }

//         .delay-date {
//           display: flex;
//           align-items: center;
//           gap: 4px;
//           font-size: 13px;
//           color: #6b7280;
//         }

//         .delay-item-actions {
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

//         .delay-reason {
//           display: flex;
//           align-items: flex-start;
//           gap: 6px;
//           margin-top: 6px;
//           font-size: 13px;
//           color: #374151;
//         }

//         .delay-reason p {
//           margin: 0;
//           line-height: 1.5;
//         }

//         .delay-contract {
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

//         @media (max-width: 768px) {
//           .contract-delay-list {
//             padding: 12px;
//           }

//           .list-header {
//             flex-direction: column;
//             align-items: stretch;
//           }

//           .header-actions {
//             flex-direction: column;
//             width: 100%;
//           }

//           .search-input-wrapper {
//             width: 100%;
//           }

//           .btn-add {
//             width: 100%;
//             justify-content: center;
//           }

//           .delay-item-header {
//             flex-direction: column;
//             align-items: stretch;
//           }

//           .delay-item-left {
//             flex-wrap: wrap;
//           }

//           .delay-item-actions {
//             justify-content: flex-end;
//           }
//         }
//       `}</style>
//     </div>
//   );
// };

// export default ContractDelayList;