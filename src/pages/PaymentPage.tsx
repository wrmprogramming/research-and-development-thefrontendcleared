// src/modules/payment/pages/PaymentPage.tsx

import React, { useState } from 'react';
import { PaymentList, PaymentForm, PaymentStats } from '../modules/payment/components';
import type { Payment } from '../modules/payment/types/payment.types';
import { PaymentDetails } from '../modules/payment/components/PaymentDetails';

export const PaymentPage: React.FC = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Payment | null>(null);
  const [selectedPaymentId, setSelectedPaymentId] = useState<number | null>(null);

  const handleAdd = () => {
    setEditingItem(null);
    setFormOpen(true);
  };

  const handleEdit = (item: Payment) => {
    setEditingItem(item);
    setFormOpen(true);
  };

  const handleView = (item: Payment) => {
    setSelectedPaymentId(item.id);
    setDetailsOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingItem(null);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedPaymentId(null);
  };

  const handleSuccess = () => {
    setFormOpen(false);
    setEditingItem(null);
  };

  return (
    <div className="payment-page">
      <PaymentStats />

      <PaymentList
        onAdd={handleAdd}
        onEdit={handleEdit}
        onView={handleView}
      />

      {formOpen && (
        <div className="modal-overlay" onClick={handleCloseForm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <PaymentForm
              initialData={editingItem || undefined}
              onSuccess={handleSuccess}
              onCancel={handleCloseForm}
            />
          </div>
        </div>
      )}

      {detailsOpen && selectedPaymentId && (
        <div className="modal-overlay" onClick={handleCloseDetails}>
          <div className="modal-content details-modal" onClick={(e) => e.stopPropagation()}>
            <PaymentDetails
              paymentId={selectedPaymentId}
              onClose={handleCloseDetails}
            />
          </div>
        </div>
      )}

      <style>{`
        .payment-page {
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

        .modal-content.details-modal {
          max-width: 720px;
        }

        @media (max-width: 768px) {
          .payment-page {
            padding: 12px;
          }

          .modal-content {
            margin: 10px;
            max-width: 100%;
          }

          .modal-content.details-modal {
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default PaymentPage;
