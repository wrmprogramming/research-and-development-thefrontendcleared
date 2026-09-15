// src/pages/CommunicationPage.tsx

import React, { useState } from 'react';
import {
  CommunicationList,
  CommunicationForm,
  CommunicationStats,
} from '../modules/communication/components';
import type { Communication } from '../modules/communication/types/communication.types';

export const CommunicationPage: React.FC = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Communication | null>(null);

  const handleAdd = () => {
    setEditingItem(null);
    setFormOpen(true);
  };

  const handleEdit = (item: Communication) => {
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
    <div className="communication-page">
      {/* آمار مکاتبات */}
      <CommunicationStats />

      {/* لیست مکاتبات */}
      <CommunicationList
        onAdd={handleAdd}
        onEdit={handleEdit}
        onView={(item) => console.log('View Communication:', item)}
        onDelete={(id) => console.log('Delete Communication:', id)}
      />

      {/* مودال فرم */}
      {formOpen && (
        <div className="modal-overlay" onClick={handleCloseForm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <CommunicationForm
              initialData={editingItem || undefined}
              onSuccess={handleSuccess}
              onCancel={handleCloseForm}
            />
          </div>
        </div>
      )}

      <style>{`
        .communication-page {
          padding: 20px;
          min-height: 100vh;
          background-color: transparent;

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
          max-width: 800px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .modal-content::-webkit-scrollbar {
          width: 6px;
        }

        .modal-content::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }

        .modal-content::-webkit-scrollbar-thumb {
          background: #c1c7cd;
          border-radius: 10px;
        }

        .modal-content::-webkit-scrollbar-thumb:hover {
          background: #a0a7ae;
        }

        @media (max-width: 768px) {
          .communication-page {
            padding: 12px;
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

export default CommunicationPage;