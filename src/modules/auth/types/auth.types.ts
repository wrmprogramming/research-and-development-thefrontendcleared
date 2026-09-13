// src/modules/auth/types/auth.types.ts

export type UserRole = 'ADMIN' | 'MANAGER' | 'USER' | 'RESEARCHER' | 'VIEWER';

export const ROLES: Record<UserRole, { label: string; color: string; description: string }> = {
  ADMIN: {
    label: 'مدیر',
    color: '#dc2626',
    description: 'دسترسی کامل به همه بخش‌ها',
  },
  MANAGER: {
    label: 'مدیر پروژه',
    color: '#2563eb',
    description: 'دسترسی به مدیریت پژوهشی و قراردادها',
  },
  RESEARCHER: {
    label: 'مدیر پژوهشی',
    color: '#059669',
    description: 'دسترسی به مدیریت پژوهشی',
  },
  USER: {
    label: 'کاربر معمولی',
    color: '#6b7280',
    description: 'دسترسی مشاهده به همه بخش‌ها',
  },
  VIEWER: {
    label: 'بیننده',
    color: '#6b7280',
    description: 'فقط مشاهده',
  },
};

export interface User {
  id: number;
  username: string;
  email: string;
  phone?: string;
  first_name: string;
  last_name: string;
  full_name: string;
  national_code?: string;
  role: UserRole;
  role_display: string;
  profile_image?: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  last_login?: string;
  date_joined: string;
  updated_at: string;
  
  // Permissions
  permissions?: string[];
  role_permissions?: string[];
  custom_permissions?: string[];
  
  // Helper properties
  is_admin?: boolean;
  is_manager?: boolean;
  can_manage_base?: boolean;
  can_manage_research?: boolean;
  can_manage_contracts?: boolean;
  can_view_all?: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email?: string;
  password: string;
  password_confirm: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  national_code?: string;
}

export interface AuthResponse {
  user: User;
  access: string;
  refresh: string;
  message: string;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
  new_password_confirm: string;
}

export interface UserLog {
  id: number;
  user: number;
  user_name: string;
  action: string;
  action_display: string;
  model_name: string;
  object_id: number;
  object_repr: string;
  ip_address: string;
  user_agent: string;
  details: Record<string, any>;
  created_at: string;
}

// // src/modules/auth/types/auth.types.ts

// export type UserRole = 'ADMIN' | 'MANAGER' | 'USER' | 'RESEARCHER' | 'VIEWER';

// export const ROLES: Record<UserRole, { label: string; color: string; description: string }> = {
//   ADMIN: {
//     label: 'مدیر',
//     color: '#dc2626',
//     description: 'دسترسی کامل به همه بخش‌ها',
//   },
//   MANAGER: {
//     label: 'مدیر پروژه',
//     color: '#2563eb',
//     description: 'دسترسی به مدیریت پژوهشی و قراردادها',
//   },
//   RESEARCHER: {
//     label: 'پژوهشگر',
//     color: '#059669',
//     description: 'دسترسی به مدیریت پژوهشی',
//   },
//   USER: {
//     label: 'کاربر معمولی',
//     color: '#6b7280',
//     description: 'دسترسی مشاهده به همه بخش‌ها',
//   },
//   VIEWER: {
//     label: 'بیننده',
//     color: '#6b7280',
//     description: 'فقط مشاهده',
//   },
// };

// export interface User {
//   id: number;
//   username: string;
//   email: string;
//   phone?: string;
//   first_name: string;
//   last_name: string;
//   full_name: string;
//   national_code?: string;
//   role: UserRole;
//   role_display: string;
//   profile_image?: string;
//   is_active: boolean;
//   is_staff: boolean;
//   is_superuser: boolean;
//   last_login?: string;
//   date_joined: string;
//   updated_at: string;
//   //  اضافه کردن پراپرتی‌های کمکی (محاسبه شده در بک‌اند)
//   is_admin?: boolean;      //  اضافه شد
//   is_manager?: boolean;    //  اضافه شد
//   can_manage_base?: boolean;      //  اضافه شد
//   can_manage_research?: boolean;  //  اضافه شد
//   can_manage_contracts?: boolean; //  اضافه شد
//   can_view_all?: boolean;         //  اضافه شد
// }

// export interface LoginRequest {
//   username: string;
//   password: string;
// }

// export interface RegisterRequest {
//   username: string;
//   email?: string;
//   password: string;
//   password_confirm: string;
//   first_name?: string;
//   last_name?: string;
//   phone?: string;
//   national_code?: string;
// }

// export interface AuthResponse {
//   user: User;
//   access: string;
//   refresh: string;
//   message: string;
// }

// export interface ChangePasswordRequest {
//   old_password: string;
//   new_password: string;
//   new_password_confirm: string;
// }

// export interface UserLog {
//   id: number;
//   user: number;
//   user_name: string;
//   action: string;
//   action_display: string;
//   model_name: string;
//   object_id: number;
//   object_repr: string;
//   ip_address: string;
//   user_agent: string;
//   details: Record<string, any>;
//   created_at: string;
// }