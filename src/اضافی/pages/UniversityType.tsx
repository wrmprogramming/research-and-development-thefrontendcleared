// src/pages/UniversityType.tsx
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useUniversityType } from '../hooks/useUniversityType';
import { GenericDataTable } from '../components/generic/GenericDataTable';
import { GenericFormModal } from '../components/generic/GenericFormModal';
import type { TableColumnConfig, FieldConfig } from '../types/generic';
import type { UniversityType as UniversityTypeModel, UniversityTypeFormData } from '../types';
import { toast } from 'react-hot-toast';

const columns: TableColumnConfig[] = [
  { field: 'name', header: 'نوع دانشگاه', sortable: true },
  { field: 'code', header: 'کد نوع', sortable: true },
  { field: 'description', header: 'توضیحات', sortable: true },
];

const formFields: FieldConfig[] = [
  { name: 'name', label: 'نوع دانشگاه', type: 'text', required: true, colSize: 12 },
  { name: 'code', label: 'کد نوع', type: 'text', required: false, colSize: 6 },
  { name: 'description', label: 'توضیحات', type: 'textarea', required: false, colSize: 12 },
];

const UniversityTypeManagement: React.FC = () => {
  const { items, isLoading, create, update, delete: deleteItem, refetch } = useUniversityType();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<UniversityTypeModel | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentFiles, setCurrentFiles] = useState<Record<string, string | null>>({});
  const [modalKey, setModalKey] = useState(0);

  const handleSubmit = async (data: UniversityTypeFormData) => {
    try {
      if (editingItem) {
        await update(editingItem.id, data, setUploadProgress);
        toast.success('نوع دانشگاه با موفقیت ویرایش شد');
      } else {
        await create(data, setUploadProgress);
        toast.success('نوع دانشگاه با موفقیت اضافه شد');
      }
      await refetch();
      setModalOpen(false);
      setEditingItem(null);
      setCurrentFiles({});
    } catch (error) {
      console.error(error);
      toast.error('خطا در انجام عملیات');
    }
  };

  const openEditModal = (item: UniversityTypeModel) => {
    setEditingItem(item);
    setModalKey(prev => prev + 1);
    setModalOpen(true);
  };

  const openAddModal = () => {
    setEditingItem(null);
    setCurrentFiles({});
    setModalKey(prev => prev + 1);
    setModalOpen(true);
  };

  const getInitialData = (): Partial<UniversityTypeFormData> => {
    if (editingItem) {
      return {
        name: editingItem.name,
        code: editingItem.code || '',
        description: editingItem.description || '',
      };
    }
    return {};
  };

  return (
    <div className="container mt-4" dir="rtl">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>مدیریت انواع دانشگاه‌ها</h2>
          <p className="text-muted">مدیریت دسته‌بندی انواع دانشگاه‌ها</p>
        </div>
        <button className="btn btn-success" onClick={openAddModal}>
          <Plus size={18} className="me-1" />
          افزودن نوع جدید
        </button>
      </div>

      <GenericDataTable
        data={items || []}
        columns={columns}
        onEdit={openEditModal}
        onDelete={deleteItem}
        isLoading={isLoading}
        searchable={true}
        searchPlaceholder="جستجو در انواع دانشگاه..."
        getItemName={(item) => (item as UniversityTypeModel).name}
      />

      <GenericFormModal
        key={`university-type-${modalKey}`}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingItem(null);
          setCurrentFiles({});
        }}
        onSubmit={handleSubmit}
        title={editingItem ? 'ویرایش نوع دانشگاه' : 'افزودن نوع دانشگاه جدید'}
        fields={formFields}
        initialData={getInitialData()}
        isLoading={false}
        uploadProgress={uploadProgress}
        isEditing={!!editingItem}
        currentFiles={currentFiles}
        onFileRemove={(field) => setCurrentFiles(prev => ({ ...prev, [field]: null }))}
      />
    </div>
  );
};

export default UniversityTypeManagement;
