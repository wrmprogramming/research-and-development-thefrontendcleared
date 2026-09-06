// src/modules/payment/components/PaymentDetails.tsx

import React, { useState } from 'react';
import { usePayment } from '../hooks/usePayment';
import { type Payment } from '../types/payment.types';
import { formatCurrency } from '../../../utils/formatter.utils';
import dateUtils from '@utils/dateUtils';
import {
  X,
  DollarSign,
  User,
  FileText,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Eye,
  Paperclip,
  Building2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface PaymentDetailsProps {
  paymentId: number;
  onClose: () => void;
}

export const PaymentDetails: React.FC<PaymentDetailsProps> = ({ paymentId, onClose }) => {
  const { useItem } = usePayment();
  const { data: payment, isLoading } = useItem(paymentId);
  const [showFullDescription, setShowFullDescription] = useState(false);

  if (isLoading) {
    return (
      <div className="payment-details">
        <div className="details-header">
          <h3>جزئیات پرداخت</h3>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="details-body">
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">در حال بارگذاری...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="payment-details">
        <div className="details-header">
          <h3>جزئیات پرداخت</h3>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="details-body">
          <div className="error-state">
            <AlertCircle size={48} />
            <p>پرداخت مورد نظر یافت نشد</p>
          </div>
        </div>
      </div>
    );
  }

  const getStatusInfo = (isPaid: boolean, isVerified: boolean) => {
    if (isVerified) {
      return {
        label: 'تایید شده',
        color: '#059669',
        bgColor: '#d1fae5',
        icon: CheckCircle,
        text: 'این پرداخت تایید شده است'
      };
    }
    if (isPaid) {
      return {
        label: 'پرداخت شده',
        color: '#2563eb',
        bgColor: '#dbeafe',
        icon: Clock,
        text: 'این پرداخت ثبت شده اما هنوز تایید نشده است'
      };
    }
    return {
      label: 'پرداخت نشده',
      color: '#dc2626',
      bgColor: '#fee2e2',
      icon: XCircle,
      text: 'این پرداخت هنوز انجام نشده است'
    };
  };

  const statusInfo = getStatusInfo(payment.is_paid, payment.is_verified);
  const StatusIcon = statusInfo.icon;

  const getFileName = (url: string) => {
    if (!url) return 'فایل';
    try {
      const parts = url.split('/');
      return parts[parts.length - 1] || 'فایل';
    } catch {
      return 'فایل';
    }
  };

  const isImage = (url: string) => {
    const ext = url.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '');
  };

  return (
    <div className="payment-details">
      <div className="details-header">
        <h3>جزئیات پرداخت</h3>
        <button className="close-btn" onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      <div className="details-body">
        {/* Header Info */}
        <div className="detail-section header-section">
          <div className="detail-row">
            <div className="detail-item">
              <span className="detail-label">شماره پرداخت</span>
              <span className="detail-value code">{payment.payment_number}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">وضعیت</span>
              <span
                className="status-badge"
                style={{
                  backgroundColor: statusInfo.bgColor,
                  color: statusInfo.color,
                }}
              >
                <StatusIcon size={14} />
                {statusInfo.label}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">نوع پرداخت</span>
              <span className="detail-value">{payment.payment_type_name || '—'}</span>
            </div>
          </div>
          <div className="detail-item full-width">
            <span className="detail-label">توضیحات وضعیت</span>
            <span className="detail-value status-text">{statusInfo.text}</span>
          </div>
        </div>

        {/* Financial */}
        <div className="detail-section">
          <h4>اطلاعات مالی</h4>
          <div className="detail-row">
            <div className="detail-item">
              <span className="detail-label">
                <DollarSign size={16} /> مبلغ پرداخت
              </span>
              <span className="detail-value amount">{formatCurrency(payment.amount)}</span>
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="detail-section">
          <h4>تاریخ‌ها</h4>
          <div className="detail-row">
            <div className="detail-item">
              <span className="detail-label">
                <Calendar size={16} /> تاریخ پرداخت
              </span>
              <span className="detail-value">{payment.payment_date}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">
                <Calendar size={16} /> تاریخ ثبت
              </span>
              <span className="detail-value">{payment.created_at}</span>
            </div>
          </div>
          {payment.verified_at && (
            <div className="detail-row">
              <div className="detail-item">
                <span className="detail-label">
                  <CheckCircle size={16} /> تاریخ تایید
                </span>
                <span className="detail-value">{payment.verified_at}</span>
              </div>
              {payment.verified_by_name && (
                <div className="detail-item">
                  <span className="detail-label">
                    <User size={16} /> تایید کننده
                  </span>
                  <span className="detail-value">{payment.verified_by_name}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Related */}
        <div className="detail-section">
          <h4>اطلاعات مرتبط</h4>
          <div className="detail-row">
            <div className="detail-item">
              <span className="detail-label">
                <Building2 size={16} /> قرارداد
              </span>
              <span className="detail-value">
                {payment.contract_number || '—'}
                {payment.contract_subject && (
                  <span className="detail-sub"> ({payment.contract_subject})</span>
                )}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">
                <User size={16} /> دریافت‌کننده
              </span>
              <span className="detail-value">{payment.receiver_name || '—'}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        {payment.description && (
          <div className="detail-section">
            <h4>توضیحات</h4>
            <p className={`description ${showFullDescription ? 'expanded' : ''}`}>
              {payment.description}
            </p>
            {payment.description.length > 200 && (
              <button
                className="toggle-description"
                onClick={() => setShowFullDescription(!showFullDescription)}
              >
                {showFullDescription ? (
                  <>مشاهده کمتر <ChevronUp size={16} /></>
                ) : (
                  <>مشاهده بیشتر <ChevronDown size={16} /></>
                )}
              </button>
            )}
          </div>
        )}

        {/* Files */}
        {payment.attachments && payment.attachments.length > 0 && (
          <div className="detail-section">
            <h4>فایل‌های پیوست</h4>
            <div className="files-list">
              {payment.attachments.map((att) => (
                <div key={att.id} className="file-item">
                  <Paperclip size={16} className="file-icon" />
                  <span className="file-label">{att.filename || getFileName(att.file)}</span>
                  <span className="file-size">{(att.size / 1024).toFixed(1)} KB</span>
                  <div className="file-actions">
                    <a href={att.file} target="_blank" rel="noopener noreferrer" className="file-action" title="مشاهده">
                      <Eye size={14} />
                    </a>
                    <a href={att.file} download className="file-action" title="دانلود">
                      <Download size={14} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Meta */}
        <div className="detail-section meta-section">
          <div className="meta-row">
            <span className="meta-label">شناسه</span>
            <span className="meta-value">#{payment.id}</span>
          </div>
          <div className="meta-row">
            <span className="meta-label">تاریخ ایجاد</span>
            <span className="meta-value">{payment.created_at}</span>
          </div>
          {payment.updated_at && (
            <div className="meta-row">
              <span className="meta-label">آخرین بروزرسانی</span>
              <span className="meta-value">{payment.updated_at}</span>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .payment-details {
          padding: 24px;
          background: white;
          border-radius: 12px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .details-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid #e9ecef;
        }

        .details-header h3 {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
          color: #1a1a2e;
        }

        .close-btn {
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
          transition: all 0.2s;
        }

        .close-btn:hover {
          background: #f3f4f6;
          color: #1a1a2e;
        }

        .details-body {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .detail-section {
          padding: 16px;
          background: #f8fafc;
          border-radius: 8px;
        }

        .detail-section h4 {
          font-size: 14px;
          font-weight: 600;
          color: #1a1a2e;
          margin: 0 0 12px 0;
        }

        .header-section {
          background: #eef2ff;
        }

        .meta-section {
          background: #f3f4f6;
        }

        .detail-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 12px;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .detail-item.full-width {
          grid-column: 1 / -1;
        }

        .detail-label {
          font-size: 12px;
          color: #6b7280;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .detail-value {
          font-size: 14px;
          font-weight: 500;
          color: #1a1a2e;
        }

        .detail-value.code {
          font-family: monospace;
          background: white;
          padding: 2px 8px;
          border-radius: 4px;
          display: inline-block;
          width: fit-content;
        }

        .detail-value.amount {
          font-size: 18px;
          font-weight: 700;
          color: #4f46e5;
        }

        .detail-value.status-text {
          font-size: 13px;
          font-weight: 400;
          color: #374151;
        }

        .detail-sub {
          font-size: 12px;
          color: #6b7280;
          font-weight: 400;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 14px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 500;
          width: fit-content;
        }

        .description {
          font-size: 14px;
          color: #374151;
          line-height: 1.6;
          margin: 0;
          white-space: pre-wrap;
          max-height: 100px;
          overflow: hidden;
          transition: max-height 0.3s ease;
        }

        .description.expanded {
          max-height: none;
        }

        .toggle-description {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          margin-top: 8px;
          background: none;
          border: none;
          color: #4f46e5;
          font-size: 13px;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .toggle-description:hover {
          background: #eef2ff;
        }

        .files-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .file-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          background: white;
          border: 1px solid #e9ecef;
          border-radius: 8px;
        }

        .file-item .file-icon {
          color: #6b7280;
        }

        .file-item .file-label {
          font-size: 13px;
          font-weight: 500;
          color: #1a1a2e;
          flex: 1;
        }

        .file-item .file-size {
          font-size: 12px;
          color: #6b7280;
        }

        .file-item .file-actions {
          display: flex;
          gap: 4px;
        }

        .file-item .file-action {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 6px;
          background: transparent;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
        }

        .file-item .file-action:hover {
          background: #f3f4f6;
          color: #4f46e5;
        }

        .meta-row {
          display: flex;
          justify-content: space-between;
          padding: 4px 0;
          font-size: 13px;
        }

        .meta-row:not(:last-child) {
          border-bottom: 1px solid #e9ecef;
        }

        .meta-label {
          color: #6b7280;
        }

        .meta-value {
          color: #1a1a2e;
          font-weight: 500;
        }

        .error-state {
          text-align: center;
          padding: 40px;
        }

        .error-state svg {
          color: #dc2626;
          margin-bottom: 12px;
        }

        .error-state p {
          color: #374151;
          margin: 0;
        }

        .text-center {
          text-align: center;
        }

        .py-5 {
          padding-top: 40px;
          padding-bottom: 40px;
        }

        .spinner-border {
          display: inline-block;
          width: 32px;
          height: 32px;
          border: 3px solid #e9ecef;
          border-top-color: #4f46e5;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 768px) {
          .payment-details {
            padding: 16px;
          }

          .detail-row {
            grid-template-columns: 1fr;
          }

          .detail-section {
            padding: 12px;
          }

          .file-item {
            flex-wrap: wrap;
          }

          .file-item .file-actions {
            width: 100%;
            justify-content: flex-end;
          }
        }
      `}</style>
    </div>
  );
};

export default PaymentDetails;