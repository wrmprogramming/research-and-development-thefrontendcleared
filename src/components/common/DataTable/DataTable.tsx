// src/components/common/DataTable/DataTable.tsx

import React from 'react';
import './DataTable.css';

export interface Column<T> {
  /** کلید فیلد در داده */
  key: string;
  /** عنوان ستون */
  title: string;
  /** تابع رندر سفارشی برای ستون */
  render?: (item: T, index: number) => React.ReactNode;
  /** عرض ستون */
  width?: number | string;
  /** آیا ستون قابل مرتب‌سازی است */
  sortable?: boolean;
  /** کلاس‌های اضافی برای ستون */
  className?: string;
}

interface DataTableProps<T> {
  /** داده‌های جدول */
  data: T[];
  /** تعریف ستون‌ها */
  columns: Column<T>[];
  /** کلید یکتا برای هر ردیف */
  rowKey: keyof T | ((item: T) => string | number);
  /** کلاس‌های اضافی */
  className?: string;
  /** تابع برای رندر سفارشی ردیف */
  onRowClick?: (item: T) => void;
  /** وضعیت بارگذاری */
  loading?: boolean;
  /** پیام در صورت خالی بودن داده */
  emptyMessage?: string;
  /** ✅ فیلد فعلی مرتب‌سازی */
  sortField?: string;
  /** ✅ جهت مرتب‌سازی */
  sortOrder?: 'asc' | 'desc';
  /** ✅ تابع مرتب‌سازی */
  onSort?: (field: string) => void;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  rowKey,
  className = '',
  onRowClick,
  loading = false,
  emptyMessage = 'هیچ داده‌ای یافت نشد',
  sortField,
  sortOrder,
  onSort,
}: DataTableProps<T>) {
  // دریافت کلید ردیف
  const getRowKey = (item: T, index: number): string | number => {
    if (typeof rowKey === 'function') {
      return rowKey(item);
    }
    return item[rowKey] ?? index;
  };

  // ✅ هندلر کلیک روی هدر
  const handleHeaderClick = (col: Column<T>) => {
    if (col.sortable && onSort) {
      onSort(col.key);
    }
  };

  if (loading) {
    return (
      <div className="data-table-loading">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">در حال بارگذاری...</span>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="data-table-empty">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`data-table-wrapper ${className}`}>
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col) => {
                const isSorted = sortField === col.key;
                return (
                  <th
                    key={col.key}
                    className={`${col.sortable ? 'sortable' : ''} ${col.className || ''}`}
                    style={{ width: col.width }}
                    onClick={() => handleHeaderClick(col)}
                  >
                    {col.title}
                    {isSorted && (
                      <span className="sort-icon">
                        {sortOrder === 'asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr
                key={getRowKey(item, index)}
                onClick={() => onRowClick?.(item)}
                className={onRowClick ? 'clickable' : ''}
              >
                {columns.map((col) => (
                  <td key={`${getRowKey(item, index)}-${col.key}`}>
                    {col.render ? col.render(item, index) : item[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DataTable;

// // src/components/common/DataTable/DataTable.tsx

// import React from 'react';
// import './DataTable.css';

// export interface Column<T> {
//   /** کلید فیلد در داده */
//   key: string;
//   /** عنوان ستون */
//   title: string;
//   /** تابع رندر سفارشی برای ستون */
//   render?: (item: T, index: number) => React.ReactNode;
//   /** عرض ستون */
//   width?: number | string;
//   /** آیا ستون قابل مرتب‌سازی است */
//   sortable?: boolean;
//   /** کلاس‌های اضافی برای ستون */
//   className?: string;
// }

// interface DataTableProps<T> {
//   /** داده‌های جدول */
//   data: T[];
//   /** تعریف ستون‌ها */
//   columns: Column<T>[];
//   /** کلید یکتا برای هر ردیف */
//   rowKey: keyof T | ((item: T) => string | number);
//   /** کلاس‌های اضافی */
//   className?: string;
//   /** تابع برای رندر سفارشی ردیف */
//   onRowClick?: (item: T) => void;
//   /** وضعیت بارگذاری */
//   loading?: boolean;
//   /** پیام در صورت خالی بودن داده */
//   emptyMessage?: string;
// }

// export function DataTable<T extends Record<string, any>>({
//   data,
//   columns,
//   rowKey,
//   className = '',
//   onRowClick,
//   loading = false,
//   emptyMessage = 'هیچ داده‌ای یافت نشد',
// }: DataTableProps<T>) {
//   // دریافت کلید ردیف
//   const getRowKey = (item: T, index: number): string | number => {
//     if (typeof rowKey === 'function') {
//       return rowKey(item);
//     }
//     return item[rowKey] ?? index;
//   };

//   if (loading) {
//     return (
//       <div className="data-table-loading">
//         <div className="spinner-border text-primary" role="status">
//           <span className="visually-hidden">در حال بارگذاری...</span>
//         </div>
//       </div>
//     );
//   }

//   if (data.length === 0) {
//     return (
//       <div className="data-table-empty">
//         <p>{emptyMessage}</p>
//       </div>
//     );
//   }

//   return (
//     <div className={`data-table-wrapper ${className}`}>
//       <div className="table-responsive">
//         <table className="data-table">
//           <thead>
//             <tr>
//               {columns.map((col) => (
//                 <th
//                   key={col.key}
//                   className={`${col.sortable ? 'sortable' : ''} ${col.className || ''}`}
//                   style={{ width: col.width }}
//                 >
//                   {col.title}
//                 </th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {data.map((item, index) => (
//               <tr
//                 key={getRowKey(item, index)}
//                 onClick={() => onRowClick?.(item)}
//                 className={onRowClick ? 'clickable' : ''}
//               >
//                 {columns.map((col) => (
//                   <td key={`${getRowKey(item, index)}-${col.key}`}>
//                     {col.render ? col.render(item, index) : item[col.key]}
//                   </td>
//                 ))}
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

// export default DataTable;