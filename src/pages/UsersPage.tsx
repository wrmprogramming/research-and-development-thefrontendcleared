// src/pages/UsersPage.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUsers } from '../modules/user/hooks/useUsers';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Plus,
  Search,
  RefreshCw,
  Filter,
  Eye,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Crown,
  Shield,
  Key,
  MoreVertical,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  Calendar,
  ChevronLeft,
  ChevronRight,
  UserCog,
} from 'lucide-react';
import { ROLES } from '../modules/auth/types/auth.types';
import type { User, UserRole } from '../modules/auth/types/auth.types';

const PAGE_SIZE = 10;

export const UsersPage: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { useList, useDelete, useToggleActive } = useUsers();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [page, setPage] = useState(1);
  const [actionMenuOpen, setActionMenuOpen] = useState<number | null>(null);

  const { data, isLoading, refetch } = useList({
    search: searchTerm || undefined,
    role: selectedRole || undefined,
    is_active: selectedStatus === 'active' ? true : selectedStatus === 'inactive' ? false : undefined,
    page,
    page_size: PAGE_SIZE,
  });

  const deleteMutation = useDelete();
  const toggleActiveMutation = useToggleActive();

  const isSuperUser = currentUser?.is_superuser;
  const isAdmin = currentUser?.role === 'ADMIN' || isSuperUser;

//   const users = data?.results || [];
//   const totalCount = data?.count || 0;
const users = Array.isArray(data) ? data : (data?.results || []);
const totalCount = Array.isArray(data) ? data.length : (data?.count || 0);
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // ========== آمار ==========
  const activeCount = users.filter(u => u.is_active).length;
  const inactiveCount = users.filter(u => !u.is_active).length;

  // ========== رنگ نقش ==========
  const getRoleColor = (role: UserRole) => {
    return ROLES[role]?.color || '#6b7280';
  };

  const getRoleLabel = (role: UserRole) => {
    return ROLES[role]?.label || role;
  };

  // ========== آیکون نقش ==========
  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'ADMIN': return Crown;
      case 'MANAGER': return Shield;
      case 'RESEARCHER': return UserCheck;
      case 'USER': return Users;
      case 'VIEWER': return Eye;
      default: return UserCog;
    }
  };

  // ========== حذف کاربر ==========
  const handleDelete = async (user: User) => {
    if (user.id === currentUser?.id) {
      alert('نمی‌توانید حساب خودتان را حذف کنید');
      return;
    }
    if (confirm(`آیا از حذف کاربر «${user.full_name}» مطمئن هستید؟`)) {
      await deleteMutation.mutateAsync(user.id);
      refetch();
    }
  };

  // ========== فعال/غیرفعال ==========
  const handleToggleActive = async (user: User) => {
    if (user.id === currentUser?.id) {
      alert('نمی‌توانید حساب خودتان را غیرفعال کنید');
      return;
    }
    await toggleActiveMutation.mutateAsync(user.id);
    refetch();
  };

  // ========== پاک کردن فیلترها ==========
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedRole('');
    setSelectedStatus('');
    setPage(1);
  };

  const hasFilters = searchTerm || selectedRole || selectedStatus;

  return (
    <div className="users-page">
      {/* ========== هدر ========== */}
      <div className="page-header">
        <div className="header-left">
          <div className="header-icon">
            <Users size={28} />
          </div>
          <div className="header-content">
            <h1 className="page-title">مدیریت کاربران</h1>
            <p className="page-subtitle">
              {totalCount} کاربر در سیستم ثبت شده است
            </p>
          </div>
        </div>

        <div className="header-actions">
          <button
            className="btn btn-secondary"
            onClick={() => refetch()}
          >
            <RefreshCw size={18} />
            بروزرسانی
          </button>
          {isAdmin && (
            <button
              className="btn btn-primary"
              onClick={() => navigate('/users/create')}
            >
              <Plus size={18} />
              کاربر جدید
            </button>
          )}
        </div>
      </div>

      {/* ========== کارت‌های آمار ========== */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#eef2ff', color: '#4f46e5' }}>
            <Users size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{totalCount}</span>
            <span className="stat-label">کل کاربران</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#d1fae5', color: '#059669' }}>
            <UserCheck size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{activeCount}</span>
            <span className="stat-label">کاربران فعال</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fee2e2', color: '#dc2626' }}>
            <UserX size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{inactiveCount}</span>
            <span className="stat-label">کاربران غیرفعال</span>
          </div>
        </div>
      </div>

      {/* ========== فیلترها ========== */}
      <div className="filters-bar">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="جستجو در نام، نام کاربری، ایمیل، کد ملی..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <select
          className="filter-select"
          value={selectedRole}
          onChange={(e) => {
            setSelectedRole(e.target.value);
            setPage(1);
          }}
        >
          <option value="">همه نقش‌ها</option>
          {Object.entries(ROLES).map(([role, info]) => (
            <option key={role} value={role}>{info.label}</option>
          ))}
        </select>

        <select
          className="filter-select"
          value={selectedStatus}
          onChange={(e) => {
            setSelectedStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">همه وضعیت‌ها</option>
          <option value="active">فعال</option>
          <option value="inactive">غیرفعال</option>
        </select>

        {hasFilters && (
          <button className="btn-clear-filters" onClick={clearFilters}>
            <XCircle size={16} />
            پاک کردن فیلترها
          </button>
        )}
      </div>

      {/* ========== جدول کاربران ========== */}
      {isLoading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>در حال بارگذاری...</p>
        </div>
      ) : users.length > 0 ? (
        <>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>کاربر</th>
                  <th>نام کاربری</th>
                  <th>ایمیل</th>
                  <th>تلفن</th>
                  <th>نقش</th>
                  <th>وضعیت</th>
                  <th>آخرین ورود</th>
                  <th>عملیات</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => {
                  const RoleIcon = getRoleIcon(user.role);
                  const roleColor = getRoleColor(user.role);
                  const isCurrentUser = user.id === currentUser?.id;
                  const rowNumber = (page - 1) * PAGE_SIZE + index + 1;

                  return (
                    <tr key={user.id} className={isCurrentUser ? 'current-user-row' : ''}>
                      <td className="text-muted">{rowNumber}</td>
                      <td>
                        <div className="user-cell">
                          <div className="user-avatar" style={{ background: roleColor }}>
                            {user.profile_image ? (
                              <img src={user.profile_image} alt={user.full_name} />
                            ) : (
                              <span>{user.full_name?.charAt(0) || user.username.charAt(0)}</span>
                            )}
                          </div>
                          <div className="user-info">
                            <span className="user-name">
                              {user.full_name}
                              {isCurrentUser && <span className="you-badge">شما</span>}
                            </span>
                            {user.national_code && (
                              <span className="user-national">کد ملی: {user.national_code}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <code className="username-code">{user.username}</code>
                      </td>
                      <td>
                        {user.email ? (
                          <a href={`mailto:${user.email}`} className="email-link">
                            {user.email}
                          </a>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td>
                        {user.phone ? (
                          <span className="phone-text">{user.phone}</span>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td>
                        <span
                          className="role-badge"
                          style={{
                            background: `${roleColor}15`,
                            color: roleColor,
                            border: `1px solid ${roleColor}30`,
                          }}
                        >
                          <RoleIcon size={14} />
                          {getRoleLabel(user.role)}
                        </span>
                      </td>
                      <td>
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
                      </td>
                      <td className="text-muted">
                        {user.last_login
                          ? new Date(user.last_login).toLocaleDateString('fa-IR')
                          : '—'}
                      </td>
                      <td>
                        <div className="action-buttons">
  <button
    className="action-btn view"
    onClick={() => navigate(`/users/${user.id}`)}
    title="مشاهده جزئیات"
  >
    <Eye size={16} />
  </button>
  <button
    className="action-btn edit"
    onClick={() => navigate(`/users/${user.id}`)}
    title="ویرایش"
  >
    <Edit size={16} />
  </button>
  <button
    className="action-btn permissions"
    onClick={() => navigate(`/users/${user.id}/permissions`)}
    title="مجوزها"
  >
    <Key size={16} />
  </button>
  {isSuperUser && !isCurrentUser && (
    <>
      <button
        className={`action-btn ${user.is_active ? 'deactivate' : 'activate'}`}
        onClick={() => handleToggleActive(user)}
        title={user.is_active ? 'غیرفعال کردن' : 'فعال کردن'}
      >
        {user.is_active ? <UserX size={16} /> : <UserCheck size={16} />}
      </button>
      <button
        className="action-btn delete"
        onClick={() => handleDelete(user)}
        title="حذف"
      >
        <Trash2 size={16} />
      </button>
    </>
  )}
</div>
                        {/* <div className="action-buttons">
                          <button
                            className="action-btn view"
                            onClick={() => navigate(`/users/${user.id}`)}
                            title="مشاهده جزئیات"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            className="action-btn edit"
                            onClick={() => navigate(`/users/${user.id}?tab=info&edit=true`)}
                            title="ویرایش"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            className="action-btn permissions"
                            onClick={() => navigate(`/users/${user.id}?tab=permissions`)}
                            title="مجوزها"
                          >
                            <Key size={16} />
                          </button>
                          {isSuperUser && !isCurrentUser && (
                            <>
                              <button
                                className={`action-btn ${user.is_active ? 'deactivate' : 'activate'}`}
                                onClick={() => handleToggleActive(user)}
                                title={user.is_active ? 'غیرفعال کردن' : 'فعال کردن'}
                              >
                                {user.is_active ? <UserX size={16} /> : <UserCheck size={16} />}
                              </button>
                              <button
                                className="action-btn delete"
                                onClick={() => handleDelete(user)}
                                title="حذف"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                        </div> */}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ========== صفحه‌بندی ========== */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="page-btn"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                <ChevronRight size={18} />
                قبلی
              </button>

              <div className="page-numbers">
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 7) {
                    pageNum = i + 1;
                  } else if (page <= 4) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 3) {
                    pageNum = totalPages - 6 + i;
                  } else {
                    pageNum = page - 3 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      className={`page-num ${page === pageNum ? 'active' : ''}`}
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                className="page-btn"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                بعدی
                <ChevronLeft size={18} />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="empty-state">
          <Users size={64} />
          <h3>هیچ کاربری یافت نشد</h3>
          <p>
            {hasFilters
              ? 'هیچ کاربری با فیلترهای انتخابی یافت نشد.'
              : 'هنوز هیچ کاربری در سیستم ثبت نشده است.'}
          </p>
          {isAdmin && !hasFilters && (
            <button
              className="btn btn-primary"
              onClick={() => navigate('/users/create')}
            >
              <Plus size={18} />
              ایجاد اولین کاربر
            </button>
          )}
        </div>
      )}

      {/* ========== استایل‌ها ========== */}
      <style>{`
        .users-page {
          padding: 24px;
          max-width: 1400px;
          margin: 0 auto;
        }

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

        .filter-select {
          padding: 10px 14px;
          border: 1.5px solid #e5e7eb;
          border-radius: 10px;
          font-size: 14px;
          font-family: inherit;
          background: white;
          cursor: pointer;
          transition: all 0.2s;
          min-width: 150px;
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
          white-space: nowrap;
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

        .current-user-row {
          background: #f5f3ff !important;
        }

        .text-muted {
          color: #9ca3af;
          font-size: 13px;
        }

        .user-cell {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 200px;
        }

        .user-avatar {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          color: white;
          font-size: 16px;
          font-weight: 700;
          flex-shrink: 0;
          overflow: hidden;
        }

        .user-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .user-info {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .user-name {
          font-size: 14px;
          font-weight: 600;
          color: #1a1a2e;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .you-badge {
          display: inline-flex;
          align-items: center;
          padding: 2px 8px;
          background: #4f46e5;
          color: white;
          font-size: 10px;
          font-weight: 600;
          border-radius: 10px;
        }

        .user-national {
          font-size: 11px;
          color: #9ca3af;
          margin-top: 2px;
        }

        .username-code {
          font-family: 'Courier New', monospace;
          font-size: 12px;
          background: #f3f4f6;
          padding: 3px 8px;
          border-radius: 6px;
          color: #4f46e5;
          direction: ltr;
          display: inline-block;
        }

        .email-link {
          color: #4f46e5;
          text-decoration: none;
          font-size: 13px;
        }

        .email-link:hover {
          text-decoration: underline;
        }

        .phone-text {
          font-size: 13px;
          direction: ltr;
          display: inline-block;
        }

        .role-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
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
          white-space: nowrap;
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
          white-space: nowrap;
        }

        .action-buttons {
          display: flex;
          gap: 4px;
        }

        .action-btn {
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

        .action-btn:hover {
          transform: translateY(-1px);
        }

        .action-btn.view:hover {
          border-color: #4f46e5;
          color: #4f46e5;
          background: #f5f3ff;
        }

        .action-btn.edit:hover {
          border-color: #2563eb;
          color: #2563eb;
          background: #eff6ff;
        }

        .action-btn.permissions:hover {
          border-color: #7c3aed;
          color: #7c3aed;
          background: #f5f3ff;
        }

        .action-btn.activate:hover {
          border-color: #059669;
          color: #059669;
          background: #ecfdf5;
        }

        .action-btn.deactivate:hover {
          border-color: #d97706;
          color: #d97706;
          background: #fffbeb;
        }

        .action-btn.delete:hover {
          border-color: #dc2626;
          color: #dc2626;
          background: #fef2f2;
        }

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

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .empty-state svg {
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

        .pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-top: 20px;
          padding: 14px;
          background: white;
          border-radius: 12px;
          border: 1px solid #e9ecef;
          flex-wrap: wrap;
        }

        .page-btn {
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

        .page-btn:hover:not(:disabled) {
          border-color: #4f46e5;
          color: #4f46e5;
        }

        .page-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .page-numbers {
          display: flex;
          gap: 4px;
        }

        .page-num {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border: 1.5px solid #e5e7eb;
          border-radius: 8px;
          background: white;
          color: #374151;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
        }

        .page-num:hover {
          border-color: #4f46e5;
          color: #4f46e5;
        }

        .page-num.active {
          background: #4f46e5;
          color: white;
          border-color: #4f46e5;
        }

        @media (max-width: 992px) {
          .table-container {
            overflow-x: auto;
          }

          .data-table {
            min-width: 1000px;
          }
        }

        @media (max-width: 768px) {
          .users-page {
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

          .filter-select {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default UsersPage;