import React, { useState } from 'react';
import { ContractDelayList, ContractDelayForm } from '../modules/contract-delay/components';
import type { ContractDelay } from '../modules/contract-delay/types/contractDelay.types';
import { Clock } from 'lucide-react';

interface ContractDelayPageProps {
  contractId?: number;
  contractNumber?: string;
  readOnly?: boolean;
}

export const ContractDelayPage: React.FC<ContractDelayPageProps> = ({
  contractId,
  contractNumber,
  readOnly = false,
}) => {
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ContractDelay | null>(null);

  const handleAdd = () => {
    setEditingItem(null);
    setFormOpen(true);
  };

  const handleEdit = (item: ContractDelay) => {
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
    <div className="contract-delay-page">
      <div className="page-header">
        <div className="header-left">
          <div className="header-icon">
            <Clock size={24} />
          </div>
          <div>
            <h1>تمدید قرارداد</h1>
            {contractNumber && (
              <span className="contract-badge">قرارداد: {contractNumber}</span>
            )}
          </div>
        </div>
      </div>

      <ContractDelayList
        contractId={contractId}
        onAdd={handleAdd}
        onEdit={handleEdit}
        readOnly={readOnly}
        onView={(item) => console.log('View delay:', item)}
      />

      {formOpen && (
        <div className="modal-overlay" onClick={handleCloseForm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <ContractDelayForm
              contractId={contractId}
              initialData={editingItem || undefined}
              onSuccess={handleSuccess}
              onCancel={handleCloseForm}
            />
          </div>
        </div>
      )}

      <style>{`
        .contract-delay-page {
          padding: 20px;
          min-height: 100vh;
          background-color: transparent;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          background: white;
          padding: 16px 20px;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
          flex-wrap: wrap;
          gap: 12px;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .header-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: linear-gradient(135deg, #eef2ff 0%, #dbeafe 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #4f46e5;
        }

        .header-left h1 {
          margin: 0;
          font-size: 22px;
          font-weight: 700;
          color: #1a1a2e;
        }

        .contract-badge {
          display: inline-block;
          background: #eef2ff;
          color: #4f46e5;
          padding: 2px 14px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 500;
          margin-top: 2px;
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

        .modal-content::-webkit-scrollbar {
          width: 4px;
        }

        .modal-content::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }

        .modal-content::-webkit-scrollbar-thumb {
          background: #c1c7cd;
          border-radius: 4px;
        }

        @media (max-width: 768px) {
          .contract-delay-page {
            padding: 12px;
          }

          .page-header {
            flex-direction: column;
            align-items: stretch;
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

export default ContractDelayPage;