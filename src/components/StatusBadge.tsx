import React from 'react';
import { RSVPStatus, MeetingStatus } from '../types';
import { CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';

interface RSVPBadgeProps {
  status: RSVPStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const RSVPBadge: React.FC<RSVPBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs font-semibold px-2.5 py-1 gap-1.5',
    lg: 'text-sm font-bold px-3 py-1.5 gap-2',
  }[size];

  switch (status) {
    case 'attending':
      return (
        <span
          className={`inline-flex items-center rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-medium ${sizeClasses}`}
        >
          <CheckCircle2 className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
          Hadir
        </span>
      );
    case 'not_attending':
      return (
        <span
          className={`inline-flex items-center rounded-full bg-rose-100 text-rose-800 border border-rose-300 font-medium ${sizeClasses}`}
        >
          <XCircle className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
          Tidak Hadir
        </span>
      );
    case 'pending':
    default:
      return (
        <span
          className={`inline-flex items-center rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-medium ${sizeClasses}`}
        >
          <Clock className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
          Belum Respon
        </span>
      );
  }
};

interface MeetingStatusBadgeProps {
  status: MeetingStatus;
}

export const MeetingStatusBadge: React.FC<MeetingStatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'active':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Aktif
        </span>
      );
    case 'completed':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-300">
          Selesai
        </span>
      );
    case 'cancelled':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
          <AlertCircle className="w-3 h-3" />
          Dibatalkan
        </span>
      );
    default:
      return null;
  }
};
