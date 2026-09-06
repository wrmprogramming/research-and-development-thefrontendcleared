import React, { useState, useEffect } from 'react';
import { useSettlement } from '../hooks/useSettlement';
import type { Settlement } from '../types/settlement.types';
import { formatCurrency } from '../../../utils/formatter.utils';
import dateUtils from '@utils/dateUtils';
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  X,
  DollarSign,
  Calendar,
  FileText,
  Building2,
  Search,
  Download,
  Paperclip,
} from 'lucide-react';

interface SettlementListProps {
  contractId?: number;
  onEdit?: (item: Settlement) => void;
  onDelete?: (id: number) => void;
  onView?: (item: Settlement) => void;
  onAdd?: () => void;
  readOnly?: boolean;
}

export const SettlementList: React.FC<SettlementListProps> = ({
  contractId,
  onEdit,
  onDelete,
  onView,
  onAdd,
  readOnly = false,
}) => {
  const { useByContract, useList, delete: deleteSettlement, isDeleting } = useSettlement();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // ========== Debounce ==========
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: settlements = [], isLoading, refetch } = contractId
    ? useByContract(contractId)
    : useList({ search: debouncedSearchTerm || undefined });

  const handleDelete = async (id: number) => {
    if (window.confirm('آیا از حذف این تسویه حساب مطمئن هستید؟')) {
      await deleteSettlement(id);
      refetch();
    }
  };

  // ========== فیلتر بر اساس جستجو ==========
  const filteredSettlements = settlements.filter((settlement) => {
    const search = debouncedSearchTerm.toLowerCase().trim();
    if (!search) return true;
    return (
      settlement.certificate_number?.toLowerCase().includes(search) ||
      settlement.contract_number?.toLowerCase().includes(search) ||
      settlement.description?.toLowerCase().includes(search)
    );
  });

  const getFileName = (url: string) => {
    if (!url) return 'فایل';
    try {
      const parts = url.split('/');
      return parts[parts.length - 1] || 'فایل';
    } catch {
      return 'فایل';
    }
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
    <div className="settlement-list">
      <div className="list-header">
        <div className="header-title">
          <DollarSign size={20} />
          <h3>تسویه حساب‌ها</h3>
          <span className="badge">{settlements.length}</span>
        </div>
        <div className="header-actions">
          {!contractId && (
            <div className="search-input-wrapper">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="جستجو در شماره مفاصا یا شماره قرارداد..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <button className="clear-btn" onClick={() => setSearchTerm('')}>
                  <X size={14} />
                </button>
              )}
            </div>
          )}
          {!readOnly && onAdd && (
            <button className="btn-add" onClick={onAdd}>
              <Plus size={16} />
              ثبت تسویه جدید
            </button>
          )}
        </div>
      </div>

      {settlements.length === 0 ? (
        <div className="empty-state">
          <DollarSign size={40} />
          <p>هیچ تسویه حسابی ثبت نشده است</p>
          {!readOnly && onAdd && (
            <button className="btn-add-primary" onClick={onAdd}>
              <Plus size={16} />
              ثبت اولین تسویه
            </button>
          )}
        </div>
      ) : (
        <div className="settlements-list">
          {filteredSettlements.map((settlement) => (
            <div key={settlement.id} className="settlement-item">
              <div className="settlement-item-header">
                <div className="settlement-item-left">
                  <span className="certificate-number">
                    <FileText size={14} />
                    {settlement.certificate_number}
                  </span>
                  <span className="settlement-date">
                    <Calendar size={14} />
                    {settlement.date}
                  </span>
                </div>
                <div className="settlement-item-actions">
                  <button
                    className="action-btn view"
                    onClick={() => onView?.(settlement)}
                    title="مشاهده"
                  >
                    <Eye size={14} />
                  </button>
                  {!readOnly && (
                    <>
                      <button
                        className="action-btn edit"
                        onClick={() => onEdit?.(settlement)}
                        title="ویرایش"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        className="action-btn delete"
                        onClick={() => handleDelete(settlement.id)}
                        disabled={isDeleting}
                        title="حذف"
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>

          

              {settlement.description && (
                <div className="settlement-description">
                  <FileText size={14} />
                  <p>{settlement.description}</p>
                </div>
              )}

              {settlement.certificate_file && (
                <div className="settlement-file">
                  <Paperclip size={14} />
                  <a
                    href={settlement.certificate_file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="file-link"
                  >
                    {getFileName(settlement.certificate_file)}
                  </a>
                  <a
                    href={settlement.certificate_file}
                    download
                    className="download-link"
                    title="دانلود فایل"
                  >
                    <Download size={14} />
                  </a>
                </div>
              )}

              {!contractId && settlement.contract_number && (
                <div className="settlement-contract">
                  <Building2 size={14} />
                  <span>{settlement.contract_number}</span>
                  {settlement.contract_subject && (
                    <span className="contract-subject">- {settlement.contract_subject}</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <style>{`
        .settlement-list {
          background: white;
          border-radius: 12px;
          border: 1px solid #e9ecef;
          overflow: hidden;
          padding: 16px;
        }

        .list-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .header-title {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .header-title h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #1a1a2e;
        }

        .badge {
          background: #eef2ff;
          color: #4f46e5;
          padding: 0 10px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .search-input-wrapper {
          position: relative;
          width: 250px;
        }

        .search-input {
          width: 100%;
          padding: 6px 36px 6px 12px;
          border: 1.5px solid #e9ecef;
          border-radius: 6px;
          font-size: 13px;
          transition: all 0.2s;
        }

        .search-input:focus {
          border-color: #4f46e5;
          outline: none;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }

        .search-icon {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
        }

        .clear-btn {
          position: absolute;
          left: 8px;
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

        .btn-add {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 16px;
          background: #4f46e5;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .btn-add:hover {
          background: #4338ca;
          transform: translateY(-1px);
        }

        .btn-add-primary {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 20px;
          background: #4f46e5;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 8px;
        }

        .btn-add-primary:hover {
          background: #4338ca;
        }

        .empty-state {
          text-align: center;
          padding: 30px 20px;
          color: #6b7280;
        }

        .empty-state p {
          margin: 8px 0;
        }

        .settlements-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-height: 500px;
          overflow-y: auto;
        }

        .settlements-list::-webkit-scrollbar {
          width: 4px;
        }

        .settlements-list::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }

        .settlements-list::-webkit-scrollbar-thumb {
          background: #c1c7cd;
          border-radius: 4px;
        }

        .settlement-item {
          padding: 12px 16px;
          background: #f8fafc;
          border-radius: 8px;
          border: 1px solid #e9ecef;
          transition: all 0.2s;
        }

        .settlement-item:hover {
          border-color: #d1d5db;
        }

        .settlement-item-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
        }

        .settlement-item-left {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .certificate-number {
          display: flex;
          align-items: center;
          gap: 4px;
          font-weight: 600;
          font-size: 14px;
          color: #4f46e5;
          font-family: monospace;
        }

        .settlement-date {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          color: #6b7280;
        }

        .settlement-item-actions {
          display: flex;
          gap: 4px;
        }

        .action-btn {
          width: 28px;
          height: 28px;
          border: none;
          border-radius: 4px;
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

        .settlement-amounts {
          display: flex;
          gap: 24px;
          margin-top: 8px;
          flex-wrap: wrap;
        }

        .amount-item {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
        }

        .amount-label {
          color: #6b7280;
        }

        .amount-value {
          font-weight: 600;
        }

        .amount-value.total {
          color: #1a1a2e;
        }

        .amount-value.remaining {
          color: #d97706;
        }

        .amount-value.zero {
          color: #059669;
        }

        .settlement-description {
          display: flex;
          align-items: flex-start;
          gap: 6px;
          margin-top: 6px;
          font-size: 13px;
          color: #374151;
        }

        .settlement-description p {
          margin: 0;
          line-height: 1.5;
        }

        .settlement-file {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 6px;
          padding-top: 6px;
          border-top: 1px solid #e9ecef;
        }

        .file-link {
          color: #4f46e5;
          text-decoration: none;
          font-size: 13px;
          font-weight: 500;
        }

        .file-link:hover {
          text-decoration: underline;
        }

        .download-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 4px;
          color: #059669;
          background: #d1fae5;
          transition: all 0.2s;
          border: none;
          cursor: pointer;
        }

        .download-link:hover {
          background: #a7f3d0;
          color: #047857;
        }

        .settlement-contract {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 6px;
          font-size: 12px;
          color: #6b7280;
          padding-top: 6px;
          border-top: 1px solid #e9ecef;
        }

        .contract-subject {
          color: #4f46e5;
        }

        @media (max-width: 768px) {
          .settlement-list {
            padding: 12px;
          }

          .list-header {
            flex-direction: column;
            align-items: stretch;
          }

          .header-actions {
            flex-direction: column;
            width: 100%;
          }

          .search-input-wrapper {
            width: 100%;
          }

          .btn-add {
            width: 100%;
            justify-content: center;
          }

          .settlement-item-header {
            flex-direction: column;
            align-items: stretch;
          }

          .settlement-item-left {
            flex-wrap: wrap;
          }

          .settlement-item-actions {
            justify-content: flex-end;
          }

          .settlement-amounts {
            flex-direction: column;
            gap: 4px;
          }
        }
      `}</style>
    </div>
  );
};

export default SettlementList;