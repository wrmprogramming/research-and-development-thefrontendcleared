// src/components/layout/Header.tsx

import React from 'react';
import './Header.css';

interface HeaderProps {
  isOpen: boolean;
  onToggle: () => void;
  isScrolled?: boolean;
}

export function Header({ isOpen, onToggle, isScrolled = false }: HeaderProps) {
  return (
    <header className={`header ${isScrolled ? "scrolled" : ""}`}>
      <div className="container-fluid">
        <div className="header-inner">
          {/* ===== بخش چپ ===== */}
          <div className="header-left">
            <button
              onClick={onToggle}
              className={`menu-btn ${isOpen ? 'active' : ''}`}
              aria-label={isOpen ? 'بستن منو' : 'باز کردن منو'}
            >
              <span className="menu-icon">
                <span className={`hamburger ${isOpen ? 'open' : ''}`}>
                  <span className="bar"></span>
                  <span className="bar"></span>
                  <span className="bar"></span>
                </span>
              </span>
              <span className="menu-label">
                <span className="label">منوی برنامه</span>
                <span className="sub-label">پنل مدیریت</span>
              </span>
              <span className="menu-dot"></span>
            </button>

            <div className="search-box">
              <input type="text" placeholder="جستجو در برنامه ..." />
              <button>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M16.5 16.5L21 21" />
                </svg>
              </button>
            </div>
          </div>

          {/* ===== بخش راست ===== */}
          <div className="header-right">
            <button className="icon-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span className="badge"></span>
            </button>

            <button className="icon-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span className="badge"></span>
            </button>

            <button className="profile-btn">
              <img src="assets/images/profile/profile-image.png" alt="پروفایل" />
              <div className="profile-info">
                <span className="name">نام کاربر</span>
                <span className="role">مدیر</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}