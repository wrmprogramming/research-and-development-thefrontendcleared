// src/components/common/StatusBadge/StatusBadge.tsx

import React from 'react';
import './StatusBadge.css';

export interface StatusConfig {
  label: string;
  color: string;
}

interface StatusBadgeProps {
  /** کلید وضعیت */
  status: string;
  /** کانفیگ وضعیت‌ها */
  config: Record<string, StatusConfig>;
  /** کلاس‌های اضافی */
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  config,
  className = '',
}) => {
  const statusConfig = config[status];

  if (!statusConfig) {
    return <span className={`status-badge ${className}`}>{status}</span>;
  }

  return (
    <span
      className={`status-badge ${className}`}
      style={{
        backgroundColor: statusConfig.color + '20',
        color: statusConfig.color,
      }}
    >
      {statusConfig.label}
    </span>
  );
};

export default StatusBadge;