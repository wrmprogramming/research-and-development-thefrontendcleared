// src/components/generic/GenericPageHeader.tsx

import React from 'react';
import { type LucideIcon, Plus, RefreshCw } from 'lucide-react';

interface GenericPageHeaderProps {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  onAdd?: () => void;
  onRefresh?: () => void;
  addLabel?: string;
}

export const GenericPageHeader: React.FC<GenericPageHeaderProps> = ({
  title,
  subtitle,
  icon: Icon,
  onAdd,
  onRefresh,
  addLabel = 'افزودن',
}) => {
  return (
    <div className="generic-page-header">
      <div className="header-content">
        <div>
          <h1 className="page-title">
            <Icon size={28} className="title-icon" />
            {title}
          </h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
        <div className="header-actions">
          {onRefresh && (
            <button className="btn btn-outline-secondary btn-sm" onClick={onRefresh}>
              <RefreshCw size={16} />
              بروزرسانی
            </button>
          )}
          {onAdd && (
            <button className="btn btn-primary btn-add" onClick={onAdd}>
              <Plus size={18} />
              {addLabel}
            </button>
          )}
        </div>
      </div>
      <style>{`
        .generic-page-header { margin-bottom: 24px; }
        .header-content { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px; }
        .page-title { display: flex; align-items: center; gap: 12px; font-size: 26px; font-weight: 700; color: #1a1a2e; margin: 0; }
        .title-icon { color: #4f46e5; }
        .page-subtitle { color: #6b7280; font-size: 14px; margin: 4px 0 0 0; }
        .header-actions { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
        .btn-add { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); border: none; color: white; padding: 10px 20px; border-radius: 10px; font-weight: 500; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3); transition: all 0.2s ease; }
        .btn-add:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(79, 70, 229, 0.4); }
      `}</style>
    </div>
  );
};
