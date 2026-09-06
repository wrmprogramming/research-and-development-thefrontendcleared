// src/modules/city/pages/CityPage.tsx

import React, { useState, useRef } from 'react';
import { CityTreeList, CityForm } from "../modules/city/components";
import type { City, TreeNode } from '../modules/city/types/city.types';
import { MapPin } from 'lucide-react';
// import { useCity } from '../hooks/useCity';
import { useCity } from '../modules/city/hooks/useCity';


export const CityPage: React.FC = () => {
  const { refetch } = useCity();
  
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<City | TreeNode | null>(null);
  const [selectedProvinceId, setSelectedProvinceId] = useState<number | undefined>(undefined);
  const [formTitle, setFormTitle] = useState('افزودن استان جدید');
  const [formMode, setFormMode] = useState<'add-province' | 'edit-province' | 'add-city' | 'edit-city'>('add-province');
  
  const treeListRef = useRef<any>(null);

  const handleAddProvince = () => {
    setEditingItem(null);
    setSelectedProvinceId(undefined);
    setFormTitle('افزودن استان جدید');
    setFormMode('add-province');
    setFormOpen(true);
  };

  const handleEditProvince = (item: TreeNode) => {
    console.log('🔄 Editing province:', item);
    setEditingItem(item);
    setSelectedProvinceId(undefined);
    setFormTitle(`ویرایش استان "${item.name}"`);
    setFormMode('edit-province');
    setFormOpen(true);
  };

  const handleAddCity = (provinceId: number, provinceName: string) => {
    console.log('➕ Adding city to province:', provinceId, provinceName);
    setEditingItem(null);
    setSelectedProvinceId(provinceId);
    setFormTitle(`افزودن شهر جدید به استان "${provinceName}"`);
    setFormMode('add-city');
    setFormOpen(true);
  };

  const handleEditCity = (item: TreeNode) => {
    console.log('🔄 Editing city:', item);
    setEditingItem(item);
    setSelectedProvinceId(undefined);
    setFormTitle(`ویرایش شهر "${item.name}"`);
    setFormMode('edit-city');
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingItem(null);
    setSelectedProvinceId(undefined);
  };

  const handleSuccess = async () => {
    setFormOpen(false);
    setEditingItem(null);
    setSelectedProvinceId(undefined);
    
    console.log('🔄 Refreshing tree data...');
    await refetch();
    
    if (treeListRef.current?.refresh) {
      await treeListRef.current.refresh();
    }
    
    console.log('✅ Refresh completed');
  };

  const getInitialData = () => {
    if (formMode === 'edit-province' && editingItem) {
      return { 
        name: editingItem.name,
        id: editingItem.id 
      };
    }
    
    if (formMode === 'edit-city' && editingItem) {
      const cityData = editingItem.data || {};
      return {
        name: editingItem.name || '',
        province_id: editingItem.parentId || selectedProvinceId || 0,
        code: cityData.code || '',
        id: editingItem.id
      };
    }
    
    if (formMode === 'add-city') {
      return {
        name: '',
        province_id: selectedProvinceId || 0,
        code: '',
      };
    }
    
    return { name: '' };
  };

  return (
    <div className="city-page">
      <div className="page-header">
        <div className="page-header-content">
          <div className="page-title-section">
            <div className="page-icon-wrapper">
              <MapPin size={28} className="page-icon" />
            </div>
            <div>
              <h1 className="page-title">مدیریت شهرها</h1>
              <p className="page-subtitle">مدیریت سلسله‌مراتبی استان‌ها و شهرها</p>
            </div>
          </div>
        </div>
      </div>

      <CityTreeList
        ref={treeListRef}
        onAdd={handleAddProvince}
        onEdit={handleEditProvince}
        onEditCity={handleEditCity}
        onAddCity={handleAddCity}
        onView={(item) => console.log('👁️ View:', item)}
      />

      {formOpen && (
        <div className="modal-overlay" onClick={handleCloseForm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <CityForm
              title={formTitle}
              initialData={getInitialData()}
              provinceId={selectedProvinceId}
              mode={formMode}
              onSuccess={handleSuccess}
              onCancel={handleCloseForm}
            />
          </div>
        </div>
      )}

      <style>{`
        .city-page {
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
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .page-icon {
          color: #2563eb;
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
          .city-page {
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
          .city-page {
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

export default CityPage;