// src/pages/UserDetailsPage.tsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUsers } from '../modules/user/hooks/useUsers';
import { usePermissions } from '../modules/permission/hooks/usePermissions';
import { useAuth } from '../context/AuthContext';
import {
  User as UserIcon,
  ArrowRight,
  Mail,
  Phone,
  CreditCard,
  Shield,
  Edit,
  Save,
  X,
  Key,
  Crown,
  Users,
  UserCheck,
  UserCog,
  Eye,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Calendar,
  Clock,
  Activity,
  Lock,
  Camera,
} from 'lucide-react';
import { ROLES } from '../modules/auth/types/auth.types';
import type { UserRole, User } from '../modules/auth/types/auth.types';

type TabType = 'info' | 'permissions' | 'logs';

export const UserDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  const { 
    useDetail, 
    useUpdate, 
    useChangeRole, 
    useToggleActive,
    useUserLogs,
  } = useUsers();
  const { useByUser, useBulkUpdateUser } = usePermissions();

  const userId = Number(id);

  const { data: user, isLoading, refetch } = useDetail(userId);
  const { data: userPermissions } = useByUser(userId);
  const { data: userLogs } = useUserLogs(userId);

  const updateMutation = useUpdate();
  const changeRoleMutation = useChangeRole();
  const toggleActiveMutation = useToggleActive();
  const bulkUpdateUserMutation = useBulkUpdateUser();

  const [activeTab, setActiveTab] = useState<TabType>('info');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [initialPermissions, setInitialPermissions] = useState<number[]>([]);
  const [hasPermissionChanges, setHasPermissionChanges] = useState(false);
  const [isChangingRole, setIsChangingRole] = useState(false);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    national_code: '',
  });

  const isSuperUser = currentUser?.is_superuser;
  const isOwnProfile = currentUser?.id === userId;
  const isAdmin = currentUser?.role === 'ADMIN' || isSuperUser;

  // ========== بارگذاری اطلاعات کاربر ==========
  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        national_code: user.national_code || '',
      });
    }
  }, [user]);

  // ========== بارگذاری مجوزهای اختصاصی ==========
  useEffect(() => {
    if (userPermissions?.permissions) {
      const granted: number[] = [];
      Object.values(userPermissions.permissions).forEach((perms: any) => {
        perms.forEach((p: any) => {
          if (p.has_permission) granted.push(p.id);
        });
      });
      setSelectedPermissions(granted);
      setInitialPermissions(granted);
    }
  }, [userPermissions]);

  // ========== بررسی تغییرات مجوزها ==========
  useEffect(() => {
    const changed =
      selectedPermissions.length !== initialPermissions.length ||
      selectedPermissions.some((id) => !initialPermissions.includes(id));
    setHasPermissionChanges(changed);
  }, [selectedPermissions, initialPermissions]);

  // ========== آیکون نقش ==========
  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'ADMIN': return Crown;
      case 'MANAGER': return Shield;
      case 'RESEARCHER': return UserCheck;
      case 'USER': return Users;
      case 'VIEWER': return UserCog;
      default: return UserIcon;
    }
  };

  // ========== عملیات‌ها ==========
  const handleSaveInfo = async () => {
    try {
      await updateMutation.mutateAsync({
        id: userId,
        data: formData,
      });
      setIsEditing(false);
      refetch();
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  const handleCancelEdit = () => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        national_code: user.national_code || '',
      });
    }
    setIsEditing(false);
  };

  const handleChangeRole = async (newRole: UserRole) => {
    try {
      await changeRoleMutation.mutateAsync({
        id: userId,
        role: newRole,
      });
      setIsChangingRole(false);
      refetch();
    } catch (error) {
      console.error('Change role error:', error);
    }
  };

  const handleToggleActive = async () => {
    try {
      await toggleActiveMutation.mutateAsync(userId);
      refetch();
    } catch (error) {
      console.error('Toggle active error:', error);
    }
  };

  const handleTogglePermission = (permissionId: number) => {
    setSelectedPermissions((prev) => {
      if (prev.includes(permissionId)) {
        return prev.filter((pid) => pid !== permissionId);
      }
      return [...prev, permissionId];
    });
  };

  const handleSelectAllInCategory = (categoryName: string) => {
    if (!userPermissions?.permissions) return;
    const categoryPerms = userPermissions.permissions[categoryName] || [];
    const categoryIds = categoryPerms.map((p: any) => p.id);

    setSelectedPermissions((prev) => {
      const allSelected = categoryIds.every((pid) => prev.includes(pid));
      if (allSelected) {
        return prev.filter((pid) => !categoryIds.includes(pid));
      }
      return Array.from(new Set([...prev, ...categoryIds]));
    });
  };

  const isCategoryAllSelected = (categoryName: string): boolean => {
    if (!userPermissions?.permissions) return false;
    const categoryPerms = userPermissions.permissions[categoryName] || [];
    return categoryPerms.every((p: any) => selectedPermissions.includes(p.id));
  };

  const handleSavePermissions = async () => {
    try {
      await bulkUpdateUserMutation.mutateAsync({
        user_id: userId,
        permission_ids: selectedPermissions,
      });
      setInitialPermissions(selectedPermissions);
      setHasPermissionChanges(false);
    } catch (error) {
      console.error('Save permissions error:', error);
    }
  };

  const handleResetPermissions = () => {
    setSelectedPermissions(initialPermissions);
  };

  // ========== Loading ==========
  if (isLoading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>در حال بارگذاری...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="error-state">
        <AlertCircle size={48} />
        <h3>کاربر یافت نشد</h3>
        <button onClick={() => navigate('/users')} className="btn btn-primary">
          <ArrowRight size={18} />
          بازگشت به لیست کاربران
        </button>
      </div>
    );
  }

  const RoleIcon = getRoleIcon(user.role);
  const roleColor = ROLES[user.role]?.color || '#6b7280';

  return (
    <div className="user-details-page">
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
          <div className="header-content">
            <h1 className="page-title">جزئیات کاربر</h1>
            <p className="page-subtitle">مشاهده و ویرایش اطلاعات کاربر</p>
          </div>
        </div>

        <div className="header-actions">
          {isAdmin && !isOwnProfile && (
            <button
              className={`btn ${user.is_active ? 'btn-warning' : 'btn-success'}`}
              onClick={handleToggleActive}
              disabled={toggleActiveMutation.isPending}
            >
              {user.is_active ? (
                <>
                  <XCircle size={18} />
                  غیرفعال کردن
                </>
              ) : (
                <>
                  <CheckCircle size={18} />
                  فعال کردن
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

      {/* ========== پروفایل کاربر ========== */}
      <div className="profile-card">
        <div className="profile-header">
          <div
            className="profile-avatar"
            style={{ background: roleColor }}
          >
            {user.profile_image ? (
              <img src={user.profile_image} alt={user.full_name} />
            ) : (
              <span>{user.full_name?.charAt(0) || user.username.charAt(0)}</span>
            )}
            {isOwnProfile && (
              <button className="avatar-edit-btn" title="تغییر تصویر">
                <Camera size={16} />
              </button>
            )}
          </div>

          <div className="profile-info">
            <div className="profile-name-row">
              <h2>{user.full_name}</h2>
              {isOwnProfile && <span className="you-badge">شما</span>}
            </div>
            <div className="profile-badges">
              <span
                className="role-badge"
                style={{
                  background: `${roleColor}15`,
                  color: roleColor,
                  border: `1px solid ${roleColor}30`,
                }}
              >
                <RoleIcon size={14} />
                {user.role_display}
              </span>
              {user.is_active ? (
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
              {user.is_superuser && (
                <span className="superuser-badge">
                  <Crown size={14} />
                  سوپرادمین
                </span>
              )}
            </div>
            <span className="username-display">@{user.username}</span>
          </div>

          {isAdmin && !isEditing && activeTab === 'info' && (
            <button
              className="btn btn-primary"
              onClick={() => setIsEditing(true)}
            >
              <Edit size={18} />
              ویرایش
            </button>
          )}
        </div>
      </div>

      {/* ========== Tabs ========== */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'info' ? 'active' : ''}`}
          onClick={() => setActiveTab('info')}
        >
          <UserIcon size={18} />
          اطلاعات شخصی
        </button>
        <button
          className={`tab ${activeTab === 'permissions' ? 'active' : ''}`}
          onClick={() => setActiveTab('permissions')}
        >
          <Key size={18} />
          مجوزهای اختصاصی
          {userPermissions && (
            <span className="tab-badge">{userPermissions.granted_count}</span>
          )}
        </button>
        <button
          className={`tab ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          <Activity size={18} />
          لاگ‌های فعالیت
        </button>
      </div>

      {/* ========== Tab 1: اطلاعات شخصی ========== */}
      {activeTab === 'info' && (
        <div className="tab-content">
          <div className="form-card">
            <div className="form-grid">
              <div className="form-group">
                <label>
                  <UserIcon size={14} />
                  نام
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="input-field"
                  />
                ) : (
                  <div className="field-value">{user.first_name || '—'}</div>
                )}
              </div>

              <div className="form-group">
                <label>
                  <UserIcon size={14} />
                  نام خانوادگی
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="input-field"
                  />
                ) : (
                  <div className="field-value">{user.last_name || '—'}</div>
                )}
              </div>

              <div className="form-group">
                <label>
                  <Mail size={14} />
                  ایمیل
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-field"
                    dir="ltr"
                  />
                ) : (
                  <div className="field-value" dir="ltr">
                    {user.email ? (
                      <a href={`mailto:${user.email}`}>{user.email}</a>
                    ) : (
                      '—'
                    )}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>
                  <Phone size={14} />
                  تلفن
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input-field"
                    dir="ltr"
                  />
                ) : (
                  <div className="field-value" dir="ltr">
                    {user.phone || '—'}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>
                  <CreditCard size={14} />
                  کد ملی
                </label>
                <div className="field-value" dir="ltr">
                  {user.national_code || '—'}
                </div>
              </div>

              <div className="form-group">
                <label>
                  <Calendar size={14} />
                  تاریخ عضویت
                </label>
                <div className="field-value">
                  {new Date(user.date_joined).toLocaleDateString('fa-IR')}
                </div>
              </div>

              <div className="form-group">
                <label>
                  <Clock size={14} />
                  آخرین ورود
                </label>
                <div className="field-value">
                  {user.last_login
                    ? new Date(user.last_login).toLocaleDateString('fa-IR')
                    : 'هرگز'}
                </div>
              </div>

              <div className="form-group">
                <label>
                  <Shield size={14} />
                  نقش
                </label>
                {isChangingRole ? (
                  <select
                    value={user.role}
                    onChange={(e) => handleChangeRole(e.target.value as UserRole)}
                    className="input-field"
                  >
                    {Object.entries(ROLES).map(([role, info]) => (
                      <option
                        key={role}
                        value={role}
                        disabled={role === 'ADMIN' && !isSuperUser}
                      >
                        {info.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="field-value-with-action">
                    <span>{user.role_display}</span>
                    {isAdmin && !isOwnProfile && (
                      <button
                        className="action-btn-small"
                        onClick={() => setIsChangingRole(true)}
                        title="تغییر نقش"
                      >
                        <Edit size={14} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="form-actions">
                <button
                  className="btn btn-secondary"
                  onClick={handleCancelEdit}
                  disabled={updateMutation.isPending}
                >
                  <X size={18} />
                  لغو
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleSaveInfo}
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? (
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
            )}
          </div>
        </div>
      )}

      {/* ========== Tab 2: مجوزهای اختصاصی ========== */}
      {activeTab === 'permissions' && (
        <div className="tab-content">
          <div className="permissions-info">
            <AlertCircle size={18} />
            <div>
              <strong>مجوزهای اختصاصی</strong>
              <p>
                این مجوزها <strong>علاوه بر</strong> مجوزهای نقش «{user.role_display}» به این کاربر داده می‌شوند.
                مجوزهای اصلی از نقش کاربر می‌آیند.
              </p>
            </div>
          </div>

          {user.is_superuser ? (
            <div className="superuser-message">
              <Crown size={48} />
              <h3>سوپرادمین</h3>
              <p>این کاربر سوپرادمین است و به همه مجوزها دسترسی دارد.</p>
            </div>
          ) : (
            <>
              {hasPermissionChanges && (
                <div className="changes-notice">
                  <AlertCircle size={16} />
                  <span>تغییرات ذخیره نشده</span>
                  <div className="changes-actions">
                    <button
                      className="btn-tool"
                      onClick={handleResetPermissions}
                    >
                      <RefreshCw size={14} />
                      بازگردانی
                    </button>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={handleSavePermissions}
                      disabled={bulkUpdateUserMutation.isPending}
                    >
                      {bulkUpdateUserMutation.isPending ? (
                        <>
                          <RefreshCw size={14} className="spin" />
                          در حال ذخیره...
                        </>
                      ) : (
                        <>
                          <Save size={14} />
                          ذخیره
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              <div className="categories-container">
                {userPermissions?.permissions && Object.entries(userPermissions.permissions).map(
                  ([categoryName, perms]: [string, any]) => {
                    const isAllSelected = isCategoryAllSelected(categoryName);
                    const selectedCount = perms.filter((p: any) =>
                      selectedPermissions.includes(p.id)
                    ).length;

                    return (
                      <div key={categoryName} className="category-block">
                        <div className="category-header">
                          <div className="category-info">
                            <span className="category-badge">{categoryName}</span>
                            <span className="category-count">
                              {selectedCount} / {perms.length}
                            </span>
                          </div>
                          {isAdmin && (
                            <button
                              className={`category-select-all ${isAllSelected ? 'active' : ''}`}
                              onClick={() => handleSelectAllInCategory(categoryName)}
                            >
                              {isAllSelected ? (
                                <>
                                  <XCircle size={14} />
                                  حذف همه
                                </>
                              ) : (
                                <>
                                  <CheckCircle size={14} />
                                  انتخاب همه
                                </>
                              )}
                            </button>
                          )}
                        </div>

                        <div className="permissions-grid">
                          {perms.map((perm: any) => {
                            const isSelected = selectedPermissions.includes(perm.id);
                            return (
                              <label
                                key={perm.id}
                                className={`permission-item ${isSelected ? 'selected' : ''}`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleTogglePermission(perm.id)}
                                  disabled={!isAdmin}
                                />
                                <div className="checkbox-custom">
                                  {isSelected && <CheckCircle size={12} />}
                                </div>
                                <div className="permission-info">
                                  <span className="permission-name">{perm.name}</span>
                                  <code className="permission-code">{perm.codename}</code>
                                </div>
                                <span className="permission-action">
                                  {perm.action}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* ========== Tab 3: لاگ‌ها ========== */}
      {activeTab === 'logs' && (
        <div className="tab-content">
          {userLogs && userLogs.length > 0 ? (
            <div className="logs-container">
              {userLogs.map((log: any) => (
                <div key={log.id} className="log-item">
                  <div className={`log-icon action-${log.action.toLowerCase()}`}>
                    {log.action === 'LOGIN' && <UserCheck size={16} />}
                    {log.action === 'LOGOUT' && <XCircle size={16} />}
                    {log.action === 'CREATE' && <CheckCircle size={16} />}
                    {log.action === 'UPDATE' && <Edit size={16} />}
                    {log.action === 'DELETE' && <XCircle size={16} />}
                    {log.action === 'VIEW' && <Eye size={16} />}
                  </div>
                  <div className="log-content">
                    <div className="log-header">
                      <span className="log-action">{log.action_display}</span>
                      <span className="log-time">
                        {new Date(log.created_at).toLocaleString('fa-IR')}
                      </span>
                    </div>
                    {log.model_name && (
                      <span className="log-model">
                        مدل: {log.model_name} {log.object_repr && `- ${log.object_repr}`}
                      </span>
                    )}
                    {log.ip_address && (
                      <span className="log-ip">آی‌پی: {log.ip_address}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Activity size={48} />
              <h3>هیچ لاگی یافت نشد</h3>
              <p>این کاربر هنوز فعالیتی نداشته است.</p>
            </div>
          )}
        </div>
      )}

      {/* ========== استایل‌ها ========== */}
      <style>{`
        .user-details-page {
          padding: 24px;
          max-width: 1200px;
          margin: 0 auto;
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
        }

        .back-btn:hover {
          background: #f5f3ff;
          border-color: #4f46e5;
        }

        .header-content h1 {
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

        .btn-sm {
          padding: 6px 12px;
          font-size: 13px;
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

        .btn-warning {
          background: #fef3c7;
          color: #d97706;
          border: 1.5px solid #fde68a;
        }

        .btn-warning:hover:not(:disabled) {
          background: #fde68a;
        }

        .btn-success {
          background: #d1fae5;
          color: #059669;
          border: 1.5px solid #a7f3d0;
        }

        .btn-success:hover:not(:disabled) {
          background: #a7f3d0;
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

        /* ===== Profile Card ===== */
        .profile-card {
          background: white;
          border-radius: 16px;
          border: 1px solid #e9ecef;
          padding: 24px;
          margin-bottom: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .profile-header {
          display: flex;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
        }

        .profile-avatar {
          position: relative;
          width: 90px;
          height: 90px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 36px;
          font-weight: 700;
          flex-shrink: 0;
          overflow: hidden;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        }

        .profile-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-edit-btn {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: white;
          border: 2px solid #e9ecef;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #4f46e5;
          cursor: pointer;
          transition: all 0.2s;
        }

        .avatar-edit-btn:hover {
          background: #f5f3ff;
          border-color: #4f46e5;
        }

        .profile-info {
          flex: 1;
          min-width: 0;
        }

        .profile-name-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
        }

        .profile-name-row h2 {
          font-size: 22px;
          font-weight: 700;
          color: #1a1a2e;
          margin: 0;
        }

        .you-badge {
          display: inline-flex;
          align-items: center;
          padding: 3px 10px;
          background: #4f46e5;
          color: white;
          font-size: 11px;
          font-weight: 600;
          border-radius: 10px;
        }

        .profile-badges {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 8px;
        }

        .role-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
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

        .superuser-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 12px;
          background: linear-gradient(135deg, #fef3c7, #fde68a);
          color: #92400e;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }

        .username-display {
          font-family: 'Courier New', monospace;
          font-size: 13px;
          color: #6b7280;
          direction: ltr;
          display: inline-block;
        }

        /* ===== Tabs ===== */
        .tabs {
          display: flex;
          gap: 4px;
          background: white;
          padding: 6px;
          border-radius: 12px;
          border: 1px solid #e9ecef;
          margin-bottom: 20px;
          overflow-x: auto;
        }

        .tab {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border: none;
          border-radius: 8px;
          background: transparent;
          color: #6b7280;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
          white-space: nowrap;
          position: relative;
        }

        .tab:hover {
          background: #f9fafb;
          color: #374151;
        }

        .tab.active {
          background: #4f46e5;
          color: white;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);
        }

        .tab-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 20px;
          height: 20px;
          padding: 0 6px;
          background: rgba(255, 255, 255, 0.25);
          border-radius: 10px;
          font-size: 11px;
          font-weight: 700;
        }

        .tab:not(.active) .tab-badge {
          background: #4f46e5;
          color: white;
        }

        /* ===== Tab Content ===== */
        .tab-content {
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ===== Form Card ===== */
        .form-card {
          background: white;
          border-radius: 14px;
          border: 1px solid #e9ecef;
          padding: 24px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 600;
          color: #6b7280;
        }

        .field-value {
          padding: 10px 14px;
          background: #f9fafb;
          border-radius: 10px;
          font-size: 14px;
          color: #1a1a2e;
          font-weight: 500;
          min-height: 42px;
          display: flex;
          align-items: center;
        }

        .field-value a {
          color: #4f46e5;
          text-decoration: none;
        }

        .field-value a:hover {
          text-decoration: underline;
        }

        .field-value-with-action {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .field-value-with-action .field-value {
          flex: 1;
        }

        .action-btn-small {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border: 1.5px solid #e5e7eb;
          border-radius: 8px;
          background: white;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.2s;
        }

        .action-btn-small:hover {
          border-color: #4f46e5;
          color: #4f46e5;
          background: #f5f3ff;
        }

        .input-field {
          padding: 10px 14px;
          border: 1.5px solid #e5e7eb;
          border-radius: 10px;
          font-size: 14px;
          font-family: inherit;
          background: white;
          transition: all 0.2s;
          width: 100%;
        }

        .input-field:focus {
          border-color: #4f46e5;
          outline: none;
          box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.08);
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid #f3f4f6;
        }

        /* ===== Permissions ===== */
        .permissions-info {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px 20px;
          background: #fef3c7;
          border: 1px solid #fde68a;
          border-radius: 12px;
          margin-bottom: 20px;
          color: #92400e;
        }

        .permissions-info svg {
          flex-shrink: 0;
          margin-top: 2px;
        }

        .permissions-info strong {
          display: block;
          font-size: 14px;
          margin-bottom: 4px;
        }

        .permissions-info p {
          margin: 0;
          font-size: 13px;
          line-height: 1.6;
        }

        .superuser-message {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 60px 20px;
          background: white;
          border-radius: 14px;
          border: 1px solid #e9ecef;
          color: #92400e;
          text-align: center;
        }

        .superuser-message svg {
          color: #d97706;
          margin-bottom: 16px;
        }

        .superuser-message h3 {
          font-size: 20px;
          font-weight: 700;
          margin: 0 0 8px 0;
          color: #1a1a2e;
        }

        .superuser-message p {
          color: #6b7280;
          font-size: 14px;
          margin: 0;
        }

        .changes-notice {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: #fef3c7;
          border: 1px solid #fde68a;
          border-radius: 10px;
          margin-bottom: 20px;
          color: #92400e;
          font-size: 13px;
          font-weight: 500;
        }

        .changes-actions {
          display: flex;
          gap: 8px;
          margin-right: auto;
        }

        .btn-tool {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
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

        .btn-tool:hover {
          border-color: #4f46e5;
          color: #4f46e5;
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
          justify-content: space-between;
          gap: 12px;
          padding: 14px 20px;
          background: #fafbfc;
          border-bottom: 1px solid #f3f4f6;
          flex-wrap: wrap;
        }

        .category-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .category-badge {
          display: inline-flex;
          padding: 5px 14px;
          background: #eef2ff;
          color: #4f46e5;
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
          padding: 6px 12px;
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

        .permissions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 8px;
          padding: 16px;
        }

        .permission-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 8px;
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
          width: 18px;
          height: 18px;
          border: 2px solid #d1d5db;
          border-radius: 5px;
          background: white;
          color: white;
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .permission-item.selected .checkbox-custom {
          background: #4f46e5;
          border-color: #4f46e5;
        }

        .permission-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
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
          font-size: 10px;
          color: #9ca3af;
          direction: ltr;
        }

        .permission-action {
          display: inline-flex;
          padding: 2px 8px;
          background: #f3f4f6;
          color: #6b7280;
          border-radius: 10px;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          flex-shrink: 0;
        }

        /* ===== Logs ===== */
        .logs-container {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .log-item {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 14px 18px;
          background: white;
          border-radius: 12px;
          border: 1px solid #e9ecef;
          transition: all 0.2s;
        }

        .log-item:hover {
          border-color: #e0e7ff;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .log-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          flex-shrink: 0;
        }

        .action-login {
          background: #d1fae5;
          color: #059669;
        }

        .action-logout {
          background: #fee2e2;
          color: #dc2626;
        }

        .action-create {
          background: #dbeafe;
          color: #2563eb;
        }

        .action-update {
          background: #fef3c7;
          color: #d97706;
        }

        .action-delete {
          background: #fee2e2;
          color: #dc2626;
        }

        .action-view {
          background: #f3f4f6;
          color: #6b7280;
        }

        .log-content {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
          min-width: 0;
        }

        .log-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }

        .log-action {
          font-size: 14px;
          font-weight: 600;
          color: #1a1a2e;
        }

        .log-time {
          font-size: 12px;
          color: #9ca3af;
        }

        .log-model {
          font-size: 12px;
          color: #6b7280;
        }

        .log-ip {
          font-size: 11px;
          color: #9ca3af;
          direction: ltr;
          font-family: 'Courier New', monospace;
        }

        /* ===== States ===== */
        .loading-state,
        .error-state,
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

        .error-state svg,
        .empty-state svg {
          color: #d1d5db;
          margin-bottom: 16px;
        }

        .error-state h3,
        .empty-state h3 {
          font-size: 18px;
          font-weight: 600;
          color: #1a1a2e;
          margin: 0 0 8px 0;
        }

        .error-state p,
        .empty-state p {
          color: #6b7280;
          font-size: 14px;
          margin: 0 0 20px 0;
        }

        /* ===== Responsive ===== */
        @media (max-width: 768px) {
          .user-details-page {
            padding: 16px;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .profile-header {
            flex-direction: column;
            text-align: center;
          }

          .profile-name-row {
            justify-content: center;
          }

          .profile-badges {
            justify-content: center;
          }

          .permissions-grid {
            grid-template-columns: 1fr;
          }

          .page-header {
            flex-direction: column;
            align-items: stretch;
          }

          .header-actions .btn {
            flex: 1;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default UserDetailsPage;