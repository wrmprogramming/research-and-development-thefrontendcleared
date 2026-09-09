// src/components/layout/Sidebar.tsx

import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Building2, 
  ChevronDown, 
  BookOpen, 
  Users,
  MapPin,
  Building,
  Phone,
  School,
  Library,
  User,
  FileText,
  FileSpreadsheet,
  CreditCard,
  DollarSign,
  TrendingUp,
  Clock,
  Users2,
  Settings,
  Briefcase,
  Calendar,
  GraduationCap,
  LogOut,
  UserCircle
} from 'lucide-react';
import './Sidebar.css';

interface NavItem {
  name: string;
  href?: string;
  icon: React.ComponentType<{ size?: number }>;
  children?: Omit<NavItem, 'icon'>[];
  requiredPermission?: 'can_manage_base' | 'can_manage_research' | 'can_manage_contracts' | 'can_view_all';
}


const navigation: NavItem[] = [
  { 
    name: 'داشبورد', 
    href: '/', 
    icon: LayoutDashboard,
    requiredPermission: 'can_view_all',
  },
  {
    icon: Building2,
    name: 'مدیریت پایه',
    requiredPermission: 'can_manage_base',
    children: [
      { name: 'استان', href: '/province' },
      { name: 'شهر', href: '/city' },
      { name: 'مکاتبه', href: '/communication' },
      { name: 'شرکت', href: '/company' },
      { name: 'نوع دانشگاه', href: '/university-types' },
      { name: 'دانشگاه', href: '/university' },
      { name: 'موضوع پروژه', href: '/project-subjects' },
      { name: 'محقق اصلی', href: '/person' },
      { name: 'نوع پرداخت', href: '/payment-types' },
    ],
  },
  {
    icon: BookOpen,
    name: 'مدیریت پژوهشی',
    requiredPermission: 'can_view_all',
    children: [
      { name: 'پژوهش', href: '/research' },
      { name: 'RFP', href: '/rfp' },
      { name: 'پروپوزال', href: '/proposal' },
    ],
  },
  {
    icon: Building2,
    name: 'مدیریت قرارداد و کنترل پروژه',
    requiredPermission: 'can_view_all',
    children: [
      { name: 'قرارداد', href: '/contract' },
      { name: 'پیشرفت فیزیکی پروژه', href: '/progress' },
      { name: 'تمدید قرارداد', href: '/contract-delays' },
    ],
  },
  {
    icon: Building2,
    name: 'مدیریت مالی و پرداخت‌ها',
    requiredPermission: 'can_view_all',
    children: [
      { name: 'پرداخت‌های مالی', href: '/payment' },
      { name: 'تسویه حساب', href: '/settlements' },
    ],
  },
  {
    icon: Users,
    name: 'کمیته‌ها',
    requiredPermission: 'can_view_all',
    children: [
      { name: 'کمیته تحقیقات', href: '/committees-research' },
      { name: 'کمیته راهبری', href: '/committees-steering' },
    ],
  },
  //  پروفایل به عنوان یک آیتم جداگانه با آیکون
  {
    icon: UserCircle,
    name: 'پروفایل من',
    href: '/profile',
    requiredPermission: 'can_view_all',
  },
];


interface SidebarProps {
  isOpen: boolean;
}

export function Sidebar({ isOpen }: SidebarProps) {
  const { user, logout } = useAuth();
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const toggleMenu = (name: string) => {
    setOpenMenu((prev) => (prev === name ? null : name));
  };

  // بررسی دسترسی کاربر
  const hasPermission = (requiredPermission?: 'can_manage_base' | 'can_manage_research' | 'can_manage_contracts' | 'can_view_all') => {
    if (!requiredPermission) return true;
    if (!user) return false;

    // ✅ استفاده از پراپرتی‌های مستقیم که از بک‌اند می‌آیند
  const permissionMap: Record<string, boolean> = {
    can_manage_base: user?.can_manage_base || user?.is_superuser || false,
    can_manage_research: user?.can_manage_research || user?.is_superuser || false,
    can_manage_contracts: user?.can_manage_contracts || user?.is_superuser || false,
    can_view_all: true,
  };
    return permissionMap[requiredPermission] || false;
    // const permissions = {
    //   can_manage_base: user?.is_admin || user?.is_superuser,
    //   can_manage_research: user?.is_manager || user?.is_admin || user?.is_superuser,
    //   can_manage_contracts: user?.is_manager || user?.is_admin || user?.is_superuser,
    //   can_view_all: true,
    // };    
    // return permissions[requiredPermission] || false;
  };

  // فیلتر کردن آیتم‌های ناوبری بر اساس دسترسی
  const filteredNavigation = navigation.filter((item) => {
    if (!hasPermission(item.requiredPermission)) return false;
    if (item.children) {
      const filteredChildren = item.children.filter((child) => hasPermission(item.requiredPermission));
      if (filteredChildren.length === 0) return false;
    }
    return true;
  });

  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <a href="/">
            <img src="/logo.jpg" alt="logo" />
          </a>
        </div>
      </div>

      <div className="sidebar-user">
        <div className="user-avatar">
          {user?.profile_image ? (
            <img src={user.profile_image} alt={user.full_name} />
          ) : (
            <span>{user?.full_name?.charAt(0) || 'U'}</span>
          )}
        </div>
        <div className="user-info">
          <span className="user-name">{user?.full_name || 'کاربر'}</span>
          <span className="user-role">{user?.role_display || 'کاربر'}</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul>
          {filteredNavigation.map((item) => {
            const hasChildren = item.children && item.children.length > 0;
            const isOpen = openMenu === item.name;
            const Icon = item.icon;

            return (
              <li
                key={item.name}
                className={`nav-item ${hasChildren ? 'has-children' : ''} ${isOpen ? 'open' : ''}`}
              >
                {hasChildren ? (
                  <>
                    <button
                      className={`nav-link ${isOpen ? 'expanded' : ''}`}
                      onClick={() => toggleMenu(item.name)}
                    >
                      <span className="nav-icon">
                        <Icon size={20} />
                      </span>
                      <span className="nav-text">{item.name}</span>
                      <span className={`nav-arrow ${isOpen ? 'open' : ''}`}>
                        <ChevronDown size={16} />
                      </span>
                    </button>

                    <ul className={`dropdown ${isOpen ? 'show' : ''}`}>
                      {item.children.map((sub) => (
                        <li key={sub.href}>
                          <NavLink
                            to={sub.href!}
                            className={({ isActive }) => (isActive ? 'active' : '')}
                          >
                            {sub.name}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <NavLink
                    to={item.href!}
                    className={({ isActive }) => (isActive ? 'active' : '')}
                  >
                    <span className="nav-icon">
                      <Icon size={20} />
                    </span>
                    <span className="nav-text">{item.name}</span>
                  </NavLink>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={logout}>
          <LogOut size={18} />
          خروج
        </button>
      </div>

      <style>{`
        .sidebar-user {
          padding: 16px 20px;
          border-bottom: 1px solid #e9ecef;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #4f46e5;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: 600;
          overflow: hidden;
          flex-shrink: 0;
        }

        .user-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .user-info {
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .user-name {
          font-size: 14px;
          font-weight: 600;
          color: #1a1a2e;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-role {
          font-size: 11px;
          color: #6b7280;
        }

        .sidebar-footer {
          padding: 16px 20px;
          border-top: 1px solid #e9ecef;
          margin-top: auto;
        }

        .logout-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          width: 100%;
          border: none;
          border-radius: 8px;
          background: #fee2e2;
          color: #dc2626;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .logout-btn:hover {
          background: #fecaca;
        }

        @media (max-width: 768px) {
          .sidebar-user {
            padding: 12px 16px;
          }
          .user-name {
            font-size: 13px;
          }
          .sidebar-footer {
            padding: 12px 16px;
          }
        }
      `}</style>
    </aside>
  );
}

// // src/components/layout/Sidebar.tsx

// import { useState } from 'react';
// import { NavLink } from 'react-router-dom';
// import { 
//   LayoutDashboard, 
//   Building2, 
//   ChevronDown, 
//   BookOpen, 
//   Users,
//   MapPin,
//   Building,
//   Phone,
//   School,
//   Library,
//   User,
//   FileText,
//   FileSpreadsheet,
//   CreditCard,
//   DollarSign,
//   TrendingUp,
//   Clock,
//   Users2,
//   Settings,
//   Briefcase,
//   Calendar,
//   GraduationCap
// } from 'lucide-react';
// import './Sidebar.css';

// const navigation = [
//   { 
//     name: 'داشبورد', 
//     href: '/', 
//     icon: LayoutDashboard 
//   },
//   {
//     icon: Building2,
//     name: 'مدیریت پایه',
//     children: [
//       { name: 'استان', href: '/province', icon: MapPin },
//       { name: 'شهر', href: '/city', icon: Building },
//       { name: 'مکاتبه', href: '/communication', icon: Phone },
//       { name: 'شرکت', href: '/company', icon: Briefcase },
//       { name: 'نوع دانشگاه', href: '/university-types', icon: School },
//       { name: 'دانشگاه', href: '/university', icon: GraduationCap },
//       { name: 'موضوع پروژه', href: '/project-subjects', icon: FileText },
//       { name: 'محقق اصلی', href: '/person', icon: User },
//       { name: 'نوع پرداخت', href: '/payment-types', icon: CreditCard },

//     ],
//   },
//   {
//     icon: BookOpen,
//     name: 'مدیریت پژوهشی',
//     children: [
//       { name: 'پژوهش', href: '/research', icon: FileText },
//       { name: 'RFP', href: '/rfp', icon: FileSpreadsheet },
//       { name: 'پروپوزال', href: '/proposal', icon: FileText },
//     ],
//   },
//   {
//     icon: Building2,
//     name: 'مدیریت قرارداد و کنترل پروژه',
//     children: [
//       { name: 'قرارداد', href: '/contract', icon: FileSpreadsheet },
//       { name: 'پیشرفت فیزیکی پروژه', href: '/progress', icon: TrendingUp },
//       { name: 'تمدید قرارداد', href: '/contract-delays', icon: Clock },
//       // { name: 'تمدید قرارداد', href: '/contract-extension', icon: Clock },
//     ],
//   },
//    {
//     icon: Building2,
//     name: 'مدیریت مالی و پرداخت ها',
//     children: [
//       { name: 'پرداخت های مالی', href: '/payment', icon: DollarSign },
//       { name: 'تسویه حساب', href: '/settlements', icon: DollarSign },
//     ],
//   },
//   {
//     icon: Users,
//     name: 'کمیته‌ها',
//     children: [
//       { name: 'کمیته تحقیقات', href: '/committees-research', icon: Users2 },
//       { name: 'کمیته راهبری', href: '/committees-steering', icon: Settings },
//     ],
//   },
// ];

// interface SidebarProps {
//   isOpen: boolean;
// }

// export function Sidebar({ isOpen }: SidebarProps) {
//   const [openMenu, setOpenMenu] = useState<string | null>(null);

//   const toggleMenu = (name: string) => {
//     setOpenMenu((prev) => (prev === name ? null : name));
//   };

//   return (
//     <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
//       <div className="sidebar-header">
//         <div className="sidebar-logo">
//           <a href="/">
//             <img src="public/logo.jpg" alt="logo" />
//           </a>
//         </div>
//       </div>

//       <nav className="sidebar-nav">
//         <ul>
//           {navigation.map((item) => {
//             const hasChildren = item.children && item.children.length > 0;
//             const isOpen = openMenu === item.name;
//             const Icon = item.icon;

//             return (
//               <li
//                 key={item.name}
//                 className={`nav-item ${hasChildren ? 'has-children' : ''} ${isOpen ? 'open' : ''}`}
//               >
//                 {hasChildren ? (
//                   <>
//                     <button
//                       className={`nav-link ${isOpen ? 'expanded' : ''}`}
//                       onClick={() => toggleMenu(item.name)}
//                     >
//                       <span className="nav-icon">
//                         <Icon size={20} />
//                       </span>
//                       <span className="nav-text">{item.name}</span>
//                       <span className={`nav-arrow ${isOpen ? 'open' : ''}`}>
//                         <ChevronDown size={16} />
//                       </span>
//                     </button>

//                     <ul className={`dropdown ${isOpen ? 'show' : ''}`}>
//                       {item.children.map((sub) => {
//                         const SubIcon = sub.icon || FileText;
//                         return (
//                           <li key={sub.href}>
//                             <NavLink
//                               to={sub.href}
//                               className={({ isActive }) => (isActive ? 'active' : '')}
//                             >
//                               <span className="dropdown-icon">
//                                 <SubIcon size={16} />
//                               </span>
//                               {sub.name}
//                             </NavLink>
//                           </li>
//                         );
//                       })}
//                     </ul>
//                   </>
//                 ) : (
//                   <NavLink
//                     to={item.href}
//                     className={({ isActive }) => (isActive ? 'active' : '')}
//                   >
//                     <span className="nav-icon">
//                       <Icon size={20} />
//                     </span>
//                     <span className="nav-text">{item.name}</span>
//                   </NavLink>
//                 )}
//               </li>
//             );
//           })}
//         </ul>
//       </nav>
//     </aside>
//   );
// }
