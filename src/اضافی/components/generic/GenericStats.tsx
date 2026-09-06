// src/components/generic/GenericStats.tsx

import React from 'react';
import type { StatConfig } from '../../types/pageConfig';

interface GenericStatsProps {
  stats: (StatConfig & { value: any })[];
}

export const GenericStats: React.FC<GenericStatsProps> = ({ stats }) => {
  return (
    <div className="stats-grid">
      {stats.map((stat, index) => (
        <div key={index} className="stat-card">
          <div className={`stat-icon ${stat.key}`}>
            <stat.icon size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stat.value}</span>
            <span className="stat-label">{stat.label}</span>
          </div>
        </div>
      ))}
      <style>{`
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 12px;
          margin-bottom: 20px;
        }
        .stat-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 18px;
          background: white;
          border-radius: 12px;
          border: 1px solid #e9ecef;
          transition: all 0.2s ease;
        }
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
        }
        .stat-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: 10px;
          flex-shrink: 0;
          background: #eef2ff;
          color: #4f46e5;
        }
        .stat-info {
          display: flex;
          flex-direction: column;
        }
        .stat-value {
          font-size: 20px;
          font-weight: 700;
          color: #1a1a2e;
          line-height: 1.2;
        }
        .stat-label {
          font-size: 12px;
          color: #6b7280;
        }
      `}</style>
    </div>
  );
};

//