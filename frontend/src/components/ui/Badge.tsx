import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  RotateCcw, 
  XCircle, 
  ShieldAlert, 
  Sparkles,
  UserCheck
} from 'lucide-react';
import { ReportStatus, UrgencyLevel, UserRole } from '../../types';

interface StatusBadgeProps {
  status: ReportStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const configs = {
    open: {
      label: 'Open',
      icon: Clock,
      style: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    in_progress: {
      label: 'In Progress',
      icon: RotateCcw,
      style: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    resolved: {
      label: 'Resolved',
      icon: CheckCircle2,
      style: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    reopened: {
      label: 'Reopened',
      icon: AlertCircle,
      style: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    rejected: {
      label: 'Rejected',
      icon: XCircle,
      style: 'bg-slate-50 text-slate-600 border-slate-200',
    },
  };

  const current = configs[status] || configs.open;
  const Icon = current.icon;

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border',
          current.style,
          className
        )
      )}
    >
      <Icon className="w-3.5 h-3.5" aria-hidden="true" />
      <span>{current.label}</span>
    </span>
  );
};

interface UrgencyBadgeProps {
  urgency: UrgencyLevel;
  className?: string;
}

export const UrgencyBadge: React.FC<UrgencyBadgeProps> = ({ urgency, className }) => {
  const configs = {
    low: {
      label: 'Low Urgency',
      style: 'bg-slate-100 text-slate-700 border-slate-200',
      icon: Clock,
    },
    medium: {
      label: 'Medium Urgency',
      style: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: Clock,
    },
    high: {
      label: 'High Urgency',
      style: 'bg-amber-50 text-amber-800 border-amber-300',
      icon: AlertCircle,
    },
    critical: {
      label: 'Critical Hazard',
      style: 'bg-rose-50 text-rose-800 border-rose-300',
      icon: ShieldAlert,
    },
  };

  const current = configs[urgency] || configs.medium;
  const Icon = current.icon;

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border',
          current.style,
          className
        )
      )}
    >
      <Icon className="w-3.5 h-3.5" aria-hidden="true" />
      <span>{current.label}</span>
    </span>
  );
};

export const RoleBadge: React.FC<{ role: UserRole; className?: string }> = ({ role, className }) => {
  const configs: Record<UserRole, { label: string; style: string }> = {
    citizen: { label: 'Citizen', style: 'bg-teal-50 text-teal-800 border-teal-200' },
    volunteer: { label: 'Volunteer', style: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
    organizer: { label: 'NGO Organizer', style: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
    moderator: { label: 'Moderator', style: 'bg-purple-50 text-purple-800 border-purple-200' },
    admin: { label: 'Admin', style: 'bg-slate-900 text-white border-slate-900' },
    guest: { label: 'Guest', style: 'bg-slate-100 text-slate-600 border-slate-200' },
  };

  const current = configs[role] || configs.citizen;

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border',
          current.style,
          className
        )
      )}
    >
      <UserCheck className="w-3 h-3" />
      <span>{current.label}</span>
    </span>
  );
};

export const AiBadge: React.FC<{ model?: string; className?: string }> = ({ model = 'Gemma 4', className }) => {
  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-gradient-to-r from-teal-50 to-blue-50 text-teal-800 border border-teal-200',
          className
        )
      )}
      title="Structured with Google Gemma local model"
    >
      <Sparkles className="w-3 h-3 text-teal-600" />
      <span>{model}</span>
    </span>
  );
};

