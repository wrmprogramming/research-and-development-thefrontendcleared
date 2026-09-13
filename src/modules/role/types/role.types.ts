// src/modules/role/types/role.types.ts

import type { UserRole } from '../../auth/types/auth.types';

export interface RoleDescription {
  id: number;
  role: UserRole;
  title: string;
  description: string;
  color: string;
  icon: string;
  is_active: boolean;
  created_at: string;
}

export interface Role {
  role: UserRole;
  role_display: string;
  users_count: number;
  permissions_count: number;
  color: string;
  icon: string;
  description: string;
}

export interface RoleDetail {
  role: UserRole;
  role_display: string;
  description: string;
  color: string;
  icon: string;
  users_count: number;
  permissions_count: number;
  permissions: {
    id: number;
    name: string;
    codename: string;
    category: string;
    action: string;
  }[];
}