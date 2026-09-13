// src/modules/permission/types/permission.types.ts

export type PermissionCategory = 
  | 'BASE'
  | 'RESEARCH'
  | 'CONTRACT'
  | 'FINANCIAL'
  | 'COMMITTEE'
  | 'REPORT'
  | 'USER'
  | 'SETTINGS';

export type PermissionAction = 
  | 'view'
  | 'create'
  | 'edit'
  | 'delete'
  | 'export'
  | 'approve';

export interface SystemPermission {
  id: number;
  name: string;
  codename: string;
  category: PermissionCategory;
  category_display: string;
  action: PermissionAction;
  action_display: string;
  description: string;
  is_active: boolean;
  created_at: string;
}

export interface GroupedPermissions {
  [category: string]: {
    id: number;
    name: string;
    codename: string;
    action: PermissionAction;
    action_display: string;
    description: string;
    has_permission?: boolean;
  }[];
}

export interface RolePermission {
  id: number;
  role: string;
  permission: number;
  permission_name: string;
  permission_codename: string;
  permission_category: string;
  role_display: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserPermission {
  id: number;
  user: number;
  permission: number;
  permission_name: string;
  permission_codename: string;
  user_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PermissionMatrix {
  roles: { code: string; label: string }[];
  permissions: {
    id: number;
    name: string;
    codename: string;
    category: string;
    action: string;
  }[];
  matrix: Record<string, number[]>;
}

export const CATEGORY_COLORS: Record<PermissionCategory, string> = {
  BASE: '#6b7280',
  RESEARCH: '#4f46e5',
  CONTRACT: '#7c3aed',
  FINANCIAL: '#059669',
  COMMITTEE: '#d97706',
  REPORT: '#2563eb',
  USER: '#ec4899',
  SETTINGS: '#14b8a6',
};

export const ACTION_COLORS: Record<PermissionAction, string> = {
  view: '#6b7280',
  create: '#059669',
  edit: '#2563eb',
  delete: '#dc2626',
  export: '#d97706',
  approve: '#7c3aed',
};