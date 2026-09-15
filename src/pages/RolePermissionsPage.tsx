// src/pages/RolePermissionsPage.tsx

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePermissions } from '../modules/permission/hooks/usePermissions';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  ArrowRight,
  CheckCircle,
  XCircle,
  Save,
  RefreshCw,
  Search,
  ChevronDown,
  ChevronUp,
  Check,
  AlertCircle,
} from 'lucide-react';
import {
  CATEGORY_COLORS,
  ACTION_COLORS,
} from '../modules/permission/types/permission.types';
import type { GroupedPermissions } from '../modules/permission/types/permission.types';

// ========== Helper: استخراج مجوزهای داده شده ==========
const extractGrantedPermissions = (data: any): number[] => {
  if (!data?.permissions) return [];
  const granted: number[] = [];
  Object.values(data.permissions).forEach((perms: any) => {
    perms.forEach((p: any) => {
      if (p.has_permission) granted.push(p.id);
    });
  });
  return granted;
};

// ========== Helper: ساخت expanded اولیه ==========
const buildInitialExpanded = (data: any): Record<string, boolean> => {
  if (!data?.permissions) return {};
  const expanded: Record<string, boolean> = {};
  Object.keys(data.permissions).forEach((cat) => {
    expanded[cat] = true;
  });
  return expanded;
};

// ==================== Inner Component ====================
// این کامپوننت فقط زمانی رندر میشه که data آماده باشه
// و state اولیه رو از props می‌گیره (نه از useEffect)
interface RolePermissionsContentProps {
  role: string;
  permissionsData: any;
  isSuperUser: boolean;
  onRefetch: () => void;
  bulkUpdateMutation: any;
}

const RolePermissionsContent: React.FC<RolePermissionsContentProps> = ({
  role,
  permissionsData,
  isSuperUser,
  onRefetch,
  bulkUpdateMutation,
}) => {
  const navigate = useNavigate();

  // ========== state اولیه از props (نه از useEffect) ==========
  const initialGranted = useMemo(
    () => extractGrantedPermissions(permissionsData),
    [permissionsData]
  );

  const initialExpanded = useMemo(
    () => buildInitialExpanded(permissionsData),
    [permissionsData]
  );

  const [selectedPermissions, setSelectedPermissions] = useState<number[]>(initialGranted);
  const [initialPermissions, setInitialPermissions] = useState<number[]>(initialGranted);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(initialExpanded);

  // ========== بررسی تغییرات (derived state - بدون useEffect) ==========
  const hasChanges = useMemo(() => {
    if (selectedPermissions.length !== initialPermissions.length) return true;
    return selectedPermissions.some((id) => !initialPermissions.includes(id));
  }, [selectedPermissions, initialPermissions]);

  // ========== توگل مجوز ==========
  const togglePermission = (permissionId: number) => {
    setSelectedPermissions((prev) => {
      if (prev.includes(permissionId)) {
        return prev.filter((id) => id !== permissionId);
      }
      return [...prev, permissionId];
    });
  };

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryName]: !prev[categoryName],
    }));
  };

  const selectAllInCategory = (categoryName: string) => {
    if (!permissionsData?.permissions) return;
    const categoryPerms = permissionsData.permissions[categoryName] || [];
    const categoryIds = categoryPerms.map((p: any) => p.id);

    setSelectedPermissions((prev) => {
      const allSelected = categoryIds.every((id) => prev.includes(id));
      if (allSelected) {
        return prev.filter((id) => !categoryIds.includes(id));
      }
      return Array.from(new Set([...prev, ...categoryIds]));
    });
  };

  const isCategoryAllSelected = (categoryName: string): boolean => {
    if (!permissionsData?.permissions) return false;
    const categoryPerms = permissionsData.permissions[categoryName] || [];
    return categoryPerms.every((p: any) => selectedPermissions.includes(p.id));
  };

  const handleSave = async () => {
    if (!role) return;
    await bulkUpdateMutation.mutateAsync({
      role,
      permission_ids: selectedPermissions,
    });
    setInitialPermissions(selectedPermissions);
  };

  const handleReset = () => {
    setSelectedPermissions(initialPermissions);
  };

  const handleSelectAll = () => {
    if (!permissionsData?.permissions) return;
    const allIds: number[] = [];
    Object.values(permissionsData.permissions).forEach((perms: any[]) => {
      perms.forEach((p: any) => allIds.push(p.id));
    });
    setSelectedPermissions(allIds);
  };

  const handleDeselectAll = () => {
    setSelectedPermissions([]);
  };

  const permissionsMap = permissionsData?.permissions;

  const filteredPermissions = useMemo((): GroupedPermissions => {
    if (!permissionsMap) return {};
    if (!searchTerm.trim()) return permissionsMap;

    const filtered: GroupedPermissions = {};
    Object.entries(permissionsMap).forEach(([category, perms]) => {
      const matchingPerms = perms.filter(
        (p: any) =>
          p.name.includes(searchTerm) ||
          p.codename.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (matchingPerms.length > 0) {
        filtered[category] = matchingPerms;
      }
    });
    return filtered;
  }, [permissionsMap, searchTerm]);

  const totalPermissions = permissionsData?.total_permissions || 0;
  const selectedCount = selectedPermissions.length;

  return (
    <>
      {/* ========== هدر ========== */}
      <div className="page-header">
        <div className="header-left">
          <button
            className="back-btn"
            onClick={() => navigate('/roles')}
            title="بازگشت"
          >
            <ArrowRight size={20} />
          </button>
          <div className="header-icon">
            <Shield size={28} />
          </div>
          <div className="header-content">
            <h1 className="page-title">
              مدیریت مجوزهای نقش «{permissionsData.role_display}»
            </h1>
            <p className="page-subtitle">
              {selectedCount} از {totalPermissions} مجوز انتخاب شده
            </p>
          </div>
        </div>

        <div className="header-actions">
          {hasChanges && (
            <span className="changes-badge">
              <AlertCircle size={14} />
              تغییرات ذخیره نشده
            </span>
          )}
          <button className="btn btn-secondary" onClick={onRefetch}>
            <RefreshCw size={18} />
            بروزرسانی
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={!hasChanges || bulkUpdateMutation.isPending || !isSuperUser}
          >
            {bulkUpdateMutation.isPending ? (
              <>
                <RefreshCw size={18} className="spin" />
                در حال ذخیره...
              </>
            ) : (
              <>
                <Save size={18} />
                ذخیره تغییرات
              </>
            )}
          </button>
        </div>
      </div>

      {/* ========== نوار پیشرفت ========== */}
      <div className="progress-bar-container">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${totalPermissions > 0 ? (selectedCount / totalPermissions) * 100 : 0}%`,
            }}
          ></div>
        </div>
        <span className="progress-text">
          {totalPermissions > 0 ? Math.round((selectedCount / totalPermissions) * 100) : 0}%
        </span>
      </div>

      {/* ========== ابزارها ========== */}
      <div className="toolbar">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="جستجو در مجوزها..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="toolbar-actions">
          <button className="btn-tool" onClick={handleSelectAll} disabled={!isSuperUser}>
            <CheckCircle size={16} />
            انتخاب همه
          </button>
          <button className="btn-tool" onClick={handleDeselectAll} disabled={!isSuperUser}>
            <XCircle size={16} />
            حذف همه
          </button>
          {hasChanges && (
            <button className="btn-tool btn-reset" onClick={handleReset}>
              <RefreshCw size={16} />
              بازگردانی
            </button>
          )}
        </div>
      </div>

      {/* ========== دسته‌بندی‌ها ========== */}
      <div className="categories-container">
        {Object.entries(filteredPermissions).map(([categoryName, perms]: [string, any]) => {
          const categoryColor =
            CATEGORY_COLORS[perms[0]?.category as keyof typeof CATEGORY_COLORS] || '#6b7280';
          const isExpanded = expandedCategories[categoryName] !== false;
          const isAllSelected = isCategoryAllSelected(categoryName);
          const selectedInCategory = perms.filter((p: any) =>
            selectedPermissions.includes(p.id)
          ).length;

          return (
            <div key={categoryName} className="category-block">
              <div className="category-header" style={{ borderRightColor: categoryColor }}>
                <button className="category-toggle" onClick={() => toggleCategory(categoryName)}>
                  {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                <div className="category-info">
                  <span
                    className="category-badge"
                    style={{ background: `${categoryColor}15`, color: categoryColor }}
                  >
                    {categoryName}
                  </span>
                  <span className="category-count">
                    {selectedInCategory} / {perms.length} مجوز
                  </span>
                </div>
                {isSuperUser && (
                  <button
                    className={`category-select-all ${isAllSelected ? 'active' : ''}`}
                    onClick={() => selectAllInCategory(categoryName)}
                  >
                    {isAllSelected ? (
                      <>
                        <CheckCircle size={16} />
                        حذف همه
                      </>
                    ) : (
                      <>
                        <Check size={16} />
                        انتخاب همه
                      </>
                    )}
                  </button>
                )}
              </div>

              {isExpanded && (
                <div className="permissions-list">
                  {perms.map((perm: any) => {
                    const isSelected = selectedPermissions.includes(perm.id);
                    const actionColor =
                      ACTION_COLORS[perm.action as keyof typeof ACTION_COLORS] || '#6b7280';
                    return (
                      <label
                        key={perm.id}
                        className={`permission-item ${isSelected ? 'selected' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => togglePermission(perm.id)}
                          disabled={!isSuperUser}
                        />
                        <div className="checkbox-custom">
                          {isSelected && <Check size={14} />}
                        </div>
                        <div className="permission-info">
                          <span className="permission-name">{perm.name}</span>
                          <code className="permission-code">{perm.codename}</code>
                        </div>
                        <span
                          className="permission-action"
                          style={{ background: `${actionColor}15`, color: actionColor }}
                        >
                          {perm.action_display}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {Object.keys(filteredPermissions).length === 0 && (
          <div className="empty-state">
            <Search size={48} />
            <h3>مجوزی یافت نشد</h3>
            <p>هیچ مجوزی با "{searchTerm}" مطابقت ندارد</p>
          </div>
        )}
      </div>

      {/* ========== دکمه ذخیره پایین ========== */}
      {hasChanges && (
        <div className="sticky-footer">
          <span className="sticky-text">
            <AlertCircle size={16} />
            {selectedCount - initialPermissions.length > 0 && (
              <span className="text-success">
                +{selectedCount - initialPermissions.length} اضافه شده
              </span>
            )}
            {initialPermissions.length - selectedCount > 0 && (
              <span className="text-danger">
                {initialPermissions.length - selectedCount} حذف شده
              </span>
            )}
          </span>
          <div className="sticky-actions">
            <button className="btn btn-secondary" onClick={handleReset}>
              لغو
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={bulkUpdateMutation.isPending}
            >
              {bulkUpdateMutation.isPending ? (
                <>
                  <RefreshCw size={18} className="spin" />
                  در حال ذخیره...
                </>
              ) : (
                <>
                  <Save size={18} />
                  ذخیره تغییرات
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

// ==================== Main Component ====================
export const RolePermissionsPage: React.FC = () => {
  const { role } = useParams<{ role: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { useByRole, useBulkUpdateRole } = usePermissions();

  const { data: permissionsData, isLoading, refetch } = useByRole(role || '');
  const bulkUpdateMutation = useBulkUpdateRole();

  const isSuperUser = user?.is_superuser || false;

  if (isLoading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>در حال بارگذاری...</p>
      </div>
    );
  }

  if (!permissionsData) {
    return (
      <div className="error-state">
        <AlertCircle size={48} />
        <h3>نقش یافت نشد</h3>
        <button onClick={() => navigate('/roles')} className="btn btn-primary">
          <ArrowRight size={18} />
          بازگشت به نقش‌ها
        </button>
      </div>
    );
  }

  return (
    <div className="role-permissions-page">
      <RolePermissionsContent
        key={`${role}-${permissionsData.granted_count}`}
        role={role || ''}
        permissionsData={permissionsData}
        isSuperUser={isSuperUser}
        onRefetch={refetch}
        bulkUpdateMutation={bulkUpdateMutation}
      />

      {/* ========== استایل‌ها ========== */}
      <style>{`
        .role-permissions-page {
          padding: 24px;
          max-width: 1200px;
          margin: 0 auto;
          padding-bottom: 100px;
          background-color: transparent;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          min-width: 0;
        }

        .back-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: white;
          border: 1.5px solid #e5e7eb;
          color: #4f46e5;
          cursor: pointer;
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .back-btn:hover {
          background: #f5f3ff;
          border-color: #4f46e5;
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
          flex-shrink: 0;
        }

        .header-content h1 {
          font-size: 20px;
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
          align-items: center;
          flex-wrap: wrap;
        }

        .changes-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          background: #fef3c7;
          color: #d97706;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 500;
        }

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
          opacity: 0.5;
          cursor: not-allowed;
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .progress-bar-container {
          display: flex;
          align-items: center;
          gap: 16px;
          background: white;
          padding: 16px 20px;
          border-radius: 12px;
          border: 1px solid #e9ecef;
          margin-bottom: 16px;
        }

        .progress-bar {
          flex: 1;
          height: 8px;
          background: #f3f4f6;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #4f46e5, #7c3aed);
          border-radius: 4px;
          transition: width 0.4s ease;
        }

        .progress-text {
          font-size: 14px;
          font-weight: 700;
          color: #4f46e5;
          min-width: 50px;
          text-align: left;
          direction: ltr;
        }

        .toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          background: white;
          padding: 14px 18px;
          border-radius: 12px;
          border: 1px solid #e9ecef;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .search-box {
          position: relative;
          flex: 1;
          min-width: 240px;
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

        .toolbar-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .btn-tool {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          background: white;
          border: 1.5px solid #e5e7eb;
          border-radius: 8px;
          color: #374151;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
        }

        .btn-tool:hover:not(:disabled) {
          border-color: #4f46e5;
          color: #4f46e5;
          background: #f5f3ff;
        }

        .btn-tool:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-reset {
          border-color: #fecaca;
          color: #dc2626;
        }

        .btn-reset:hover {
          background: #fef2f2;
          border-color: #dc2626;
          color: #dc2626;
        }

        .categories-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .category-block {
          background: white;
          border-radius: 14px;
          border: 1px solid #e9ecef;
          overflow: hidden;
        }

        .category-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          background: #fafbfc;
          border-bottom: 1px solid #f3f4f6;
          border-right: 4px solid #4f46e5;
        }

        .category-toggle {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          background: white;
          border: 1.5px solid #e5e7eb;
          border-radius: 8px;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.2s;
        }

        .category-toggle:hover {
          border-color: #4f46e5;
          color: #4f46e5;
        }

        .category-info {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          flex-wrap: wrap;
        }

        .category-badge {
          display: inline-flex;
          align-items: center;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
        }

        .category-count {
          font-size: 13px;
          color: #6b7280;
          direction: ltr;
        }

        .category-select-all {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          background: white;
          border: 1.5px solid #e5e7eb;
          border-radius: 8px;
          color: #374151;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
        }

        .category-select-all:hover {
          border-color: #4f46e5;
          color: #4f46e5;
        }

        .category-select-all.active {
          background: #4f46e5;
          color: white;
          border-color: #4f46e5;
        }

        .permissions-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 8px;
          padding: 16px 20px;
        }

        .permission-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          border-radius: 10px;
          border: 1.5px solid #f3f4f6;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        }

        .permission-item:hover {
          border-color: #e0e7ff;
          background: #fafbff;
        }

        .permission-item.selected {
          border-color: #4f46e5;
          background: #f5f3ff;
        }

        .permission-item input[type="checkbox"] {
          position: absolute;
          opacity: 0;
          pointer-events: none;
        }

        .checkbox-custom {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          border: 2px solid #d1d5db;
          border-radius: 6px;
          background: white;
          color: white;
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .permission-item.selected .checkbox-custom {
          background: #4f46e5;
          border-color: #4f46e5;
        }

        .permission-item:has(input:disabled) {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .permission-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
          min-width: 0;
        }

        .permission-name {
          font-size: 13px;
          font-weight: 500;
          color: #1a1a2e;
        }

        .permission-code {
          font-family: 'Courier New', monospace;
          font-size: 11px;
          color: #6b7280;
          direction: ltr;
        }

        .permission-action {
          display: inline-flex;
          align-items: center;
          padding: 3px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .empty-state,
        .error-state,
        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          background: white;
          border-radius: 14px;
          border: 1px solid #e9ecef;
          text-align: center;
          color: #6b7280;
        }

        .empty-state svg,
        .error-state svg {
          color: #d1d5db;
          margin-bottom: 16px;
        }

        .empty-state h3,
        .error-state h3 {
          font-size: 18px;
          font-weight: 600;
          color: #1a1a2e;
          margin: 0 0 8px 0;
        }

        .empty-state p,
        .error-state p {
          margin: 0 0 20px 0;
          font-size: 14px;
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

        .sticky-footer {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: white;
          border-top: 1px solid #e9ecef;
          padding: 14px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.08);
          z-index: 100;
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }

        .sticky-text {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
        }

        .text-success {
          color: #059669;
          font-weight: 600;
        }

        .text-danger {
          color: #dc2626;
          font-weight: 600;
        }

        .sticky-actions {
          display: flex;
          gap: 10px;
        }

        @media (max-width: 992px) {
          .permissions-list {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .role-permissions-page {
            padding: 16px;
            padding-bottom: 120px;
          }

          .page-header {
            flex-direction: column;
            align-items: stretch;
          }

          .header-content h1 {
            font-size: 16px;
          }

          .toolbar {
            flex-direction: column;
            align-items: stretch;
          }

          .permissions-list {
            padding: 12px;
          }

          .sticky-footer {
            flex-direction: column;
            gap: 12px;
          }

          .sticky-actions {
            width: 100%;
          }

          .sticky-actions .btn {
            flex: 1;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default RolePermissionsPage;