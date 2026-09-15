// src/pages/RolesPage.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoles } from '../modules/role/hooks/useRoles';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Key,
  Shield,
  Eye,
  Edit,
  UserCheck,
  UserCog,
  Crown,
  RefreshCw,
  Settings,
} from 'lucide-react';

export const RolesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { useList } = useRoles();
  const { data: roles, isLoading, refetch } = useList();

  const isSuperUser = user?.is_superuser;

  // ========== آیکون برای هر نقش ==========
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN': return Crown;
      case 'MANAGER': return Shield;
      case 'RESEARCHER': return UserCheck;
      case 'USER': return Users;
      case 'VIEWER': return Eye;
      default: return UserCog;
    }
  };

  // ========== رنگ برای هر نقش ==========
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return '#dc2626';
      case 'MANAGER': return '#2563eb';
      case 'RESEARCHER': return '#059669';
      case 'USER': return '#6b7280';
      case 'VIEWER': return '#7c3aed';
      default: return '#6b7280';
    }
  };

  // ========== توضیحات پیش‌فرض برای هر نقش ==========
  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'دسترسی کامل به همه بخش‌های سیستم';
      case 'MANAGER': return 'مدیریت پژوهش‌ها، قراردادها و گزارش‌گیری';
      case 'RESEARCHER': return 'مدیریت پژوهش‌های خود و مشاهده سایر بخش‌ها';
      case 'USER': return 'مشاهده همه بخش‌ها بدون امکان ویرایش';
      case 'VIEWER': return 'مشاهده محدود برخی بخش‌ها';
      default: return '';
    }
  };

  const totalRoles = roles?.length || 0;
  const totalUsers = roles?.reduce((sum, r) => sum + r.users_count, 0) || 0;
  const totalPermissions = roles?.reduce((sum, r) => sum + r.permissions_count, 0) || 0;

  return (
    <div className="roles-page">
      {/* ========== هدر ========== */}
      <div className="page-header">
        <div className="header-left">
          <div className="header-icon">
            <Shield size={28} />
          </div>
          <div className="header-content">
            <h1 className="page-title">مدیریت نقش‌ها</h1>
            <p className="page-subtitle">
              مدیریت نقش‌های کاربری و مجوزهای هر نقش
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
        </div>
      </div>

      {/* ========== کارت‌های آمار ========== */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#eef2ff', color: '#4f46e5' }}>
            <Shield size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{totalRoles}</span>
            <span className="stat-label">کل نقش‌ها</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#d1fae5', color: '#059669' }}>
            <Users size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{totalUsers}</span>
            <span className="stat-label">کاربران</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
            <Key size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{totalPermissions}</span>
            <span className="stat-label">مجوزهای اختصاص یافته</span>
          </div>
        </div>
      </div>

      {/* ========== لیست نقش‌ها ========== */}
      {isLoading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>در حال بارگذاری...</p>
        </div>
      ) : (
        <div className="roles-grid">
          {roles?.map((role) => {
            const Icon = getRoleIcon(role.role);
            const color = getRoleColor(role.role);
            const description = role.description || getRoleDescription(role.role);

            return (
              <div key={role.role} className="role-card" style={{ '--role-color': color } as React.CSSProperties}>
                <div className="role-card-header">
                  <div className="role-icon" style={{ background: `${color}15`, color }}>
                    <Icon size={24} />
                  </div>
                  <div className="role-info">
                    <h3 className="role-title">{role.role_display}</h3>
                    <span className="role-code">{role.role}</span>
                  </div>
                </div>

                <p className="role-description">{description}</p>

                <div className="role-stats">
                  <div className="role-stat">
                    <Users size={16} />
                    <span>{role.users_count} کاربر</span>
                  </div>
                  <div className="role-stat">
                    <Key size={16} />
                    <span>{role.permissions_count} مجوز</span>
                  </div>
                </div>

                {isSuperUser && (
                  <button
                    className="role-action-btn"
                    onClick={() => navigate(`/roles/${role.role}/permissions`)}
                    style={{ background: color, color: 'white' }}
                  >
                    <Edit size={16} />
                    مدیریت مجوزها
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ========== استایل‌ها ========== */}
      <style>{`
        .roles-page {
          padding: 24px;
          max-width: 1400px;
          margin: 0 auto;
          background-color: transparent;
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

        .roles-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
        }

        .role-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          border: 1px solid #e9ecef;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .role-card::before {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 4px;
          height: 100%;
          background: var(--role-color, #4f46e5);
        }

        .role-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
          border-color: var(--role-color, #4f46e5);
        }

        .role-card-header {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 16px;
        }

        .role-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 52px;
          height: 52px;
          border-radius: 14px;
          flex-shrink: 0;
        }

        .role-info {
          flex: 1;
          min-width: 0;
        }

        .role-title {
          font-size: 18px;
          font-weight: 700;
          color: #1a1a2e;
          margin: 0 0 4px 0;
        }

        .role-code {
          font-family: 'Courier New', monospace;
          font-size: 11px;
          background: #f3f4f6;
          padding: 2px 8px;
          border-radius: 6px;
          color: #6b7280;
          direction: ltr;
          display: inline-block;
        }

        .role-description {
          font-size: 13px;
          color: #6b7280;
          line-height: 1.6;
          margin: 0 0 16px 0;
          min-height: 40px;
        }

        .role-stats {
          display: flex;
          gap: 16px;
          padding: 14px 0;
          border-top: 1px solid #f3f4f6;
          border-bottom: 1px solid #f3f4f6;
          margin-bottom: 16px;
        }

        .role-stat {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #374151;
          font-weight: 500;
        }

        .role-stat svg {
          color: #9ca3af;
        }

        .role-action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 12px;
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .role-action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          background: white;
          border-radius: 14px;
          border: 1px solid #e9ecef;
        }

        .spinner {
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

        @media (max-width: 768px) {
          .roles-page {
            padding: 16px;
          }

          .page-header {
            flex-direction: column;
            align-items: stretch;
          }

          .roles-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default RolesPage;