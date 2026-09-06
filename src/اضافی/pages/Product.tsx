// pages/Product.tsx
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useProduct } from '@hooks/useProduct';
import { GenericDataTable } from '@components/generic/GenericDataTable';
import { GenericFormModal } from '@components/generic/GenericFormModal';
import { type GenericPageConfig } from '../types/generic';
import type { Product, ProductFormData } from '../types';
import { toast } from 'react-hot-toast';

const config: GenericPageConfig<ProductFormData> = {
  title: 'مدیریت محصولات',
  subtitle: 'مدیریت و سازماندهی تمام محصولات',
  queryKey: 'products',
  
  columns: [
    { field: 'name', header: 'نام محصول', sortable: true },
    { field: 'price', header: 'قیمت', type: 'number', sortable: true },
    { field: 'description', header: 'توضیحات', sortable: false },
    { field: 'created_at', header: 'تاریخ ایجاد', type: 'date', sortable: true },
  ],
  
  formFields: [
    { name: 'name', label: 'نام محصول', type: 'text', required: true, colSize: 12 },
    { name: 'price', label: 'قیمت', type: 'number', required: true, colSize: 6 },
    { name: 'description', label: 'توضیحات', type: 'textarea', required: false, colSize: 12 },
  ],
  
  defaultValues: {
    price: 0,
  },
};

const ProductsManagement: React.FC = () => {
  const { items, isLoading, create, update, delete: deleteItem, isCreating, isUpdating } = useProduct();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Product | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentFiles, setCurrentFiles] = useState<Record<string, string | null>>({});
  const [modalKey, setModalKey] = useState(0);

  const handleSubmit = async (data: ProductFormData) => {
    try {
      if (editingItem) {
        await update({
          id: editingItem.id,
          data: {
            name: data.name,
            price: data.price,
            description: data.description,
          },
          onProgress: setUploadProgress,
        });
      } else {
        await create({
          data: {
            name: data.name,
            price: data.price,
            description: data.description,
          },
          onProgress: setUploadProgress,
        });
      }
      setModalOpen(false);
      setEditingItem(null);
      setCurrentFiles({});
      toast.success(editingItem ? 'با موفقیت ویرایش شد' : 'با موفقیت اضافه شد');
    } catch (error) {
      console.error(error);
      toast.error('خطا در انجام عملیات');
    }
  };

  const openEditModal = (item: Product) => {
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

  const handleFileRemove = (field: string) => {
    setCurrentFiles(prev => ({ ...prev, [field]: null }));
  };

  const getInitialData = (): Partial<ProductFormData> => {
    if (editingItem) {
      return {
        name: editingItem.name,
        price: editingItem.price,
        description: editingItem.description,
      };
    }
    return config.defaultValues;
  };

  return (
    <div className="container mt-4" dir="rtl">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>{config.title}</h2>
          {config.subtitle && <p className="text-muted">{config.subtitle}</p>}
        </div>
        <button className="btn btn-success" onClick={openAddModal}>
          <Plus size={18} className="me-1" />
          افزودن جدید
        </button>
      </div>

      <GenericDataTable
        data={items}
        columns={config.columns}
        onEdit={openEditModal}
        onDelete={deleteItem}
        isLoading={isLoading}
      />

      <GenericFormModal
        key={modalKey}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingItem(null);
          setCurrentFiles({});
        }}
        onSubmit={handleSubmit}
        title={editingItem ? 'ویرایش محصول' : 'افزودن محصول جدید'}
        fields={config.formFields}
        initialData={getInitialData()}
        isLoading={isCreating || isUpdating}
        uploadProgress={uploadProgress}
        isEditing={!!editingItem}
        currentFiles={currentFiles}
        onFileRemove={handleFileRemove}
      />
    </div>
  );
};

export default ProductsManagement;