// src/components/common/Pagination/Pagination.tsx

import React from 'react';
import './Pagination.css';
import { toPersianNumber } from '../../../utils/formatter.utils';
interface PaginationProps {
  /** تعداد کل آیتم‌ها */
  totalItems: number;
  /** تعداد آیتم در هر صفحه */
  pageSize: number;
  /** شماره صفحه فعلی (شروع از 1) */
  currentPage: number;
  /** تابع تغییر صفحه */
  onPageChange: (page: number) => void;
  /** تابع تغییر تعداد آیتم در صفحه */
  onPageSizeChange?: (size: number) => void;
  /** گزینه‌های تعداد آیتم در صفحه */
  pageSizeOptions?: number[];
  /** کلاس‌های اضافی */
  className?: string;
  /** نمایش اطلاعات تعداد آیتم‌ها */
  showInfo?: boolean;
  /** تعداد دکمه‌های قابل مشاهده در وسط */
  maxVisiblePages?: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  totalItems,
  pageSize,
  currentPage,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
  className = '',
  showInfo = true,
  maxVisiblePages = 5,
}) => {
  const totalPages = Math.ceil(totalItems / pageSize);

  if (totalPages <= 1 && pageSizeOptions.length === 0) {
    return null;
  }

  // محاسبه صفحات قابل نمایش
  const getVisiblePages = () => {
    const pages: number[] = [];
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  const visiblePages = getVisiblePages();

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className={`pagination-container ${className}`}>
            {showInfo && totalItems > 0 && (
        <div className="pagination-info">
          نمایش {toPersianNumber(((currentPage - 1) * pageSize) + 1)} تا{' '}
          {toPersianNumber(Math.min(currentPage * pageSize, totalItems))} از{' '}
          {toPersianNumber(totalItems)} مورد
        </div>
      )}
      {/* اطلاعات تعداد آیتم‌ها */}
      {/* {showInfo && totalItems > 0 && (
        <div className="pagination-info">
          نمایش {((currentPage - 1) * pageSize) + 1} تا{' '}
          {Math.min(currentPage * pageSize, totalItems)} از {totalItems} مورد
        </div>
      )} */}

      {/* کنترل‌های صفحه‌بندی */}
      <div className="pagination-controls">
        {/* دکمه رفتن به صفحه اول */}
        <button
          className="pagination-btn"
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          aria-label="صفحه اول"
        >
          <span className="double-chevron-left">«</span>
        </button>

        {/* دکمه صفحه قبلی */}
        <button
          className="pagination-btn"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="صفحه قبلی"
        >
          <span className="single-chevron-left">‹</span>
        </button>

        {/* دکمه‌های صفحات */}
        {visiblePages.map((page) => (
          <button
            key={page}
            className={`pagination-btn ${page === currentPage ? 'active' : ''}`}
            onClick={() => handlePageChange(page)}
          >
            {toPersianNumber(page)}
          </button>
        ))}
        {/* {visiblePages.map((page) => (
          <button
            key={page}
            className={`pagination-btn ${page === currentPage ? 'active' : ''}`}
            onClick={() => handlePageChange(page)}
          >
            {page}
          </button>
        ))} */}

        {/* دکمه صفحه بعدی */}
        <button
          className="pagination-btn"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="صفحه بعدی"
        >
          <span className="single-chevron-right">›</span>
        </button>

        {/* دکمه رفتن به صفحه آخر */}
        <button
          className="pagination-btn"
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          aria-label="صفحه آخر"
        >
          <span className="double-chevron-right">»</span>
        </button>
      </div>

      {/* انتخاب تعداد آیتم در صفحه */}
      {onPageSizeChange && pageSizeOptions.length > 0 && (
        <div className="page-size-selector">
          <label>تعداد در صفحه:</label>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {toPersianNumber(size)}
              </option>
            ))}
          </select>
          {/* <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select> */}
        </div>
      )}
    </div>
  );
};

export default Pagination;