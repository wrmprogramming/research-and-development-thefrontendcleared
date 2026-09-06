// src/components/layout/Sidebar.tsx

import { useState } from 'react';
import { NavLink } from 'react-router-dom';
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
  GraduationCap
} from 'lucide-react';
import './Sidebar.css';

const navigation = [
  { 
    name: 'داشبورد', 
    href: '/', 
    icon: LayoutDashboard 
  },
  {
    icon: Building2,
    name: 'مدیریت پایه',
    children: [
      { name: 'استان', href: '/province', icon: MapPin },
      { name: 'شهر', href: '/city', icon: Building },
      { name: 'مکاتبه', href: '/communication', icon: Phone },
      { name: 'شرکت', href: '/company', icon: Briefcase },
      { name: 'نوع دانشگاه', href: '/university-types', icon: School },
      { name: 'دانشگاه', href: '/university', icon: GraduationCap },
      { name: 'موضوع پروژه', href: '/project-subjects', icon: FileText },
      { name: 'محقق اصلی', href: '/person', icon: User },
      { name: 'نوع پرداخت', href: '/payment-types', icon: CreditCard },

    ],
  },
  {
    icon: BookOpen,
    name: 'مدیریت پژوهشی',
    children: [
      { name: 'پژوهش', href: '/research', icon: FileText },
      { name: 'RFP', href: '/rfp', icon: FileSpreadsheet },
      { name: 'پروپوزال', href: '/proposal', icon: FileText },
    ],
  },
  {
    icon: Building2,
    name: 'مدیریت قرارداد و کنترل پروژه',
    children: [
      { name: 'قرارداد', href: '/contract', icon: FileSpreadsheet },
      { name: 'پیشرفت فیزیکی پروژه', href: '/progress', icon: TrendingUp },
      { name: 'تمدید قرارداد', href: '/contract-delays', icon: Clock },
      // { name: 'تمدید قرارداد', href: '/contract-extension', icon: Clock },
    ],
  },
   {
    icon: Building2,
    name: 'مدیریت مالی و پرداخت ها',
    children: [
      { name: 'پرداخت های مالی', href: '/payment', icon: DollarSign },
      { name: 'تسویه حساب', href: '/settlements', icon: DollarSign },
    ],
  },
  {
    icon: Users,
    name: 'کمیته‌ها',
    children: [
      { name: 'کمیته تحقیقات', href: '/committees-research', icon: Users2 },
      { name: 'کمیته راهبری', href: '/committees-steering', icon: Settings },
    ],
  },
];

interface SidebarProps {
  isOpen: boolean;
}

export function Sidebar({ isOpen }: SidebarProps) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const toggleMenu = (name: string) => {
    setOpenMenu((prev) => (prev === name ? null : name));
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <a href="/">
            <img src="public/logo.jpg" alt="logo" />
          </a>
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul>
          {navigation.map((item) => {
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
                      {item.children.map((sub) => {
                        const SubIcon = sub.icon || FileText;
                        return (
                          <li key={sub.href}>
                            <NavLink
                              to={sub.href}
                              className={({ isActive }) => (isActive ? 'active' : '')}
                            >
                              <span className="dropdown-icon">
                                <SubIcon size={16} />
                              </span>
                              {sub.name}
                            </NavLink>
                          </li>
                        );
                      })}
                    </ul>
                  </>
                ) : (
                  <NavLink
                    to={item.href}
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
    </aside>
  );
}
