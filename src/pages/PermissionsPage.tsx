// src/pages/PermissionsPage.tsx

import React, { useState } from 'react';
import { usePermissions } from '../modules/permission/hooks/usePermissions';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  Plus,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Download,
  UserCheck,
  Layers,
  ChevronDown,
  Sparkles,
  Database,
} from 'lucide-react';
import { CATEGORY_COLORS, ACTION_COLORS } from '../modules/permission/types/permission.types';
import type { PermissionCategory, PermissionAction } from '../modules/permission/types/permission.types';

export const PermissionsPage: React.FC = () => {
  const { user } = useAuth();
  const { 
    useList, 
    useGrouped, 
    useInitialize 
  } = usePermissions();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedAction, setSelectedAction] = useState<string>('');

  const { data: permissions, isLoading, refetch } = useList({
    category: selectedCategory || undefined,
    action: selectedAction || undefined,
    search: searchTerm || undefined,
  });

  const { data: groupedPermissions } = useGrouped();
  const initializeMutation = useInitialize();

  const isSuperUser = user?.is_superuser;

  // ========== فیلترها ==========
  const categories: { value: PermissionCategory | ''; label: string }[] = [
    { value: '', label: 'همه دسته‌ها' },
    { value: 'BASE', label: 'مدیریت پایه' },
    { value: 'RESEARCH', label: 'مدیریت پژوهشی' },
    { value: 'CONTRACT', label: 'مدیریت قرارداد' },
    { value: 'FINANCIAL', label: 'مدیریت مالی' },
    { value: 'COMMITTEE', label: 'کمیته‌ها' },
    { value: 'REPORT', label: 'گزارش‌گیری' },
    { value: 'USER', label: 'مدیریت کاربران' },
    { value: 'SETTINGS', label: 'تنظیمات سیستم' },
  ];

  const actions: { value: PermissionAction | ''; label: string }[] = [
    { value: '', label: 'همه عملیات' },
    { value: 'view', label: 'مشاهده' },
    { value: 'create', label: 'ایجاد' },
    { value: 'edit', label: 'ویرایش' },
    { value: 'delete', label: 'حذف' },
    { value: 'export', label: 'خروجی' },
    { value: 'approve', label: 'تایید' },
  ];

  // ========== آمار ==========
  const totalPermissions = permissions?.length || 0;
  const activePermissions = permissions?.filter(p => p.is_active).length || 0;
  const categoriesCount = groupedPermissions ? Object.keys(groupedPermissions).length : 0;

  // ========== عملیات initialize ==========
  const handleInitialize = async () => {
    if (!isSuperUser) {
      alert('فقط سوپرادمین می‌تواند مجوزها را ایجاد کند');
      return;
    }
    
    const confirmed = window.confirm(
      'آیا مطمئن هستید؟ این عملیات مجوزهای پیش‌فرض را ایجاد می‌کند.\n' +
      '(مجوزهای تکراری نادیده گرفته می‌شوند)'
    );
    
    if (confirmed) {
      await initializeMutation.mutateAsync();
      refetch();
    }
  };

  return (
    <div className="permissions-page">
      {/* ========== هدر ========== */}
      <div className="page-header">
        <div className="header-left">
          <div className="header-icon">
            <Shield size={28} />
          </div>
          <div className="header-content">
            <h1 className="page-title">مدیریت مجوزها</h1>
            <p className="page-subtitle">
              لیست مجوزهای سیستم و مدیریت دسترسی‌ها
            </p>
          </div>
        </div>

        <div className="header-actions">
          {isSuperUser && (
            <button 
              className="btn btn-primary"
              onClick={handleInitialize}
              disabled={initializeMutation.isPending}
            >
              {initializeMutation.isPending ? (
                <>
                  <RefreshCw size={18} className="spin" />
                  در حال ایجاد...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  ایجاد مجوزهای پیش‌فرض
                </>
              )}
            </button>
          )}
          <button 
            className="btn btn-secondary"
            onClick={() => refetch()}
          >
            <RefreshCw size={18} />
            بروزرسانی
          </button>
        </div>
      </div>

      {/* ========== کارت‌های آمار ========== */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#eef2ff', color: '#4f46e5' }}>
            <Database size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{totalPermissions}</span>
            <span className="stat-label">کل مجوزها</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#d1fae5', color: '#059669' }}>
            <CheckCircle size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{activePermissions}</span>
            <span className="stat-label">مجوزهای فعال</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
            <Layers size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{categoriesCount}</span>
            <span className="stat-label">دسته‌بندی‌ها</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ede9fe', color: '#7c3aed' }}>
            <UserCheck size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-value">5</span>
            <span className="stat-label">نقش‌های کاربری</span>
          </div>
        </div>
      </div>

      {/* ========== فیلترها ========== */}
      <div className="filters-bar">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="جستجو در مجوزها..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="filter-select"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>

          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="filter-select"
          >
            {actions.map((act) => (
              <option key={act.value} value={act.value}>
                {act.label}
              </option>
            ))}
          </select>

          {(searchTerm || selectedCategory || selectedAction) && (
            <button 
              className="btn-clear-filters"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
                setSelectedAction('');
              }}
            >
              <XCircle size={16} />
              پاک کردن فیلترها
            </button>
          )}
        </div>
      </div>

      {/* ========== جدول مجوزها ========== */}
      {isLoading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>در حال بارگذاری...</p>
        </div>
      ) : permissions && permissions.length > 0 ? (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>نام مجوز</th>
                <th>کد مجوز</th>
                <th>دسته‌بندی</th>
                <th>عملیات</th>
                <th>وضعیت</th>
                <th>تاریخ ایجاد</th>
              </tr>
            </thead>
            <tbody>
              {permissions.map((permission, index) => (
                <tr key={permission.id}>
                  <td className="text-muted">{index + 1}</td>
                  <td>
                    <div className="permission-name">
                      <Shield size={16} className="permission-icon" />
                      {permission.name}
                    </div>
                  </td>
                  <td>
                    <code className="permission-code">{permission.codename}</code>
                  </td>
                  <td>
                    <span 
                      className="badge category-badge"
                      style={{ 
                        background: `${CATEGORY_COLORS[permission.category]}15`,
                        color: CATEGORY_COLORS[permission.category],
                        border: `1px solid ${CATEGORY_COLORS[permission.category]}30`
                      }}
                    >
                      {permission.category_display}
                    </span>
                  </td>
                  <td>
                    <span 
                      className="badge action-badge"
                      style={{ 
                        background: `${ACTION_COLORS[permission.action]}15`,
                        color: ACTION_COLORS[permission.action],
                        border: `1px solid ${ACTION_COLORS[permission.action]}30`
                      }}
                    >
                      {permission.action_display}
                    </span>
                  </td>
                  <td>
                    {permission.is_active ? (
                      <span className="status-active">
                        <CheckCircle size={14} />
                        فعال
                      </span>
                    ) : (
                      <span className="status-inactive">
                        <XCircle size={14} />
                        غیرفعال
                      </span>
                    )}
                  </td>
                  <td className="text-muted">
                    {new Date(permission.created_at).toLocaleDateString('fa-IR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">
            <Shield size={64} />
          </div>
          <h3>هیچ مجوزی یافت نشد</h3>
          <p>
            {isSuperUser 
              ? 'برای شروع، روی دکمه "ایجاد مجوزهای پیش‌فرض" کلیک کنید.'
              : 'هیچ مجوزی با فیلترهای انتخابی یافت نشد.'}
          </p>
          {isSuperUser && (
            <button 
              className="btn btn-primary"
              onClick={handleInitialize}
              disabled={initializeMutation.isPending}
            >
              <Sparkles size={18} />
              ایجاد مجوزهای پیش‌فرض
            </button>
          )}
        </div>
      )}

      {/* ========== استایل‌ها ========== */}
      <style>{`
        .permissions-page {
          padding: 24px;
          max-width: 1400px;
          margin: 0 auto;
        }

        /* ===== Header ===== */
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .header-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 56px;
          height: 56px;
          border-radius: 16px;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          color: white;
          box-shadow: 0 8px 20px rgba(79, 70, 229, 0.3);
        }

        .header-content h1 {
          font-size: 24px;
          font-weight: 700;
          color: #1a1a2e;
          margin: 0 0 4px 0;
        }

        .page-subtitle {
          font-size: 14px;
          color: #6b7280;
          margin: 0;
        }

        .header-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        /* ===== Buttons ===== */
        .btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
          white-space: nowrap;
        }

        .btn-primary {
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          color: white;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(79, 70, 229, 0.35);
        }

        .btn-secondary {
          background: white;
          color: #374151;
          border: 1.5px solid #e5e7eb;
        }

        .btn-secondary:hover:not(:disabled) {
          border-color: #4f46e5;
          color: #4f46e5;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* ===== Stats ===== */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 14px;
          background: white;
          padding: 18px 20px;
          border-radius: 14px;
          border: 1px solid #e9ecef;
          transition: all 0.2s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
        }

        .stat-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 12px;
          flex-shrink: 0;
        }

        .stat-content {
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-size: 24px;
          font-weight: 700;
          color: #1a1a2e;
          line-height: 1.2;
        }

        .stat-label {
          font-size: 13px;
          color: #6b7280;
          margin-top: 2px;
        }

        /* ===== Filters ===== */
        .filters-bar {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
          flex-wrap: wrap;
          align-items: center;
          background: white;
          padding: 16px;
          border-radius: 12px;
          border: 1px solid #e9ecef;
        }

        .search-box {
          position: relative;
          flex: 1;
          min-width: 220px;
        }

        .search-icon {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          pointer-events: none;
        }

        .search-box input {
          width: 100%;
          padding: 10px 42px 10px 16px;
          border: 1.5px solid #e5e7eb;
          border-radius: 10px;
          font-size: 14px;
          font-family: inherit;
          background: #f9fafb;
          transition: all 0.2s;
        }

        .search-box input:focus {
          border-color: #4f46e5;
          background: white;
          outline: none;
          box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.08);
        }

        .filter-group {
          display: flex;
          gap: 10px;
          align-items: center;
          flex-wrap: wrap;
        }

        .filter-select {
          padding: 10px 14px;
          border: 1.5px solid #e5e7eb;
          border-radius: 10px;
          font-size: 14px;
          font-family: inherit;
          background: white;
          cursor: pointer;
          transition: all 0.2s;
          min-width: 160px;
        }

        .filter-select:focus {
          border-color: #4f46e5;
          outline: none;
          box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.08);
        }

        .btn-clear-filters {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          background: #fef2f2;
          color: #dc2626;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.2s;
        }

        .btn-clear-filters:hover {
          background: #fee2e2;
        }

        /* ===== Table ===== */
        .table-container {
          background: white;
          border-radius: 14px;
          border: 1px solid #e9ecef;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }

        .data-table thead {
          background: #f9fafb;
          border-bottom: 2px solid #e9ecef;
        }

        .data-table th {
          padding: 14px 16px;
          text-align: right;
          font-weight: 600;
          font-size: 13px;
          color: #6b7280;
        }

        .data-table td {
          padding: 14px 16px;
          border-bottom: 1px solid #f3f4f6;
          color: #374151;
        }

        .data-table tbody tr:hover {
          background: #fafbfc;
        }

        .data-table tbody tr:last-child td {
          border-bottom: none;
        }

        .text-muted {
          color: #9ca3af;
          font-size: 13px;
        }

        .permission-name {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
          color: #1a1a2e;
        }

        .permission-icon {
          color: #4f46e5;
        }

        .permission-code {
          font-family: 'Courier New', monospace;
          font-size: 12px;
          background: #f3f4f6;
          padding: 3px 8px;
          border-radius: 6px;
          color: #4f46e5;
          direction: ltr;
          display: inline-block;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
          white-space: nowrap;
        }

        .status-active {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 12px;
          background: #d1fae5;
          color: #059669;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
        }

        .status-inactive {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 12px;
          background: #fee2e2;
          color: #dc2626;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
        }

        /* ===== Loading & Empty ===== */
        .loading-state,
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          background: white;
          border-radius: 14px;
          border: 1px solid #e9ecef;
          text-align: center;
        }

        .loading-state .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #e9ecef;
          border-top-color: #4f46e5;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-bottom: 16px;
        }

        .empty-icon {
          color: #d1d5db;
          margin-bottom: 16px;
        }

        .empty-state h3 {
          font-size: 18px;
          font-weight: 600;
          color: #1a1a2e;
          margin: 0 0 8px 0;
        }

        .empty-state p {
          color: #6b7280;
          font-size: 14px;
          margin: 0 0 20px 0;
          max-width: 400px;
        }

        /* ===== Responsive ===== */
        @media (max-width: 768px) {
          .permissions-page {
            padding: 16px;
          }

          .page-header {
            flex-direction: column;
            align-items: stretch;
          }

          .header-actions {
            width: 100%;
          }

          .header-actions .btn {
            flex: 1;
            justify-content: center;
          }

          .filters-bar {
            flex-direction: column;
            align-items: stretch;
          }

          .filter-group {
            flex-direction: column;
            align-items: stretch;
          }

          .filter-select {
            width: 100%;
          }

          .table-container {
            overflow-x: auto;
          }

          .data-table {
            min-width: 800px;
          }
        }
      `}</style>
    </div>
  );
};

export default PermissionsPage;