// src/pages/UserPermissionsPage.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePermissions } from '../modules/permission/hooks/usePermissions';
import { useUsers } from '../modules/user/hooks/useUsers';
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
  Crown,
  User,
  Key,
  Info,
  Lock,
  Eye,
  Plus,
  Sparkles,
  Copy,
} from 'lucide-react';
import {
  CATEGORY_COLORS,
  ACTION_COLORS,
} from '../modules/permission/types/permission.types';
import type { GroupedPermissions } from '../modules/permission/types/permission.types';

// ========== Helper ==========
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

const buildInitialExpanded = (data: any): Record<string, boolean> => {
  if (!data?.permissions) return {};
  const expanded: Record<string, boolean> = {};
  Object.keys(data.permissions).forEach((cat) => {
    expanded[cat] = true;
  });
  return expanded;
};

type ViewMode = 'custom' | 'role' | 'combined';

// ==================== Inner Component ====================
interface UserPermissionsContentProps {
  userId: number;
  userData: any;
  permissionsData: any;
  rolePermissionsData: any;
  isSuperUser: boolean;
  onRefetch: () => void;
  bulkUpdateMutation: any;
}

const UserPermissionsContent: React.FC<UserPermissionsContentProps> = ({
  userId,
  userData,
  permissionsData,
  rolePermissionsData,
  isSuperUser,
  onRefetch,
  bulkUpdateMutation,
}) => {
  const navigate = useNavigate();

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
  const [viewMode, setViewMode] = useState<ViewMode>('custom');

  // ✅ مجوزهای نقش (فقط خواندنی)
  const rolePermissionIds = useMemo(() => {
    if (!rolePermissionsData?.permissions) return new Set<number>();
    const ids = new Set<number>();
    Object.values(rolePermissionsData.permissions).forEach((perms: any) => {
      perms.forEach((p: any) => {
        if (p.has_permission) ids.add(p.id);
      });
    });
    return ids;
  }, [rolePermissionsData]);

  // ========== بررسی تغییرات ==========
  const hasChanges = useMemo(() => {
    if (selectedPermissions.length !== initialPermissions.length) return true;
    return selectedPermissions.some((id) => !initialPermissions.includes(id));
  }, [selectedPermissions, initialPermissions]);

  // ========== شمارش ==========
  const customCount = selectedPermissions.length;
  const roleCount = rolePermissionIds.size;
  const combinedCount = useMemo(() => {
    const combined = new Set([...rolePermissionIds, ...selectedPermissions]);
    return combined.size;
  }, [rolePermissionIds, selectedPermissions]);

  const totalPermissions = permissionsData?.total_permissions || 0;

  // ========== توگل مجوز ==========
  const togglePermission = (permissionId: number) => {
    if (rolePermissionIds.has(permissionId)) return; // اگه از نقش داره، قابل تغییر نیست

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
    const categoryIds = categoryPerms
      .filter((p: any) => !rolePermissionIds.has(p.id))
      .map((p: any) => p.id);

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
    const selectablePerms = categoryPerms.filter((p: any) => !rolePermissionIds.has(p.id));
    if (selectablePerms.length === 0) return false;
    return selectablePerms.every((p: any) => selectedPermissions.includes(p.id));
  };

  const handleSave = async () => {
    await bulkUpdateMutation.mutateAsync({
      user_id: userId,
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
      perms.forEach((p: any) => {
        if (!rolePermissionIds.has(p.id)) allIds.push(p.id);
      });
    });
    setSelectedPermissions(allIds);
  };

  const handleDeselectAll = () => {
    setSelectedPermissions([]);
  };

  const handleCopyFromRole = () => {
    const roleIds = Array.from(rolePermissionIds);
    setSelectedPermissions(roleIds);
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

  return (
    <>
      {/* ========== هدر ========== */}
      <div className="page-header">
        <div className="header-left">
          <button
            className="back-btn"
            onClick={() => navigate('/users')}
            title="بازگشت"
          >
            <ArrowRight size={20} />
          </button>
          <div className="header-icon">
            <Key size={28} />
          </div>
          <div className="header-content">
            <h1 className="page-title">
              مجوزهای «{userData.full_name}»
            </h1>
            <p className="page-subtitle">
              مدیریت مجوزهای اختصاصی کاربر
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
          <button
            className="btn btn-secondary"
            onClick={onRefetch}
          >
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

      {/* ========== اطلاعات کاربر ========== */}
      <div className="user-info-banner">
        <div className="user-avatar-small">
          {userData.profile_image ? (
            <img src={userData.profile_image} alt={userData.full_name} />
          ) : (
            <span>{userData.full_name?.charAt(0)}</span>
          )}
        </div>
        <div className="user-info-content">
          <strong>{userData.full_name}</strong>
          <span className="user-role-text">
            نقش اصلی: <span className="role-highlight">{userData.role_display}</span>
          </span>
        </div>
      </div>

      {/* ========== آمار مجوزها ========== */}
      <div className="permission-stats">
        <div className="permission-stat-card">
          <div className="stat-icon-wrapper role-stat">
            <Lock size={20} />
          </div>
          <div className="stat-content-wrapper">
            <span className="stat-number">{roleCount}</span>
            <span className="stat-label">مجوز از نقش</span>
            <span className="stat-hint">غیرقابل تغییر</span>
          </div>
        </div>

        <div className="stat-plus">+</div>

        <div className="permission-stat-card">
          <div className="stat-icon-wrapper custom-stat">
            <Sparkles size={20} />
          </div>
          <div className="stat-content-wrapper">
            <span className="stat-number">{customCount}</span>
            <span className="stat-label">مجوز اختصاصی</span>
            <span className="stat-hint">قابل تغییر</span>
          </div>
        </div>

        <div className="stat-equals">=</div>

        <div className="permission-stat-card total-card">
          <div className="stat-icon-wrapper total-stat">
            <Shield size={20} />
          </div>
          <div className="stat-content-wrapper">
            <span className="stat-number">{combinedCount}</span>
            <span className="stat-label">مجموع دسترسی‌ها</span>
            <span className="stat-hint">از {totalPermissions} مجوز</span>
          </div>
        </div>
      </div>

      {/* ========== نمایش حالت ========== */}
      <div className="view-modes">
        <button
          className={`view-mode-btn ${viewMode === 'custom' ? 'active' : ''}`}
          onClick={() => setViewMode('custom')}
        >
          <Sparkles size={16} />
          مجوزهای اختصاصی
          <span className="count-badge">{customCount}</span>
        </button>
        <button
          className={`view-mode-btn ${viewMode === 'role' ? 'active' : ''}`}
          onClick={() => setViewMode('role')}
        >
          <Lock size={16} />
          مجوزهای نقش
          <span className="count-badge">{roleCount}</span>
        </button>
        <button
          className={`view-mode-btn ${viewMode === 'combined' ? 'active' : ''}`}
          onClick={() => setViewMode('combined')}
        >
          <Shield size={16} />
          همه دسترسی‌ها
          <span className="count-badge">{combinedCount}</span>
        </button>
      </div>

      {/* ========== ابزارها ========== */}
      {viewMode === 'custom' && (
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
            <button
              className="btn-tool"
              onClick={handleSelectAll}
              disabled={!isSuperUser}
            >
              <CheckCircle size={16} />
              انتخاب همه
            </button>
            <button
              className="btn-tool"
              onClick={handleDeselectAll}
              disabled={!isSuperUser}
            >
              <XCircle size={16} />
              حذف همه
            </button>
            <button
              className="btn-tool btn-copy"
              onClick={handleCopyFromRole}
              disabled={!isSuperUser}
              title="کپی مجوزهای نقش به عنوان مجوز اختصاصی"
            >
              <Copy size={16} />
              کپی از نقش
            </button>
            {hasChanges && (
              <button
                className="btn-tool btn-reset"
                onClick={handleReset}
              >
                <RefreshCw size={16} />
                بازگردانی
              </button>
            )}
          </div>
        </div>
      )}

      {/* ========== دسته‌بندی‌ها ========== */}
      <div className="categories-container">
        {Object.entries(filteredPermissions).map(([categoryName, perms]: [string, any]) => {
          const categoryColor =
            CATEGORY_COLORS[perms[0]?.category as keyof typeof CATEGORY_COLORS] || '#6b7280';
          const isExpanded = expandedCategories[categoryName] !== false;
          const isAllSelected = isCategoryAllSelected(categoryName);
          
          // ✅ شمارش
          const roleCountInCat = perms.filter((p: any) => rolePermissionIds.has(p.id)).length;
          const customCountInCat = perms.filter((p: any) =>
            selectedPermissions.includes(p.id) && !rolePermissionIds.has(p.id)
          ).length;
          const totalInCat = perms.length;

          // ✅ فیلتر بر اساس حالت
          let displayedPerms = perms;
          if (viewMode === 'custom') {
            displayedPerms = perms.filter((p: any) => !rolePermissionIds.has(p.id));
          } else if (viewMode === 'role') {
            displayedPerms = perms.filter((p: any) => rolePermissionIds.has(p.id));
          }

          if (displayedPerms.length === 0) return null;

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
                  <div className="category-counts">
                    {viewMode !== 'role' && roleCountInCat > 0 && (
                      <span className="count-chip role-chip">
                        <Lock size={10} />
                        {roleCountInCat} از نقش
                      </span>
                    )}
                    {viewMode !== 'role' && customCountInCat > 0 && (
                      <span className="count-chip custom-chip">
                        <Sparkles size={10} />
                        {customCountInCat} اختصاصی
                      </span>
                    )}
                    <span className="count-total">
                      {viewMode === 'combined' ? `${totalInCat} کل` : `${displayedPerms.length} مجوز`}
                    </span>
                  </div>
                </div>
                {isSuperUser && viewMode === 'custom' && (
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
                  {displayedPerms.map((perm: any) => {
                    const isFromRole = rolePermissionIds.has(perm.id);
                    const isCustomSelected = selectedPermissions.includes(perm.id) && !isFromRole;
                    const isSelected = isFromRole || isCustomSelected;
                    const actionColor =
                      ACTION_COLORS[perm.action as keyof typeof ACTION_COLORS] || '#6b7280';

                    // ✅ در حالت custom، فقط مجوزهای غیر-نقش رو نشون بده
                    // ✅ در حالت role، فقط مجوزهای نقش رو نشون بده
                    // ✅ در حالت combined، همه رو نشون بده

                    return (
                      <label
                        key={perm.id}
                        className={`permission-item ${isSelected ? 'selected' : ''} ${isFromRole ? 'from-role' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => togglePermission(perm.id)}
                          disabled={!isSuperUser || isFromRole || viewMode === 'role'}
                        />
                        <div className={`checkbox-custom ${isFromRole ? 'from-role' : ''}`}>
                          {isSelected && <Check size={14} />}
                        </div>
                        <div className="permission-info">
                          <div className="permission-name-row">
                            <span className="permission-name">{perm.name}</span>
                            {isFromRole && (
                              <span className="from-role-badge" title="از نقش کاربر">
                                <Lock size={10} />
                                نقش
                              </span>
                            )}
                            {isCustomSelected && (
                              <span className="custom-badge" title="مجوز اختصاصی">
                                <Sparkles size={10} />
                                اختصاصی
                              </span>
                            )}
                          </div>
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
      {hasChanges && viewMode === 'custom' && (
        <div className="sticky-footer">
          <span className="sticky-text">
            <AlertCircle size={16} />
            {customCount - initialPermissions.length > 0 && (
              <span className="text-success">
                +{customCount - initialPermissions.length} اضافه شده
              </span>
            )}
            {initialPermissions.length - customCount > 0 && (
              <span className="text-danger">
                {initialPermissions.length - customCount} حذف شده
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
export const UserPermissionsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { useByUser, useBulkUpdateUser } = usePermissions();
  const { useDetail } = useUsers();

  const userId = Number(id);
  const { data: userData, isLoading: userLoading } = useDetail(userId);
  const { data: permissionsData, isLoading: permLoading, refetch } = useByUser(userId);
  
  // ✅ دریافت مجوزهای نقش
  const { useByRole } = usePermissions();
  const { data: rolePermissionsData, isLoading: roleLoading } = useByRole(
    userData?.role || ''
  );
  
  const bulkUpdateUserMutation = useBulkUpdateUser();

  const isSuperUser = currentUser?.is_superuser || false;
  const isLoading = userLoading || permLoading || roleLoading;

  if (isLoading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>در حال بارگذاری...</p>
      </div>
    );
  }

  if (!userData || !permissionsData) {
    return (
      <div className="error-state">
        <AlertCircle size={48} />
        <h3>اطلاعات یافت نشد</h3>
        <button onClick={() => navigate('/users')} className="btn btn-primary">
          <ArrowRight size={18} />
          بازگشت به لیست کاربران
        </button>
      </div>
    );
  }

  // اگه کاربر سوپرادمینه
  if (userData.is_superuser) {
    return (
      <div className="user-permissions-page">
        <div className="page-header">
          <div className="header-left">
            <button className="back-btn" onClick={() => navigate('/users')}>
              <ArrowRight size={20} />
            </button>
            <div className="header-icon">
              <Crown size={28} />
            </div>
            <div className="header-content">
              <h1 className="page-title">مجوزهای «{userData.full_name}»</h1>
            </div>
          </div>
        </div>

        <div className="superuser-info">
          <Crown size={64} />
          <h2>سوپرادمین</h2>
          <p>این کاربر سوپرادمین است و به همه مجوزها دسترسی دارد.</p>
          <p>نیازی به تنظیم مجوز اختصاصی نیست.</p>
          <button onClick={() => navigate(`/users/${userId}`)} className="btn btn-primary">
            <ArrowRight size={18} />
            بازگشت به جزئیات کاربر
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="user-permissions-page">
      <UserPermissionsContent
        key={`${userId}-${permissionsData.granted_count}-${rolePermissionsData?.granted_count}`}
        userId={userId}
        userData={userData}
        permissionsData={permissionsData}
        rolePermissionsData={rolePermissionsData}
        isSuperUser={isSuperUser}
        onRefetch={refetch}
        bulkUpdateMutation={bulkUpdateUserMutation}
      />

      {/* ========== استایل‌ها ========== */}
      <style>{`
        .user-permissions-page {
          padding: 24px;
          max-width: 1200px;
          margin: 0 auto;
          padding-bottom: 100px;
        }

        /* ===== Header ===== */
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

        /* ===== User Info ===== */
        .user-info-banner {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 20px;
          background: white;
          border-radius: 14px;
          border: 1px solid #e9ecef;
          margin-bottom: 16px;
        }

        .user-avatar-small {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: 700;
          flex-shrink: 0;
          overflow: hidden;
        }

        .user-avatar-small img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .user-info-content {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
          min-width: 0;
        }

        .user-info-content strong {
          font-size: 16px;
          font-weight: 700;
          color: #1a1a2e;
        }

        .user-role-text {
          font-size: 13px;
          color: #6b7280;
        }

        .role-highlight {
          font-weight: 600;
          color: #4f46e5;
        }

        /* ===== Permission Stats ===== */
        .permission-stats {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .permission-stat-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          background: white;
          border-radius: 14px;
          border: 1px solid #e9ecef;
          flex: 1;
          min-width: 200px;
          transition: all 0.2s;
        }

        .permission-stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
        }

        .stat-icon-wrapper {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .stat-icon-wrapper.role-stat {
          background: #f3f4f6;
          color: #6b7280;
        }

        .stat-icon-wrapper.custom-stat {
          background: #f5f3ff;
          color: #7c3aed;
        }

        .stat-icon-wrapper.total-stat {
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          color: white;
        }

        .stat-content-wrapper {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .stat-number {
          font-size: 24px;
          font-weight: 700;
          color: #1a1a2e;
          line-height: 1.2;
        }

        .stat-label {
          font-size: 13px;
          font-weight: 600;
          color: #374151;
        }

        .stat-hint {
          font-size: 11px;
          color: #9ca3af;
        }

        .stat-plus,
        .stat-equals {
          font-size: 24px;
          font-weight: 700;
          color: #d1d5db;
          user-select: none;
        }

        /* ===== View Modes ===== */
        .view-modes {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
          padding: 6px;
          background: white;
          border-radius: 12px;
          border: 1px solid #e9ecef;
          overflow-x: auto;
          flex-wrap: wrap;
        }

        .view-mode-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          background: transparent;
          border: none;
          border-radius: 8px;
          color: #6b7280;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
          white-space: nowrap;
        }

        .view-mode-btn:hover {
          background: #f9fafb;
          color: #374151;
        }

        .view-mode-btn.active {
          background: #4f46e5;
          color: white;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);
        }

        .count-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 22px;
          height: 22px;
          padding: 0 6px;
          background: rgba(255, 255, 255, 0.25);
          border-radius: 11px;
          font-size: 11px;
          font-weight: 700;
          direction: ltr;
        }

        .view-mode-btn:not(.active) .count-badge {
          background: #e5e7eb;
          color: #6b7280;
        }

        /* ===== Toolbar ===== */
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

        .btn-copy {
          border-color: #7c3aed;
          color: #7c3aed;
        }

        .btn-copy:hover:not(:disabled) {
          background: #f5f3ff;
          border-color: #7c3aed;
          color: #7c3aed;
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

        /* ===== Categories ===== */
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
          flex-shrink: 0;
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

        .category-counts {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .count-chip {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 8px;
          border-radius: 10px;
          font-size: 11px;
          font-weight: 600;
        }

        .role-chip {
          background: #f3f4f6;
          color: #6b7280;
        }

        .custom-chip {
          background: #f5f3ff;
          color: #7c3aed;
        }

        .count-total {
          font-size: 12px;
          color: #9ca3af;
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

        .permission-item:hover:not(.from-role) {
          border-color: #e0e7ff;
          background: #fafbff;
        }

        .permission-item.selected {
          border-color: #4f46e5;
          background: #f5f3ff;
        }

        .permission-item.from-role {
          background: #f9fafb;
          border-color: #e5e7eb;
          cursor: not-allowed;
          opacity: 0.85;
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

        .checkbox-custom.from-role {
          background: #6b7280;
          border-color: #6b7280;
        }

        .permission-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
          min-width: 0;
        }

        .permission-name-row {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .permission-name {
          font-size: 13px;
          font-weight: 500;
          color: #1a1a2e;
        }

        .from-role-badge {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          padding: 2px 6px;
          background: #f3f4f6;
          color: #6b7280;
          border-radius: 8px;
          font-size: 10px;
          font-weight: 600;
        }

        .custom-badge {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          padding: 2px 6px;
          background: #f5f3ff;
          color: #7c3aed;
          border-radius: 8px;
          font-size: 10px;
          font-weight: 600;
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
          opacity: 0.5;
          cursor: not-allowed;
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* ===== Empty/Error/Loading ===== */
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

        /* ===== Superuser ===== */
        .superuser-info {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 60px 20px;
          background: white;
          border-radius: 14px;
          border: 1px solid #e9ecef;
          text-align: center;
        }

        .superuser-info svg {
          color: #d97706;
          margin-bottom: 20px;
        }

        .superuser-info h2 {
          font-size: 24px;
          font-weight: 700;
          color: #1a1a2e;
          margin: 0 0 8px 0;
        }

        .superuser-info p {
          color: #6b7280;
          font-size: 15px;
          margin: 0 0 8px 0;
        }

        .superuser-info button {
          margin-top: 24px;
        }

        /* ===== Sticky Footer ===== */
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

        /* ===== Responsive ===== */
        @media (max-width: 992px) {
          .permissions-list {
            grid-template-columns: 1fr;
          }

          .permission-stats {
            flex-direction: column;
            align-items: stretch;
          }

          .stat-plus,
          .stat-equals {
            text-align: center;
          }
        }

        @media (max-width: 768px) {
          .user-permissions-page {
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

export default UserPermissionsPage;

// // src/pages/UserPermissionsPage.tsx

// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { usePermissions } from '../modules/permission/hooks/usePermissions';
// import { useUsers } from '../modules/user/hooks/useUsers';
// import { useAuth } from '../context/AuthContext';
// import {
//   Shield,
//   ArrowRight,
//   CheckCircle,
//   XCircle,
//   Save,
//   RefreshCw,
//   Search,
//   ChevronDown,
//   ChevronUp,
//   Check,
//   AlertCircle,
//   Crown,
//   User,
//   Key,
//   Info,
// } from 'lucide-react';
// import {
//   CATEGORY_COLORS,
//   ACTION_COLORS,
// } from '../modules/permission/types/permission.types';
// import type { GroupedPermissions } from '../modules/permission/types/permission.types';

// // ========== Helper ==========
// const extractGrantedPermissions = (data: any): number[] => {
//   if (!data?.permissions) return [];
//   const granted: number[] = [];
//   Object.values(data.permissions).forEach((perms: any) => {
//     perms.forEach((p: any) => {
//       if (p.has_permission) granted.push(p.id);
//     });
//   });
//   return granted;
// };

// const buildInitialExpanded = (data: any): Record<string, boolean> => {
//   if (!data?.permissions) return {};
//   const expanded: Record<string, boolean> = {};
//   Object.keys(data.permissions).forEach((cat) => {
//     expanded[cat] = true;
//   });
//   return expanded;
// };

// // ==================== Inner Component ====================
// interface UserPermissionsContentProps {
//   userId: number;
//   userData: any;
//   permissionsData: any;
//   isSuperUser: boolean;
//   onRefetch: () => void;
//   bulkUpdateMutation: any;
// }

// const UserPermissionsContent: React.FC<UserPermissionsContentProps> = ({
//   userId,
//   userData,
//   permissionsData,
//   isSuperUser,
//   onRefetch,
//   bulkUpdateMutation,
// }) => {
//   const navigate = useNavigate();

//   const initialGranted = React.useMemo(
//     () => extractGrantedPermissions(permissionsData),
//     [permissionsData]
//   );

//   const initialExpanded = React.useMemo(
//     () => buildInitialExpanded(permissionsData),
//     [permissionsData]
//   );

//   const [selectedPermissions, setSelectedPermissions] = useState<number[]>(initialGranted);
//   const [initialPermissions, setInitialPermissions] = useState<number[]>(initialGranted);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(initialExpanded);

//   // ========== بررسی تغییرات ==========
//   const hasChanges = React.useMemo(() => {
//     if (selectedPermissions.length !== initialPermissions.length) return true;
//     return selectedPermissions.some((id) => !initialPermissions.includes(id));
//   }, [selectedPermissions, initialPermissions]);

//   // ========== توگل مجوز ==========
//   const togglePermission = (permissionId: number) => {
//     setSelectedPermissions((prev) => {
//       if (prev.includes(permissionId)) {
//         return prev.filter((id) => id !== permissionId);
//       }
//       return [...prev, permissionId];
//     });
//   };

//   const toggleCategory = (categoryName: string) => {
//     setExpandedCategories((prev) => ({
//       ...prev,
//       [categoryName]: !prev[categoryName],
//     }));
//   };

//   const selectAllInCategory = (categoryName: string) => {
//     if (!permissionsData?.permissions) return;
//     const categoryPerms = permissionsData.permissions[categoryName] || [];
//     const categoryIds = categoryPerms.map((p: any) => p.id);

//     setSelectedPermissions((prev) => {
//       const allSelected = categoryIds.every((id) => prev.includes(id));
//       if (allSelected) {
//         return prev.filter((id) => !categoryIds.includes(id));
//       }
//       return Array.from(new Set([...prev, ...categoryIds]));
//     });
//   };

//   const isCategoryAllSelected = (categoryName: string): boolean => {
//     if (!permissionsData?.permissions) return false;
//     const categoryPerms = permissionsData.permissions[categoryName] || [];
//     return categoryPerms.every((p: any) => selectedPermissions.includes(p.id));
//   };

//   const handleSave = async () => {
//     await bulkUpdateMutation.mutateAsync({
//       user_id: userId,
//       permission_ids: selectedPermissions,
//     });
//     setInitialPermissions(selectedPermissions);
//   };

//   const handleReset = () => {
//     setSelectedPermissions(initialPermissions);
//   };

//   const handleSelectAll = () => {
//     if (!permissionsData?.permissions) return;
//     const allIds: number[] = [];
//     Object.values(permissionsData.permissions).forEach((perms: any[]) => {
//       perms.forEach((p: any) => allIds.push(p.id));
//     });
//     setSelectedPermissions(allIds);
//   };

//   const handleDeselectAll = () => {
//     setSelectedPermissions([]);
//   };

//   const permissionsMap = permissionsData?.permissions;

//   const filteredPermissions = React.useMemo((): GroupedPermissions => {
//     if (!permissionsMap) return {};
//     if (!searchTerm.trim()) return permissionsMap;

//     const filtered: GroupedPermissions = {};
//     Object.entries(permissionsMap).forEach(([category, perms]) => {
//       const matchingPerms = perms.filter(
//         (p: any) =>
//           p.name.includes(searchTerm) ||
//           p.codename.toLowerCase().includes(searchTerm.toLowerCase())
//       );
//       if (matchingPerms.length > 0) {
//         filtered[category] = matchingPerms;
//       }
//     });
//     return filtered;
//   }, [permissionsMap, searchTerm]);

//   const totalPermissions = permissionsData?.total_permissions || 0;
//   const selectedCount = selectedPermissions.length;

//   return (
//     <>
//       {/* ========== هدر ========== */}
//       <div className="page-header">
//         <div className="header-left">
//           <button
//             className="back-btn"
//             onClick={() => navigate('/users')}
//             title="بازگشت"
//           >
//             <ArrowRight size={20} />
//           </button>
//           <div className="header-icon">
//             <Key size={28} />
//           </div>
//           <div className="header-content">
//             <h1 className="page-title">
//               مجوزهای اختصاصی «{userData.full_name}»
//             </h1>
//             <p className="page-subtitle">
//               {selectedCount} از {totalPermissions} مجوز اختصاصی انتخاب شده
//             </p>
//           </div>
//         </div>

//         <div className="header-actions">
//           {hasChanges && (
//             <span className="changes-badge">
//               <AlertCircle size={14} />
//               تغییرات ذخیره نشده
//             </span>
//           )}
//           <button
//             className="btn btn-secondary"
//             onClick={onRefetch}
//           >
//             <RefreshCw size={18} />
//             بروزرسانی
//           </button>
//           <button
//             className="btn btn-primary"
//             onClick={handleSave}
//             disabled={!hasChanges || bulkUpdateMutation.isPending || !isSuperUser}
//           >
//             {bulkUpdateMutation.isPending ? (
//               <>
//                 <RefreshCw size={18} className="spin" />
//                 در حال ذخیره...
//               </>
//             ) : (
//               <>
//                 <Save size={18} />
//                 ذخیره تغییرات
//               </>
//             )}
//           </button>
//         </div>
//       </div>

//       {/* ========== اطلاعات کاربر ========== */}
//       <div className="user-info-banner">
//         <div className="user-avatar-small">
//           {userData.profile_image ? (
//             <img src={userData.profile_image} alt={userData.full_name} />
//           ) : (
//             <span>{userData.full_name?.charAt(0)}</span>
//           )}
//         </div>
//         <div className="user-info-content">
//           <strong>{userData.full_name}</strong>
//           <span className="user-role-text">
//             نقش اصلی: <span className="role-highlight">{userData.role_display}</span>
//           </span>
//         </div>
//         <div className="user-info-note">
//           <Info size={16} />
//           <span>مجوزهای نقش به‌صورت خودکار اعمال می‌شوند. اینجا فقط مجوزهای <strong>اضافه</strong> را تنظیم کنید.</span>
//         </div>
//       </div>

//       {/* ========== نوار پیشرفت ========== */}
//       <div className="progress-bar-container">
//         <div className="progress-bar">
//           <div
//             className="progress-fill"
//             style={{
//               width: `${totalPermissions > 0 ? (selectedCount / totalPermissions) * 100 : 0}%`,
//             }}
//           ></div>
//         </div>
//         <span className="progress-text">
//           {totalPermissions > 0 ? Math.round((selectedCount / totalPermissions) * 100) : 0}%
//         </span>
//       </div>

//       {/* ========== ابزارها ========== */}
//       <div className="toolbar">
//         <div className="search-box">
//           <Search size={18} className="search-icon" />
//           <input
//             type="text"
//             placeholder="جستجو در مجوزها..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//         </div>

//         <div className="toolbar-actions">
//           <button
//             className="btn-tool"
//             onClick={handleSelectAll}
//             disabled={!isSuperUser}
//           >
//             <CheckCircle size={16} />
//             انتخاب همه
//           </button>
//           <button
//             className="btn-tool"
//             onClick={handleDeselectAll}
//             disabled={!isSuperUser}
//           >
//             <XCircle size={16} />
//             حذف همه
//           </button>
//           {hasChanges && (
//             <button
//               className="btn-tool btn-reset"
//               onClick={handleReset}
//             >
//               <RefreshCw size={16} />
//               بازگردانی
//             </button>
//           )}
//         </div>
//       </div>

//       {/* ========== دسته‌بندی‌ها ========== */}
//       <div className="categories-container">
//         {Object.entries(filteredPermissions).map(([categoryName, perms]: [string, any]) => {
//           const categoryColor =
//             CATEGORY_COLORS[perms[0]?.category as keyof typeof CATEGORY_COLORS] || '#6b7280';
//           const isExpanded = expandedCategories[categoryName] !== false;
//           const isAllSelected = isCategoryAllSelected(categoryName);
//           const selectedInCategory = perms.filter((p: any) =>
//             selectedPermissions.includes(p.id)
//           ).length;

//           return (
//             <div key={categoryName} className="category-block">
//               <div className="category-header" style={{ borderRightColor: categoryColor }}>
//                 <button className="category-toggle" onClick={() => toggleCategory(categoryName)}>
//                   {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
//                 </button>
//                 <div className="category-info">
//                   <span
//                     className="category-badge"
//                     style={{ background: `${categoryColor}15`, color: categoryColor }}
//                   >
//                     {categoryName}
//                   </span>
//                   <span className="category-count">
//                     {selectedInCategory} / {perms.length} مجوز
//                   </span>
//                 </div>
//                 {isSuperUser && (
//                   <button
//                     className={`category-select-all ${isAllSelected ? 'active' : ''}`}
//                     onClick={() => selectAllInCategory(categoryName)}
//                   >
//                     {isAllSelected ? (
//                       <>
//                         <CheckCircle size={16} />
//                         حذف همه
//                       </>
//                     ) : (
//                       <>
//                         <Check size={16} />
//                         انتخاب همه
//                       </>
//                     )}
//                   </button>
//                 )}
//               </div>

//               {isExpanded && (
//                 <div className="permissions-list">
//                   {perms.map((perm: any) => {
//                     const isSelected = selectedPermissions.includes(perm.id);
//                     const actionColor =
//                       ACTION_COLORS[perm.action as keyof typeof ACTION_COLORS] || '#6b7280';

//                     return (
//                       <label
//                         key={perm.id}
//                         className={`permission-item ${isSelected ? 'selected' : ''}`}
//                       >
//                         <input
//                           type="checkbox"
//                           checked={isSelected}
//                           onChange={() => togglePermission(perm.id)}
//                           disabled={!isSuperUser}
//                         />
//                         <div className="checkbox-custom">
//                           {isSelected && <Check size={14} />}
//                         </div>
//                         <div className="permission-info">
//                           <span className="permission-name">{perm.name}</span>
//                           <code className="permission-code">{perm.codename}</code>
//                         </div>
//                         <span
//                           className="permission-action"
//                           style={{ background: `${actionColor}15`, color: actionColor }}
//                         >
//                           {perm.action_display}
//                         </span>
//                       </label>
//                     );
//                   })}
//                 </div>
//               )}
//             </div>
//           );
//         })}

//         {Object.keys(filteredPermissions).length === 0 && (
//           <div className="empty-state">
//             <Search size={48} />
//             <h3>مجوزی یافت نشد</h3>
//             <p>هیچ مجوزی با "{searchTerm}" مطابقت ندارد</p>
//           </div>
//         )}
//       </div>

//       {/* ========== دکمه ذخیره پایین ========== */}
//       {hasChanges && (
//         <div className="sticky-footer">
//           <span className="sticky-text">
//             <AlertCircle size={16} />
//             {selectedCount - initialPermissions.length > 0 && (
//               <span className="text-success">
//                 +{selectedCount - initialPermissions.length} اضافه شده
//               </span>
//             )}
//             {initialPermissions.length - selectedCount > 0 && (
//               <span className="text-danger">
//                 {initialPermissions.length - selectedCount} حذف شده
//               </span>
//             )}
//           </span>
//           <div className="sticky-actions">
//             <button className="btn btn-secondary" onClick={handleReset}>
//               لغو
//             </button>
//             <button
//               className="btn btn-primary"
//               onClick={handleSave}
//               disabled={bulkUpdateMutation.isPending}
//             >
//               {bulkUpdateMutation.isPending ? (
//                 <>
//                   <RefreshCw size={18} className="spin" />
//                   در حال ذخیره...
//                 </>
//               ) : (
//                 <>
//                   <Save size={18} />
//                   ذخیره تغییرات
//                 </>
//               )}
//             </button>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// // ==================== Main Component ====================
// export const UserPermissionsPage: React.FC = () => {
//   const { id } = useParams<{ id: string }>();
//   const navigate = useNavigate();
//   const { user: currentUser } = useAuth();
//   const { useByUser, useBulkUpdateUser } = usePermissions();
//   const { useDetail } = useUsers();

//   const userId = Number(id);
//   const { data: userData, isLoading: userLoading } = useDetail(userId);
//   const { data: permissionsData, isLoading: permLoading, refetch } = useByUser(userId);
//   const bulkUpdateUserMutation = useBulkUpdateUser();

//   const isSuperUser = currentUser?.is_superuser || false;
//   const isLoading = userLoading || permLoading;

//   if (isLoading) {
//     return (
//       <div className="loading-state">
//         <div className="spinner"></div>
//         <p>در حال بارگذاری...</p>
//       </div>
//     );
//   }

//   if (!userData || !permissionsData) {
//     return (
//       <div className="error-state">
//         <AlertCircle size={48} />
//         <h3>اطلاعات یافت نشد</h3>
//         <button onClick={() => navigate('/users')} className="btn btn-primary">
//           <ArrowRight size={18} />
//           بازگشت به لیست کاربران
//         </button>
//       </div>
//     );
//   }

//   // اگه کاربر سوپرادمینه، پیام خاص نشون بده
//   if (userData.is_superuser) {
//     return (
//       <div className="user-permissions-page">
//         <div className="page-header">
//           <div className="header-left">
//             <button className="back-btn" onClick={() => navigate('/users')}>
//               <ArrowRight size={20} />
//             </button>
//             <div className="header-icon">
//               <Crown size={28} />
//             </div>
//             <div className="header-content">
//               <h1 className="page-title">مجوزهای «{userData.full_name}»</h1>
//             </div>
//           </div>
//         </div>

//         <div className="superuser-info">
//           <Crown size={64} />
//           <h2>سوپرادمین</h2>
//           <p>این کاربر سوپرادمین است و به همه مجوزها دسترسی دارد.</p>
//           <p>نیازی به تنظیم مجوز اختصاصی نیست.</p>
//           <button onClick={() => navigate(`/users/${userId}`)} className="btn btn-primary">
//             <ArrowRight size={18} />
//             بازگشت به جزئیات کاربر
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="user-permissions-page">
//       <UserPermissionsContent
//         key={`${userId}-${permissionsData.granted_count}`}
//         userId={userId}
//         userData={userData}
//         permissionsData={permissionsData}
//         isSuperUser={isSuperUser}
//         onRefetch={refetch}
//         bulkUpdateMutation={bulkUpdateUserMutation}
//       />

//       {/* ========== استایل‌ها ========== */}
//       <style>{`
//         .user-permissions-page {
//           padding: 24px;
//           max-width: 1200px;
//           margin: 0 auto;
//           padding-bottom: 100px;
//         }

//         /* ===== Header ===== */
//         .page-header {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           gap: 16px;
//           margin-bottom: 20px;
//           flex-wrap: wrap;
//         }

//         .header-left {
//           display: flex;
//           align-items: center;
//           gap: 12px;
//           flex: 1;
//           min-width: 0;
//         }

//         .back-btn {
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           width: 44px;
//           height: 44px;
//           border-radius: 12px;
//           background: white;
//           border: 1.5px solid #e5e7eb;
//           color: #4f46e5;
//           cursor: pointer;
//           transition: all 0.2s;
//           flex-shrink: 0;
//         }

//         .back-btn:hover {
//           background: #f5f3ff;
//           border-color: #4f46e5;
//         }

//         .header-icon {
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           width: 56px;
//           height: 56px;
//           border-radius: 16px;
//           background: linear-gradient(135deg, #4f46e5, #7c3aed);
//           color: white;
//           box-shadow: 0 8px 20px rgba(79, 70, 229, 0.3);
//           flex-shrink: 0;
//         }

//         .header-content h1 {
//           font-size: 20px;
//           font-weight: 700;
//           color: #1a1a2e;
//           margin: 0 0 4px 0;
//         }

//         .page-subtitle {
//           font-size: 14px;
//           color: #6b7280;
//           margin: 0;
//         }

//         .header-actions {
//           display: flex;
//           gap: 10px;
//           align-items: center;
//           flex-wrap: wrap;
//         }

//         .changes-badge {
//           display: inline-flex;
//           align-items: center;
//           gap: 6px;
//           padding: 8px 14px;
//           background: #fef3c7;
//           color: #d97706;
//           border-radius: 20px;
//           font-size: 13px;
//           font-weight: 500;
//         }

//         /* ===== User Info Banner ===== */
//         .user-info-banner {
//           display: flex;
//           align-items: center;
//           gap: 16px;
//           padding: 16px 20px;
//           background: white;
//           border-radius: 14px;
//           border: 1px solid #e9ecef;
//           margin-bottom: 16px;
//           flex-wrap: wrap;
//         }

//         .user-avatar-small {
//           width: 48px;
//           height: 48px;
//           border-radius: 50%;
//           background: linear-gradient(135deg, #4f46e5, #7c3aed);
//           color: white;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           font-size: 20px;
//           font-weight: 700;
//           flex-shrink: 0;
//           overflow: hidden;
//         }

//         .user-avatar-small img {
//           width: 100%;
//           height: 100%;
//           object-fit: cover;
//         }

//         .user-info-content {
//           display: flex;
//           flex-direction: column;
//           gap: 2px;
//           flex: 1;
//           min-width: 0;
//         }

//         .user-info-content strong {
//           font-size: 16px;
//           font-weight: 700;
//           color: #1a1a2e;
//         }

//         .user-role-text {
//           font-size: 13px;
//           color: #6b7280;
//         }

//         .role-highlight {
//           font-weight: 600;
//           color: #4f46e5;
//         }

//         .user-info-note {
//           display: flex;
//           align-items: center;
//           gap: 8px;
//           padding: 8px 14px;
//           background: #eff6ff;
//           color: #2563eb;
//           border-radius: 10px;
//           font-size: 12px;
//           line-height: 1.5;
//         }

//         .user-info-note svg {
//           flex-shrink: 0;
//         }

//         /* ===== Buttons ===== */
//         .btn {
//           display: inline-flex;
//           align-items: center;
//           gap: 8px;
//           padding: 10px 18px;
//           border: none;
//           border-radius: 10px;
//           font-size: 14px;
//           font-weight: 600;
//           cursor: pointer;
//           transition: all 0.2s ease;
//           font-family: inherit;
//           white-space: nowrap;
//         }

//         .btn-primary {
//           background: linear-gradient(135deg, #4f46e5, #7c3aed);
//           color: white;
//           box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);
//         }

//         .btn-primary:hover:not(:disabled) {
//           transform: translateY(-2px);
//           box-shadow: 0 8px 20px rgba(79, 70, 229, 0.35);
//         }

//         .btn-secondary {
//           background: white;
//           color: #374151;
//           border: 1.5px solid #e5e7eb;
//         }

//         .btn-secondary:hover:not(:disabled) {
//           border-color: #4f46e5;
//           color: #4f46e5;
//         }

//         .btn:disabled {
//           opacity: 0.5;
//           cursor: not-allowed;
//         }

//         .spin {
//           animation: spin 1s linear infinite;
//         }

//         @keyframes spin {
//           to { transform: rotate(360deg); }
//         }

//         /* ===== Progress ===== */
//         .progress-bar-container {
//           display: flex;
//           align-items: center;
//           gap: 16px;
//           background: white;
//           padding: 16px 20px;
//           border-radius: 12px;
//           border: 1px solid #e9ecef;
//           margin-bottom: 16px;
//         }

//         .progress-bar {
//           flex: 1;
//           height: 8px;
//           background: #f3f4f6;
//           border-radius: 4px;
//           overflow: hidden;
//         }

//         .progress-fill {
//           height: 100%;
//           background: linear-gradient(90deg, #4f46e5, #7c3aed);
//           border-radius: 4px;
//           transition: width 0.4s ease;
//         }

//         .progress-text {
//           font-size: 14px;
//           font-weight: 700;
//           color: #4f46e5;
//           min-width: 50px;
//           text-align: left;
//           direction: ltr;
//         }

//         /* ===== Toolbar ===== */
//         .toolbar {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           gap: 12px;
//           background: white;
//           padding: 14px 18px;
//           border-radius: 12px;
//           border: 1px solid #e9ecef;
//           margin-bottom: 20px;
//           flex-wrap: wrap;
//         }

//         .search-box {
//           position: relative;
//           flex: 1;
//           min-width: 240px;
//         }

//         .search-icon {
//           position: absolute;
//           right: 14px;
//           top: 50%;
//           transform: translateY(-50%);
//           color: #9ca3af;
//           pointer-events: none;
//         }

//         .search-box input {
//           width: 100%;
//           padding: 10px 42px 10px 16px;
//           border: 1.5px solid #e5e7eb;
//           border-radius: 10px;
//           font-size: 14px;
//           font-family: inherit;
//           background: #f9fafb;
//           transition: all 0.2s;
//         }

//         .search-box input:focus {
//           border-color: #4f46e5;
//           background: white;
//           outline: none;
//           box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.08);
//         }

//         .toolbar-actions {
//           display: flex;
//           gap: 8px;
//           flex-wrap: wrap;
//         }

//         .btn-tool {
//           display: inline-flex;
//           align-items: center;
//           gap: 6px;
//           padding: 8px 14px;
//           background: white;
//           border: 1.5px solid #e5e7eb;
//           border-radius: 8px;
//           color: #374151;
//           font-size: 13px;
//           font-weight: 500;
//           cursor: pointer;
//           transition: all 0.2s;
//           font-family: inherit;
//         }

//         .btn-tool:hover:not(:disabled) {
//           border-color: #4f46e5;
//           color: #4f46e5;
//           background: #f5f3ff;
//         }

//         .btn-tool:disabled {
//           opacity: 0.5;
//           cursor: not-allowed;
//         }

//         .btn-reset {
//           border-color: #fecaca;
//           color: #dc2626;
//         }

//         .btn-reset:hover {
//           background: #fef2f2;
//           border-color: #dc2626;
//           color: #dc2626;
//         }

//         /* ===== Categories ===== */
//         .categories-container {
//           display: flex;
//           flex-direction: column;
//           gap: 16px;
//         }

//         .category-block {
//           background: white;
//           border-radius: 14px;
//           border: 1px solid #e9ecef;
//           overflow: hidden;
//         }

//         .category-header {
//           display: flex;
//           align-items: center;
//           gap: 12px;
//           padding: 16px 20px;
//           background: #fafbfc;
//           border-bottom: 1px solid #f3f4f6;
//           border-right: 4px solid #4f46e5;
//         }

//         .category-toggle {
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           width: 28px;
//           height: 28px;
//           background: white;
//           border: 1.5px solid #e5e7eb;
//           border-radius: 8px;
//           color: #6b7280;
//           cursor: pointer;
//           transition: all 0.2s;
//         }

//         .category-toggle:hover {
//           border-color: #4f46e5;
//           color: #4f46e5;
//         }

//         .category-info {
//           display: flex;
//           align-items: center;
//           gap: 12px;
//           flex: 1;
//           flex-wrap: wrap;
//         }

//         .category-badge {
//           display: inline-flex;
//           align-items: center;
//           padding: 6px 14px;
//           border-radius: 20px;
//           font-size: 13px;
//           font-weight: 600;
//         }

//         .category-count {
//           font-size: 13px;
//           color: #6b7280;
//           direction: ltr;
//         }

//         .category-select-all {
//           display: inline-flex;
//           align-items: center;
//           gap: 6px;
//           padding: 6px 14px;
//           background: white;
//           border: 1.5px solid #e5e7eb;
//           border-radius: 8px;
//           color: #374151;
//           font-size: 12px;
//           font-weight: 500;
//           cursor: pointer;
//           transition: all 0.2s;
//           font-family: inherit;
//         }

//         .category-select-all:hover {
//           border-color: #4f46e5;
//           color: #4f46e5;
//         }

//         .category-select-all.active {
//           background: #4f46e5;
//           color: white;
//           border-color: #4f46e5;
//         }

//         .permissions-list {
//           display: grid;
//           grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
//           gap: 8px;
//           padding: 16px 20px;
//         }

//         .permission-item {
//           display: flex;
//           align-items: center;
//           gap: 12px;
//           padding: 12px 14px;
//           border-radius: 10px;
//           border: 1.5px solid #f3f4f6;
//           cursor: pointer;
//           transition: all 0.2s;
//           position: relative;
//         }

//         .permission-item:hover {
//           border-color: #e0e7ff;
//           background: #fafbff;
//         }

//         .permission-item.selected {
//           border-color: #4f46e5;
//           background: #f5f3ff;
//         }

//         .permission-item input[type="checkbox"] {
//           position: absolute;
//           opacity: 0;
//           pointer-events: none;
//         }

//         .checkbox-custom {
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           width: 20px;
//           height: 20px;
//           border: 2px solid #d1d5db;
//           border-radius: 6px;
//           background: white;
//           color: white;
//           transition: all 0.2s;
//           flex-shrink: 0;
//         }

//         .permission-item.selected .checkbox-custom {
//           background: #4f46e5;
//           border-color: #4f46e5;
//         }

//         .permission-info {
//           display: flex;
//           flex-direction: column;
//           gap: 4px;
//           flex: 1;
//           min-width: 0;
//         }

//         .permission-name {
//           font-size: 13px;
//           font-weight: 500;
//           color: #1a1a2e;
//         }

//         .permission-code {
//           font-family: 'Courier New', monospace;
//           font-size: 11px;
//           color: #6b7280;
//           direction: ltr;
//         }

//         .permission-action {
//           display: inline-flex;
//           align-items: center;
//           padding: 3px 10px;
//           border-radius: 12px;
//           font-size: 11px;
//           font-weight: 600;
//           white-space: nowrap;
//           flex-shrink: 0;
//         }

//         /* ===== Empty/Error/Loading ===== */
//         .empty-state,
//         .error-state,
//         .loading-state {
//           display: flex;
//           flex-direction: column;
//           align-items: center;
//           justify-content: center;
//           padding: 60px 20px;
//           background: white;
//           border-radius: 14px;
//           border: 1px solid #e9ecef;
//           text-align: center;
//           color: #6b7280;
//         }

//         .empty-state svg,
//         .error-state svg {
//           color: #d1d5db;
//           margin-bottom: 16px;
//         }

//         .empty-state h3,
//         .error-state h3 {
//           font-size: 18px;
//           font-weight: 600;
//           color: #1a1a2e;
//           margin: 0 0 8px 0;
//         }

//         .empty-state p,
//         .error-state p {
//           margin: 0 0 20px 0;
//           font-size: 14px;
//         }

//         .loading-state .spinner {
//           width: 40px;
//           height: 40px;
//           border: 4px solid #e9ecef;
//           border-top-color: #4f46e5;
//           border-radius: 50%;
//           animation: spin 0.8s linear infinite;
//           margin-bottom: 16px;
//         }

//         /* ===== Superuser Info ===== */
//         .superuser-info {
//           display: flex;
//           flex-direction: column;
//           align-items: center;
//           padding: 60px 20px;
//           background: white;
//           border-radius: 14px;
//           border: 1px solid #e9ecef;
//           text-align: center;
//         }

//         .superuser-info svg {
//           color: #d97706;
//           margin-bottom: 20px;
//         }

//         .superuser-info h2 {
//           font-size: 24px;
//           font-weight: 700;
//           color: #1a1a2e;
//           margin: 0 0 8px 0;
//         }

//         .superuser-info p {
//           color: #6b7280;
//           font-size: 15px;
//           margin: 0 0 8px 0;
//         }

//         .superuser-info button {
//           margin-top: 24px;
//         }

//         /* ===== Sticky Footer ===== */
//         .sticky-footer {
//           position: fixed;
//           bottom: 0;
//           left: 0;
//           right: 0;
//           background: white;
//           border-top: 1px solid #e9ecef;
//           padding: 14px 24px;
//           display: flex;
//           align-items: center;
//           justify-content: space-between;
//           gap: 16px;
//           box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.08);
//           z-index: 100;
//           animation: slideUp 0.3s ease;
//         }

//         @keyframes slideUp {
//           from { transform: translateY(100%); }
//           to { transform: translateY(0); }
//         }

//         .sticky-text {
//           display: inline-flex;
//           align-items: center;
//           gap: 12px;
//           font-size: 14px;
//           font-weight: 500;
//           color: #374151;
//         }

//         .text-success {
//           color: #059669;
//           font-weight: 600;
//         }

//         .text-danger {
//           color: #dc2626;
//           font-weight: 600;
//         }

//         .sticky-actions {
//           display: flex;
//           gap: 10px;
//         }

//         /* ===== Responsive ===== */
//         @media (max-width: 992px) {
//           .permissions-list {
//             grid-template-columns: 1fr;
//           }
//         }

//         @media (max-width: 768px) {
//           .user-permissions-page {
//             padding: 16px;
//             padding-bottom: 120px;
//           }

//           .page-header {
//             flex-direction: column;
//             align-items: stretch;
//           }

//           .header-content h1 {
//             font-size: 16px;
//           }

//           .toolbar {
//             flex-direction: column;
//             align-items: stretch;
//           }

//           .permissions-list {
//             padding: 12px;
//           }

//           .user-info-banner {
//             flex-direction: column;
//             text-align: center;
//           }

//           .user-info-note {
//             width: 100%;
//           }

//           .sticky-footer {
//             flex-direction: column;
//             gap: 12px;
//           }

//           .sticky-actions {
//             width: 100%;
//           }

//           .sticky-actions .btn {
//             flex: 1;
//             justify-content: center;
//           }
//         }
//       `}</style>
//     </div>
//   );
// };

// export default UserPermissionsPage;