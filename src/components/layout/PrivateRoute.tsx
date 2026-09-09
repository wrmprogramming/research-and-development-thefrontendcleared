// src/components/layout/PrivateRoute.tsx

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface PrivateRouteProps {
  requiredRole?: 'ADMIN' | 'MANAGER' | 'USER' | 'RESEARCHER' | 'VIEWER';
  requiredPermission?: 'can_manage_base' | 'can_manage_research' | 'can_manage_contracts' | 'can_view_all';
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({
  requiredRole,
  requiredPermission,
}) => {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>در حال بارگذاری...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // بررسی نقش (Role)
  if (requiredRole && user?.role !== requiredRole && !user?.is_superuser) {
    return <Navigate to="/unauthorized" replace />;
  }

  // بررسی دسترسی (Permission) - با استفاده از پراپرتی‌های موجود
  if (requiredPermission) {
    // ✅ استفاده از پراپرتی‌های مستقیم که از بک‌اند می‌آیند
    const permissionMap: Record<string, boolean> = {
      can_manage_base: user?.can_manage_base || user?.is_superuser || false,
      can_manage_research: user?.can_manage_research || user?.is_superuser || false,
      can_manage_contracts: user?.can_manage_contracts || user?.is_superuser || false,
      can_view_all: true,
    };

    if (!permissionMap[requiredPermission]) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <Outlet />;
};