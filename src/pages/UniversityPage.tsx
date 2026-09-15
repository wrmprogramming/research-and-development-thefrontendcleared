// src/modules/university/pages/UniversityPage.tsx
import React, { useState, useRef, useCallback } from 'react';
import { UniversityTreeList, UniversityForm } from '../modules/university/components';
import type { University, TreeNode } from '../modules/university/types/university.types';
import { GraduationCap } from 'lucide-react';
import { useUniversity } from '../modules/university/hooks/useUniversity';

export const UniversityPage: React.FC = () => {
  const { refetch } = useUniversity();
  
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<University | TreeNode | null>(null);
  const [selectedCityId, setSelectedCityId] = useState<number | undefined>(undefined);
  const [selectedCityName, setSelectedCityName] = useState<string>('');
  const [formTitle, setFormTitle] = useState('افزودن دانشگاه جدید');
  const [formMode, setFormMode] = useState<'add' | 'edit' | 'add-with-city'>('add');
  
  const treeListRef = useRef<any>(null);

  // ========== Handlers ==========
  const handleAddUniversity = useCallback(() => {
    setEditingItem(null);
    setSelectedCityId(undefined);
    setSelectedCityName('');
    setFormTitle('افزودن دانشگاه جدید');
    setFormMode('add');
    setFormOpen(true);
  }, []);

  const handleAddUniversityWithCity = useCallback((cityId: number, cityName: string) => {
    setEditingItem(null);
    setSelectedCityId(cityId);
    setSelectedCityName(cityName);
    setFormTitle(`افزودن دانشگاه جدید به شهر "${cityName}"`);
    setFormMode('add-with-city');
    setFormOpen(true);
  }, []);

  const handleEditUniversity = useCallback((item: TreeNode) => {
    console.log('🔄 Editing university:', item);
    setEditingItem(item);
    setSelectedCityId(undefined);
    setSelectedCityName('');
    setFormTitle(`ویرایش دانشگاه "${item.name}"`);
    setFormMode('edit');
    setFormOpen(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setFormOpen(false);
    setEditingItem(null);
    setSelectedCityId(undefined);
    setSelectedCityName('');
  }, []);

  // ========== به‌روزرسانی سریع پس از موفقیت ==========
  const handleSuccess = useCallback(async () => {
    console.log('🔄 handleSuccess called - closing form and refreshing...');
    
    // ✅ اول فرم را ببند
    setFormOpen(false);
    setEditingItem(null);
    setSelectedCityId(undefined);
    setSelectedCityName('');
    
    // ✅ سپس رفرش کن (با تاخیر کم برای اطمینان از ثبت در سرور)
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      await refetch();
      
      if (treeListRef.current?.refresh) {
        await treeListRef.current.refresh();
      }
      console.log('✅ Refresh completed successfully');
    } catch (error) {
      console.error('❌ Error during refresh:', error);
    }
  }, [refetch]);

  // ========== دریافت داده‌های اولیه فرم ==========
  const getInitialData = useCallback(() => {
    if (formMode === 'edit' && editingItem) {
      const uniData = editingItem.data || {};
      return {
        name: editingItem.name || '',
        city_id: typeof uniData.city === 'object' ? uniData.city?.id : uniData.city,
        type_id: typeof uniData.type === 'object' ? uniData.type?.id : uniData.type,
        address: uniData.address || '',
        phone: uniData.phone || '',
        email: uniData.email || '',
        website: uniData.website || '',
        id: editingItem.id
      };
    }
    
    if (formMode === 'add-with-city' && selectedCityId) {
      return {
        name: '',
        city_id: selectedCityId,
        type_id: 0,
        address: '',
        phone: '',
        email: '',
        website: '',
      };
    }
    
    return {
      name: '',
      city_id: 0,
      type_id: 0,
      address: '',
      phone: '',
      email: '',
      website: '',
    };
  }, [formMode, editingItem, selectedCityId]);

  return (
    <div className="university-page">
      {/* ========== Header ========== */}
      <div className="page-header">
        <div className="page-header-content">
          <div className="page-title-section">
            <div className="page-icon-wrapper">
              <GraduationCap size={28} className="page-icon" />
            </div>
            <div>
              <h1 className="page-title">مدیریت دانشگاه‌ها</h1>
              <p className="page-subtitle">مدیریت سلسله‌مراتبی استان‌ها، شهرها و دانشگاه‌ها</p>
            </div>
          </div>
        </div>
      </div>

      {/* ========== Tree List ========== */}
      <UniversityTreeList
        ref={treeListRef}
        onAddUniversity={handleAddUniversityWithCity}
        onEditUniversity={handleEditUniversity}
        onView={(item) => console.log('👁️ View:', item)}
      />

      {/* ========== Form Modal ========== */}
      {formOpen && (
        <div className="modal-overlay" onClick={handleCloseForm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <UniversityForm
              title={formTitle}
              initialData={getInitialData()}
              cityId={selectedCityId}
              onSuccess={handleSuccess}
              onCancel={handleCloseForm}
            />
          </div>
        </div>
      )}

      {/* ========== Styles ========== */}
      <style>{`
        .university-page {
          padding: 20px;
          min-height: 100vh;
          background-color: transparent;
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
          background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .page-icon {
          color: #059669;
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
          max-width: 600px;
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

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        @media (max-width: 768px) {
          .university-page {
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

        @media (max-width: 480px) {
          .university-page {
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

export default UniversityPage;
