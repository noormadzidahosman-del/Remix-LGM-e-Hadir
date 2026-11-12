import React from 'react';
import { ShieldAlert, ShieldCheck, CheckCircle2, AlertTriangle } from 'lucide-react';

interface QuorumGaugeProps {
  attending: number;
  total: number;
  size?: 'sm' | 'md' | 'lg';
}

export const QuorumGauge: React.FC<QuorumGaugeProps> = ({
  attending,
  total,
  size = 'md',
}) => {
  const percentage = total > 0 ? Math.round((attending / total) * 100) : 0;

  // Determine Quorum Status according to government committee standards
  let statusText = 'Kuorum Belum Sah';
  let statusColor = 'text-rose-600';
  let strokeColor = '#E11D48'; // Rose-600
  let bgColor = 'bg-rose-50 border-rose-200';
  let icon = <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />;

  if (percentage >= 67) {
    statusText = 'Kuorum Sah & Optimum (≥ 2/3)';
    statusColor = 'text-emerald-700';
    strokeColor = '#059669'; // Emerald-600
    bgColor = 'bg-emerald-50 border-emerald-200';
    icon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
  } else if (percentage >= 50) {
    statusText = 'Kuorum Minimum Dicapai (≥ 1/2)';
    statusColor = 'text-amber-700';
    strokeColor = '#D97706'; // Amber-600
    bgColor = 'bg-amber-50 border-amber-200';
    icon = <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />;
  }

  // SVG parameters
  const radius = size === 'sm' ? 28 : size === 'lg' ? 48 : 36;
  const strokeWidth = size === 'sm' ? 5 : size === 'lg' ? 8 : 6;
  const svgSize = (radius + strokeWidth) * 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex items-center gap-4">
      {/* Circular Progress Gauge */}
      <div className="relative flex items-center justify-center shrink-0">
        <svg
          width={svgSize}
          height={svgSize}
          className="transform -rotate-90"
        >
          {/* Background circle track */}
          <circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            stroke="#E2E8F0"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Animated active progress arc */}
          <circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center Percentage Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span
            className={`font-black tracking-tight tabular-nums ${
              size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-xl' : 'text-base'
            } text-slate-900`}
          >
            {percentage}%
          </span>
          <span className="text-[9px] uppercase font-bold text-slate-400 -mt-0.5">Kuorum</span>
        </div>
      </div>

      {/* Text Meta Info */}
      <div className="flex flex-col">
        <div
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${bgColor} ${statusColor} self-start`}
        >
          {icon}
          <span>{statusText}</span>
        </div>

        <div className="text-xs text-slate-600 font-semibold mt-1">
          <span className="text-slate-900 font-bold tabular-nums">{attending}</span> daripada{' '}
          <span className="text-slate-900 font-bold tabular-nums">{total}</span> orang hadir
        </div>
        <p className="text-[10px] text-slate-400 mt-0.5">
          {percentage >= 67
            ? 'Mesyuarat mempunyai bilangan ahli mencukupi untuk meluluskan usul.'
            : percentage >= 50
            ? 'Memenuhi syarat kehadiran asas mengikut garis panduan tadbir urus.'
            : 'Perlu pengesahan tambahan untuk mencapai kuorum minima.'}
        </p>
      </div>
    </div>
  );
};
