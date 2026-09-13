// src/context/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/auth.api';
import type { User, LoginRequest, RegisterRequest } from '../modules/auth/types/auth.types';
import { toast } from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  changePassword: (data: { old_password: string; new_password: string; new_password_confirm: string }) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper functions
const getTokens = () => {
  const access = localStorage.getItem('access_token');
  const refresh = localStorage.getItem('refresh_token');
  return { access, refresh };
};

const setTokens = (access: string, refresh: string) => {
  localStorage.setItem('access_token', access);
  localStorage.setItem('refresh_token', refresh);
};

const clearTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const enrichUser = (userData: User): User => ({
    ...userData,
    can_manage_base: userData.is_admin || userData.is_superuser || false,
    can_manage_research: userData.is_manager || userData.is_admin || userData.is_superuser || false,
    can_manage_contracts: userData.is_manager || userData.is_admin || userData.is_superuser || false,
    can_view_all: true,
  });

  useEffect(() => {
    const loadUser = async () => {
      const { access } = getTokens();
      
      if (!access) {
        setIsLoading(false);
        return;
      }

      try {
        const userData = await authApi.getProfile();
        setUser(enrichUser(userData));
      } catch (error: any) {
        if (error.response?.status === 401 || error.status === 401) {
          clearTokens();
          setUser(null);
        } else {
          setUser(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (data: LoginRequest) => {
    try {
      const response = await authApi.login(data);
      setTokens(response.access, response.refresh);
      setUser(enrichUser(response.user));
      toast.success(response.message || 'ورود موفقیت‌آمیز بود');
    } catch (error: any) {
      toast.error(error.message || 'خطا در ورود به سیستم');
      throw error;
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      const response = await authApi.register(data);
      setTokens(response.access, response.refresh);
      setUser(enrichUser(response.user));
      toast.success(response.message || 'ثبت‌نام با موفقیت انجام شد');
    } catch (error: any) {
      toast.error(error.message || 'خطا در ثبت‌نام');
      throw error;
    }
  };

  const logout = async () => {
    const { refresh } = getTokens();
    if (refresh) {
      try {
        await authApi.logout(refresh);
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    clearTokens();
    setUser(null);
    toast.success('خروج با موفقیت انجام شد');
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const updatedUser = await authApi.updateProfile(data);
      setUser(prev => prev ? enrichUser({ ...prev, ...updatedUser }) : null);
      toast.success('اطلاعات با موفقیت به‌روزرسانی شد');
    } catch (error: any) {
      toast.error(error.message || 'خطا در به‌روزرسانی اطلاعات');
      throw error;
    }
  };

  const changePassword = async (data: {
    old_password: string;
    new_password: string;
    new_password_confirm: string;
  }) => {
    try {
      await authApi.changePassword(data);
      toast.success('رمز عبور با موفقیت تغییر کرد');
    } catch (error: any) {
      toast.error(error.message || 'خطا در تغییر رمز عبور');
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      const userData = await authApi.getProfile();
      setUser(enrichUser(userData));
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  };

  // ✅ بررسی مجوز
  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    if (user.is_superuser) return true;
    
    // اگر '*' داشته باشه، همه دسترسی‌ها
    if (user.permissions?.includes('*')) return true;
    
    return user.permissions?.includes(permission) || false;
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    if (!user) return false;
    if (user.is_superuser) return true;
    
    if (user.permissions?.includes('*')) return true;
    
    return permissions.some(p => user.permissions?.includes(p));
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    hasPermission,
    hasAnyPermission,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// // src/context/AuthContext.tsx

// import React, { createContext, useContext, useState, useEffect } from 'react';
// import { authApi } from '../api/auth.api';
// import type { User, LoginRequest, RegisterRequest } from '../modules/auth/types/auth.types';
// import { toast } from 'react-hot-toast';

// interface AuthContextType {
//   user: User | null;
//   isLoading: boolean;
//   isAuthenticated: boolean;
//   login: (data: LoginRequest) => Promise<void>;
//   register: (data: RegisterRequest) => Promise<void>;
//   logout: () => Promise<void>;
//   updateProfile: (data: Partial<User>) => Promise<void>;
//   changePassword: (data: { old_password: string; new_password: string; new_password_confirm: string }) => Promise<void>;
//   refreshToken: () => Promise<void>;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

// // Helper functions
// const getTokens = () => {
//   const access = localStorage.getItem('access_token');
//   const refresh = localStorage.getItem('refresh_token');
//   return { access, refresh };
// };

// const setTokens = (access: string, refresh: string) => {
//   localStorage.setItem('access_token', access);
//   localStorage.setItem('refresh_token', refresh);
// };

// const clearTokens = () => {
//   localStorage.removeItem('access_token');
//   localStorage.removeItem('refresh_token');
// };

// export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [user, setUser] = useState<User | null>(null);
//   const [isLoading, setIsLoading] = useState(true);

//   //  بارگذاری کاربر
//   useEffect(() => {
//     const loadUser = async () => {
//       const { access } = getTokens();
      
//       console.log('🔍 Checking token:', access ? ' Token exists' : '❌ No token');
      
//       if (!access) {
//         console.log('⏹️ No token, skipping user load');
//         setIsLoading(false);
//         return;
//       }

//       try {
//         console.log(' Loading user profile...');
//         const userData = await authApi.getProfile();
//         console.log(' User loaded:', userData);
        
//         setUser({
//           ...userData,
//           can_manage_base: userData.is_admin || userData.is_superuser,
//           can_manage_research: userData.is_manager || userData.is_admin || userData.is_superuser,
//           can_manage_contracts: userData.is_manager || userData.is_admin || userData.is_superuser,
//           can_view_all: true,
//         });
//       } catch (error: any) {
//         console.error(' Failed to load user:', error);
        
//         // اگر خطای 401 (Unauthorized) بود، توکن را پاک کن
//         if (error.response?.status === 401 || error.status === 401) {
//           console.log(' Token expired or invalid, clearing...');
//           clearTokens();
//           setUser(null);
//         } else {
//           console.log('🟡 Other error occurred:', error.message);
//           setUser(null);
//         }
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     loadUser();
//   }, []);

//   const login = async (data: LoginRequest) => {
//     console.log('🔐 Logging in...');
//     try {
//       const response = await authApi.login(data);
//       console.log('✅ Login successful');
      
//       setTokens(response.access, response.refresh);
//       setUser({
//         ...response.user,
//         can_manage_base: response.user.is_admin || response.user.is_superuser,
//         can_manage_research: response.user.is_manager || response.user.is_admin || response.user.is_superuser,
//         can_manage_contracts: response.user.is_manager || response.user.is_admin || response.user.is_superuser,
//         can_view_all: true,
//       });
      
//       toast.success(response.message || 'ورود موفقیت‌آمیز بود');
//     } catch (error: any) {
//       console.error(' Login failed:', error);
//       toast.error(error.message || 'خطا در ورود به سیستم');
//       throw error;
//     }
//   };

//   const register = async (data: RegisterRequest) => {
//     console.log('📝 Registering...');
//     try {
//       const response = await authApi.register(data);
//       console.log('✅ Registration successful');
      
//       setTokens(response.access, response.refresh);
//       setUser({
//         ...response.user,
//         can_manage_base: response.user.is_admin || response.user.is_superuser,
//         can_manage_research: response.user.is_manager || response.user.is_admin || response.user.is_superuser,
//         can_manage_contracts: response.user.is_manager || response.user.is_admin || response.user.is_superuser,
//         can_view_all: true,
//       });
      
//       toast.success(response.message || 'ثبت‌نام با موفقیت انجام شد');
//     } catch (error: any) {
//       console.error(' Registration failed:', error);
//       toast.error(error.message || 'خطا در ثبت‌نام');
//       throw error;
//     }
//   };

//   const logout = async () => {
//     console.log('🚪 Logging out...');
//     const { refresh } = getTokens();
//     if (refresh) {
//       try {
//         await authApi.logout(refresh);
//       } catch (error) {
//         console.error('Logout error:', error);
//       }
//     }
//     clearTokens();
//     setUser(null);
//     toast.success('خروج با موفقیت انجام شد');
//   };

//   const updateProfile = async (data: Partial<User>) => {
//     console.log('📝 Updating profile...');
//     try {
//       const updatedUser = await authApi.updateProfile(data);
//       setUser(prev => prev ? { ...prev, ...updatedUser } : null);
//       toast.success('اطلاعات با موفقیت به‌روزرسانی شد');
//     } catch (error: any) {
//       console.error(' Update profile failed:', error);
//       toast.error(error.message || 'خطا در به‌روزرسانی اطلاعات');
//       throw error;
//     }
//   };

//   const changePassword = async (data: {
//     old_password: string;
//     new_password: string;
//     new_password_confirm: string;
//   }) => {
//     console.log('🔑 Changing password...');
//     try {
//       await authApi.changePassword(data);
//       toast.success('رمز عبور با موفقیت تغییر کرد');
//     } catch (error: any) {
//       console.error(' Change password failed:', error);
//       toast.error(error.message || 'خطا در تغییر رمز عبور');
//       throw error;
//     }
//   };

//   const refreshToken = async () => {
//     const { refresh } = getTokens();
//     if (!refresh) {
//       throw new Error('No refresh token');
//     }
//     const response = await authApi.refreshToken(refresh);
//     localStorage.setItem('access_token', response.access);
//   };

//   const value = {
//     user,
//     isLoading,
//     isAuthenticated: !!user,
//     login,
//     register,
//     logout,
//     updateProfile,
//     changePassword,
//     refreshToken,
//   };

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// };
