// src/components/generic/GenericDataTable.tsx

import React, { useState, useMemo, useCallback } from 'react';
import { Pencil, Trash2, Search, ChevronUp, ChevronDown, ArrowUpDown } from 'lucide-react';
import { type TableColumnConfig } from '../../types/generic';
import { GenericDeleteModal } from './GenericDeleteModal';

interface GenericDataTableProps<T> {
  data: T[];
  columns: TableColumnConfig<T>[];
  onEdit: (item: T) => void;
  onDelete: (id: number) => void;
  isLoading?: boolean;
  searchable?: boolean;
  onSearch?: (term: string) => void;
  searchPlaceholder?: string;
  renderActions?: (item: T) => React.ReactNode;
  getItemName?: (item: T) => string;
  renderEmptyState?: () => React.ReactNode;
  rowClassName?: (item: T) => string;
  rowStyle?: (item: T) => React.CSSProperties;
  pageSize?: number;
  showPagination?: boolean;
  onPageChange?: (page: number) => void;
  totalCount?: number;
}

function GenericDataTableComponent<T extends { id: number }>({
  data,
  columns,
  onEdit,
  onDelete,
  isLoading = false,
  searchable = true,
  onSearch,
  searchPlaceholder = 'جستجو...',
  renderActions,
  getItemName,
  renderEmptyState,
  rowClassName,
  rowStyle,
  pageSize = 10,
  showPagination = false,
  onPageChange,
  totalCount = 0,
}: GenericDataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteItemName, setDeleteItemName] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    if (onSearch) onSearch(value);
    setCurrentPage(1);
  }, [onSearch]);

  const handleSort = useCallback((field: string) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  }, [sortField]);

  const openDeleteModal = useCallback((item: T) => {
    setDeleteId(item.id);
    setDeleteItemName(getItemName ? getItemName(item) : `آیتم شماره ${item.id}`);
    setDeleteModalOpen(true);
  }, [getItemName]);

  const handleConfirmDelete = useCallback(async () => {
    if (deleteId) {
      setIsDeleting(true);
      try {
        await onDelete(deleteId);
        setDeleteModalOpen(false);
        setDeleteId(null);
        setDeleteItemName('');
      } finally {
        setIsDeleting(false);
      }
    }
  }, [deleteId, onDelete]);

  // پردازش داده‌ها
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    
    const searchLower = searchTerm.toLowerCase();
    return data.filter(item => {
      return columns.some(col => {
        const value = (item as any)[col.field];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(searchLower);
        }
        if (typeof value === 'number') {
          return String(value).includes(searchLower);
        }
        return false;
      });
    });
  }, [data, searchTerm, columns]);

  const sortedData = useMemo(() => {
    if (!sortField) return filteredData;
    
    const result = [...filteredData].sort((a, b) => {
      let aVal = (a as any)[sortField];
      let bVal = (b as any)[sortField];
      
      if (Array.isArray(aVal)) aVal = aVal.length;
      if (Array.isArray(bVal)) bVal = bVal.length;
      
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' 
          ? aVal.localeCompare(bVal, 'fa') 
          : bVal.localeCompare(aVal, 'fa');
      }
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      const aStr = String(aVal);
      const bStr = String(bVal);
      return sortOrder === 'asc' 
        ? aStr.localeCompare(bStr, 'fa') 
        : bStr.localeCompare(aStr, 'fa');
    });
    
    return result;
  }, [filteredData, sortField, sortOrder]);

  const paginatedData = useMemo(() => {
    if (!showPagination) return sortedData;
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize, showPagination]);

  const renderCell = useCallback((item: T, column: TableColumnConfig<T>) => {
    let value = (item as any)[column.field];
    
    if (Array.isArray(value)) {
      value = value.length;
    }
    
    if (column.render) {
      return column.render(value, item);
    }
    
    switch (column.type) {
      case 'file':
        return value ? (
          <a href={value} target="_blank" rel="noopener noreferrer" className="text-primary">
            مشاهده فایل
          </a>
        ) : <span className="text-muted">—</span>;
      
      case 'image':
        return value ? (
          <img 
            src={value} 
            alt="preview" 
            className="table-image-preview"
          />
        ) : <span className="text-muted">—</span>;
      
      case 'badge':
        return <span className="badge bg-secondary">{value}</span>;
      
      case 'date':
        return value ? new Date(value).toLocaleDateString('fa-IR') : '—';
      
      default:
        return value !== undefined && value !== null ? value : <span className="text-muted">—</span>;
    }
  }, []);

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">در حال بارگذاری...</span>
        </div>
      </div>
    );
  }

  if (data.length === 0 || filteredData.length === 0) {
    if (renderEmptyState) {
      return <>{renderEmptyState()}</>;
    }
    return (
      <div className="text-center py-5">
        <div className="empty-state-icon">📭</div>
        <h5 className="mt-3">داده‌ای یافت نشد</h5>
        <p className="text-muted">موردی با عبارت جستجو شده پیدا نشد</p>
      </div>
    );
  }

  return (
    <>
      <div className="generic-table-container">
        {searchable && (
          <div className="table-search-wrapper">
            <div className="input-group">
              <span className="input-group-text bg-transparent border-end-0">
                <Search size={16} className="text-muted" />
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-0"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
              {searchTerm && (
                <button
                  className="btn btn-outline-secondary border-start-0"
                  onClick={() => handleSearch('')}
                  type="button"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        )}
        
        <div className="table-responsive">
          <table className="table table-striped table-hover align-middle">
            <thead className="table-dark">
              <tr>
                <th style={{ width: 50 }}>#</th>
                {columns.map(col => (
                  <th 
                    key={col.field} 
                    style={{ width: col.width }}
                    title={col.sortable !== false ? 'برای مرتب‌سازی کلیک کنید' : ''}
                  >
                    {col.sortable !== false ? (
                      <button 
                        className="btn btn-link text-white p-0 text-decoration-none d-flex align-items-center gap-1"
                        onClick={() => handleSort(col.field)}
                        style={{ 
                          background: 'transparent', 
                          border: 'none',
                          padding: 0,
                          color: 'white',
                          cursor: 'pointer'
                        }}
                      >
                        {col.header}
                        {sortField === col.field ? (
                          sortOrder === 'asc' ? (
                            <ChevronUp size={14} style={{ color: '#ffd700' }} />
                          ) : (
                            <ChevronDown size={14} style={{ color: '#ffd700' }} />
                          )
                        ) : (
                          <ArrowUpDown size={14} style={{ opacity: 0.4 }} />
                        )}
                      </button>
                    ) : (
                      <span style={{ color: 'white' }}>{col.header}</span>
                    )}
                  </th>
                ))}
                <th style={{ width: 120, color: 'white' }}>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((item, index) => (
                <tr 
                  key={item.id}
                  className={rowClassName?.(item)}
                  style={rowStyle?.(item)}
                >
                  <td>{(currentPage - 1) * pageSize + index + 1}</td>
                  {columns.map(col => (
                    <td key={col.field}>{renderCell(item, col)}</td>
                  ))}
                  <td>
                    {renderActions ? (
                      renderActions(item)
                    ) : (
                      <div className="d-flex gap-1">
                        <button 
                          className="btn btn-sm btn-warning" 
                          onClick={() => onEdit(item)}
                        >
                          <Pencil size={14} />
                        </button>
                        <button 
                          className="btn btn-sm btn-danger" 
                          onClick={() => openDeleteModal(item)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showPagination && totalCount > 0 && (
          <div className="d-flex justify-content-between align-items-center mt-3">
            <span className="text-muted small">
              نمایش {((currentPage - 1) * pageSize) + 1} تا {Math.min(currentPage * pageSize, totalCount)} از {totalCount}
            </span>
            <nav>
              <ul className="pagination pagination-sm mb-0">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setCurrentPage(p => p - 1)}>
                    قبلی
                  </button>
                </li>
                {Array.from({ length: Math.ceil(totalCount / pageSize) }, (_, i) => i + 1).map(page => (
                  <li key={page} className={`page-item ${page === currentPage ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => setCurrentPage(page)}>
                      {page}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${currentPage === Math.ceil(totalCount / pageSize) ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setCurrentPage(p => p + 1)}>
                    بعدی
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </div>

      <GenericDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeleteId(null);
          setDeleteItemName('');
        }}
        onConfirm={handleConfirmDelete}
        title="حذف آیتم"
        message="آیا از حذف این آیتم مطمئن هستید؟"
        itemName={deleteItemName}
        isLoading={isDeleting}
      />

      <style>{`
        .generic-table-container {
          background: white;
          border-radius: 12px;
          padding: 16px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
        }
        .table-search-wrapper { margin-bottom: 16px; }
        .table-search-wrapper .input-group { max-width: 400px; }
        .table-search-wrapper .form-control:focus {
          box-shadow: none;
          border-color: #4f46e5;
        }
        .table-image-preview {
          width: 40px;
          height: 40px;
          object-fit: cover;
          border-radius: 8px;
          border: 2px solid #e9ecef;
        }
        .table-dark th {
          background: #212529 !important;
          color: white !important;
          padding: 12px 16px;
        }
        .table-dark th button {
          background: transparent !important;
          border: none !important;
          color: white !important;
          padding: 0 !important;
          gap: 6px;
          font-weight: 600;
          font-size: 14px;
        }
        .table-dark th button:hover {
          background: transparent !important;
          color: white !important;
          text-decoration: underline;
        }
        .empty-state-icon { font-size: 48px; opacity: 0.5; }
      `}</style>
    </>
  );
}

const GenericDataTable = React.memo(GenericDataTableComponent) as <T extends { id: number }>(
  props: GenericDataTableProps<T>
) => React.ReactElement;

export { GenericDataTable };
export default GenericDataTable;
//
