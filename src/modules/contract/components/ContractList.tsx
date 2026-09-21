// src/modules/contract/components/ContractList.tsx

import React, { useState } from 'react';
import { useContract } from '../hooks/useContract';
import { CONTRACT_STATUSES, type Contract, type ContractFilters } from '../types/contract.types';
import { formatCurrency, toPersianNumber } from '../../../utils/formatter.utils';

import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  Filter,
  X,
  FileText,
  DollarSign,
  Building2,
  GraduationCap,
  Paperclip,
  Calendar,
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

// ✅ برای فیلترهای سفارشی
import { CompanySelect } from '../../company/components/CompanySelect';
import { UniversitySelect } from '../../university/components/UniversitySelect';
import JalaliDatePicker from '../../../components/JalaliDatePicker';

interface ContractListProps {
  onEdit?: (item: Contract) => void;
  onDelete?: (id: number) => void;
  onView?: (item: Contract) => void;
  onAdd?: () => void;
  onPayments?: (item: Contract) => void;
}

export const ContractList: React.FC<ContractListProps> = ({
  onEdit,
  onDelete,
  onView,
  onAdd,
  onPayments,
}) => {
  const { useList, delete: deleteContract, isDeleting } = useContract();

  // ========== State ==========
  // ✅ فقط یک state برای همه فیلترها
  const [filters, setFilters] = useState<ContractFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [contractorSearch, setContractorSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // ========== Query ==========
  const { data, isLoading, refetch } = useList({
    ...filters,
    search: searchTerm || undefined,
    contractor: contractorSearch || undefined,
    page: currentPage,
    page_size: pageSize,
    ordering: sortOrder === 'desc' ? `-${sortField}` : sortField,
  });

  const contracts = data?.results || [];
  const totalCount = data?.count || 0;

  // ========== Handlers ==========
  const handleDelete = async (id: number) => {
    if (window.confirm('آیا از حذف این قرارداد مطمئن هستید؟')) {
      if (onDelete) {
        onDelete(id);
      } else {
        await deleteContract(id);
        refetch();
      }
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleContractorSearchChange = (value: string) => {
    setContractorSearch(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (key: string, value: any) => {
    let finalValue = value;

    if (key === 'year' && value) {
      const numValue = Number(value);
      finalValue = !isNaN(numValue) && numValue > 0 ? numValue : undefined;
    }

    if (key === 'is_archived') {
      if (value === 'active') finalValue = false;
      else if (value === 'archived') finalValue = true;
      else finalValue = undefined;
    }

    // ✅ اعداد
    const numericKeys = [
      'total_amount_min', 'total_amount_max',
      'financial_progress_min', 'financial_progress_max',
      'physical_progress_min', 'physical_progress_max',
    ];
    if (numericKeys.includes(key) && value !== undefined && value !== null && value !== '') {
      const numValue = Number(value);
      finalValue = !isNaN(numValue) ? numValue : undefined;
    }

    setFilters((prev) => ({
      ...prev,
      [key]: finalValue === '' || finalValue === undefined ? undefined : finalValue,
    }));

    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
    setContractorSearch('');
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchTerm ||
    contractorSearch ||
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

  // ========== ستون‌های جدول ==========
  const columns: Column<Contract>[] = [
    {
      key: 'contract_number',
      title: 'شماره / موضوع',
      sortable: true,
      render: (item) => (
        <div className="code-title">
          <span className="code-badge">{item.contract_number}</span>
          <span className="title">{item.subject}</span>
        </div>
      ),
    },
    {
      key: 'contractor',
      title: 'طرف قرارداد',
      render: (item) => (
        <div className="contractor-cell">
          <div className="affiliation-icon">
            {item.affiliation_type === 'UNIVERSITY' ? (
              <GraduationCap size={14} />
            ) : (
              <Building2 size={14} />
            )}
          </div>
          {item.contractor || '—'}
        </div>
      ),
    },
    {
      key: 'total_amount',
      title: 'مبلغ کل',
      sortable: true,
      render: (item) => (
        <div className="budget-cell">
          <DollarSign size={14} />
          {item.total_amount ? formatCurrency(item.total_amount) : '—'}
        </div>
      ),
    },
    {
      key: 'financial_progress',
      title: 'پیشرفت مالی',
      sortable: true,
      render: (item) => {
        const progress = Number(item.financial_progress) || 0;
        return (
          <div className="progress-cell">
            <span className="progress-value">{toPersianNumber(progress.toFixed(1))}%</span>
            <div className="progress-mini">
              <div
                className="progress-fill-mini financial"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      key: 'physical_progress',
      title: 'پیشرفت فیزیکی',
      sortable: true,
      render: (item) => {
        const progress = Number(item.physical_progress) || 0;
        return (
          <div className="progress-cell">
            <span className="progress-value">{toPersianNumber(progress.toFixed(1))}%</span>
            <div className="progress-mini">
              <div
                className="progress-fill-mini physical"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      key: 'status',
      title: 'وضعیت',
      render: (item) => (
        <StatusBadge status={item.status} config={CONTRACT_STATUSES} />
      ),
    },
    {
      key: 'end_date',
      title: 'تاریخ اتمام',
      sortable: true,
      render: (item) => (
        <div className="date-cell">
          <Calendar size={14} />
          {item.end_date ? toPersianNumber(item.end_date) : '—'}
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
      width: 140,
      render: (item) => (
        <div className="actions">
          <button
            className="action-btn view"
            onClick={() => onView?.(item)}
            title="مشاهده"
          >
            <Eye size={16} />
          </button>
          <button
            className="action-btn edit"
            onClick={() => onEdit?.(item)}
            title="ویرایش"
          >
            <Pencil size={16} />
          </button>
          {onPayments && (
            <button
              className="action-btn payment"
              onClick={() => onPayments?.(item)}
              title="پرداخت‌ها"
            >
              <DollarSign size={16} />
            </button>
          )}
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

  // ========== فیلدهای فیلتر ==========
  const filterFields: FilterField[] = [
    // ========== فیلترهای پایه ==========
    {
      key: 'status',
      label: 'وضعیت',
      type: 'select',
      options: Object.entries(CONTRACT_STATUSES).map(([key, { label }]) => ({
        value: key,
        label,
      })),
    },
    {
      key: 'year',
      label: 'سال',
      type: 'number',
      placeholder: 'مثال: 1405',
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
    {
      key: 'is_archived',
      label: 'بایگانی',
      type: 'select',
      options: [
        { value: 'active', label: 'غیربایگانی' },
        { value: 'archived', label: 'بایگانی شده' },
      ],
    },
    {
      key: 'company',
      label: 'شرکت',
      type: 'custom',
      customComponent: (
        <CompanySelect
          value={filters.company ?? null}
          onChange={(id) => handleFilterChange('company', id)}
          placeholder="انتخاب شرکت..."
        />
      ),
    },
    {
      key: 'university',
      label: 'دانشگاه',
      type: 'custom',
      customComponent: (
        <UniversitySelect
          value={filters.university ?? null}
          onChange={(id) => handleFilterChange('university', id)}
          placeholder="انتخاب دانشگاه..."
        />
      ),
    },

    // ========== بازه مبلغ ==========
    {
      key: 'total_amount_min',
      label: 'مبلغ از (ریال)',
      type: 'number',
      placeholder: 'حداقل مبلغ',
    },
    {
      key: 'total_amount_max',
      label: 'مبلغ تا (ریال)',
      type: 'number',
      placeholder: 'حداکثر مبلغ',
    },

    // ========== بازه پیشرفت مالی ==========
    {
      key: 'financial_progress_min',
      label: 'پیشرفت مالی از (%)',
      type: 'number',
      placeholder: 'حداقل %',
    },
    {
      key: 'financial_progress_max',
      label: 'پیشرفت مالی تا (%)',
      type: 'number',
      placeholder: 'حداکثر %',
    },

    // ========== بازه پیشرفت فیزیکی ==========
    {
      key: 'physical_progress_min',
      label: 'پیشرفت فیزیکی از (%)',
      type: 'number',
      placeholder: 'حداقل %',
    },
    {
      key: 'physical_progress_max',
      label: 'پیشرفت فیزیکی تا (%)',
      type: 'number',
      placeholder: 'حداکثر %',
    },

    // ========== بازه تاریخ قرارداد ==========
    {
      key: 'date_group',
      label: '',
      type: 'fieldset',
      fieldsetTitle: '📅 تاریخ قرارداد',
      fieldsetFields: [
        {
          key: 'date_from',
          label: 'از تاریخ',
          type: 'custom',
          customComponent: (
            <JalaliDatePicker
              value={(filters.date_from as string) || null}
              onChange={(date) => handleFilterChange('date_from', date)}
              placeholder="1405/01/01"
              label=""
            />
          ),
        },
        {
          key: 'date_to',
          label: 'تا تاریخ',
          type: 'custom',
          customComponent: (
            <JalaliDatePicker
              value={(filters.date_to as string) || null}
              onChange={(date) => handleFilterChange('date_to', date)}
              placeholder="1405/12/29"
              label=""
            />
          ),
        },
      ],
    },

    // ========== بازه تاریخ شروع ==========
    {
      key: 'start_date_group',
      label: '',
      type: 'fieldset',
      fieldsetTitle: '📅 تاریخ شروع',
      fieldsetFields: [
        {
          key: 'start_date_from',
          label: 'از تاریخ',
          type: 'custom',
          customComponent: (
            <JalaliDatePicker
              value={(filters.start_date_from as string) || null}
              onChange={(date) => handleFilterChange('start_date_from', date)}
              placeholder="1405/01/01"
              label=""
            />
          ),
        },
        {
          key: 'start_date_to',
          label: 'تا تاریخ',
          type: 'custom',
          customComponent: (
            <JalaliDatePicker
              value={(filters.start_date_to as string) || null}
              onChange={(date) => handleFilterChange('start_date_to', date)}
              placeholder="1405/12/29"
              label=""
            />
          ),
        },
      ],
    },

    // ========== بازه تاریخ پایان ==========
    {
      key: 'end_date_group',
      label: '',
      type: 'fieldset',
      fieldsetTitle: '📅 تاریخ پایان',
      fieldsetFields: [
        {
          key: 'end_date_from',
          label: 'از تاریخ',
          type: 'custom',
          customComponent: (
            <JalaliDatePicker
              value={(filters.end_date_from as string) || null}
              onChange={(date) => handleFilterChange('end_date_from', date)}
              placeholder="1405/01/01"
              label=""
            />
          ),
        },
        {
          key: 'end_date_to',
          label: 'تا تاریخ',
          type: 'custom',
          customComponent: (
            <JalaliDatePicker
              value={(filters.end_date_to as string) || null}
              onChange={(date) => handleFilterChange('end_date_to', date)}
              placeholder="1405/12/29"
              label=""
            />
          ),
        },
      ],
    },
  ];

  return (
    <div className="contract-list">
      {/* Header */}
      <div className="contract-list-header">
        <div className="header-title">
          <FileText size={24} />
          <h2>قراردادها</h2>
          <span className="badge">{toPersianNumber(totalCount)}</span>
        </div>
        {onAdd && (
          <button className="btn-primary" onClick={onAdd}>
            <Plus size={18} />
            افزودن قرارداد
          </button>
        )}
      </div>

      {/* Search & Filters */}
      <div className="search-section">
        <SearchBar
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="جستجو در شماره، موضوع، تعهدات، شرح خدمات..."
        />

        <div className="contractor-search-wrapper">
          <SearchBar
            value={contractorSearch}
            onChange={handleContractorSearchChange}
            placeholder="جستجوی طرف قرارداد..."
          />
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
        data={contracts}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        emptyMessage={
          hasActiveFilters
            ? 'با فیلترهای انتخاب شده موردی پیدا نشد'
            : 'هنوز قراردادی ثبت نشده است'
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
        .contract-list { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
        .contract-list-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .header-title { display: flex; align-items: center; gap: 12px; }
        .header-title h2 { margin: 0; font-size: 20px; font-weight: 600; }
        .header-title .badge { background: #eef2ff; color: #4f46e5; padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; }
        .btn-primary { display: inline-flex; align-items: center; gap: 8px; padding: 8px 20px; background: #4f46e5; color: white; border: none; border-radius: 8px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
        .btn-primary:hover { background: #4338ca; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3); }
        .search-section { display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
        .contractor-search-wrapper { flex: 1; min-width: 180px; }
        .filter-actions { display: flex; gap: 8px; flex-shrink: 0; }
        .filter-toggle { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border: 1.5px solid #e9ecef; border-radius: 8px; background: white; color: #6b7280; font-size: 14px; cursor: pointer; transition: all 0.2s; }
        .filter-toggle:hover { border-color: #4f46e5; color: #4f46e5; }
        .filter-toggle.active { border-color: #4f46e5; background: #eef2ff; color: #4f46e5; }
        .badge-filter { color: #4f46e5; font-size: 18px; }
        .clear-filters { display: inline-flex; align-items: center; gap: 4px; padding: 8px 12px; border: none; background: #fee2e2; color: #dc2626; border-radius: 8px; font-size: 13px; cursor: pointer; transition: all 0.2s; }
        .clear-filters:hover { background: #fecaca; }
        .code-title { display: flex; flex-direction: column; gap: 4px; }
        .code-badge { background: #eef2ff; color: #4f46e5; padding: 2px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; display: inline-block; width: fit-content; }
        .title { font-weight: 500; font-size: 14px; color: #1a1a2e; }
        .contractor-cell { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #374151; }
        .affiliation-icon { display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 4px; background: #f3f4f6; color: #6b7280; }
        .budget-cell { display: flex; align-items: center; gap: 4px; font-weight: 500; }
        .progress-cell { display: flex; flex-direction: column; gap: 4px; }
        .progress-value { font-size: 13px; font-weight: 600; color: #1a1a2e; }
        .progress-mini { width: 60px; height: 4px; background: #e9ecef; border-radius: 2px; overflow: hidden; }
        .progress-fill-mini { height: 100%; border-radius: 2px; transition: width 0.3s ease; }
        .progress-fill-mini.financial { background: linear-gradient(90deg, #059669, #10b981); }
        .progress-fill-mini.physical { background: linear-gradient(90deg, #4f46e5, #7c3aed); }
        .date-cell { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #6b7280; }
        .attachments-cell { display: flex; align-items: center; gap: 6px; }
        .attachment-count { font-size: 12px; color: #6b7280; }
        .attachment-icons { display: flex; align-items: center; gap: 4px; }
        .attachment-link { display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 4px; color: #4f46e5; background: #eef2ff; transition: all 0.2s; text-decoration: none; }
        .attachment-link:hover { background: #dbeafe; color: #4338ca; }
        .more-files { font-size: 11px; color: #6b7280; background: #f3f4f6; padding: 0 6px; border-radius: 10px; }
        .actions { display: flex; gap: 4px; flex-wrap: wrap; }
        .action-btn { width: 32px; height: 32px; border: none; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; background: transparent; color: #6b7280; }
        .action-btn:hover { background: #f3f4f6; }
        .action-btn.view:hover { background: #d1fae5; color: #059669; }
        .action-btn.edit:hover { background: #eef2ff; color: #4f46e5; }
        .action-btn.payment:hover { background: #fef3c7; color: #d97706; }
        .action-btn.delete:hover { background: #fee2e2; color: #dc2626; }
        .action-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .text-muted { color: #9ca3af; }
        @media (max-width: 768px) {
          .contract-list { padding: 12px; }
          .search-section { flex-direction: column; }
          .contractor-search-wrapper { min-width: 100%; }
          .filter-actions { width: 100%; }
          .filter-actions button { flex: 1; justify-content: center; }
          .actions { flex-direction: column; gap: 2px; }
        }
      `}</style>
    </div>
  );
};

export default ContractList;

// // src/modules/contract/components/ContractList.tsx

// import React, { useState, useEffect } from 'react';
// import { useContract } from '../hooks/useContract';
// import { CONTRACT_STATUSES, type Contract } from '../types/contract.types';
// import { formatCurrency } from '../../../utils/formatter.utils';
// import dateUtils from '@utils/dateUtils';
// import {
//   Search,
//   Plus,
//   Pencil,
//   Trash2,
//   Eye,
//   Filter,
//   X,
//   FileText,
//   DollarSign,
//   Building2,
//   GraduationCap,
//   Paperclip,
//   Calendar,
//   ChevronLeft,
//   ChevronRight,
// } from 'lucide-react';
// import {
//   Pagination,
//   SearchBar,
//   FilterPanel,
//   DataTable,
//   StatusBadge,
//   type Column,
//   type FilterField,
// } from '../../../components/common';

// interface ContractListProps {
//   onEdit?: (item: Contract) => void;
//   onDelete?: (id: number) => void;
//   onView?: (item: Contract) => void;
//   onAdd?: () => void;
//   onPayments?: (item: Contract) => void;
// }

// export const ContractList: React.FC<ContractListProps> = ({
//   onEdit,
//   onDelete,
//   onView,
//   onAdd,
//   onPayments,
// }) => {
//   const { useList, delete: deleteContract, isDeleting } = useContract();

//   // ========== State ==========
//   const [filters, setFilters] = useState<{
//     search?: string;
//     status?: string;
//     is_archived?: boolean;
//     affiliation_type?: string;
//     year?: number;
//     company?: number;      // ✅ اضافه شد
//     university?: number;   // ✅ اضافه شد
//     contractor?: string;   // ✅ اضافه شد
//   }>({});

//   const [searchTerm, setSearchTerm] = useState('');
//   const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
//   const [yearInput, setYearInput] = useState<string>('');
//   const [debouncedYear, setDebouncedYear] = useState<number | undefined>(undefined);
//   const [contractorSearch, setContractorSearch] = useState<string>('');  // ✅ اضافه شد
//   const [debouncedContractor, setDebouncedContractor] = useState<string | undefined>(undefined);
//   const [showFilters, setShowFilters] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [pageSize, setPageSize] = useState(10);
//   const [sortField, setSortField] = useState<string>('created_at');
//   const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

//   // ========== Debounce برای جستجو ==========
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setDebouncedSearchTerm(searchTerm);
//       setCurrentPage(1);
//     }, 500);
//     return () => clearTimeout(timer);
//   }, [searchTerm]);

//   // ✅ Debounce برای سال
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       const yearNum = yearInput ? Number(yearInput) : undefined;
//       setDebouncedYear(yearNum && !isNaN(yearNum) ? yearNum : undefined);
//       setCurrentPage(1);
//     }, 500);
//     return () => clearTimeout(timer);
//   }, [yearInput]);

//   // ✅ Debounce برای طرف قرارداد
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setDebouncedContractor(contractorSearch || undefined);
//       setCurrentPage(1);
//     }, 500);
//     return () => clearTimeout(timer);
//   }, [contractorSearch]);

//   // ========== دریافت داده‌ها ==========
//   const { data, isLoading, refetch } = useList({
//     ...filters,
//     search: debouncedSearchTerm || undefined,
//     year: debouncedYear,
//     contractor: debouncedContractor,  // ✅ اضافه شد
//     page: currentPage,
//     page_size: pageSize,
//     ordering: sortOrder === 'desc' ? `-${sortField}` : sortField,
//   });

//   const contracts = data?.results || [];
//   const totalCount = data?.count || 0;

//   // ========== Handlers ==========
//   const handleDelete = async (id: number) => {
//     if (window.confirm('آیا از حذف این قرارداد مطمئن هستید؟')) {
//       await deleteContract(id);
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
//     setYearInput('');
//     setDebouncedYear(undefined);
//     setContractorSearch('');
//     setDebouncedContractor(undefined);
//     setCurrentPage(1);
//   };

//   const hasActiveFilters = searchTerm || contractorSearch || yearInput || 
//     Object.values(filters).some(v => v !== undefined && v !== '' && v !== null);

//   // ========== ستون‌های جدول ==========
//   const columns: Column<Contract>[] = [
//     {
//       key: 'contract_number',
//       title: 'شماره / موضوع',
//       render: (item) => (
//         <div className="code-title">
//           <span className="code-badge">{item.contract_number}</span>
//           <span className="title">{item.subject}</span>
//         </div>
//       ),
//     },
//     {
//       key: 'contractor',
//       title: 'طرف قرارداد',
//       render: (item) => (
//         <div className="contractor-cell">
//           <div className="affiliation-icon">
//             {item.affiliation_type === 'UNIVERSITY' ? (
//               <GraduationCap size={14} />
//             ) : (
//               <Building2 size={14} />
//             )}
//           </div>
//           {item.contractor || '—'}
//         </div>
//       ),
//     },
//     {
//       key: 'total_amount',
//       title: 'مبلغ کل',
//       render: (item) => (
//         <div className="budget-cell">
//           <DollarSign size={14} />
//           {formatCurrency(item.total_amount)}
//         </div>
//       ),
//     },
//     {
//       key: 'financial_progress',
//       title: 'پیشرفت مالی',
//       render: (item) => (
//         <div className="progress-cell">
//           <span className="progress-value">{Number(item.financial_progress).toFixed(1)}%</span>
//           <div className="progress-mini">
//             <div className="progress-fill-mini financial" style={{ width: `${Number(item.financial_progress)}%` }} />
//           </div>
//         </div>
//       ),
//     },
//     {
//       key: 'physical_progress',
//       title: 'پیشرفت فیزیکی',
//       render: (item) => (
//         <div className="progress-cell">
//           <span className="progress-value">{Number(item.physical_progress).toFixed(1)}%</span>
//           <div className="progress-mini">
//             <div className="progress-fill-mini physical" style={{ width: `${Number(item.physical_progress)}%` }} />
//           </div>
//         </div>
//       ),
//     },
//     {
//       key: 'status',
//       title: 'وضعیت',
//       render: (item) => (
//         <StatusBadge status={item.status} config={CONTRACT_STATUSES} />
//       ),
//     },
//     {
//       key: 'end_date',
//       title: 'تاریخ اتمام',
//       render: (item) => (
//         <div className="date-cell">
//           <Calendar size={14} />
//           {item.end_date}
//         </div>
//       ),
//     },
//     {
//       key: 'attachments',
//       title: 'فایل‌ها',
//       render: (item) => (
//         <>
//           {item.attachments && item.attachments.length > 0 ? (
//             <div className="attachments-cell">
//               <span className="attachment-count">{item.attachments.length} فایل</span>
//               <div className="attachment-icons">
//                 {item.attachments.slice(0, 3).map((att) => (
//                   <a key={att.id} href={att.file} target="_blank" rel="noopener noreferrer" className="attachment-link" title={att.filename}>
//                     <Paperclip size={12} />
//                   </a>
//                 ))}
//                 {item.attachments.length > 3 && (
//                   <span className="more-files">+{item.attachments.length - 3}</span>
//                 )}
//               </div>
//             </div>
//           ) : (
//             <span className="text-muted">—</span>
//           )}
//         </>
//       ),
//     },
//     {
//       key: 'actions',
//       title: 'عملیات',
//       width: 140,
//       render: (item) => (
//         <div className="actions">
//           <button className="action-btn view" onClick={() => onView?.(item)} title="مشاهده">
//             <Eye size={16} />
//           </button>
//           <button className="action-btn edit" onClick={() => onEdit?.(item)} title="ویرایش">
//             <Pencil size={16} />
//           </button>
//           {onPayments && (
//             <button className="action-btn payment" onClick={() => onPayments?.(item)} title="پرداخت‌ها">
//               <DollarSign size={16} />
//             </button>
//           )}
//           <button className="action-btn delete" onClick={() => handleDelete(item.id)} disabled={isDeleting} title="حذف">
//             <Trash2 size={16} />
//           </button>
//         </div>
//       ),
//     },
//   ];

//   // ========== فیلدهای فیلتر ==========
//   const filterFields: FilterField[] = [
//     {
//       key: 'status',
//       label: 'وضعیت',
//       type: 'select',
//       options: Object.entries(CONTRACT_STATUSES).map(([key, { label }]) => ({
//         value: key,
//         label,
//       })),
//     },
//     {
//       key: 'year',
//       label: 'سال',
//       type: 'number',
//       placeholder: 'سال را وارد کنید...',
//     },
//     {
//       key: 'affiliation_type',
//       label: 'نوع همکار',
//       type: 'select',
//       options: [
//         { value: 'UNIVERSITY', label: 'دانشگاه' },
//         { value: 'COMPANY', label: 'شرکت' },
//       ],
//     },
//     {
//       key: 'is_archived',
//       label: 'بایگانی',
//       type: 'select',
//       options: [
//         { value: 'active', label: 'غیربایگانی' },
//         { value: 'archived', label: 'بایگانی شده' },
//       ],
//     },
//   ];

//   // ========== Render ==========
//   return (
//     <div className="contract-list">
//       {/* Header */}
//       <div className="contract-list-header">
//         <div className="header-title">
//           <FileText size={24} />
//           <h2>قراردادها</h2>
//           <span className="badge">{totalCount}</span>
//         </div>
//         {onAdd && (
//           <button className="btn-primary" onClick={onAdd}>
//             <Plus size={18} />
//             افزودن قرارداد
//           </button>
//         )}
//       </div>

//       {/* Search & Filters */}
//       <div className="search-section">
//         {/* جستجوی اصلی */}
//         <div className="search-input-wrapper">
//           <Search size={18} className="search-icon" />
//           <input
//             type="text"
//             placeholder="جستجو در شماره، موضوع، طرف قرارداد، تعهدات، شرح خدمات..."
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

//         {/* ✅ جستجوی طرف قرارداد */}
//         <div className="contractor-search-wrapper">
//           <Search size={16} className="contractor-search-icon" />
//           <input
//             type="text"
//             placeholder="جستجوی طرف قرارداد..."
//             value={contractorSearch}
//             onChange={(e) => setContractorSearch(e.target.value)}
//             className="contractor-search-input"
//           />
//           {contractorSearch && (
//             <button className="clear-btn" onClick={() => setContractorSearch('')}>
//               <X size={14} />
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
//         data={contracts}
//         columns={columns}
//         rowKey="id"
//         loading={isLoading}
//         emptyMessage={hasActiveFilters ? 'با فیلترهای انتخاب شده موردی پیدا نشد' : 'هنوز قراردادی ثبت نشده است'}
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
//         .contract-list {
//           background: white;
//           border-radius: 12px;
//           padding: 20px;
//           box-shadow: 0 1px 3px rgba(0,0,0,0.06);
//         }

//         .contract-list-header {
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
//           background: #eef2ff;
//           color: #4f46e5;
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
//           background: #4f46e5;
//           color: white;
//           border: none;
//           border-radius: 8px;
//           font-weight: 500;
//           cursor: pointer;
//           transition: all 0.2s;
//         }

//         .btn-primary:hover {
//           background: #4338ca;
//           transform: translateY(-1px);
//           box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
//         }

//         .search-section {
//           display: flex;
//           gap: 12px;
//           margin-bottom: 16px;
//           flex-wrap: wrap;
//         }

//         .search-input-wrapper {
//           flex: 2;
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
//           z-index: 2;
//         }

//         .clear-btn:hover {
//           color: #ef4444;
//         }

//         /* ✅ جستجوی طرف قرارداد */
//         .contractor-search-wrapper {
//           flex: 1;
//           position: relative;
//           min-width: 160px;
//         }

//         .contractor-search-input {
//           width: 100%;
//           padding: 8px 36px 8px 12px;
//           border: 1.5px solid #e9ecef;
//           border-radius: 8px;
//           font-size: 14px;
//           transition: all 0.2s;
//         }

//         .contractor-search-input:focus {
//           border-color: #4f46e5;
//           outline: none;
//           box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
//         }

//         .contractor-search-icon {
//           position: absolute;
//           right: 10px;
//           top: 50%;
//           transform: translateY(-50%);
//           color: #9ca3af;
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

//         .code-title {
//           display: flex;
//           flex-direction: column;
//           gap: 4px;
//         }

//         .code-badge {
//           background: #eef2ff;
//           color: #4f46e5;
//           padding: 2px 10px;
//           border-radius: 12px;
//           font-size: 11px;
//           font-weight: 600;
//           display: inline-block;
//           width: fit-content;
//         }

//         .title {
//           font-weight: 500;
//           font-size: 14px;
//           color: #1a1a2e;
//         }

//         .contractor-cell {
//           display: flex;
//           align-items: center;
//           gap: 6px;
//           font-size: 13px;
//           color: #374151;
//         }

//         .affiliation-icon {
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           width: 24px;
//           height: 24px;
//           border-radius: 4px;
//           background: #f3f4f6;
//           color: #6b7280;
//         }

//         .budget-cell {
//           display: flex;
//           align-items: center;
//           gap: 4px;
//           font-weight: 500;
//         }

//         .progress-cell {
//           display: flex;
//           flex-direction: column;
//           gap: 4px;
//         }

//         .progress-value {
//           font-size: 13px;
//           font-weight: 600;
//           color: #1a1a2e;
//         }

//         .progress-mini {
//           width: 60px;
//           height: 4px;
//           background: #e9ecef;
//           border-radius: 2px;
//           overflow: hidden;
//         }

//         .progress-fill-mini {
//           height: 100%;
//           border-radius: 2px;
//           transition: width 0.3s ease;
//         }

//         .progress-fill-mini.financial {
//           background: linear-gradient(90deg, #059669, #10b981);
//         }

//         .progress-fill-mini.physical {
//           background: linear-gradient(90deg, #4f46e5, #7c3aed);
//         }

//         .date-cell {
//           display: flex;
//           align-items: center;
//           gap: 6px;
//           font-size: 13px;
//           color: #6b7280;
//           direction: ltr;
//         }

//         .attachments-cell {
//           display: flex;
//           align-items: center;
//           gap: 6px;
//         }

//         .attachment-count {
//           font-size: 12px;
//           color: #6b7280;
//         }

//         .attachment-icons {
//           display: flex;
//           align-items: center;
//           gap: 4px;
//         }

//         .attachment-link {
//           display: inline-flex;
//           align-items: center;
//           justify-content: center;
//           width: 24px;
//           height: 24px;
//           border-radius: 4px;
//           color: #4f46e5;
//           background: #eef2ff;
//           transition: all 0.2s;
//           text-decoration: none;
//         }

//         .attachment-link:hover {
//           background: #dbeafe;
//           color: #4338ca;
//         }

//         .more-files {
//           font-size: 11px;
//           color: #6b7280;
//           background: #f3f4f6;
//           padding: 0 6px;
//           border-radius: 10px;
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
//           background: #eef2ff;
//           color: #4f46e5;
//         }

//         .action-btn.payment:hover {
//           background: #fef3c7;
//           color: #d97706;
//         }

//         .action-btn.delete:hover {
//           background: #fee2e2;
//           color: #dc2626;
//         }

//         .action-btn:disabled {
//           opacity: 0.5;
//           cursor: not-allowed;
//         }

//         .text-muted {
//           color: #9ca3af;
//         }

//         @media (max-width: 768px) {
//           .contract-list {
//             padding: 12px;
//           }

//           .search-section {
//             flex-direction: column;
//           }

//           .search-input-wrapper,
//           .contractor-search-wrapper {
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

// export default ContractList;

