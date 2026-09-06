// src/modules/university-type/pages/UniversityTypePage.tsx
import React, { useState } from 'react';
import { UniversityTypeList, UniversityTypeForm } from '../modules/university-type/components';
import type { UniversityType } from '../modules/university-type/types/university-type.types';
import { Building2 } from 'lucide-react';
import { useUniversityType } from '../modules/university-type/hooks/useUniversityType';


export const UniversityTypePage: React.FC = () => {
  const { refetch } = useUniversityType();
  
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<UniversityType | null>(null);

  const handleAdd = () => {
    setEditingItem(null);
    setFormOpen(true);
  };

  const handleEdit = (item: UniversityType) => {
    setEditingItem(item);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingItem(null);
  };

  const handleSuccess = async () => {
    setFormOpen(false);
    setEditingItem(null);
    await refetch();
  };

  return (
    <div className="university-type-page">
      <div className="page-header">
        <div className="page-header-content">
          <div className="page-title-section">
            <div className="page-icon-wrapper">
              <Building2 size={28} className="page-icon" />
            </div>
            <div>
              <h1 className="page-title">مدیریت انواع دانشگاه</h1>
              <p className="page-subtitle">مدیریت و سازماندهی انواع دانشگاه‌ها</p>
            </div>
          </div>
        </div>
      </div>

      <UniversityTypeList
        onAdd={handleAdd}
        onEdit={handleEdit}
        onView={(item) => console.log('مشاهده:', item)}
      />

      {formOpen && (
        <div className="modal-overlay" onClick={handleCloseForm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <UniversityTypeForm
              initialData={editingItem || undefined}
              onSuccess={handleSuccess}
              onCancel={handleCloseForm}
            />
          </div>
        </div>
      )}

      <style>{`
        .university-type-page {
          padding: 20px;
          min-height: 100vh;
          background: #f8fafc;
        }

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
          max-width: 500px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: slideUp 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        @media (max-width: 768px) {
          .university-type-page {
            padding: 12px;
          }

          .page-header {
            padding: 16px;
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
      `}</style>
    </div>
  );
};

export default UniversityTypePage;