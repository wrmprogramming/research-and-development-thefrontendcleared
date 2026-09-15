// src/pages/CompanyPage.tsx

import React, { useState } from 'react';
import { CompanyList, CompanyForm } from '../modules/company/components';
import type { Company } from '../modules/company/types/company.types';
import { Building2 } from 'lucide-react';

export const CompanyPage: React.FC = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Company | null>(null);

  const handleAdd = () => {
    setEditingItem(null);
    setFormOpen(true);
  };

  const handleEdit = (item: Company) => {
    setEditingItem(item);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingItem(null);
  };

  const handleSuccess = () => {
    setFormOpen(false);
    setEditingItem(null);
  };

  return (
    <div className="company-page">
      {/* هدر صفحه - بدون دکمه افزودن */}
      <div className="page-header">
        <div className="page-header-content">
          <div className="page-title-section">
            <div className="page-icon-wrapper">
              <Building2 size={28} className="page-icon" />
            </div>
            <div>
              <h1 className="page-title">مدیریت شرکت‌ها</h1>
              <p className="page-subtitle">مدیریت و سازماندهی اطلاعات شرکت‌های همکار</p>
            </div>
          </div>
          {/* ✅ دکمه افزودن از هدر حذف شد - فقط در CompanyList وجود دارد */}
        </div>
      </div>

      {/* لیست شرکت‌ها - با دکمه افزودن */}
      <CompanyList
        onAdd={handleAdd}
        onEdit={handleEdit}
        onView={(item) => console.log('مشاهده شرکت:', item)}
      />

      {/* مودال فرم */}
      {formOpen && (
        <div className="modal-overlay" onClick={handleCloseForm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <CompanyForm
              initialData={editingItem || undefined}
              onSuccess={handleSuccess}
              onCancel={handleCloseForm}
            />
          </div>
        </div>
      )}

      <style>{`
        .company-page {
          padding: 20px;
          min-height: 100vh;
          background-color: transparent;
        }

        /* ========== Page Header ========== */
        .page-header {
          background: white;
          border-radius: 12px;
          padding: 20px 24px;
          margin-bottom: 20px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
          border: 1px solid #e9ecef;
        }

        .page-header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
        }

        .page-title-section {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .page-icon-wrapper {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: linear-gradient(135deg, #eef2ff 0%, #dbeafe 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .page-icon {
          color: #4f46e5;
        }

        .page-title {
          font-size: 22px;
          font-weight: 700;
          color: #1a1a2e;
          margin: 0 0 4px 0;
        }

        .page-subtitle {
          font-size: 14px;
          color: #6b7280;
          margin: 0;
        }

        /* ========== Modal ========== */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          z-index: 1050;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: fadeIn 0.2s ease;
        }

        .modal-content {
          background: white;
          border-radius: 16px;
          max-width: 700px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: slideUp 0.3s ease;
        }

        .modal-content::-webkit-scrollbar {
          width: 6px;
        }

        .modal-content::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }

        .modal-content::-webkit-scrollbar-thumb {
          background: #c1c7cd;
          border-radius: 4px;
        }

        /* ========== Animations ========== */
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        /* ========== Responsive ========== */
        @media (max-width: 768px) {
          .company-page {
            padding: 12px;
          }

          .page-header {
            padding: 16px;
          }

          .page-header-content {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }

          .page-title-section {
            gap: 12px;
          }

          .page-icon-wrapper {
            width: 40px;
            height: 40px;
          }

          .page-title {
            font-size: 18px;
          }

          .page-subtitle {
            font-size: 13px;
          }

          .modal-content {
            margin: 10px;
            max-width: 100%;
            max-height: 95vh;
          }
        }

        @media (max-width: 480px) {
          .company-page {
            padding: 8px;
          }

          .page-header {
            padding: 12px;
          }

          .page-title {
            font-size: 16px;
          }

          .page-icon-wrapper {
            width: 36px;
            height: 36px;
          }

          .page-icon {
            width: 20px;
            height: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default CompanyPage;
