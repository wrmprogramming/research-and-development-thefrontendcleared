// src/modules/proposal/components/ProposalList.tsx

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProposal } from '../hooks/useProposal';
import { type Proposal, type ProposalFilters } from '../types/proposal.types';
import { toPersianNumber } from '../../../utils/formatter.utils';

import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  Filter,
  X,
  FileText,
  Building2,
  Users,
  Trophy,
  Paperclip,
  Calendar,
  Clock,
  XCircle,
} from 'lucide-react';

import {
  Pagination,
  SearchBar,
  FilterPanel,
  DataTable,
  type Column,
  type FilterField,
} from '../../../components/common';

import { UniversitySelect } from '../../university/components/UniversitySelect';
import { RfpSelect } from '../../rfp/components/RfpSelect';
import { ProjectSubjectSelect } from '../../project-subject/components/ProjectSubjectSelect';
import { PersonSelect } from '../../person/components/PersonSelect';
import JalaliDatePicker from '../../../components/JalaliDatePicker';

interface ProposalListProps {
  onEdit?: (item: Proposal) => void;
  onDelete?: (id: number) => void;
  onAdd?: () => void;
}

export const ProposalList: React.FC<ProposalListProps> = ({
  onEdit,
  onDelete,
  onAdd,
}) => {
  const navigate = useNavigate();
  const { useList, useStats, delete: deleteProposal, isDeleting } = useProposal();

  // ========== State ==========
  // ✅ فقط یک state برای همه فیلترها (مثل ResearchList)
  const [filters, setFilters] = useState<ProposalFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState<string>('submit_date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // ========== آمار برای گرفتن لیست سال‌ها ==========
  const { data: statsData } = useStats();
  const years = useMemo(() => {
    if (!statsData?.by_year) return [];
    return statsData.by_year
      .map((item) => item.year)
      .filter((year) => year > 0)
      .sort((a, b) => b - a);
  }, [statsData]);

  // ========== Query ==========
  const { data, isLoading, refetch } = useList({
    ...filters,
    search: searchTerm || undefined,
    page: currentPage,
    page_size: pageSize,
    ordering: sortOrder === 'desc' ? `-${sortField}` : sortField,
  });

  const proposals = data?.results || [];
  const totalCount = data?.count || 0;

  // ========== Handlers ==========
  const handleView = (item: Proposal) => {
    navigate(`/proposal/${item.id}`);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('آیا از حذف این پروپوزال مطمئن هستید؟')) {
      await deleteProposal(id);
      refetch();
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // ✅ همه فیلترها در یک state (مثل ResearchList)
  const handleFilterChange = (key: string, value: any) => {
    let finalValue = value;

    // مدیریت is_winner به صورت boolean
    if (key === 'is_winner') {
      if (value === '' || value === undefined || value === null) {
        finalValue = undefined;
      } else {
        finalValue = value === 'true' || value === true;
      }
    }

    // مدیریت year
    if (key === 'year' && value) {
      const numValue = Number(value);
      finalValue = !isNaN(numValue) && numValue > 0 ? numValue : undefined;
    }

    // مدیریت عددی‌ها
    if (
      (key === 'execution_time_min' || key === 'execution_time_max') &&
      value !== undefined &&
      value !== null &&
      value !== ''
    ) {
      const numValue = Number(value);
      finalValue = !isNaN(numValue) ? numValue : undefined;
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

  // ========== ستون‌های جدول ==========
  const columns: Column<Proposal>[] = [
    {
      key: 'code',
      title: 'کد / عنوان',
      sortable: true,
      render: (item) => (
        <div className="code-title">
          <span className="code-badge">{item.code}</span>
          <span className="title">{item.title_farsi}</span>
          {item.title_english && (
            <span className="title-english">{item.title_english}</span>
          )}
        </div>
      ),
    },
    {
      key: 'university_name',
      title: 'دانشگاه',
      render: (item) => (
        <div className="university-cell">
          <Building2 size={14} />
          {item.university_name || '—'}
        </div>
      ),
    },
    {
      key: 'primary_researcher_name',
      title: 'پژوهشگر اصلی',
      render: (item) => (
        <div className="researcher-cell">
          <Users size={14} />
          {item.primary_researcher_name || '—'}
        </div>
      ),
    },
    {
      key: 'is_winner',
      title: 'وضعیت',
      sortable: true,
      render: (item) =>
        item.is_winner ? (
          <span className="winner-badge">
            <Trophy size={14} />
            برنده
          </span>
        ) : (
          <span className="not-winner-badge">
            <XCircle size={14} />
            غیربرنده
          </span>
        ),
    },
    {
      key: 'execution_time',
      title: 'مدت اجرا',
      sortable: true,
      render: (item) => (
        <div className="time-cell">
          <Clock size={14} />
          {item.execution_time
            ? `${toPersianNumber(item.execution_time)} ماه`
            : '—'}
        </div>
      ),
    },
    {
      key: 'approved_date',
      title: 'تاریخ تصویب',
      sortable: true,
      render: (item) => (
        <div className="date-cell">
          <Calendar size={14} />
          {toPersianNumber(item.approved_date) || '—'}
        </div>
      ),
    },
    {
      key: 'rfp_title',
      title: 'RFP مرتبط',
      render: (item) => (
        <div className="rfp-cell">
          <FileText size={14} />
          <span className="rfp-code">{item.rfp_code || '—'}</span>
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
            onClick={() => handleView(item)}
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
    {
      key: 'year',
      label: 'سال',
      type: 'select',
      options: years.map((y) => ({
        value: String(y),
        label: toPersianNumber(y),
      })),
    },
    {
      key: 'rfp',
      label: 'RFP مرتبط',
      type: 'custom',
      customComponent: (
        <RfpSelect
          value={filters.rfp ?? null}
          onChange={(id) => handleFilterChange('rfp', id)}
          placeholder="انتخاب RFP..."
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
    {
      key: 'project_subject',
      label: 'موضوع پروژه',
      type: 'custom',
      customComponent: (
        <ProjectSubjectSelect
          value={filters.project_subject ?? null}
          onChange={(id) => handleFilterChange('project_subject', id)}
          placeholder="انتخاب موضوع..."
        />
      ),
    },
    {
      key: 'is_winner',
      label: 'وضعیت برنده',
      type: 'select',
      options: [
        { value: 'true', label: 'برنده' },
        { value: 'false', label: 'غیربرنده' },
      ],
    },
    {
      key: 'primary_researcher',
      label: 'پژوهشگر اصلی',
      type: 'custom',
      customComponent: (
        <PersonSelect
          value={filters.primary_researcher ?? null}
          onChange={(id) => handleFilterChange('primary_researcher', id)}
          placeholder="انتخاب پژوهشگر..."
          label=""
        />
      ),
    },
    {
      key: 'execution_time_min',
      label: 'مدت اجرا از (ماه)',
      type: 'number',
      placeholder: 'حداقل مدت',
    },
    {
      key: 'execution_time_max',
      label: 'مدت اجرا تا (ماه)',
      type: 'number',
      placeholder: 'حداکثر مدت',
    },
    {
      key: 'approved_date_group',
      label: '',
      type: 'fieldset',
      fieldsetTitle: '📅 تاریخ تصویب',
      fieldsetFields: [
        {
          key: 'approved_date_from',
          label: 'از تاریخ',
          type: 'custom',
          customComponent: (
            <JalaliDatePicker
              value={(filters.approved_date_from as string) || null}
              onChange={(date) => handleFilterChange('approved_date_from', date)}
              placeholder="1405/01/01"
              label=""
            />
          ),
        },
        {
          key: 'approved_date_to',
          label: 'تا تاریخ',
          type: 'custom',
          customComponent: (
            <JalaliDatePicker
              value={(filters.approved_date_to as string) || null}
              onChange={(date) => handleFilterChange('approved_date_to', date)}
              placeholder="1405/12/29"
              label=""
            />
          ),
        },
      ],
    },
  ];

  return (
    <div className="proposal-list">
      {/* Header */}
      <div className="proposal-list-header">
        <div className="header-title">
          <FileText size={24} />
          <h2>پروپوزال‌ها</h2>
          <span className="badge">{toPersianNumber(totalCount)}</span>
        </div>
        {onAdd && (
          <button className="btn-primary" onClick={onAdd}>
            <Plus size={18} />
            افزودن پروپوزال
          </button>
        )}
      </div>

      {/* Search & Filters */}
      <div className="search-section">
        <SearchBar
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="جستجو در عنوان فارسی، انگلیسی و کد..."
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
        data={proposals}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        emptyMessage={
          hasActiveFilters
            ? 'با فیلترهای انتخاب شده موردی پیدا نشد'
            : 'هنوز پروپوزالی ثبت نشده است'
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

      {/* استایل‌ها */}
      <style>{`
        .proposal-list { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
        .proposal-list-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
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
        .code-title { display: flex; flex-direction: column; gap: 2px; }
        .code-badge { background: #eef2ff; color: #4f46e5; padding: 2px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; display: inline-block; width: fit-content; }
        .title { font-weight: 500; font-size: 14px; color: #1a1a2e; }
        .title-english { font-size: 12px; color: #6b7280; }
        .university-cell, .researcher-cell, .time-cell, .date-cell, .rfp-cell { display: flex; align-items: center; gap: 6px; color: #374151; font-size: 13px; }
        .rfp-code { font-weight: 500; color: #4f46e5; }
        .winner-badge { display: inline-flex; align-items: center; gap: 4px; padding: 2px 10px; border-radius: 12px; background: #d1fae5; color: #059669; font-size: 12px; font-weight: 500; }
        .not-winner-badge { display: inline-flex; align-items: center; gap: 4px; padding: 2px 10px; border-radius: 12px; background: #f3f4f6; color: #6b7280; font-size: 12px; font-weight: 500; }
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
          .proposal-list { padding: 12px; }
          .search-section { flex-direction: column; }
          .filter-actions { width: 100%; }
          .filter-actions button { flex: 1; justify-content: center; }
          .actions { flex-direction: column; gap: 2px; }
        }
      `}</style>
    </div>
  );
};

export default ProposalList;
// // src/modules/proposal/components/ProposalList.tsx

// import React, { useState, useEffect, useMemo } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useProposal } from '../hooks/useProposal';
// import { useRfp } from '../../rfp/hooks/useRfp';
// import { useUniversity } from '../../university/hooks/useUniversity';
// import { type Proposal, type ProposalFilters } from '../types/proposal.types';
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
//   Building2,
//   Users,
//   Trophy,
//   Paperclip,
// } from 'lucide-react';

// interface ProposalListProps {
//   onEdit?: (item: Proposal) => void;
//   onDelete?: (id: number) => void;
//   onAdd?: () => void;
// }

// export const ProposalList: React.FC<ProposalListProps> = ({
//   onEdit,
//   onDelete,
//   onAdd,
// }) => {
//   const navigate = useNavigate();
//   const { useList, delete: deleteProposal, isDeleting } = useProposal();
  
//   // ✅ اصلاح: استفاده از useRfp با تایپ صحیح
//   const { useList: useRfpList } = useRfp();
//   const { useList: useUniversityList } = useUniversity();

//   const [filters, setFilters] = useState<ProposalFilters>({});
//   const [searchTerm, setSearchTerm] = useState('');
//   const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
//   const [showFilters, setShowFilters] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [pageSize, setPageSize] = useState(10);
//   const [sortField, setSortField] = useState<string>('submit_date');
//   const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

//   // ============================================================
//   // 🔥 لیست سال‌ها از داده‌های آماری
//   // ============================================================
//   const { useStats } = useProposal();
//   const { data: statsData } = useStats();
  
//   const years = useMemo(() => {
//     if (!statsData?.by_year) return [];
//     return statsData.by_year
//       .map(item => item.year)
//       .filter(year => year > 0)
//       .sort((a, b) => b - a);
//   }, [statsData]);

//   // ============================================================
//   // 🔥 دریافت داده‌ها برای فیلترها - با تایپ صحیح
//   // ============================================================
//   const rfpsQuery = useRfpList({});
//   const rfpsData = rfpsQuery.data;
//   const isRfpLoading = rfpsQuery.isLoading;
  
//   const rfps = useMemo(() => {
//     if (!rfpsData) return [];
//     // اگر داده به صورت PaginatedResponse است
//     if ('results' in rfpsData) {
//       return rfpsData.results || [];
//     }
//     // اگر داده به صورت آرایه است
//     if (Array.isArray(rfpsData)) {
//       return rfpsData;
//     }
//     return [];
//   }, [rfpsData]);

//   const universitiesQuery = useUniversityList({});
//   const universitiesData = universitiesQuery.data;
//   const isUniversityLoading = universitiesQuery.isLoading;
  
//   const universities = useMemo(() => {
//     if (!universitiesData) return [];
//     if ('results' in universitiesData) {
//       return universitiesData.results || [];
//     }
//     if (Array.isArray(universitiesData)) {
//       return universitiesData;
//     }
//     return [];
//   }, [universitiesData]);

//   // ============================================================
//   // Debounce
//   // ============================================================
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setDebouncedSearchTerm(searchTerm);
//       setCurrentPage(1);
//     }, 500);
//     return () => clearTimeout(timer);
//   }, [searchTerm]);

//   // ============================================================
//   // دریافت لیست پروپوزال‌ها
//   // ============================================================
//   const { data, isLoading, refetch } = useList({
//     ...filters,
//     search: debouncedSearchTerm || undefined,
//     page: currentPage,
//     page_size: pageSize,
//     ordering: sortOrder === 'desc' ? `-${sortField}` : sortField,
//   });

//   const proposals = data?.results || [];
//   const totalCount = data?.count || 0;
//   const totalPages = Math.ceil(totalCount / pageSize);

//   // ========== Handle View - رفتن به صفحه جزئیات ==========
//   const handleView = (item: Proposal) => {
//     navigate(`/proposal/${item.id}`);
//   };

//   const handleDelete = async (id: number, title: string) => {
//     if (window.confirm(`آیا از حذف پروپوزال "${title}" مطمئن هستید؟`)) {
//       await deleteProposal(id);
//       refetch();
//     }
//   };

//   const handleFilterChange = (key: keyof ProposalFilters, value: any) => {
//     setFilters((prev) => {
//       const newFilters = { ...prev };
//       if (value === undefined || value === null || value === '' || value === 'all' || value === '0') {
//         delete newFilters[key];
//       } else {
//         newFilters[key] = value;
//       }
//       return newFilters;
//     });
//     setCurrentPage(1);
//   };

//   const clearFilters = () => {
//     setFilters({});
//     setSearchTerm('');
//     setDebouncedSearchTerm('');
//     setCurrentPage(1);
//   };

//   const hasActiveFilters = searchTerm || Object.values(filters).some(v => v !== undefined);

//   const handleSort = (field: string) => {
//     if (sortField === field) {
//       setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
//     } else {
//       setSortField(field);
//       setSortOrder('asc');
//     }
//     setCurrentPage(1);
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
//           <button
//             className="pagination-btn"
//             onClick={() => goToPage(1)}
//             disabled={currentPage === 1}
//           >
//             <span className="double-chevron-left">«</span>
//           </button>
//           <button
//             className="pagination-btn"
//             onClick={() => goToPage(currentPage - 1)}
//             disabled={currentPage === 1}
//           >
//             <span className="single-chevron-left">‹</span>
//           </button>

//           {pages.map((page) => (
//             <button
//               key={page}
//               className={`pagination-btn ${page === currentPage ? 'active' : ''}`}
//               onClick={() => goToPage(page)}
//             >
//               {page}
//             </button>
//           ))}

//           <button
//             className="pagination-btn"
//             onClick={() => goToPage(currentPage + 1)}
//             disabled={currentPage === totalPages}
//           >
//             <span className="single-chevron-right">›</span>
//           </button>
//           <button
//             className="pagination-btn"
//             onClick={() => goToPage(totalPages)}
//             disabled={currentPage === totalPages}
//           >
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
//     <div className="proposal-list">
//       <div className="proposal-list-header">
//         <div className="header-title">
//           <FileText size={24} />
//           <h2>پروپوزال‌ها</h2>
//           <span className="badge">{totalCount}</span>
//         </div>
//         {onAdd && (
//           <button className="btn-primary" onClick={onAdd}>
//             <Plus size={18} />
//             افزودن پروپوزال
//           </button>
//         )}
//       </div>

//       <div className="search-section">
//         <div className="search-input-wrapper">
//           <Search size={18} className="search-icon" />
//           <input
//             type="text"
//             placeholder="جستجو در عنوان فارسی، انگلیسی و کد..."
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

//       {showFilters && (
//         <div className="filter-panel">
//           <div className="filter-grid">
//             <div className="filter-group">
//               <label>RFP</label>
//               <select
//                 value={filters.rfp || ''}
//                 onChange={(e) => handleFilterChange('rfp', e.target.value ? Number(e.target.value) : undefined)}
//                 disabled={isRfpLoading}
//               >
//                 <option value="">همه RFPها</option>
//                 {rfps.length > 0 ? (
//                   rfps.map((rfp) => (
//                     <option key={rfp.id} value={rfp.id}>
//                       {rfp.code} - {rfp.title}
//                     </option>
//                   ))
//                 ) : (
//                   <option value="" disabled>در حال بارگذاری...</option>
//                 )}
//               </select>
//             </div>

//             <div className="filter-group">
//               <label>سال</label>
//               <select
//                 value={filters.year || ''}
//                 onChange={(e) => handleFilterChange('year', e.target.value ? Number(e.target.value) : undefined)}
//               >
//                 <option value="">همه سال‌ها</option>
//                 {years.map((year) => (
//                   <option key={year} value={year}>
//                     {year}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div className="filter-group">
//               <label>دانشگاه</label>
//               <select
//                 value={filters.university || ''}
//                 onChange={(e) => handleFilterChange('university', e.target.value ? Number(e.target.value) : undefined)}
//                 disabled={isUniversityLoading}
//               >
//                 <option value="">همه دانشگاه‌ها</option>
//                 {universities.length > 0 ? (
//                   universities.map((uni) => (
//                     <option key={uni.id} value={uni.id}>
//                       {uni.name}
//                     </option>
//                   ))
//                 ) : (
//                   <option value="" disabled>در حال بارگذاری...</option>
//                 )}
//               </select>
//             </div>

//             <div className="filter-group">
//               <label>وضعیت برنده</label>
//               <select
//                 value={filters.is_winner !== undefined ? String(filters.is_winner) : ''}
//                 onChange={(e) => {
//                   const value = e.target.value;
//                   if (value === '') {
//                     handleFilterChange('is_winner', undefined);
//                   } else {
//                     handleFilterChange('is_winner', value === 'true');
//                   }
//                 }}
//               >
//                 <option value="">همه</option>
//                 <option value="true">برنده</option>
//                 <option value="false">غیربرنده</option>
//               </select>
//             </div>
//           </div>
//         </div>
//       )}

//       {proposals.length === 0 ? (
//         <div className="empty-state">
//           <FileText size={48} />
//           <h5>هیچ پروپوزالی یافت نشد</h5>
//           <p className="text-muted">
//             {hasActiveFilters ? 'با فیلترهای انتخاب شده موردی پیدا نشد' : 'هنوز پروپوزالی ثبت نشده است'}
//           </p>
//         </div>
//       ) : (
//         <>
//           <div className="table-responsive">
//             <table className="proposal-table">
//               <thead>
//                 <tr>
//                   <th onClick={() => handleSort('code')} className="sortable">
//                     کد / عنوان
//                     {sortField === 'code' && (
//                       <span className="sort-icon">{sortOrder === 'asc' ? '▲' : '▼'}</span>
//                     )}
//                   </th>
//                   <th onClick={() => handleSort('university__name')} className="sortable">
//                     دانشگاه
//                     {sortField === 'university__name' && (
//                       <span className="sort-icon">{sortOrder === 'asc' ? '▲' : '▼'}</span>
//                     )}
//                   </th>
//                   <th onClick={() => handleSort('primary_researcher__first_name')} className="sortable">
//                     پژوهشگر اصلی
//                     {sortField === 'primary_researcher__first_name' && (
//                       <span className="sort-icon">{sortOrder === 'asc' ? '▲' : '▼'}</span>
//                     )}
//                   </th>
//                   <th onClick={() => handleSort('is_winner')} className="sortable">
//                     برنده
//                     {sortField === 'is_winner' && (
//                       <span className="sort-icon">{sortOrder === 'asc' ? '▲' : '▼'}</span>
//                     )}
//                   </th>
//                   <th onClick={() => handleSort('execution_time')} className="sortable">
//                     مدت اجرا
//                     {sortField === 'execution_time' && (
//                       <span className="sort-icon">{sortOrder === 'asc' ? '▲' : '▼'}</span>
//                     )}
//                   </th>
//                   <th onClick={() => handleSort('approved_date')} className="sortable">
//                     تاریخ تصویب
//                     {sortField === 'approved_date' && (
//                       <span className="sort-icon">{sortOrder === 'asc' ? '▲' : '▼'}</span>
//                     )}
//                   </th>
//                   <th>فایل‌ها</th>
//                   <th style={{ width: 120 }}>عملیات</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {proposals.map((proposal) => (
//                   <tr key={proposal.id}>
//                     <td>
//                       <div className="code-title">
//                         <span className="code-badge">{proposal.code}</span>
//                         <span className="title">{proposal.title_farsi}</span>
//                         {proposal.title_english && (
//                           <span className="title-english">{proposal.title_english}</span>
//                         )}
//                       </div>
//                     </td>
//                     <td>
//                       <div className="university-cell">
//                         <Building2 size={14} />
//                         {proposal.university_name || '—'}
//                       </div>
//                     </td>
//                     <td>
//                       <div className="researcher-cell">
//                         <Users size={14} />
//                         {proposal.primary_researcher_name || '—'}
//                       </div>
//                     </td>
//                     <td>
//                       {proposal.is_winner ? (
//                         <span className="winner-badge">
//                           <Trophy size={14} />
//                           برنده
//                         </span>
//                       ) : (
//                         <span className="not-winner-badge">غیربرنده</span>
//                       )}
//                     </td>
//                     <td>
//                       <div className="time-cell">
//                         <Calendar size={14} />
//                         {proposal.execution_time} ماه
//                       </div>
//                     </td>
//                     <td>
//                       <div className="date-cell">
//                         <Calendar size={14} />
//                         {proposal.approved_date ? proposal.approved_date : '—'}
//                       </div>
//                     </td>
//                     <td>
//                       {proposal.attachments && proposal.attachments.length > 0 ? (
//                         <div className="attachments-cell">
//                           <span className="attachment-count">{proposal.attachments.length} فایل</span>
//                           <div className="attachment-icons">
//                             {proposal.attachments.slice(0, 3).map((att) => (
//                               <a
//                                 key={att.id}
//                                 href={att.file}
//                                 target="_blank"
//                                 rel="noopener noreferrer"
//                                 className="attachment-link"
//                                 title={att.filename}
//                               >
//                                 <Paperclip size={12} />
//                               </a>
//                             ))}
//                             {proposal.attachments.length > 3 && (
//                               <span className="more-files">+{proposal.attachments.length - 3}</span>
//                             )}
//                           </div>
//                         </div>
//                       ) : (
//                         <span className="text-muted">—</span>
//                       )}
//                     </td>
//                     <td>
//                       <div className="actions">
//                         <button
//                           className="action-btn view"
//                           onClick={() => handleView(proposal)}
//                           title="مشاهده"
//                         >
//                           <Eye size={16} />
//                         </button>
//                         <button
//                           className="action-btn edit"
//                           onClick={() => onEdit?.(proposal)}
//                           title="ویرایش"
//                         >
//                           <Pencil size={16} />
//                         </button>
//                         <button
//                           className="action-btn delete"
//                           onClick={() => handleDelete(proposal.id, proposal.title_farsi)}
//                           disabled={isDeleting}
//                           title="حذف"
//                         >
//                           <Trash2 size={16} />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           {renderPagination()}
//         </>
//       )}

//       <style>{`
//         .proposal-list {
//           background: white;
//           border-radius: 12px;
//           padding: 20px;
//           box-shadow: 0 1px 3px rgba(0,0,0,0.06);
//         }

//         .proposal-list-header {
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
//           z-index: 2;
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
//           grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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

//         .filter-group select {
//           padding: 8px 12px;
//           border: 1.5px solid #d1d5db;
//           border-radius: 6px;
//           font-size: 13px;
//           background: white;
//           width: 100%;
//         }

//         .filter-group select:focus {
//           border-color: #4f46e5;
//           outline: none;
//           box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
//         }

//         .filter-group select:disabled {
//           background: #f3f4f6;
//           cursor: not-allowed;
//           opacity: 0.7;
//         }

//         .sortable {
//           cursor: pointer;
//           user-select: none;
//           transition: all 0.2s;
//         }

//         .sortable:hover {
//           color: #4f46e5;
//         }

//         .sort-icon {
//           display: inline-block;
//           margin-right: 4px;
//           font-size: 11px;
//           color: #4f46e5;
//         }

//         .proposal-table {
//           width: 100%;
//           border-collapse: collapse;
//         }

//         .proposal-table thead th {
//           padding: 12px 16px;
//           text-align: right;
//           font-weight: 600;
//           font-size: 13px;
//           color: #6b7280;
//           border-bottom: 2px solid #e9ecef;
//         }

//         .proposal-table tbody td {
//           padding: 12px 16px;
//           border-bottom: 1px solid #f3f4f6;
//           vertical-align: middle;
//         }

//         .proposal-table tbody tr:hover {
//           background: #f8fafc;
//         }

//         .code-title {
//           display: flex;
//           flex-direction: column;
//           gap: 2px;
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

//         .title-english {
//           font-size: 12px;
//           color: #6b7280;
//         }

//         .university-cell,
//         .researcher-cell {
//           display: flex;
//           align-items: center;
//           gap: 6px;
//           color: #374151;
//         }

//         .winner-badge {
//           display: inline-flex;
//           align-items: center;
//           gap: 4px;
//           padding: 2px 10px;
//           border-radius: 12px;
//           background: #d1fae5;
//           color: #059669;
//           font-size: 12px;
//           font-weight: 500;
//         }

//         .not-winner-badge {
//           padding: 2px 10px;
//           border-radius: 12px;
//           background: #f3f4f6;
//           color: #6b7280;
//           font-size: 12px;
//           font-weight: 500;
//         }

//         .time-cell,
//         .date-cell {
//           display: flex;
//           align-items: center;
//           gap: 4px;
//           color: #374151;
//         }

//         .date-cell {
//           font-size: 13px;
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

//         .empty-state {
//           text-align: center;
//           padding: 40px;
//         }

//         .empty-state svg {
//           color: #d1d5db;
//           margin-bottom: 12px;
//         }

//         .empty-state h5 {
//           margin-bottom: 4px;
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

//         .page-size-selector select:focus {
//           outline: none;
//           border-color: #4f46e5;
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
//           .proposal-list {
//             padding: 12px;
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

//           .proposal-table {
//             font-size: 13px;
//           }

//           .proposal-table thead th,
//           .proposal-table tbody td {
//             padding: 8px 10px;
//           }

//           .actions {
//             flex-direction: column;
//             gap: 2px;
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

//           .page-size-selector {
//             margin-top: 4px;
//           }
//         }
//       `}</style>
//     </div>
//   );
// };

// export default ProposalList;
