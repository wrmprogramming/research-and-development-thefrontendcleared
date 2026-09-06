// components/generic/GenericDeleteModal.tsx
import React from 'react';
import { X, Trash2 } from 'lucide-react';

interface GenericDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  itemName?: string;
  isLoading?: boolean;
}

export function GenericDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'حذف آیتم',
  message = 'آیا از حذف این آیتم مطمئن هستید؟',
  itemName,
  isLoading = false,
}: GenericDeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="modal show d-block" 
      style={{ 
        backgroundColor: 'rgba(0,0,0,0.5)', 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        zIndex: 1050,
        backdropFilter: 'blur(4px)'
      }}
    >
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '450px' }}>
        <div className="modal-content" style={{ borderRadius: '16px', overflow: 'hidden' }}>
          {/* هدر */}
          <div className="modal-header" style={{ borderBottom: 'none', padding: '24px 24px 0 24px' }}>
            <div 
              className="rounded-circle d-flex align-items-center justify-content-center mx-auto"
              style={{ 
                width: '64px', 
                height: '64px', 
                backgroundColor: '#fee2e2',
              }}
            >
              <Trash2 size={32} color="#dc2626" />
            </div>
            <button 
              type="button" 
              className="btn-close position-absolute" 
              style={{ top: '20px', right: '20px' }}
              onClick={onClose}
            />
          </div>

          {/* بدنه */}
          <div className="modal-body text-center" style={{ padding: '24px' }}>
            <h4 className="mb-3" style={{ fontWeight: '600' }}>{title}</h4>
            <p className="text-muted mb-2" style={{ fontSize: '0.95rem' }}>
              {message}
            </p>
            {itemName && (
              <div 
                className="mt-3 p-2 bg-light rounded-3 d-inline-block"
                style={{ 
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  padding: '8px 16px'
                }}
              >
                <strong style={{ color: '#dc2626' }}>"{itemName}"</strong>
              </div>
            )}
            <p className="text-muted mt-3 small">
              این عمل غیرقابل بازگشت است.
            </p>
          </div>

          {/* فوتر */}
          <div className="modal-footer" style={{ borderTop: 'none', padding: '0 24px 24px 24px', gap: '12px' }}>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={onClose}
              style={{ 
                borderRadius: '10px', 
                padding: '10px 24px',
                flex: 1,
                fontWeight: '500'
              }}
              disabled={isLoading}
            >
              انصراف
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={onConfirm}
              disabled={isLoading}
              style={{ 
                borderRadius: '10px', 
                padding: '10px 24px',
                flex: 1,
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                  در حال حذف...
                </>
              ) : (
                <>
                  <Trash2 size={16} />
                  حذف
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
//