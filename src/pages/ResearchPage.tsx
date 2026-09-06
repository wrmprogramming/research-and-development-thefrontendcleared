// src/pages/ResearchPage.tsx

import React, { useState } from 'react';
import { ResearchList, ResearchForm, ResearchStats } from '../modules/research/components';
import type { Research } from '../modules/research/types/research.types';

export const ResearchPage: React.FC = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Research | null>(null);

  const handleAdd = () => {
    setEditingItem(null);
    setFormOpen(true);
  };

  const handleEdit = (item: Research) => {
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
    <div className="research-page">
      <ResearchStats />

      <ResearchList
        onAdd={handleAdd}
        onEdit={handleEdit}
        onView={(item) => console.log('View:', item)}
      />

      {formOpen && (
        <div className="modal-overlay" onClick={handleCloseForm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <ResearchForm
              initialData={editingItem || undefined}
              onSuccess={handleSuccess}
              onCancel={handleCloseForm}
            />
          </div>
        </div>
      )}

      <style>{`
        .research-page {
          padding: 20px;
          min-height: 100vh;
          background: #f8fafc;
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

        @media (max-width: 768px) {
          .research-page {
            padding: 12px;
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

export default ResearchPage;
