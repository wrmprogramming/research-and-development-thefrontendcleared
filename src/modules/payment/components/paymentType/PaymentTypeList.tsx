// src/modules/payment/components/paymentType/PaymentTypeList.tsx

import React, { useState } from 'react';
import { usePaymentType } from '../../hooks/usePaymentType';
import type { PaymentType, PaymentTypeFilters } from '../../types/paymentType.types';
import { toPersianNumber } from '../../../../utils/formatter.utils';

import {
  Plus,
  Pencil,
  Trash2,
  Filter,
  X,
  FileText,
  CheckCircle,
  XCircle,
} from 'lucide-react';

import {
  Pagination,
  SearchBar,
  FilterPanel,
  DataTable,
  type Column,
  type FilterField,
} from '../../../../components/common';

interface PaymentTypeListProps {
  onEdit?: (item: PaymentType) => void;
  onDelete?: (id: number) => void;
  onAdd?: () => void;
}

export const PaymentTypeList: React.FC<PaymentTypeListProps> = ({
  onEdit,
  onDelete,
  onAdd,
}) => {
  const { useList, delete: deletePaymentType, isDeleting } = usePaymentType();

  const [filters, setFilters] = useState<PaymentTypeFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading, refetch } = useList({
    ...filters,
    search: searchTerm || undefined,
  });

  // ✅ داده ممکنه آرایه یا PaginatedResponse باشه
  const items = Array.isArray(data) ? data : (data as any)?.results || [];
  const totalCount = items.length;

  const handleDelete = async (id: number) => {
    if (window.confirm('آیا از حذف این نوع پرداخت مطمئن هستید؟')) {
      await deletePaymentType(id);
      refetch();
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (key: string, value: any) => {
    let finalValue = value;
    if (key === 'is_active') {
      if (value === 'true') finalValue = true;
      else if (value === 'false') finalValue = false;
      else finalValue = undefined;
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

  // ========== Columns ==========
  const columns: Column<PaymentType>[] = [
    {
      key: 'name',
      title: 'نام',
      render: (item) => <span className="item-name">{item.name}</span>,
    },
    {
      key: 'code',
      title: 'کد',
      render: (item) => <span className="item-code">{item.code}</span>,
    },
    {
      key: 'description',
      title: 'توضیحات',
      render: (item) => (
        <span className="item-description">{item.description || '—'}</span>
      ),
    },
    {
      key: 'is_active',
      title: 'وضعیت',
      render: (item) => (
        <span
          className={`status-badge ${item.is_active !== false ? 'active' : 'inactive'}`}
        >
          {item.is_active !== false ? (
            <>
              <CheckCircle size={12} />
              فعال
            </>
          ) : (
            <>
              <XCircle size={12} />
              غیرفعال
            </>
          )}
        </span>
      ),
    },
    {
      key: 'actions',
      title: 'عملیات',
      width: 120,
      render: (item) => (
        <div className="actions">
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

  // ========== Filter Fields ==========
  const filterFields: FilterField[] = [
    {
      key: 'is_active',
      label: 'وضعیت',
      type: 'select',
      options: [
        { value: 'true', label: 'فعال' },
        { value: 'false', label: 'غیرفعال' },
      ],
    },
  ];

  return (
    <div className="payment-type-list">
      <div className="payment-type-list-header">
        <div className="header-title">
          <FileText size={24} />
          <h2>انواع پرداخت</h2>
          <span className="badge">{toPersianNumber(totalCount)}</span>
        </div>
        {onAdd && (
          <button className="btn-primary" onClick={onAdd}>
            <Plus size={18} />
            افزودن نوع پرداخت
          </button>
        )}
      </div>

      <div className="search-section">
        <SearchBar
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="جستجو در نام و کد..."
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
        data={items}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        emptyMessage={
          hasActiveFilters
            ? 'با فیلترهای انتخاب شده موردی پیدا نشد'
            : 'هنوز نوع پرداختی ثبت نشده است'
        }
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
        .payment-type-list { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
        .payment-type-list-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .header-title { display: flex; align-items: center; gap: 12px; }
        .header-title h2 { margin: 0; font-size: 20px; font-weight: 600; }
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
        .item-name { font-weight: 500; color: #1a1a2e; }
        .item-code { font-family: monospace; background: #f3f4f6; padding: 2px 8px; border-radius: 4px; font-size: 12px; color: #374151; }
        .item-description { color: #6b7280; font-size: 13px; }
        .status-badge { display: inline-flex; align-items: center; gap: 4px; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; }
        .status-badge.active { background: #d1fae5; color: #059669; }
        .status-badge.inactive { background: #fee2e2; color: #dc2626; }
        .actions { display: flex; gap: 4px; }
        .action-btn { width: 32px; height: 32px; border: none; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; background: transparent; color: #6b7280; }
        .action-btn:hover { background: #f3f4f6; }
        .action-btn.edit:hover { background: #eef2ff; color: #4f46e5; }
        .action-btn.delete:hover { background: #fee2e2; color: #dc2626; }
        .action-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        @media (max-width: 768px) {
          .payment-type-list { padding: 12px; }
          .search-section { flex-direction: column; }
          .filter-actions { width: 100%; }
          .filter-actions button { flex: 1; justify-content: center; }
        }
      `}</style>
    </div>
  );
};

export default PaymentTypeList;
// // src/modules/payment/components/paymentType/PaymentTypeList.tsx
// import React, { useState } from 'react';
// import { usePaymentType } from '../../hooks/usePaymentType';
// import type { PaymentType } from '../../types/paymentType.types';
// import {
//   Search,
//   Plus,
//   Pencil,
//   Trash2,
//   Filter,
//   X,
//   FileText,
//   CheckCircle,
//   XCircle,
// } from 'lucide-react';

// interface PaymentTypeListProps {
//   onEdit?: (item: PaymentType) => void;
//   onDelete?: (id: number) => void;
//   onAdd?: () => void;
// }

// export const PaymentTypeList: React.FC<PaymentTypeListProps> = ({
//   onEdit,
//   onDelete,
//   onAdd,
// }) => {
//   const { useList, delete: deletePaymentType, isDeleting } = usePaymentType();
//   const [filters, setFilters] = useState<{ search?: string; is_active?: boolean }>({});
//   const [searchTerm, setSearchTerm] = useState('');
//   const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
//   const [showFilters, setShowFilters] = useState(false);

//   React.useEffect(() => {
//     const timer = setTimeout(() => {
//       setDebouncedSearchTerm(searchTerm);
//     }, 500);
//     return () => clearTimeout(timer);
//   }, [searchTerm]);

//   const { data: items = [], isLoading, refetch } = useList({
//     ...filters,
//     search: debouncedSearchTerm || undefined,
//   });

//   const handleDelete = async (id: number) => {
//     if (window.confirm('آیا از حذف این نوع پرداخت مطمئن هستید؟')) {
//       await deletePaymentType(id);
//       refetch();
//     }
//   };

//   const clearFilters = () => {
//     setFilters({});
//     setSearchTerm('');
//     setDebouncedSearchTerm('');
//   };

//   const hasActiveFilters = searchTerm || Object.values(filters).some(v => v !== undefined);

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
//     <div className="payment-type-list">
//       <div className="payment-type-list-header">
//         <div className="header-title">
//           <FileText size={24} />
//           <h2>انواع پرداخت</h2>
//           <span className="badge">{items.length}</span>
//         </div>
//         {onAdd && (
//           <button className="btn-primary" onClick={onAdd}>
//             <Plus size={18} />
//             افزودن نوع پرداخت
//           </button>
//         )}
//       </div>

//       <div className="search-section">
//         <div className="search-input-wrapper">
//           <Search size={18} className="search-icon" />
//           <input
//             type="text"
//             placeholder="جستجو در نام و کد..."
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
//               <label>وضعیت</label>
//               <select
//                 value={filters.is_active === undefined ? '' : filters.is_active ? 'active' : 'inactive'}
//                 onChange={(e) => {
//                   const val = e.target.value;
//                   setFilters(prev => ({
//                     ...prev,
//                     is_active: val === '' ? undefined : val === 'active',
//                   }));
//                 }}
//               >
//                 <option value="">همه</option>
//                 <option value="active">فعال</option>
//                 <option value="inactive">غیرفعال</option>
//               </select>
//             </div>
//           </div>
//         </div>
//       )}

//       {items.length === 0 ? (
//         <div className="empty-state">
//           <FileText size={48} />
//           <h5>هیچ نوع پرداختی یافت نشد</h5>
//           <p className="text-muted">
//             {hasActiveFilters ? 'با فیلترهای انتخاب شده موردی پیدا نشد' : 'هنوز نوع پرداختی ثبت نشده است'}
//           </p>
//         </div>
//       ) : (
//         <div className="table-responsive">
//           <table className="payment-type-table">
//             <thead>
//               <tr>
//                 <th>نام</th>
//                 <th>کد</th>
//                 <th>توضیحات</th>
//                 <th>وضعیت</th>
//                 <th style={{ width: 120 }}>عملیات</th>
//               </tr>
//             </thead>
//             <tbody>
//               {items.map((item) => (
//                 <tr key={item.id}>
//                   <td>
//                     <span className="item-name">{item.name}</span>
//                   </td>
//                   <td>
//                     <span className="item-code">{item.code}</span>
//                   </td>
//                   <td>
//                     <span className="item-description">
//                       {item.description || '—'}
//                     </span>
//                   </td>
//                   <td>
//                     <span
//                       className={`status-badge ${item.is_active !== false ? 'active' : 'inactive'}`}
//                     >
//                       {item.is_active !== false ? (
//                         <>
//                           <CheckCircle size={12} />
//                           فعال
//                         </>
//                       ) : (
//                         <>
//                           <XCircle size={12} />
//                           غیرفعال
//                         </>
//                       )}
//                     </span>
//                   </td>
//                   <td>
//                     <div className="actions">
//                       <button
//                         className="action-btn edit"
//                         onClick={() => onEdit?.(item)}
//                         title="ویرایش"
//                       >
//                         <Pencil size={16} />
//                       </button>
//                       <button
//                         className="action-btn delete"
//                         onClick={() => handleDelete(item.id)}
//                         disabled={isDeleting}
//                         title="حذف"
//                       >
//                         <Trash2 size={16} />
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}

//       <style>{`
//         .payment-type-list {
//           background: white;
//           border-radius: 12px;
//           padding: 20px;
//           box-shadow: 0 1px 3px rgba(0,0,0,0.06);
//         }

//         .payment-type-list-header {
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

//         .badge {
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
//         }

//         .payment-type-table {
//           width: 100%;
//           border-collapse: collapse;
//         }

//         .payment-type-table thead th {
//           padding: 12px 16px;
//           text-align: right;
//           font-weight: 600;
//           font-size: 13px;
//           color: #6b7280;
//           border-bottom: 2px solid #e9ecef;
//         }

//         .payment-type-table tbody td {
//           padding: 12px 16px;
//           border-bottom: 1px solid #f3f4f6;
//           vertical-align: middle;
//         }

//         .payment-type-table tbody tr:hover {
//           background: #f8fafc;
//         }

//         .item-name {
//           font-weight: 500;
//           color: #1a1a2e;
//         }

//         .item-code {
//           font-family: monospace;
//           background: #f3f4f6;
//           padding: 2px 8px;
//           border-radius: 4px;
//           font-size: 12px;
//           color: #374151;
//         }

//         .item-description {
//           color: #6b7280;
//           font-size: 13px;
//         }

//         .status-badge {
//           display: inline-flex;
//           align-items: center;
//           gap: 4px;
//           padding: 4px 12px;
//           border-radius: 20px;
//           font-size: 12px;
//           font-weight: 500;
//         }

//         .status-badge.active {
//           background: #d1fae5;
//           color: #059669;
//         }

//         .status-badge.inactive {
//           background: #fee2e2;
//           color: #dc2626;
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

//         @media (max-width: 768px) {
//           .payment-type-list {
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

//           .payment-type-table {
//             font-size: 13px;
//           }

//           .payment-type-table thead th,
//           .payment-type-table tbody td {
//             padding: 8px 10px;
//           }
//         }
//       `}</style>
//     </div>
//   );
// };

// export default PaymentTypeList;