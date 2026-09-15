// src/modules/progress/pages/ProgressPage.tsx

import React, { useState } from 'react';
import { ProgressList, ProgressForm, ProgressStats } from '../modules/progress/components';
import type { Progress } from '../modules/progress/types/progress.types';
import { Plus } from 'lucide-react';

export const ProgressPage: React.FC = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Progress | null>(null);
  const [selectedContractId, setSelectedContractId] = useState<number | undefined>(undefined);

  const handleAdd = () => {
    setEditingItem(null);
    setFormOpen(true);
  };

  const handleEdit = (item: Progress) => {
    setEditingItem(item);
    if (item.contract) {
      setSelectedContractId(typeof item.contract === 'object' ? (item.contract as any).id : item.contract);
    }
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingItem(null);
    setSelectedContractId(undefined);
  };

  const handleSuccess = () => {
    setFormOpen(false);
    setEditingItem(null);
    setSelectedContractId(undefined);
  };

  return (
    <div className="progress-page">
      <div className="page-header">
        <h1>پیشرفت فیزیکی پروژه‌ها</h1>
        <button className="btn-add" onClick={handleAdd}>
          <Plus size={18} />
          ثبت پیشرفت جدید
        </button>
      </div>

      <ProgressStats />

      <div className="progress-list-wrapper">
        <ProgressList
          onAdd={handleAdd}
          onEdit={handleEdit}
          onView={(item) => console.log('View:', item)}
        />
      </div>

      {formOpen && (
        <div className="modal-overlay" onClick={handleCloseForm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <ProgressForm
              initialData={editingItem || undefined}
              contractId={selectedContractId}
              onSuccess={handleSuccess}
              onCancel={handleCloseForm}
            />
          </div>
        </div>
      )}

      <style>{`
        .progress-page {
          padding: 20px;
          min-height: 100vh;
          background-color: transparent;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .page-header h1 {
          font-size: 24px;
          font-weight: 700;
          color: #1a1a2e;
          margin: 0;
        }

        .btn-add {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 24px;
          background: #4f46e5;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-add:hover {
          background: #4338ca;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
        }

        .progress-list-wrapper {
          margin-top: 20px;
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
        }

        .modal-content {
          background: white;
          border-radius: 16px;
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        @media (max-width: 768px) {
          .progress-page {
            padding: 12px;
          }

          .page-header {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }

          .modal-content {
            margin: 10px;
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default ProgressPage;
