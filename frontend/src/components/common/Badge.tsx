import React from 'react';
import { SeverityLevel, VerificationStatus } from '../../types';

interface BadgeProps {
  label: string;
  variant?: 'severity' | 'verification' | 'status' | 'default';
  value?: SeverityLevel | VerificationStatus | string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'default',
  value,
  size = 'md',
}) => {
  const getStyles = () => {
    const val = (value || label).toUpperCase();

    if (variant === 'severity' || val === 'CRITICAL' || val === 'HIGH' || val === 'MEDIUM' || val === 'LOW') {
      switch (val) {
        case 'CRITICAL':
          return 'bg-red-500/10 text-red-400 border-red-500/30';
        case 'HIGH':
          return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
        case 'MEDIUM':
          return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
        case 'LOW':
        default:
          return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      }
    }

    if (variant === 'verification' || val === 'VERIFIED' || val === 'UNVERIFIED' || val === 'REJECTED') {
      switch (val) {
        case 'VERIFIED':
          return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
        case 'REJECTED':
          return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
        case 'UNVERIFIED':
        default:
          return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      }
    }

    if (val === 'ONLINE' || val === 'CONNECTED' || val === 'RUNNING' || val === 'RESOLVED') {
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    }

    if (val === 'OFFLINE' || val === 'DISCONNECTED' || val === 'ERROR') {
      return 'bg-red-500/10 text-red-400 border-red-500/30';
    }

    if (val === 'IN_PROGRESS' || val === 'ASSIGNED') {
      return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    }

    return 'bg-slate-800 text-slate-300 border-slate-700';
  };

  const sizeClasses = size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center font-mono font-medium uppercase tracking-wider rounded border ${sizeClasses} ${getStyles()}`}
    >
      {label}
    </span>
  );
};

export default Badge;
