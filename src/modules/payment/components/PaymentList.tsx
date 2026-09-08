// src/modules/payment/components/PaymentList.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePayment } from '../hooks/usePayment';
import { type Payment } from '../types/payment.types';
import { formatCurrency } from '../../../utils/formatter.utils';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Eye,
  Filter,
  X,
  DollarSign,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Paperclip,
  Building2,
} from 'lucide-react';

interface PaymentListProps {
  onEdit?: (item: Payment) => void;
  onDelete?: (id: number) => void;
  onAdd?: () => void;
  onVerify?: (id: number) => void;
}

export const PaymentList: React.FC<PaymentListProps> = ({
  onEdit,
  onDelete,
  onAdd,
  onVerify,
}) => {
  const navigate = useNavigate();
  const { useList, delete: deletePayment, verify, isDeleting, isVerifying } = usePayment();
  const [filters, setFilters] = useState<{
    search?: string;
    is_paid?: boolean;
    is_verified?: boolean;
  }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState<string>('payment_date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data, isLoading, refetch } = useList({
    ...filters,
    search: debouncedSearchTerm || undefined,
    page: currentPage,
    page_size: pageSize,
    ordering: sortOrder === 'desc' ? `-${sortField}` : sortField,
  });

  const payments = data?.results || [];
  const totalCount = data?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  // ========== Handle View - رفتن به صفحه جزئیات ==========
  const handleView = (payment: Payment) => {
    navigate(`/payment/${payment.id}`);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('آیا از حذف این پرداخت مطمئن هستید؟')) {
      await deletePayment(id);
      refetch();
    }
  };

  const handleVerify = async (id: number) => {
    if (window.confirm('آیا از تایید این پرداخت مطمئن هستید؟')) {
      await verify(id);
      refetch();
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === '' ? undefined : value,
    }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm || Object.values(filters).some(v => v !== undefined);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1);
  };

  const getStatusBadge = (isPaid: boolean, isVerified: boolean) => {
    if (isVerified) {
      return { label: 'تایید شده', color: '#059669', bgColor: '#d1fae5', icon: CheckCircle };
    }
    if (isPaid) {
      return { label: 'پرداخت شده', color: '#2563eb', bgColor: '#dbeafe', icon: Clock };
    }
    return { label: 'پرداخت نشده', color: '#dc2626', bgColor: '#fee2e2', icon: XCircle };
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="pagination-container">
        <div className="pagination-info">
          نمایش {((currentPage - 1) * pageSize) + 1} تا{' '}
          {Math.min(currentPage * pageSize, totalCount)} از {totalCount} مورد
        </div>
        <div className="pagination-controls">
          <button className="pagination-btn" onClick={() => goToPage(1)} disabled={currentPage === 1}>
            <span className="double-chevron-left">«</span>
          </button>
          <button className="pagination-btn" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
            <span className="single-chevron-left">‹</span>
          </button>
          {pages.map((page) => (
            <button key={page} className={`pagination-btn ${page === currentPage ? 'active' : ''}`} onClick={() => goToPage(page)}>
              {page}
            </button>
          ))}
          <button className="pagination-btn" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
            <span className="single-chevron-right">›</span>
          </button>
          <button className="pagination-btn" onClick={() => goToPage(totalPages)} disabled={currentPage === totalPages}>
            <span className="double-chevron-right">»</span>
          </button>
        </div>
        <div className="page-size-selector">
          <label>تعداد در صفحه:</label>
          <select value={pageSize} onChange={handlePageSizeChange}>
            <option value={5}>۵</option>
            <option value={10}>۱۰</option>
            <option value={20}>۲۰</option>
            <option value={50}>۵۰</option>
          </select>
        </div>
      </div>
    );
  };

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
    <div className="payment-list">
      <div className="payment-list-header">
        <div className="header-title">
          <DollarSign size={24} />
          <h2>پرداخت‌ها</h2>
          <span className="badge">{totalCount}</span>
        </div>
        {onAdd && (
          <button className="btn-primary" onClick={onAdd}>
            <Plus size={18} />
            افزودن پرداخت
          </button>
        )}
      </div>

      <div className="search-section">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="جستجو در شماره پرداخت، توضیحات و شماره قرارداد..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button className="clear-btn" onClick={() => setSearchTerm('')}>
              <X size={16} />
            </button>
          )}
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

      {showFilters && (
        <div className="filter-panel">
          <div className="filter-grid">
            <div className="filter-group">
              <label>وضعیت پرداخت</label>
              <select
                value={filters.is_paid === undefined ? '' : filters.is_paid ? 'paid' : 'unpaid'}
                onChange={(e) => {
                  const val = e.target.value;
                  handleFilterChange('is_paid', val === '' ? undefined : val === 'paid');
                }}
              >
                <option value="">همه</option>
                <option value="paid">پرداخت شده</option>
                <option value="unpaid">پرداخت نشده</option>
              </select>
            </div>
            <div className="filter-group">
              <label>وضعیت تایید</label>
              <select
                value={filters.is_verified === undefined ? '' : filters.is_verified ? 'verified' : 'unverified'}
                onChange={(e) => {
                  const val = e.target.value;
                  handleFilterChange('is_verified', val === '' ? undefined : val === 'verified');
                }}
              >
                <option value="">همه</option>
                <option value="verified">تایید شده</option>
                <option value="unverified">تایید نشده</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {payments.length === 0 ? (
        <div className="empty-state">
          <DollarSign size={48} />
          <h5>هیچ پرداختی یافت نشد</h5>
          <p className="text-muted">
            {hasActiveFilters ? 'با فیلترهای انتخاب شده موردی پیدا نشد' : 'هنوز پرداختی ثبت نشده است'}
          </p>
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="payment-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('payment_number')} className="sortable">
                    شماره پرداخت {sortField === 'payment_number' && <span className="sort-icon">{sortOrder === 'asc' ? '▲' : '▼'}</span>}
                  </th>
                  <th onClick={() => handleSort('amount')} className="sortable">
                    مبلغ {sortField === 'amount' && <span className="sort-icon">{sortOrder === 'asc' ? '▲' : '▼'}</span>}
                  </th>
                  <th onClick={() => handleSort('payment_date')} className="sortable">
                    تاریخ پرداخت {sortField === 'payment_date' && <span className="sort-icon">{sortOrder === 'asc' ? '▲' : '▼'}</span>}
                  </th>
                  <th>نوع پرداخت</th>
                  <th>قرارداد</th>
                  <th onClick={() => handleSort('is_verified')} className="sortable">
                    وضعیت {sortField === 'is_verified' && <span className="sort-icon">{sortOrder === 'asc' ? '▲' : '▼'}</span>}
                  </th>
                  <th>فایل‌ها</th>
                  <th style={{ width: 160 }}>عملیات</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => {
                  const status = getStatusBadge(payment.is_paid, payment.is_verified);
                  const StatusIcon = status.icon;

                  return (
                    <tr key={payment.id}>
                      <td>
                        <span className="payment-code">{payment.payment_number}</span>
                      </td>
                      <td className="amount-cell">
                        <DollarSign size={14} />
                        {formatCurrency(payment.amount)}
                      </td>
                      <td>
                        <div className="date-cell">
                          {payment.payment_date}
                        </div>
                      </td>
                      <td>
                        <span className="payment-type-badge">
                          {payment.payment_type_name || '—'}
                        </span>
                      </td>
                      <td>
                        <div className="contract-cell">
                          <Building2 size={14} className="contract-icon" />
                          <div className="contract-info">
                            <span className="contract-number">
                              {payment.contract_number || '—'}
                            </span>
                            {payment.contract_subject && (
                              <span className="contract-subject">
                                {payment.contract_subject}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          className="status-badge"
                          style={{
                            backgroundColor: status.bgColor,
                            color: status.color,
                          }}
                        >
                          <StatusIcon size={12} />
                          {status.label}
                        </span>
                      </td>
                      <td>
                        {payment.attachments && payment.attachments.length > 0 ? (
                          <div className="attachments-cell">
                            <span className="attachment-count">{payment.attachments.length} فایل</span>
                            <div className="attachment-icons">
                              {payment.attachments.slice(0, 2).map((att) => (
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
                              {payment.attachments.length > 2 && (
                                <span className="more-files">+{payment.attachments.length - 2}</span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td>
                        <div className="actions">
                          {/* ✅ دکمه مشاهده - رفتن به صفحه جزئیات */}
                          <button
                            className="action-btn view"
                            onClick={() => handleView(payment)}
                            title="مشاهده"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            className="action-btn edit"
                            onClick={() => onEdit?.(payment)}
                            title="ویرایش"
                          >
                            <Pencil size={16} />
                          </button>
                          {!payment.is_verified && (
                            <button
                              className="action-btn verify"
                              onClick={() => handleVerify(payment.id)}
                              disabled={isVerifying}
                              title="تایید"
                            >
                              <CheckCircle size={16} />
                            </button>
                          )}
                          <button
                            className="action-btn delete"
                            onClick={() => handleDelete(payment.id)}
                            disabled={isDeleting}
                            title="حذف"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {renderPagination()}
        </>
      )}

      <style>{`
        .payment-list {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
        }

        .payment-list-header {
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

        .badge {
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

        .search-input-wrapper {
          flex: 1;
          position: relative;
        }

        .search-input {
          width: 100%;
          padding: 8px 40px 8px 12px;
          border: 1.5px solid #e9ecef;
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.2s;
        }

        .search-input:focus {
          border-color: #4f46e5;
          outline: none;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }

        .search-icon {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
        }

        .clear-btn {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #9ca3af;
          cursor: pointer;
          padding: 4px;
        }

        .clear-btn:hover {
          color: #ef4444;
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
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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

        .filter-group select {
          padding: 8px 12px;
          border: 1.5px solid #d1d5db;
          border-radius: 6px;
          font-size: 13px;
        }

        .sortable {
          cursor: pointer;
          user-select: none;
          transition: all 0.2s;
        }

        .sortable:hover {
          color: #4f46e5;
        }

        .sort-icon {
          display: inline-block;
          margin-right: 4px;
          font-size: 11px;
          color: #4f46e5;
        }

        .payment-table {
          width: 100%;
          border-collapse: collapse;
        }

        .payment-table thead th {
          padding: 12px 16px;
          text-align: right;
          font-weight: 600;
          font-size: 13px;
          color: #6b7280;
          border-bottom: 2px solid #e9ecef;
        }

        .payment-table tbody td {
          padding: 12px 16px;
          border-bottom: 1px solid #f3f4f6;
          vertical-align: middle;
        }

        .payment-table tbody tr:hover {
          background: #f8fafc;
        }

        .payment-code {
          font-family: monospace;
          font-weight: 600;
          color: #4f46e5;
          background: #eef2ff;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 12px;
        }

        .amount-cell {
          display: flex;
          align-items: center;
          gap: 4px;
          font-weight: 600;
          color: #1a1a2e;
        }

        .date-cell {
          font-size: 13px;
          color: #6b7280;
          direction: ltr;
        }

        .payment-type-badge {
          background: #f3f4f6;
          padding: 2px 10px;
          border-radius: 12px;
          font-size: 12px;
          color: #374151;
        }

        .contract-cell {
          display: flex;
          align-items: flex-start;
          gap: 6px;
        }

        .contract-icon {
          flex-shrink: 0;
          margin-top: 2px;
          color: #6b7280;
        }

        .contract-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .contract-number {
          font-family: monospace;
          font-size: 12px;
          color: #4f46e5;
          font-weight: 600;
        }

        .contract-subject {
          font-size: 12px;
          color: #6b7280;
          max-width: 150px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
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
          flex-wrap: wrap;
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

        .action-btn.verify:hover {
          background: #d1fae5;
          color: #059669;
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

        .empty-state {
          text-align: center;
          padding: 40px;
        }

        .empty-state svg {
          color: #d1d5db;
          margin-bottom: 12px;
        }

        .empty-state h5 {
          margin-bottom: 4px;
          color: #374151;
        }

        .pagination-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
          padding: 16px 0;
          border-top: 1px solid #e9ecef;
          margin-top: 16px;
        }

        .pagination-info {
          font-size: 14px;
          color: #6b7280;
        }

        .pagination-controls {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .pagination-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 36px;
          height: 36px;
          padding: 0 8px;
          border: 1px solid #e9ecef;
          border-radius: 6px;
          background: white;
          color: #374151;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .pagination-btn:hover:not(:disabled) {
          background: #f3f4f6;
          border-color: #d1d5db;
        }

        .pagination-btn.active {
          background: #4f46e5;
          border-color: #4f46e5;
          color: white;
          font-weight: 600;
        }

        .pagination-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .page-size-selector {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #6b7280;
        }

        .page-size-selector select {
          padding: 4px 8px;
          border: 1px solid #e9ecef;
          border-radius: 4px;
          font-size: 14px;
          background: white;
          cursor: pointer;
        }

        .double-chevron-right,
        .double-chevron-left,
        .single-chevron-right,
        .single-chevron-left {
          font-size: 18px;
          font-weight: 700;
          line-height: 1;
          display: inline-block;
          color: inherit;
        }

        .double-chevron-right,
        .double-chevron-left {
          font-size: 16px;
        }

        .single-chevron-right,
        .single-chevron-left {
          font-size: 20px;
        }

        @media (max-width: 768px) {
          .payment-list {
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

          .filter-grid {
            grid-template-columns: 1fr;
          }

          .payment-table {
            font-size: 13px;
          }

          .payment-table thead th,
          .payment-table tbody td {
            padding: 8px 10px;
          }

          .pagination-container {
            flex-direction: column;
            align-items: center;
          }

          .pagination-info {
            text-align: center;
          }

          .pagination-controls {
            flex-wrap: wrap;
            justify-content: center;
          }

          .contract-subject {
            max-width: 100px;
          }
        }
      `}</style>
    </div>
  );
};

export default PaymentList;

// // src/modules/payment/components/PaymentList.tsx

// import React, { useState, useEffect } from 'react';
// import { usePayment } from '../hooks/usePayment';
// import { type Payment } from '../types/payment.types';
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
//   DollarSign,
//   User,
//   FileText,
//   CheckCircle,
//   XCircle,
//   Clock,
//   Download,
//   Paperclip,
//   Building2,
//   ChevronLeft,
//   ChevronRight,
// } from 'lucide-react';

// interface PaymentListProps {
//   onEdit?: (item: Payment) => void;
//   onDelete?: (id: number) => void;
//   onView?: (item: Payment) => void;
//   onAdd?: () => void;
//   onVerify?: (id: number) => void;
// }

// export const PaymentList: React.FC<PaymentListProps> = ({
//   onEdit,
//   onDelete,
//   onView,
//   onAdd,
//   onVerify,
// }) => {
//   const { useList, delete: deletePayment, verify, isDeleting, isVerifying } = usePayment();
//   const [filters, setFilters] = useState<{
//     search?: string;
//     is_paid?: boolean;
//     is_verified?: boolean;
//   }>({});
//   const [searchTerm, setSearchTerm] = useState('');
//   const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
//   const [showFilters, setShowFilters] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [pageSize, setPageSize] = useState(10);
//   const [sortField, setSortField] = useState<string>('payment_date');
//   const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setDebouncedSearchTerm(searchTerm);
//       setCurrentPage(1);
//     }, 500);
//     return () => clearTimeout(timer);
//   }, [searchTerm]);

//   const { data, isLoading, refetch } = useList({
//     ...filters,
//     search: debouncedSearchTerm || undefined,
//     page: currentPage,
//     page_size: pageSize,
//     ordering: sortOrder === 'desc' ? `-${sortField}` : sortField,
//   });

//   const payments = data?.results || [];
//   const totalCount = data?.count || 0;
//   const totalPages = Math.ceil(totalCount / pageSize);

//   const handleDelete = async (id: number) => {
//     if (window.confirm('آیا از حذف این پرداخت مطمئن هستید؟')) {
//       await deletePayment(id);
//       refetch();
//     }
//   };

//   const handleVerify = async (id: number) => {
//     if (window.confirm('آیا از تایید این پرداخت مطمئن هستید؟')) {
//       await verify(id);
//       refetch();
//     }
//   };

//   const handleFilterChange = (key: string, value: any) => {
//     setFilters(prev => ({
//       ...prev,
//       [key]: value === '' ? undefined : value,
//     }));
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

//   const getStatusBadge = (isPaid: boolean, isVerified: boolean) => {
//     if (isVerified) {
//       return { label: 'تایید شده', color: '#059669', bgColor: '#d1fae5', icon: CheckCircle };
//     }
//     if (isPaid) {
//       return { label: 'پرداخت شده', color: '#2563eb', bgColor: '#dbeafe', icon: Clock };
//     }
//     return { label: 'پرداخت نشده', color: '#dc2626', bgColor: '#fee2e2', icon: XCircle };
//   };

//   const getFileName = (url: string) => {
//     if (!url) return 'فایل';
//     try {
//       const parts = url.split('/');
//       return parts[parts.length - 1] || 'فایل';
//     } catch {
//       return 'فایل';
//     }
//   };

//   const renderPagination = () => {
//   if (totalPages <= 1) return null;

//   const pages = [];
//   const maxVisible = 5;
//   let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
//   let endPage = Math.min(totalPages, startPage + maxVisible - 1);
  
//   if (endPage - startPage < maxVisible - 1) {
//     startPage = Math.max(1, endPage - maxVisible + 1);
//   }

//   for (let i = startPage; i <= endPage; i++) {
//     pages.push(i);
//   }

//   return (
//     <div className="pagination-container">
//       <div className="pagination-info">
//         نمایش {((currentPage - 1) * pageSize) + 1} تا{' '}
//         {Math.min(currentPage * pageSize, totalCount)} از {totalCount} مورد
//       </div>
//       <div className="pagination-controls">
//         {/* دکمه رفتن به صفحه اول */}
//         <button className="pagination-btn" onClick={() => goToPage(1)} disabled={currentPage === 1}>
//           <span className="double-chevron-left">«</span>
//         </button>
//         {/* دکمه صفحه قبلی */}
//         <button className="pagination-btn" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
//           <span className="single-chevron-left">‹</span>
//         </button>
//         {pages.map((page) => (
//           <button key={page} className={`pagination-btn ${page === currentPage ? 'active' : ''}`} onClick={() => goToPage(page)}>
//             {page}
//           </button>
//         ))}
//         {/* دکمه صفحه بعدی */}
//         <button className="pagination-btn" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
//           <span className="single-chevron-right">›</span>
//         </button>
//         {/* دکمه رفتن به صفحه آخر */}
//         <button className="pagination-btn" onClick={() => goToPage(totalPages)} disabled={currentPage === totalPages}>
//           <span className="double-chevron-right">»</span>
//         </button>
//       </div>
//       <div className="page-size-selector">
//         <label>تعداد در صفحه:</label>
//         <select value={pageSize} onChange={handlePageSizeChange}>
//           <option value={5}>۵</option>
//           <option value={10}>۱۰</option>
//           <option value={20}>۲۰</option>
//           <option value={50}>۵۰</option>
//         </select>
//       </div>
//     </div>
//   );
// };

  
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
//     <div className="payment-list">
//       <div className="payment-list-header">
//         <div className="header-title">
//           <DollarSign size={24} />
//           <h2>پرداخت‌ها</h2>
//           <span className="badge">{totalCount}</span>
//         </div>
//         {onAdd && (
//           <button className="btn-primary" onClick={onAdd}>
//             <Plus size={18} />
//             افزودن پرداخت
//           </button>
//         )}
//       </div>

//       <div className="search-section">
//         <div className="search-input-wrapper">
//           <Search size={18} className="search-icon" />
//           <input
//             type="text"
//             placeholder="جستجو در شماره پرداخت، توضیحات و شماره قرارداد..."
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
//               <label>وضعیت پرداخت</label>
//               <select
//                 value={filters.is_paid === undefined ? '' : filters.is_paid ? 'paid' : 'unpaid'}
//                 onChange={(e) => {
//                   const val = e.target.value;
//                   handleFilterChange('is_paid', val === '' ? undefined : val === 'paid');
//                 }}
//               >
//                 <option value="">همه</option>
//                 <option value="paid">پرداخت شده</option>
//                 <option value="unpaid">پرداخت نشده</option>
//               </select>
//             </div>
//             <div className="filter-group">
//               <label>وضعیت تایید</label>
//               <select
//                 value={filters.is_verified === undefined ? '' : filters.is_verified ? 'verified' : 'unverified'}
//                 onChange={(e) => {
//                   const val = e.target.value;
//                   handleFilterChange('is_verified', val === '' ? undefined : val === 'verified');
//                 }}
//               >
//                 <option value="">همه</option>
//                 <option value="verified">تایید شده</option>
//                 <option value="unverified">تایید نشده</option>
//               </select>
//             </div>
//           </div>
//         </div>
//       )}

//       {payments.length === 0 ? (
//         <div className="empty-state">
//           <DollarSign size={48} />
//           <h5>هیچ پرداختی یافت نشد</h5>
//           <p className="text-muted">
//             {hasActiveFilters ? 'با فیلترهای انتخاب شده موردی پیدا نشد' : 'هنوز پرداختی ثبت نشده است'}
//           </p>
//         </div>
//       ) : (
//         <>
//           <div className="table-responsive">
//             <table className="payment-table">
//               <thead>
//                 <tr>
//                   <th onClick={() => handleSort('payment_number')} className="sortable">
//                     شماره پرداخت {sortField === 'payment_number' && <span className="sort-icon">{sortOrder === 'asc' ? '▲' : '▼'}</span>}
//                   </th>
//                   <th onClick={() => handleSort('amount')} className="sortable">
//                     مبلغ {sortField === 'amount' && <span className="sort-icon">{sortOrder === 'asc' ? '▲' : '▼'}</span>}
//                   </th>
//                   <th onClick={() => handleSort('payment_date')} className="sortable">
//                     تاریخ پرداخت {sortField === 'payment_date' && <span className="sort-icon">{sortOrder === 'asc' ? '▲' : '▼'}</span>}
//                   </th>
//                   <th>نوع پرداخت</th>
//                   <th>قرارداد</th>
//                   <th onClick={() => handleSort('is_verified')} className="sortable">
//                     وضعیت {sortField === 'is_verified' && <span className="sort-icon">{sortOrder === 'asc' ? '▲' : '▼'}</span>}
//                   </th>
//                   <th>فایل‌ها</th>
//                   <th style={{ width: 160 }}>عملیات</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {payments.map((payment) => {
//                   const status = getStatusBadge(payment.is_paid, payment.is_verified);
//                   const StatusIcon = status.icon;

//                   return (
//                     <tr key={payment.id}>
//                       <td>
//                         <span className="payment-code">{payment.payment_number}</span>
//                       </td>
//                       <td className="amount-cell">
//                         <DollarSign size={14} />
//                         {formatCurrency(payment.amount)}
//                       </td>
//                       <td>
//                         <div className="date-cell">
//                           {payment.payment_date}
//                         </div>
//                       </td>
//                       <td>
//                         <span className="payment-type-badge">
//                           {payment.payment_type_name || '—'}
//                         </span>
//                       </td>
                     
//                       <td>
//                         <div className="contract-cell">
//                           <Building2 size={14} className="contract-icon" />
//                           <div className="contract-info">
//                             <span className="contract-number">
//                               {payment.contract_number || '—'}
//                             </span>
//                             {payment.contract_subject && (
//                               <span className="contract-subject">
//                                 {payment.contract_subject}
//                               </span>
//                             )}
//                           </div>
//                         </div>
//                       </td>
//                       <td>
//                         <span
//                           className="status-badge"
//                           style={{
//                             backgroundColor: status.bgColor,
//                             color: status.color,
//                           }}
//                         >
//                           <StatusIcon size={12} />
//                           {status.label}
//                         </span>
//                       </td>
//                       <td>
//                         {payment.attachments && payment.attachments.length > 0 ? (
//                           <div className="attachments-cell">
//                             <span className="attachment-count">{payment.attachments.length} فایل</span>
//                             <div className="attachment-icons">
//                               {payment.attachments.slice(0, 2).map((att) => (
//                                 <a
//                                   key={att.id}
//                                   href={att.file}
//                                   target="_blank"
//                                   rel="noopener noreferrer"
//                                   className="attachment-link"
//                                   title={att.filename}
//                                 >
//                                   <Paperclip size={12} />
//                                 </a>
//                               ))}
//                               {payment.attachments.length > 2 && (
//                                 <span className="more-files">+{payment.attachments.length - 2}</span>
//                               )}
//                             </div>
//                           </div>
//                         ) : (
//                           <span className="text-muted">—</span>
//                         )}
//                       </td>
//                       <td>
//                         <div className="actions">
//                           <button
//                             className="action-btn view"
//                             onClick={() => onView?.(payment)}
//                             title="مشاهده"
//                           >
//                             <Eye size={16} />
//                           </button>
//                           <button
//                             className="action-btn edit"
//                             onClick={() => onEdit?.(payment)}
//                             title="ویرایش"
//                           >
//                             <Pencil size={16} />
//                           </button>
//                           {!payment.is_verified && (
//                             <button
//                               className="action-btn verify"
//                               onClick={() => handleVerify(payment.id)}
//                               disabled={isVerifying}
//                               title="تایید"
//                             >
//                               <CheckCircle size={16} />
//                             </button>
//                           )}
//                           <button
//                             className="action-btn delete"
//                             onClick={() => handleDelete(payment.id)}
//                             disabled={isDeleting}
//                             title="حذف"
//                           >
//                             <Trash2 size={16} />
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//           {renderPagination()}
//         </>
//       )}

//       <style>{`
//         .payment-list {
//           background: white;
//           border-radius: 12px;
//           padding: 20px;
//           box-shadow: 0 1px 3px rgba(0,0,0,0.06);
//         }

//         .payment-list-header {
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

//         .payment-table {
//           width: 100%;
//           border-collapse: collapse;
//         }

//         .payment-table thead th {
//           padding: 12px 16px;
//           text-align: right;
//           font-weight: 600;
//           font-size: 13px;
//           color: #6b7280;
//           border-bottom: 2px solid #e9ecef;
//         }

//         .payment-table tbody td {
//           padding: 12px 16px;
//           border-bottom: 1px solid #f3f4f6;
//           vertical-align: middle;
//         }

//         .payment-table tbody tr:hover {
//           background: #f8fafc;
//         }

//         .payment-code {
//           font-family: monospace;
//           font-weight: 600;
//           color: #4f46e5;
//           background: #eef2ff;
//           padding: 2px 8px;
//           border-radius: 4px;
//           font-size: 12px;
//         }

//         .amount-cell {
//           display: flex;
//           align-items: center;
//           gap: 4px;
//           font-weight: 600;
//           color: #1a1a2e;
//         }

//         .date-cell {
//           font-size: 13px;
//           color: #6b7280;
//           direction: ltr;
//         }

//         .payment-type-badge {
//           background: #f3f4f6;
//           padding: 2px 10px;
//           border-radius: 12px;
//           font-size: 12px;
//           color: #374151;
//         }

//         .receiver-cell {
//           display: flex;
//           align-items: center;
//           gap: 6px;
//           font-size: 13px;
//           color: #374151;
//         }

//         .contract-cell {
//           display: flex;
//           align-items: flex-start;
//           gap: 6px;
//         }

//         .contract-icon {
//           flex-shrink: 0;
//           margin-top: 2px;
//           color: #6b7280;
//         }

//         .contract-info {
//           display: flex;
//           flex-direction: column;
//           gap: 2px;
//         }

//         .contract-number {
//           font-family: monospace;
//           font-size: 12px;
//           color: #4f46e5;
//           font-weight: 600;
//         }

//         .contract-subject {
//           font-size: 12px;
//           color: #6b7280;
//           max-width: 150px;
//           white-space: nowrap;
//           overflow: hidden;
//           text-overflow: ellipsis;
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

//         .action-btn.verify:hover {
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

//         @media (max-width: 768px) {
//           .payment-list {
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

//           .payment-table {
//             font-size: 13px;
//           }

//           .payment-table thead th,
//           .payment-table tbody td {
//             padding: 8px 10px;
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

//           .contract-subject {
//             max-width: 100px;
//           }
//         }
//           .double-chevron-right,
// .double-chevron-left,
// .single-chevron-right,
// .single-chevron-left {
//   font-size: 18px;
//   font-weight: 700;
//   line-height: 1;
//   display: inline-block;
//   color: inherit;
// }

// .double-chevron-right,
// .double-chevron-left {
//   font-size: 16px;
// }

// .single-chevron-right,
// .single-chevron-left {
//   font-size: 20px;
// }
//       `}</style>
//     </div>
//   );


// };

// export default PaymentList;
