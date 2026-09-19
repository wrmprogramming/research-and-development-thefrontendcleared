// src/modules/communication/components/CommunicationList.tsx

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCommunication } from '../hooks/useCommunication';
import { useResearch } from '../../research/hooks/useResearch';
import { type Communication } from '../types/communication.types';
import {
  Search, Plus, Pencil, Trash2, Eye, Filter, X,
  Mail, User, BookOpen, Paperclip, Calendar,
  Hash, FileText, ChevronDown, ChevronUp,
} from 'lucide-react';
import JalaliDatePicker from '../../../components/JalaliDatePicker';

// ✅ کامپوننت‌های common
import {
  Pagination,
  SearchBar,
  FilterPanel,
  DataTable,
  type Column,
  type FilterField,
} from '../../../components/common';

interface CommunicationListProps {
  onEdit?: (item: Communication) => void;
  onDelete?: (id: number) => void;
  onAdd?: () => void;
}

export const CommunicationList: React.FC<CommunicationListProps> = ({
  onEdit,
  onDelete,
  onAdd,
}) => {
  const navigate = useNavigate();
  const { useList, delete: deleteCommunication, isDeleting } = useCommunication();
  const { useList: useResearchList } = useResearch();

  // ========== State ==========
  const [filters, setFilters] = useState<{
    research?: number;
    from_date?: string;
    to_date?: string;
  }>({});

  // ✅ فقط searchTerm داریم. SearchBar خودش debounce می‌کنه
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState<string>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // ========== دریافت لیست پژوهش‌ها برای فیلتر ==========
  const { data: researchesData } = useResearchList({ page_size: 500 });
  const researches = useMemo(() => {
    if (!researchesData) return [];
    if ('results' in researchesData) return researchesData.results || [];
    if (Array.isArray(researchesData)) return researchesData;
    return [];
  }, [researchesData]);

  // ========== Query ==========
  // ✅ مستقیم از searchTerm استفاده می‌کنیم
  const { data, isLoading, refetch } = useList({
    ...filters,
    search: searchTerm || undefined,
    page: currentPage,
    page_size: pageSize,
    ordering: sortOrder === 'desc' ? `-${sortField}` : sortField,
  });

  const communications = data?.results || [];
  const totalCount = data?.count || 0;

  // ========== Handlers ==========
  const handleDelete = async (id: number, title: string) => {
    if (window.confirm(`آیا از حذف مکاتبه "${title}" مطمئن هستید؟`)) {
      await deleteCommunication(id);
      refetch();
    }
  };

  // ✅ جدید: هر بار جستجو، برو به صفحه 1
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      if (value === undefined || value === null || value === '' || value === 'all') {
        delete newFilters[key as keyof typeof newFilters];
      } else {
        newFilters[key as keyof typeof newFilters] = value;
      }
      return newFilters;
    });
    setCurrentPage(1);
  };

  // ✅ ساده‌شده
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const getFileName = (url: string | null | undefined) => {
    if (!url) return '';
    try {
      const parts = url.split('/');
      return parts[parts.length - 1] || '';
    } catch {
      return '';
    }
  };

  // ========== ستون‌های جدول ==========
  const columns: Column<Communication>[] = [
    {
      key: 'letter_number',
      title: 'شماره',
      sortable: true,
      render: (item) =>
        item.letter_number ? (
          <div className="letter-number-cell">
            <Hash size={14} />
            <span>{item.letter_number}</span>
          </div>
        ) : (
          <span className="text-muted">—</span>
        ),
    },
    {
      key: 'title',
      title: 'عنوان',
      sortable: true,
      render: (item) => (
        <div className="title-cell">
          <Mail size={14} />
          <span className="title">{item.title}</span>
        </div>
      ),
    },
    {
      key: 'sender',
      title: 'ارسال‌کننده',
      render: (item) => (
        <div className="sender-cell">
          <User size={14} />
          {item.sender}
        </div>
      ),
    },
    {
      key: 'receiver',
      title: 'دریافت‌کننده',
      render: (item) => (
        <div className="receiver-cell">
          <User size={14} />
          {item.receiver}
        </div>
      ),
    },
    {
      key: 'date',
      title: 'تاریخ مکاتبه',
      sortable: true,
      render: (item) => (
        <div className="date-cell">
          <Calendar size={14} />
          {item.date}
        </div>
      ),
    },
    {
      key: 'send_receive_date',
      title: 'تاریخ ارسال/دریافت',
      render: (item) =>
        item.send_receive_date ? (
          <div className="date-cell">
            <Calendar size={14} />
            {item.send_receive_date}
          </div>
        ) : (
          <span className="text-muted">—</span>
        ),
    },
    {
      key: 'research_code',
      title: 'پژوهش',
      render: (item) =>
        item.research_code ? (
          <div className="research-cell">
            <BookOpen size={14} />
            <span className="research-code">{item.research_code}</span>
          </div>
        ) : (
          <span className="text-muted">—</span>
        ),
    },
    {
      key: 'files',
      title: 'فایل‌ها',
      render: (item) => (
        <div className="files-cell">
          {item.attachment || item.letter_file ? (
            <div className="file-icons">
              {item.attachment && (
                <a
                  href={item.attachment}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="file-link"
                  title={`پیوست: ${getFileName(item.attachment)}`}
                >
                  <Paperclip size={14} />
                </a>
              )}
              {item.letter_file && (
                <a
                  href={item.letter_file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="file-link letter"
                  title={`نامه: ${getFileName(item.letter_file)}`}
                >
                  <FileText size={14} />
                </a>
              )}
            </div>
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
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/communication/${item.id}`);
            }}
            title="مشاهده"
          >
            <Eye size={16} />
          </button>
          <button
            className="action-btn edit"
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(item);
            }}
            title="ویرایش"
          >
            <Pencil size={16} />
          </button>
          <button
            className="action-btn delete"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(item.id, item.title);
            }}
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
      key: 'research',
      label: 'پژوهش',
      type: 'select',
      options: researches.map((r) => ({
        value: String(r.id),
        label: `${r.code} - ${r.title}`,
      })),
    },
  ];

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">در حال بارگذاری...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="communication-list">
      {/* ========== Header ========== */}
      <div className="communication-list-header">
        <div className="header-title">
          <Mail size={24} />
          <h2>مکاتبات</h2>
          <span className="badge">{totalCount}</span>
        </div>
        {onAdd && (
          <button className="btn-primary" onClick={onAdd}>
            <Plus size={18} />
            افزودن مکاتبه
          </button>
        )}
      </div>

      {/* ========== Search ========== */}
      <div className="search-section">
        <SearchBar
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="جستجو در عنوان، شماره، ارسال‌کننده و دریافت‌کننده..."
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

      {/* ========== Filter Panel ========== */}
      {showFilters && (
        <div className="filter-panel">
          <div className="filter-grid">
            {/* فیلتر پژوهش */}
            <div className="filter-group">
              <label>پژوهش</label>
              <select
                value={filters.research || ''}
                onChange={(e) =>
                  handleFilterChange(
                    'research',
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
              >
                <option value="">همه پژوهش‌ها</option>
                {researches.map((research) => (
                  <option key={research.id} value={research.id}>
                    {research.code} - {research.title}
                  </option>
                ))}
              </select>
            </div>

            {/* فیلتر از تاریخ */}
            <div className="filter-group">
              <label>از تاریخ</label>
              <JalaliDatePicker
                value={filters.from_date || null}
                onChange={(date) => handleFilterChange('from_date', date)}
                placeholder="1402/01/01"
                label=""
              />
            </div>

            {/* فیلتر تا تاریخ */}
            <div className="filter-group">
              <label>تا تاریخ</label>
              <JalaliDatePicker
                value={filters.to_date || null}
                onChange={(date) => handleFilterChange('to_date', date)}
                placeholder="1402/12/29"
                label=""
              />
            </div>
          </div>
        </div>
      )}

      {/* ========== Table با DataTable ========== */}
      <DataTable
        data={communications}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        emptyMessage={
          hasActiveFilters
            ? 'با فیلترهای انتخاب شده موردی پیدا نشد'
            : 'هنوز مکاتبه‌ای ثبت نشده است'
        }
        sortField={sortField}
        sortOrder={sortOrder}
        onSort={handleSort}
      />

      {/* ========== Pagination ========== */}
      {totalCount > 0 && (
        <Pagination
          totalItems={totalCount}
          pageSize={pageSize}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}

      <style>{`
        .communication-list {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
        }

        .communication-list-header {
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

        .filter-panel {
          padding: 16px;
          margin-bottom: 16px;
          background: #f8fafc;
          border-radius: 8px;
        }

        .filter-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .filter-group label {
          font-size: 12px;
          font-weight: 500;
          color: #374151;
        }

        .filter-group select,
        .filter-group input {
          padding: 8px 12px;
          border: 1.5px solid #d1d5db;
          border-radius: 6px;
          font-size: 13px;
          background: white;
          width: 100%;
        }

        .filter-group select:focus,
        .filter-group input:focus {
          border-color: #4f46e5;
          outline: none;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }

        .letter-number-cell {
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 600;
          color: #4f46e5;
          font-size: 13px;
        }

        .title-cell {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .title-cell .title {
          font-weight: 500;
          color: #1a1a2e;
        }

        .sender-cell,
        .receiver-cell,
        .research-cell {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #374151;
          font-size: 13px;
        }

        .research-code {
          font-weight: 600;
          color: #4f46e5;
          background: #eef2ff;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 12px;
        }

        .date-cell {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #6b7280;
          direction: ltr;
        }

        .files-cell {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .file-icons {
          display: flex;
          gap: 4px;
        }

        .file-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 4px;
          background: #eef2ff;
          color: #4f46e5;
          transition: all 0.2s;
          text-decoration: none;
        }

        .file-link:hover {
          background: #dbeafe;
          color: #4338ca;
        }

        .file-link.letter {
          background: #fef3c7;
          color: #d97706;
        }

        .file-link.letter:hover {
          background: #fde68a;
        }

        .text-muted {
          color: #9ca3af;
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

        @media (max-width: 768px) {
          .communication-list { padding: 12px; }
          .search-section { flex-direction: column; }
          .filter-actions { width: 100%; }
          .filter-actions button { flex: 1; justify-content: center; }
          .filter-grid { grid-template-columns: 1fr; }
          .actions { flex-direction: column; gap: 2px; }
        }
      `}</style>
    </div>
  );
};

export default CommunicationList;
// // src/modules/communication/components/CommunicationList.tsx

// import React, { useState, useEffect, useMemo } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useCommunication } from '../hooks/useCommunication';
// import { useResearch } from '../../research/hooks/useResearch';
// import { type Communication } from '../types/communication.types';
// import {
//   Search, Plus, Pencil, Trash2, Eye, Filter, X,
//   Mail, User, BookOpen, Paperclip, Calendar,
//   Hash, FileText, ChevronDown, ChevronUp,
// } from 'lucide-react';
// import JalaliDatePicker from '../../../components/JalaliDatePicker';

// interface CommunicationListProps {
//   onEdit?: (item: Communication) => void;
//   onDelete?: (id: number) => void;
//   onAdd?: () => void;
// }

// export const CommunicationList: React.FC<CommunicationListProps> = ({
//   onEdit,
//   onDelete,
//   onAdd,
// }) => {
//   const navigate = useNavigate();
//   const { useList, delete: deleteCommunication, isDeleting } = useCommunication();
//   const { useList: useResearchList } = useResearch();

//   // ========== State ==========
//   const [filters, setFilters] = useState<{
//     research?: number;
//     from_date?: string;
//     to_date?: string;
//   }>({});

//   const [searchTerm, setSearchTerm] = useState('');
//   const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
//   const [showFilters, setShowFilters] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [pageSize, setPageSize] = useState(10);
//   const [sortField, setSortField] = useState<string>('date');
//   const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

//   // ========== دریافت لیست پژوهش‌ها برای فیلتر ==========
//   const { data: researchesData } = useResearchList({ page_size: 500 });
//   const researches = useMemo(() => {
//     if (!researchesData) return [];
//     if ('results' in researchesData) return researchesData.results || [];
//     if (Array.isArray(researchesData)) return researchesData;
//     return [];
//   }, [researchesData]);

//   // ========== Debounce Search ==========
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setDebouncedSearchTerm(searchTerm);
//       setCurrentPage(1);
//     }, 500);
//     return () => clearTimeout(timer);
//   }, [searchTerm]);

//   // ========== Query ==========
//   const { data, isLoading, refetch } = useList({
//     ...filters,
//     search: debouncedSearchTerm || undefined,
//     page: currentPage,
//     page_size: pageSize,
//     ordering: sortOrder === 'desc' ? `-${sortField}` : sortField,
//   });

//   const communications = data?.results || [];
//   const totalCount = data?.count || 0;
//   const totalPages = Math.ceil(totalCount / pageSize);

//   // ========== Handlers ==========
//   // const handleView = (item: Communication) => {
//   //   navigate(`/communication/${item.id}`);
//   // };

//   const handleDelete = async (id: number, title: string) => {
//     if (window.confirm(`آیا از حذف مکاتبه "${title}" مطمئن هستید؟`)) {
//       await deleteCommunication(id);
//       refetch();
//     }
//   };

//   const handleFilterChange = (key: string, value: any) => {
//     setFilters((prev) => {
//       const newFilters = { ...prev };
//       if (value === undefined || value === null || value === '' || value === 'all') {
//         delete newFilters[key as keyof typeof newFilters];
//       } else {
//         newFilters[key as keyof typeof newFilters] = value;
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

//   const hasActiveFilters =
//     searchTerm ||
//     Object.values(filters).some((v) => v !== undefined && v !== '' && v !== null);

//   const handleSort = (field: string) => {
//     if (sortField === field) {
//       setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
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

 

//   const getFileName = (url: string | null | undefined) => {
//     if (!url) return '';
//     try {
//       const parts = url.split('/');
//       return parts[parts.length - 1] || '';
//     } catch {
//       return '';
//     }
//   };

//   // ========== Pagination ==========
//   const renderPagination = () => {
//     if (totalPages <= 1) return null;

//     const pages: number[] = [];
//     const maxVisible = 5;
//     let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
//     let endPage = Math.min(totalPages, startPage + maxVisible - 1);

//     if (endPage - startPage < maxVisible - 1) {
//       startPage = Math.max(1, endPage - maxVisible + 1);
//     }

//     for (let i = startPage; i <= endPage; i++) pages.push(i);

//     return (
//       <div className="pagination-container">
//         <div className="pagination-info">
//           نمایش {((currentPage - 1) * pageSize) + 1} تا{' '}
//           {Math.min(currentPage * pageSize, totalCount)} از {totalCount} مورد
//         </div>
//         <div className="pagination-controls">
//           <button className="pagination-btn" onClick={() => goToPage(1)} disabled={currentPage === 1}>«</button>
//           <button className="pagination-btn" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>‹</button>
//           {pages.map((page) => (
//             <button
//               key={page}
//               className={`pagination-btn ${page === currentPage ? 'active' : ''}`}
//               onClick={() => goToPage(page)}
//             >
//               {page}
//             </button>
//           ))}
//           <button className="pagination-btn" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>›</button>
//           <button className="pagination-btn" onClick={() => goToPage(totalPages)} disabled={currentPage === totalPages}>»</button>
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
//     <div className="communication-list">
//       {/* ========== Header ========== */}
//       <div className="communication-list-header">
//         <div className="header-title">
//           <Mail size={24} />
//           <h2>مکاتبات</h2>
//           <span className="badge">{totalCount}</span>
//         </div>
//         {onAdd && (
//           <button className="btn-primary" onClick={onAdd}>
//             <Plus size={18} />
//             افزودن مکاتبه
//           </button>
//         )}
//       </div>

//       {/* ========== Search ========== */}
//       <div className="search-section">
//         <div className="search-input-wrapper">
//           <Search size={18} className="search-icon" />
//           <input
//             type="text"
//             placeholder="جستجو در عنوان، شماره، ارسال‌کننده و دریافت‌کننده..."
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

//       {/* ========== Filter Panel ========== */}
//       {showFilters && (
//         <div className="filter-panel">
//           <div className="filter-grid">
//             {/* ✅ فیلتر پژوهش به صورت لیست کشویی */}
//             <div className="filter-group">
//               <label>پژوهش</label>
//               <select
//                 value={filters.research || ''}
//                 onChange={(e) =>
//                   handleFilterChange('research', e.target.value ? Number(e.target.value) : undefined)
//                 }
//               >
//                 <option value="">همه پژوهش‌ها</option>
//                 {researches.map((research) => (
//                   <option key={research.id} value={research.id}>
//                     {research.code} - {research.title}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* ✅ فیلتر از تاریخ شمسی */}
//             <div className="filter-group">
//               <label>از تاریخ</label>
//               <JalaliDatePicker
//                 value={filters.from_date || null}
//                 onChange={(date) => handleFilterChange('from_date', date)}
//                 placeholder="1402/01/01"
//                 label=""
//               />
//             </div>

//             {/* ✅ فیلتر تا تاریخ شمسی */}
//             <div className="filter-group">
//               <label>تا تاریخ</label>
//               <JalaliDatePicker
//                 value={filters.to_date || null}
//                 onChange={(date) => handleFilterChange('to_date', date)}
//                 placeholder="1402/12/29"
//                 label=""
//               />
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ========== Table ========== */}
//       {communications.length === 0 ? (
//         <div className="empty-state">
//           <Mail size={48} />
//           <h5>هیچ مکاتبه‌ای یافت نشد</h5>
//           <p className="text-muted">
//             {hasActiveFilters
//               ? 'با فیلترهای انتخاب شده موردی پیدا نشد'
//               : 'هنوز مکاتبه‌ای ثبت نشده است'}
//           </p>
//         </div>
//       ) : (
//         <>
//           <div className="table-responsive">
//             <table className="communication-table">
//               <thead>
//                 <tr>
//                   <th onClick={() => handleSort('letter_number')} className="sortable">
//                     شماره
//                     {sortField === 'letter_number' && (
//                       <span className="sort-icon">{sortOrder === 'asc' ? '▲' : '▼'}</span>
//                     )}
//                   </th>
//                   <th onClick={() => handleSort('title')} className="sortable">
//                     عنوان
//                     {sortField === 'title' && (
//                       <span className="sort-icon">{sortOrder === 'asc' ? '▲' : '▼'}</span>
//                     )}
//                   </th>
//                   <th>ارسال‌کننده</th>
//                   <th>دریافت‌کننده</th>
//                   <th onClick={() => handleSort('date')} className="sortable">
//                     تاریخ مکاتبه
//                     {sortField === 'date' && (
//                       <span className="sort-icon">{sortOrder === 'asc' ? '▲' : '▼'}</span>
//                     )}
//                   </th>
//                   <th>تاریخ ارسال/دریافت</th>
//                   <th>پژوهش</th>
//                   <th>فایل‌ها</th>
//                   <th style={{ width: 120 }}>عملیات</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {communications.map((communication) => (
//                   <tr key={communication.id}>
//                     <td>
//                       {communication.letter_number ? (
//                         <div className="letter-number-cell">
//                           <Hash size={14} />
//                           <span>{communication.letter_number}</span>
//                         </div>
//                       ) : (
//                         <span className="text-muted">—</span>
//                       )}
//                     </td>
//                     <td>
//                       <div className="title-cell">
//                         <Mail size={14} />
//                         <span className="title">{communication.title}</span>
//                       </div>
//                     </td>
//                     <td>
//                       <div className="sender-cell">
//                         <User size={14} />
//                         {communication.sender}
//                       </div>
//                     </td>
//                     <td>
//                       <div className="receiver-cell">
//                         <User size={14} />
//                         {communication.receiver}
//                       </div>
//                     </td>
//                     <td>
//                       <div className="date-cell">
//                         <Calendar size={14} />
//                         {communication.date}
//                       </div>
//                     </td>
//                     <td>
//                       {communication.send_receive_date ? (
//                         <div className="date-cell">
//                           <Calendar size={14} />
//                           {communication.send_receive_date}
//                         </div>
//                       ) : (
//                         <span className="text-muted">—</span>
//                       )}
//                     </td>
//                     <td>
//                       {communication.research_code ? (
//                         <div className="research-cell">
//                           <BookOpen size={14} />
//                           <span className="research-code">{communication.research_code}</span>
//                         </div>
//                       ) : (
//                         <span className="text-muted">—</span>
//                       )}
//                     </td>
//                     <td>
//                       <div className="files-cell">
//                         {communication.attachment || communication.letter_file ? (
//                           <div className="file-icons">
//                             {communication.attachment && (
//                               <a
//                                 href={communication.attachment}
//                                 target="_blank"
//                                 rel="noopener noreferrer"
//                                 className="file-link"
//                                 title={`پیوست: ${getFileName(communication.attachment)}`}
//                               >
//                                 <Paperclip size={14} />
//                               </a>
//                             )}
//                             {communication.letter_file && (
//                               <a
//                                 href={communication.letter_file}
//                                 target="_blank"
//                                 rel="noopener noreferrer"
//                                 className="file-link letter"
//                                 title={`نامه: ${getFileName(communication.letter_file)}`}
//                               >
//                                 <FileText size={14} />
//                               </a>
//                             )}
//                           </div>
//                         ) : (
//                           <span className="text-muted">—</span>
//                         )}
//                       </div>
//                     </td>
//                     <td>
//                       <div className="actions">
//                         <button
//                           className="action-btn view"
//                           onClick={() => handleView(communication)}
//                           title="مشاهده"
//                         >
//                           <Eye size={16} />
//                         </button>
//                         <button
//                           className="action-btn edit"
//                           onClick={() => onEdit?.(communication)}
//                           title="ویرایش"
//                         >
//                           <Pencil size={16} />
//                         </button>
//                         <button
//                           className="action-btn delete"
//                           onClick={() => handleDelete(communication.id, communication.title)}
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
//         .communication-list {
//           background: white;
//           border-radius: 12px;
//           padding: 20px;
//           box-shadow: 0 1px 3px rgba(0,0,0,0.06);
//         }

//         .communication-list-header {
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
//           grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
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

//         .filter-group select,
//         .filter-group input {
//           padding: 8px 12px;
//           border: 1.5px solid #d1d5db;
//           border-radius: 6px;
//           font-size: 13px;
//           background: white;
//           width: 100%;
//         }

//         .filter-group select:focus,
//         .filter-group input:focus {
//           border-color: #4f46e5;
//           outline: none;
//           box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
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

//         .communication-table {
//           width: 100%;
//           border-collapse: collapse;
//         }

//         .communication-table thead th {
//           padding: 12px 16px;
//           text-align: right;
//           font-weight: 600;
//           font-size: 13px;
//           color: #6b7280;
//           border-bottom: 2px solid #e9ecef;
//         }

//         .communication-table tbody td {
//           padding: 12px 16px;
//           border-bottom: 1px solid #f3f4f6;
//           vertical-align: middle;
//         }

//         .communication-table tbody tr:hover {
//           background: #f8fafc;
//         }

//         .letter-number-cell {
//           display: flex;
//           align-items: center;
//           gap: 6px;
//           font-weight: 600;
//           color: #4f46e5;
//           font-size: 13px;
//         }

//         .title-cell {
//           display: flex;
//           align-items: center;
//           gap: 8px;
//         }

//         .title-cell .title {
//           font-weight: 500;
//           color: #1a1a2e;
//         }

//         .sender-cell,
//         .receiver-cell,
//         .research-cell {
//           display: flex;
//           align-items: center;
//           gap: 6px;
//           color: #374151;
//           font-size: 13px;
//         }

//         .research-code {
//           font-weight: 600;
//           color: #4f46e5;
//           background: #eef2ff;
//           padding: 2px 8px;
//           border-radius: 4px;
//           font-size: 12px;
//         }

//         .date-cell {
//           display: flex;
//           align-items: center;
//           gap: 6px;
//           font-size: 13px;
//           color: #6b7280;
//           direction: ltr;
//         }

//         .files-cell {
//           display: flex;
//           align-items: center;
//           gap: 4px;
//         }

//         .file-icons {
//           display: flex;
//           gap: 4px;
//         }

//         .file-link {
//           display: inline-flex;
//           align-items: center;
//           justify-content: center;
//           width: 28px;
//           height: 28px;
//           border-radius: 4px;
//           background: #eef2ff;
//           color: #4f46e5;
//           transition: all 0.2s;
//           text-decoration: none;
//         }

//         .file-link:hover {
//           background: #dbeafe;
//           color: #4338ca;
//         }

//         .file-link.letter {
//           background: #fef3c7;
//           color: #d97706;
//         }

//         .file-link.letter:hover {
//           background: #fde68a;
//         }

//         .text-muted {
//           color: #9ca3af;
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

//         @media (max-width: 768px) {
//           .communication-list { padding: 12px; }
//           .search-section { flex-direction: column; }
//           .filter-actions { width: 100%; }
//           .filter-actions button { flex: 1; justify-content: center; }
//           .filter-grid { grid-template-columns: 1fr; }
//           .communication-table { font-size: 13px; }
//           .communication-table thead th,
//           .communication-table tbody td { padding: 8px 10px; }
//           .actions { flex-direction: column; gap: 2px; }
//           .pagination-container { flex-direction: column; align-items: center; }
//         }
//       `}</style>
//     </div>
//   );
// };

// export default CommunicationList;

// // // src/modules/communication/components/CommunicationList.tsx

// // import React, { useState, useEffect } from 'react';
// // import { useCommunication } from '../hooks/useCommunication';
// // import { type Communication } from '../types/communication.types';
// // import dateUtils from '@utils/dateUtils';
// // import {
// //   Plus,
// //   Pencil,
// //   Trash2,
// //   Eye,
// //   Filter,
// //   X,
// //   Search,
// //   FileText,
// //   Mail,
// //   Building2,
// //   BookOpen,
// //   Paperclip,
// //   Calendar,
// //   User,
// //   ChevronLeft,
// //   ChevronRight,
// // } from 'lucide-react';

// // interface CommunicationListProps {
// //   onEdit?: (item: Communication) => void;
// //   onDelete?: (id: number) => void;
// //   onView?: (item: Communication) => void;
// //   onAdd?: () => void;
// // }

// // export const CommunicationList: React.FC<CommunicationListProps> = ({
// //   onEdit,
// //   onDelete,
// //   onView,
// //   onAdd,
// // }) => {
// //   const { useList, delete: deleteCommunication, isDeleting } = useCommunication();

// //   //  اصلاح: اضافه کردن research_id به تایپ فیلترها
// //   const [filters, setFilters] = useState<{
// //     search?: string;
// //     research_id?: string;
// //   }>({});
// //   const [searchTerm, setSearchTerm] = useState('');
// //   const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
// //   const [researchFilter, setResearchFilter] = useState<string>(''); //  اضافه شد
// //   const [debouncedResearchFilter, setDebouncedResearchFilter] = useState<string | undefined>(undefined); //  اضافه شد
// //   const [showFilters, setShowFilters] = useState(false);
// //   const [currentPage, setCurrentPage] = useState(1);
// //   const [pageSize, setPageSize] = useState(10);
// //   const [sortField, setSortField] = useState<string>('date');
// //   const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

// //   // Debounce برای جستجو
// //   useEffect(() => {
// //     const timer = setTimeout(() => {
// //       setDebouncedSearchTerm(searchTerm);
// //       setCurrentPage(1);
// //     }, 500);
// //     return () => clearTimeout(timer);
// //   }, [searchTerm]);

// //   //  Debounce برای فیلتر پژوهش
// //   useEffect(() => {
// //     const timer = setTimeout(() => {
// //       setDebouncedResearchFilter(researchFilter || undefined);
// //       setCurrentPage(1);
// //     }, 500);
// //     return () => clearTimeout(timer);
// //   }, [researchFilter]);

// //   const { data, isLoading, refetch } = useList({
// //     ...filters,
// //     search: debouncedSearchTerm || undefined,
// //     research: debouncedResearchFilter ? Number(debouncedResearchFilter) : undefined, //  ارسال به API
// //     page: currentPage,
// //     page_size: pageSize,
// //     ordering: sortOrder === 'desc' ? `-${sortField}` : sortField,
// //   });

// //   const communications = data?.results || [];
// //   const totalCount = data?.count || 0;
// //   const totalPages = Math.ceil(totalCount / pageSize);

// //   const handleDelete = async (id: number, title: string) => {
// //     if (window.confirm(`آیا از حذف مکاتبه "${title}" مطمئن هستید؟`)) {
// //       await deleteCommunication(id);
// //       refetch();
// //     }
// //   };

// //   const handleFilterChange = (key: string, value: any) => {
// //     setFilters(prev => ({
// //       ...prev,
// //       [key]: value === '' ? undefined : value,
// //     }));
// //     setCurrentPage(1);
// //   };

// //   const clearFilters = () => {
// //     setFilters({});
// //     setSearchTerm('');
// //     setDebouncedSearchTerm('');
// //     setResearchFilter('');
// //     setDebouncedResearchFilter(undefined);
// //     setCurrentPage(1);
// //   };

// //   const hasActiveFilters = searchTerm || researchFilter || Object.values(filters).some(v => v !== undefined);

// //   const handleSort = (field: string) => {
// //     if (sortField === field) {
// //       setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
// //     } else {
// //       setSortField(field);
// //       setSortOrder('asc');
// //     }
// //     setCurrentPage(1);
// //   };

// //   const goToPage = (page: number) => {
// //     if (page >= 1 && page <= totalPages) {
// //       setCurrentPage(page);
// //       window.scrollTo({ top: 0, behavior: 'smooth' });
// //     }
// //   };

// //   const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
// //     setPageSize(Number(e.target.value));
// //     setCurrentPage(1);
// //   };

// //   const renderPagination = () => {
// //     if (totalPages <= 1) return null;

// //     const pages = [];
// //     const maxVisible = 5;
// //     let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
// //     let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
// //     if (endPage - startPage < maxVisible - 1) {
// //       startPage = Math.max(1, endPage - maxVisible + 1);
// //     }

// //     for (let i = startPage; i <= endPage; i++) {
// //       pages.push(i);
// //     }

// //     return (
// //       <div className="pagination-container">
// //         <div className="pagination-info">
// //           نمایش {((currentPage - 1) * pageSize) + 1} تا{' '}
// //           {Math.min(currentPage * pageSize, totalCount)} از {totalCount} مورد
// //         </div>
// //         <div className="pagination-controls">
// //           <button className="pagination-btn" onClick={() => goToPage(1)} disabled={currentPage === 1}>
// //             <span className="double-chevron-left">«</span>
// //           </button>
// //           <button className="pagination-btn" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
// //             <span className="single-chevron-left">‹</span>
// //           </button>
// //           {pages.map((page) => (
// //             <button key={page} className={`pagination-btn ${page === currentPage ? 'active' : ''}`} onClick={() => goToPage(page)}>
// //               {page}
// //             </button>
// //           ))}
// //           <button className="pagination-btn" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
// //             <span className="single-chevron-right">›</span>
// //           </button>
// //           <button className="pagination-btn" onClick={() => goToPage(totalPages)} disabled={currentPage === totalPages}>
// //             <span className="double-chevron-right">»</span>
// //           </button>
// //         </div>
// //         <div className="page-size-selector">
// //           <label>تعداد در صفحه:</label>
// //           <select value={pageSize} onChange={handlePageSizeChange}>
// //             <option value={5}>۵</option>
// //             <option value={10}>۱۰</option>
// //             <option value={20}>۲۰</option>
// //             <option value={50}>۵۰</option>
// //           </select>
// //         </div>
// //       </div>
// //     );
// //   };

// //   const getFileIcon = (url: string | null | undefined) => {
// //     if (!url) return null;
// //     const ext = url.split('.').pop()?.toLowerCase();
// //     if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) {
// //       return 'image';
// //     }
// //     if (['pdf'].includes(ext || '')) {
// //       return 'pdf';
// //     }
// //     return 'file';
// //   };

// //   const getFileName = (url: string | null | undefined) => {
// //     if (!url) return '';
// //     try {
// //       const parts = url.split('/');
// //       return parts[parts.length - 1] || '';
// //     } catch {
// //       return '';
// //     }
// //   };

// //   if (isLoading) {
// //     return (
// //       <div className="text-center py-5">
// //         <div className="spinner-border text-primary" role="status">
// //           <span className="visually-hidden">در حال بارگذاری...</span>
// //         </div>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="communication-list">
// //       <div className="communication-list-header">
// //         <div className="header-title">
// //           <Mail size={24} />
// //           <h2>مکاتبات</h2>
// //           <span className="badge">{totalCount}</span>
// //         </div>
// //         {onAdd && (
// //           <button className="btn-primary" onClick={onAdd}>
// //             <Plus size={18} />
// //             افزودن مکاتبه
// //           </button>
// //         )}
// //       </div>

// //       <div className="search-section">
// //         <div className="search-input-wrapper">
// //           <Search size={18} className="search-icon" />
// //           <input
// //             type="text"
// //             placeholder="جستجو در عنوان، ارسال‌کننده و دریافت‌کننده..."
// //             value={searchTerm}
// //             onChange={(e) => setSearchTerm(e.target.value)}
// //             className="search-input"
// //           />
// //           {searchTerm && (
// //             <button className="clear-btn" onClick={() => setSearchTerm('')}>
// //               <X size={16} />
// //             </button>
// //           )}
// //         </div>

// //         <div className="filter-actions">
// //           <button
// //             className={`filter-toggle ${showFilters ? 'active' : ''}`}
// //             onClick={() => setShowFilters(!showFilters)}
// //           >
// //             <Filter size={16} />
// //             فیلترها
// //             {hasActiveFilters && <span className="badge-filter">•</span>}
// //           </button>
// //           {hasActiveFilters && (
// //             <button className="clear-filters" onClick={clearFilters}>
// //               <X size={14} />
// //               پاک کردن
// //             </button>
// //           )}
// //         </div>
// //       </div>

// //       {showFilters && (
// //         <div className="filter-panel">
// //           <div className="filter-grid">
// //             <div className="filter-group">
// //               <label>پژوهش</label>
// //               <input
// //                 type="text"
// //                 placeholder="کد یا شناسه پژوهش..."
// //                 value={researchFilter}
// //                 onChange={(e) => setResearchFilter(e.target.value)}
// //               />
// //               <small className="hint">کد پژوهش یا شناسه را وارد کنید</small>
// //             </div>
// //           </div>
// //         </div>
// //       )}

// //       {communications.length === 0 ? (
// //         <div className="empty-state">
// //           <Mail size={48} />
// //           <h5>هیچ مکاتبه‌ای یافت نشد</h5>
// //           <p className="text-muted">
// //             {hasActiveFilters ? 'با فیلترهای انتخاب شده موردی پیدا نشد' : 'هنوز مکاتبه‌ای ثبت نشده است'}
// //           </p>
// //         </div>
// //       ) : (
// //         <>
// //           <div className="table-responsive">
// //             <table className="communication-table">
// //               <thead>
// //                 <tr>
// //                   <th onClick={() => handleSort('title')} className="sortable">
// //                     عنوان
// //                     {sortField === 'title' && <span className="sort-icon">{sortOrder === 'asc' ? '▲' : '▼'}</span>}
// //                   </th>
// //                   <th onClick={() => handleSort('sender')} className="sortable">
// //                     ارسال‌کننده
// //                     {sortField === 'sender' && <span className="sort-icon">{sortOrder === 'asc' ? '▲' : '▼'}</span>}
// //                   </th>
// //                   <th onClick={() => handleSort('receiver')} className="sortable">
// //                     دریافت‌کننده
// //                     {sortField === 'receiver' && <span className="sort-icon">{sortOrder === 'asc' ? '▲' : '▼'}</span>}
// //                   </th>
// //                   <th onClick={() => handleSort('date')} className="sortable">
// //                     تاریخ
// //                     {sortField === 'date' && <span className="sort-icon">{sortOrder === 'asc' ? '▲' : '▼'}</span>}
// //                   </th>
// //                   <th>پژوهش</th>
// //                   <th>فایل‌ها</th>
// //                   <th style={{ width: 120 }}>عملیات</th>
// //                 </tr>
// //               </thead>
// //               <tbody>
// //                 {communications.map((communication) => (
// //                   <tr key={communication.id}>
// //                     <td>
// //                       <div className="title-cell">
// //                         <Mail size={14} />
// //                         <span className="title">{communication.title}</span>
// //                       </div>
// //                     </td>
// //                     <td>
// //                       <div className="sender-cell">
// //                         <User size={14} />
// //                         {communication.sender}
// //                       </div>
// //                     </td>
// //                     <td>
// //                       <div className="receiver-cell">
// //                         <User size={14} />
// //                         {communication.receiver}
// //                       </div>
// //                     </td>
// //                     <td>
// //                       <div className="date-cell">
// //                         <Calendar size={14} />
// //                         {communication.date}
// //                       </div>
// //                     </td>
// //                     <td>
// //                       {communication.research_code ? (
// //                         <div className="research-cell">
// //                           <BookOpen size={14} />
// //                           <span className="research-code">{communication.research_code}</span>
// //                           {communication.research_title && (
// //                             <span className="research-title"> - {communication.research_title}</span>
// //                           )}
// //                         </div>
// //                       ) : (
// //                         <span className="text-muted">—</span>
// //                       )}
// //                     </td>
// //                     <td>
// //                       <div className="files-cell">
// //                         {(communication.attachment || communication.letter_file) ? (
// //                           <div className="file-icons">
// //                             {communication.attachment && (
// //                               <a
// //                                 href={communication.attachment}
// //                                 target="_blank"
// //                                 rel="noopener noreferrer"
// //                                 className="file-link"
// //                                 title={`پیوست: ${getFileName(communication.attachment)}`}
// //                               >
// //                                 <Paperclip size={14} />
// //                               </a>
// //                             )}
// //                             {communication.letter_file && (
// //                               <a
// //                                 href={communication.letter_file}
// //                                 target="_blank"
// //                                 rel="noopener noreferrer"
// //                                 className="file-link letter"
// //                                 title={`نامه: ${getFileName(communication.letter_file)}`}
// //                               >
// //                                 <FileText size={14} />
// //                               </a>
// //                             )}
// //                           </div>
// //                         ) : (
// //                           <span className="text-muted">—</span>
// //                         )}
// //                       </div>
// //                     </td>
// //                     <td>
// //                       <div className="actions">
// //                         {/* <button className="action-btn view" onClick={() => onView?.(communication)} title="مشاهده">
// //                           <Eye size={16} />
// //                         </button> */}
// //                         <button className="action-btn edit" onClick={() => onEdit?.(communication)} title="ویرایش">
// //                           <Pencil size={16} />
// //                         </button>
// //                         <button className="action-btn delete" onClick={() => handleDelete(communication.id, communication.title)} disabled={isDeleting} title="حذف">
// //                           <Trash2 size={16} />
// //                         </button>
// //                       </div>
// //                     </td>
// //                   </tr>
// //                 ))}
// //               </tbody>
// //             </table>
// //           </div>
// //           {renderPagination()}
// //         </>
// //       )}

// //       <style>{`
// //         .communication-list {
// //           background: white;
// //           border-radius: 12px;
// //           padding: 20px;
// //           box-shadow: 0 1px 3px rgba(0,0,0,0.06);
// //         }

// //         .communication-list-header {
// //           display: flex;
// //           justify-content: space-between;
// //           align-items: center;
// //           margin-bottom: 20px;
// //         }

// //         .header-title {
// //           display: flex;
// //           align-items: center;
// //           gap: 12px;
// //         }

// //         .header-title h2 {
// //           margin: 0;
// //           font-size: 20px;
// //           font-weight: 600;
// //         }

// //         .header-title .badge {
// //           background: #eef2ff;
// //           color: #4f46e5;
// //           padding: 2px 10px;
// //           border-radius: 12px;
// //           font-size: 12px;
// //           font-weight: 600;
// //         }

// //         .btn-primary {
// //           display: inline-flex;
// //           align-items: center;
// //           gap: 8px;
// //           padding: 8px 20px;
// //           background: #4f46e5;
// //           color: white;
// //           border: none;
// //           border-radius: 8px;
// //           font-weight: 500;
// //           cursor: pointer;
// //           transition: all 0.2s;
// //         }

// //         .btn-primary:hover {
// //           background: #4338ca;
// //           transform: translateY(-1px);
// //           box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
// //         }

// //         .search-section {
// //           display: flex;
// //           gap: 12px;
// //           margin-bottom: 16px;
// //         }

// //         .search-input-wrapper {
// //           flex: 1;
// //           position: relative;
// //         }

// //         .search-input {
// //           width: 100%;
// //           padding: 8px 40px 8px 12px;
// //           border: 1.5px solid #e9ecef;
// //           border-radius: 8px;
// //           font-size: 14px;
// //           transition: all 0.2s;
// //         }

// //         .search-input:focus {
// //           border-color: #4f46e5;
// //           outline: none;
// //           box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
// //         }

// //         .search-icon {
// //           position: absolute;
// //           right: 12px;
// //           top: 50%;
// //           transform: translateY(-50%);
// //           color: #9ca3af;
// //         }

// //         .clear-btn {
// //           position: absolute;
// //           left: 12px;
// //           top: 50%;
// //           transform: translateY(-50%);
// //           background: none;
// //           border: none;
// //           color: #9ca3af;
// //           cursor: pointer;
// //           padding: 4px;
// //         }

// //         .clear-btn:hover {
// //           color: #ef4444;
// //         }

// //         .filter-actions {
// //           display: flex;
// //           gap: 8px;
// //         }

// //         .filter-toggle {
// //           display: inline-flex;
// //           align-items: center;
// //           gap: 6px;
// //           padding: 8px 16px;
// //           border: 1.5px solid #e9ecef;
// //           border-radius: 8px;
// //           background: white;
// //           color: #6b7280;
// //           font-size: 14px;
// //           cursor: pointer;
// //           transition: all 0.2s;
// //         }

// //         .filter-toggle:hover {
// //           border-color: #4f46e5;
// //           color: #4f46e5;
// //         }

// //         .filter-toggle.active {
// //           border-color: #4f46e5;
// //           background: #eef2ff;
// //           color: #4f46e5;
// //         }

// //         .badge-filter {
// //           color: #4f46e5;
// //           font-size: 18px;
// //         }

// //         .clear-filters {
// //           display: inline-flex;
// //           align-items: center;
// //           gap: 4px;
// //           padding: 8px 12px;
// //           border: none;
// //           background: #fee2e2;
// //           color: #dc2626;
// //           border-radius: 8px;
// //           font-size: 13px;
// //           cursor: pointer;
// //           transition: all 0.2s;
// //         }

// //         .clear-filters:hover {
// //           background: #fecaca;
// //         }

// //         .filter-panel {
// //           padding: 16px;
// //           margin-bottom: 16px;
// //           background: #f8fafc;
// //           border-radius: 8px;
// //         }

// //         .filter-grid {
// //           display: grid;
// //           grid-template-columns: 1fr;
// //           gap: 16px;
// //           max-width: 400px;
// //         }

// //         .filter-group {
// //           display: flex;
// //           flex-direction: column;
// //           gap: 4px;
// //         }

// //         .filter-group label {
// //           font-size: 12px;
// //           font-weight: 500;
// //           color: #374151;
// //         }

// //         .filter-group input {
// //           padding: 8px 12px;
// //           border: 1.5px solid #d1d5db;
// //           border-radius: 6px;
// //           font-size: 13px;
// //           width: 100%;
// //         }

// //         .filter-group input:focus {
// //           border-color: #4f46e5;
// //           outline: none;
// //           box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
// //         }

// //         .hint {
// //           font-size: 11px;
// //           color: #6b7280;
// //           margin-top: 2px;
// //         }

// //         .sortable {
// //           cursor: pointer;
// //           user-select: none;
// //           transition: all 0.2s;
// //         }

// //         .sortable:hover {
// //           color: #4f46e5;
// //         }

// //         .sort-icon {
// //           display: inline-block;
// //           margin-right: 4px;
// //           font-size: 11px;
// //           color: #4f46e5;
// //         }

// //         .communication-table {
// //           width: 100%;
// //           border-collapse: collapse;
// //         }

// //         .communication-table thead th {
// //           padding: 12px 16px;
// //           text-align: right;
// //           font-weight: 600;
// //           font-size: 13px;
// //           color: #6b7280;
// //           border-bottom: 2px solid #e9ecef;
// //         }

// //         .communication-table tbody td {
// //           padding: 12px 16px;
// //           border-bottom: 1px solid #f3f4f6;
// //           vertical-align: middle;
// //         }

// //         .communication-table tbody tr:hover {
// //           background: #f8fafc;
// //         }

// //         .title-cell {
// //           display: flex;
// //           align-items: center;
// //           gap: 8px;
// //         }

// //         .title-cell .title {
// //           font-weight: 500;
// //           color: #1a1a2e;
// //         }

// //         .sender-cell,
// //         .receiver-cell,
// //         .research-cell {
// //           display: flex;
// //           align-items: center;
// //           gap: 6px;
// //           color: #374151;
// //           font-size: 13px;
// //         }

// //         .research-code {
// //           font-weight: 600;
// //           color: #4f46e5;
// //           background: #eef2ff;
// //           padding: 2px 8px;
// //           border-radius: 4px;
// //           font-size: 12px;
// //         }

// //         .research-title {
// //           color: #6b7280;
// //           font-size: 12px;
// //         }

// //         .date-cell {
// //           display: flex;
// //           align-items: center;
// //           gap: 6px;
// //           font-size: 13px;
// //           color: #6b7280;
// //           direction: ltr;
// //         }

// //         .files-cell {
// //           display: flex;
// //           align-items: center;
// //           gap: 4px;
// //         }

// //         .file-icons {
// //           display: flex;
// //           gap: 4px;
// //         }

// //         .file-link {
// //           display: inline-flex;
// //           align-items: center;
// //           justify-content: center;
// //           width: 28px;
// //           height: 28px;
// //           border-radius: 4px;
// //           background: #eef2ff;
// //           color: #4f46e5;
// //           transition: all 0.2s;
// //           text-decoration: none;
// //         }

// //         .file-link:hover {
// //           background: #dbeafe;
// //           color: #4338ca;
// //         }

// //         .file-link.letter {
// //           background: #fef3c7;
// //           color: #d97706;
// //         }

// //         .file-link.letter:hover {
// //           background: #fde68a;
// //         }

// //         .text-muted {
// //           color: #9ca3af;
// //         }

// //         .actions {
// //           display: flex;
// //           gap: 4px;
// //         }

// //         .action-btn {
// //           width: 32px;
// //           height: 32px;
// //           border: none;
// //           border-radius: 6px;
// //           display: inline-flex;
// //           align-items: center;
// //           justify-content: center;
// //           cursor: pointer;
// //           transition: all 0.2s;
// //           background: transparent;
// //           color: #6b7280;
// //         }

// //         .action-btn:hover {
// //           background: #f3f4f6;
// //         }

// //         .action-btn.view:hover {
// //           background: #d1fae5;
// //           color: #059669;
// //         }

// //         .action-btn.edit:hover {
// //           background: #eef2ff;
// //           color: #4f46e5;
// //         }

// //         .action-btn.delete:hover {
// //           background: #fee2e2;
// //           color: #dc2626;
// //         }

// //         .action-btn:disabled {
// //           opacity: 0.5;
// //           cursor: not-allowed;
// //         }

// //         .empty-state {
// //           text-align: center;
// //           padding: 40px;
// //         }

// //         .empty-state svg {
// //           color: #d1d5db;
// //           margin-bottom: 12px;
// //         }

// //         .empty-state h5 {
// //           margin-bottom: 4px;
// //           color: #374151;
// //         }

// //         .pagination-container {
// //           display: flex;
// //           justify-content: space-between;
// //           align-items: center;
// //           flex-wrap: wrap;
// //           gap: 16px;
// //           padding: 16px 0;
// //           border-top: 1px solid #e9ecef;
// //           margin-top: 16px;
// //         }

// //         .pagination-info {
// //           font-size: 14px;
// //           color: #6b7280;
// //         }

// //         .pagination-controls {
// //           display: flex;
// //           align-items: center;
// //           gap: 4px;
// //         }

// //         .pagination-btn {
// //           display: inline-flex;
// //           align-items: center;
// //           justify-content: center;
// //           min-width: 36px;
// //           height: 36px;
// //           padding: 0 8px;
// //           border: 1px solid #e9ecef;
// //           border-radius: 6px;
// //           background: white;
// //           color: #374151;
// //           font-size: 14px;
// //           cursor: pointer;
// //           transition: all 0.2s;
// //         }

// //         .pagination-btn:hover:not(:disabled) {
// //           background: #f3f4f6;
// //           border-color: #d1d5db;
// //         }

// //         .pagination-btn.active {
// //           background: #4f46e5;
// //           border-color: #4f46e5;
// //           color: white;
// //           font-weight: 600;
// //         }

// //         .pagination-btn:disabled {
// //           opacity: 0.4;
// //           cursor: not-allowed;
// //         }

// //         .page-size-selector {
// //           display: flex;
// //           align-items: center;
// //           gap: 8px;
// //           font-size: 14px;
// //           color: #6b7280;
// //         }

// //         .page-size-selector select {
// //           padding: 4px 8px;
// //           border: 1px solid #e9ecef;
// //           border-radius: 4px;
// //           font-size: 14px;
// //           background: white;
// //           cursor: pointer;
// //         }

// //         .double-chevron-right,
// //         .double-chevron-left,
// //         .single-chevron-right,
// //         .single-chevron-left {
// //           font-size: 18px;
// //           font-weight: 700;
// //           line-height: 1;
// //           display: inline-block;
// //           color: inherit;
// //         }

// //         .double-chevron-right,
// //         .double-chevron-left {
// //           font-size: 16px;
// //         }

// //         .single-chevron-right,
// //         .single-chevron-left {
// //           font-size: 20px;
// //         }

// //         @media (max-width: 768px) {
// //           .communication-list {
// //             padding: 12px;
// //           }

// //           .search-section {
// //             flex-direction: column;
// //           }

// //           .filter-actions {
// //             width: 100%;
// //           }

// //           .filter-actions button {
// //             flex: 1;
// //             justify-content: center;
// //           }

// //           .filter-grid {
// //             grid-template-columns: 1fr;
// //             max-width: 100%;
// //           }

// //           .communication-table {
// //             font-size: 13px;
// //           }

// //           .communication-table thead th,
// //           .communication-table tbody td {
// //             padding: 8px 10px;
// //           }

// //           .actions {
// //             flex-direction: column;
// //             gap: 2px;
// //           }

// //           .pagination-container {
// //             flex-direction: column;
// //             align-items: center;
// //           }

// //           .pagination-info {
// //             text-align: center;
// //           }

// //           .pagination-controls {
// //             flex-wrap: wrap;
// //             justify-content: center;
// //           }
// //         }
// //       `}</style>
// //     </div>
// //   );
// // };

// // export default CommunicationList;