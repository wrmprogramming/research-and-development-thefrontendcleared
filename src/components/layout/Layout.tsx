// src/components/layout/Layout.tsx

import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Footer } from './Footer';
import { useState, useEffect } from 'react';
import './Layout.css';
export function Layout() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1200);

  // ===== Preloader =====
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // ===== تشخیص دسکتاپ =====
  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 1200;
      setIsDesktop(desktop);
      if (desktop) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ===== Toggle Sidebar =====
  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // ===== مدیریت اسکرول =====
  useEffect(() => {
    const handleScroll = () => {
      setHeaderScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    //style={{ backgroundImage: `url(${layoutBg})`}}
    <div className="app">
      {/* ===== دایره‌های تزئینی پس‌زمینه ===== */}
      <div className="bg-circle-1"></div>
      <div className="bg-circle-2"></div>
      <div className="bg-circle-3"></div>

      {isLoading && (
        <div className="preloader">
          <div className="spinner"></div>
        </div>
      )}

      <Sidebar isOpen={isSidebarOpen} />

      <div className={`main-content ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <Header 
          isOpen={isSidebarOpen}
          onToggle={toggleSidebar}
          isScrolled={headerScrolled}
        />
        
        <div className="page-content">
          <div className="container-fluid">
            <Outlet />
          </div>
        </div>
        
        <Footer />
      </div>

      <div 
        className={`overlay ${isSidebarOpen ? 'active' : ''}`} 
        onClick={closeSidebar}
      ></div>
    </div>
  );
}

