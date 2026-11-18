import React from 'react';
import { ApplicationStatus } from '../../types';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Search, 
  Building2 
} from 'lucide-react';

interface StatusBadgeProps {
  status: ApplicationStatus | string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md', className = '' }) => {
  const getBadgeConfig = (statusStr: string) => {
    switch (statusStr) {
      case 'Submitted':
        return {
          bg: 'bg-blue-50 text-blue-700 border-blue-200/80',
          dot: 'bg-blue-500',
          icon: Clock,
          label: 'Submitted',
        };
      case 'Under Initial Verification':
        return {
          bg: 'bg-cyan-50 text-cyan-800 border-cyan-200/80',
          dot: 'bg-cyan-500',
          icon: Search,
          label: 'Under Initial Verification',
        };
      case 'Under Department Review':
        return {
          bg: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
          dot: 'bg-indigo-500',
          icon: Building2,
          label: 'Under Department Review',
        };
      case 'Additional Documents Requested':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-200/80',
          dot: 'bg-amber-500',
          icon: AlertCircle,
          label: 'Additional Documents Requested',
        };
      case 'Approved':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
          dot: 'bg-emerald-500',
          icon: CheckCircle2,
          label: 'Approved',
        };
      case 'Rejected':
        return {
          bg: 'bg-rose-50 text-rose-800 border-rose-200/80',
          dot: 'bg-rose-500',
          icon: XCircle,
          label: 'Rejected',
        };
      default:
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
          icon: Clock,
          label: statusStr,
        };
    }
  };

  const config = getBadgeConfig(status);
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-xs font-semibold px-2.5 py-1 gap-1.5',
    lg: 'text-sm font-semibold px-3 py-1.5 gap-2',
  }[size];

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-2xs font-medium tracking-tight whitespace-nowrap ${config.bg} ${sizeClasses} ${className}`}
    >
      <Icon className={`${iconSizes} shrink-0`} />
      <span>{config.label}</span>
    </span>
  );
};
