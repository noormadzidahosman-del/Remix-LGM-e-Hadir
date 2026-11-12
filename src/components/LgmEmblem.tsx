import React, { useState, useId } from 'react';

export interface LgmEmblemProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'light' | 'dark';
  iconOnly?: boolean;
  animated?: boolean;
  interactive?: boolean;
  showPresence?: boolean;
  className?: string;
  onEmblemClick?: () => void;
}

export const LgmEmblem: React.FC<LgmEmblemProps> = ({
  size = 'md',
  variant = 'light',
  iconOnly = false,
  animated = true,
  interactive = true,
  showPresence = true,
  className = '',
  onEmblemClick,
}) => {
  const uid = useId().replace(/:/g, '_');
  const [isHovered, setIsHovered] = useState(false);
  const [clickWave, setClickWave] = useState(0);

  const dimensions = {
    xs: 'w-7 h-7',
    sm: 'w-9 h-9',
    md: 'w-11 h-11',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20',
    '2xl': 'w-28 h-28',
  }[size];

  const svgPixel = {
    xs: 28,
    sm: 36,
    md: 44,
    lg: 64,
    xl: 80,
    '2xl': 112,
  }[size];

  const handleClick = (e: React.MouseEvent) => {
    if (interactive) {
      setClickWave(prev => prev + 1);
    }
    if (onEmblemClick) {
      onEmblemClick();
    }
  };

  return (
    <div
      className={`inline-flex items-center gap-3 select-none ${className}`}
      onMouseEnter={() => interactive && setIsHovered(true)}
      onMouseLeave={() => interactive && setIsHovered(false)}
      onClick={handleClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      title={interactive ? 'Logo Rasmi LGM e-Hadir (Dengan Ciri Bergerak Dinamik)' : undefined}
    >
      {/* High-Fidelity Official LGM Rubber Seal Emblem with Moving Features */}
      <div
        className={`${dimensions} rounded-2xl flex items-center justify-center shrink-0 relative transition-all duration-300 ${
          isHovered ? 'scale-105 shadow-xl' : 'scale-100'
        } ${
          variant === 'dark'
            ? 'bg-gradient-to-br from-emerald-800 via-emerald-950 to-slate-950 border border-emerald-500/40 shadow-lg shadow-emerald-950/60'
            : 'bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-950 border border-emerald-600/40 shadow-md shadow-emerald-950/25'
        } ${animated ? 'animate-lgm-glow' : ''} overflow-hidden cursor-pointer`}
      >
        {/* Ambient Moving Sheen Light Sweep */}
        {animated && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
            <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-25 animate-lgm-sheen" />
          </div>
        )}

        {/* Concentric Pulse Ripples (Expanding from latex drop on click or rhythm) */}
        {animated && (
          <div
            key={clickWave}
            className={`absolute inset-0 rounded-2xl pointer-events-none border border-amber-400/30 transition-transform duration-1000 ${
              clickWave > 0 ? 'scale-125 opacity-0' : 'opacity-0'
            }`}
          />
        )}

        <svg
          width={svgPixel}
          height={svgPixel}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full p-1 drop-shadow-sm relative z-0"
        >
          <defs>
            {/* Emerald Forest Gradient */}
            <linearGradient id={`lgmEmerald_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34D399" />
              <stop offset="45%" stopColor="#059669" />
              <stop offset="100%" stopColor="#022c22" />
            </linearGradient>

            {/* Corporate Gold Radiant Gradient */}
            <linearGradient id={`lgmGold_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FEF3C7" />
              <stop offset="30%" stopColor="#FBBF24" />
              <stop offset="70%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#78350F" />
            </linearGradient>

            {/* Pure White Natural Latex Droplet Gradient */}
            <linearGradient id={`latexDrop_${uid}`} x1="25%" y1="0%" x2="75%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="65%" stopColor="#FDFBF7" />
              <stop offset="85%" stopColor="#FEF3C7" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>

            {/* Moving Ripple Wave Gradient */}
            <radialGradient id={`rippleGrad_${uid}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
              <stop offset="70%" stopColor="#FEF3C7" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
            </radialGradient>

            {/* Soft Shadow Filter */}
            <filter id={`softShadow_${uid}`} x="-15%" y="-15%" width="130%" height="130%">
              <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#022c22" floodOpacity="0.6" />
            </filter>
          </defs>

          {/* Deep Inner Seal Core */}
          <circle
            cx="50"
            cy="50"
            r="41"
            fill="#064E3B"
            fillOpacity="0.85"
            stroke="#10B981"
            strokeWidth="1"
            strokeOpacity="0.4"
          />

          {/* MOVING FEATURE 1: Smooth Continuously Rotating Outer Gold Dash Authority Ring */}
          <g
            className={
              animated
                ? isHovered
                  ? 'animate-lgm-orbit-fast'
                  : 'animate-lgm-orbit-slow'
                : ''
            }
            style={{ transformOrigin: '50px 50px' }}
          >
            <circle
              cx="50"
              cy="50"
              r="44"
              stroke={`url(#lgmGold_${uid})`}
              strokeWidth="2.5"
              strokeDasharray="28 6 14 6"
              strokeLinecap="round"
              opacity="0.9"
            />
            {/* Orbiting Satellite Gleam Particles */}
            <circle cx="50" cy="6" r="2" fill="#FEF3C7" filter={`url(#softShadow_${uid})`} />
            <circle cx="50" cy="94" r="1.5" fill="#FBBF24" />
            <circle cx="6" cy="50" r="1.5" fill="#FBBF24" />
            <circle cx="94" cy="50" r="2" fill="#FEF3C7" />
          </g>

          {/* MOVING FEATURE 2: Counter-Rotating Secondary Fine Orbit Ring */}
          <g
            className={animated ? 'animate-lgm-orbit-counter' : ''}
            style={{ transformOrigin: '50px 50px' }}
          >
            <circle
              cx="50"
              cy="50"
              r="38"
              stroke="#34D399"
              strokeWidth="0.75"
              strokeDasharray="6 14"
              strokeLinecap="round"
              opacity="0.5"
            />
          </g>

          {/* MOVING FEATURE 3: Trifoliate Hevea Rubber Leaves with Organic Sway & Sheen */}
          <g filter={`url(#softShadow_${uid})`}>
            {/* Left Leaflet - Gentle Sway Left */}
            <g
              className={animated ? 'animate-lgm-leaf-left' : ''}
              style={{ transformOrigin: '48px 52px' }}
            >
              <path
                d="M48 52 C36 46, 26 36, 25 24 C37 24, 46 32, 48 45 Z"
                fill={`url(#lgmEmerald_${uid})`}
                stroke="#D1FAE5"
                strokeWidth="0.85"
              />
              <path
                d="M25 24 Q36 38 48 52"
                stroke="#A7F3D0"
                strokeWidth="0.8"
                strokeLinecap="round"
                opacity="0.85"
              />
              <path
                d="M29 30 Q37 34 43 42"
                stroke="#6EE7B7"
                strokeWidth="0.5"
                strokeLinecap="round"
                opacity="0.6"
              />
            </g>

            {/* Right Leaflet - Gentle Sway Right */}
            <g
              className={animated ? 'animate-lgm-leaf-right' : ''}
              style={{ transformOrigin: '52px 52px' }}
            >
              <path
                d="M52 52 C64 46, 74 36, 75 24 C63 24, 54 32, 52 45 Z"
                fill={`url(#lgmEmerald_${uid})`}
                stroke="#D1FAE5"
                strokeWidth="0.85"
              />
              <path
                d="M75 24 Q64 38 52 52"
                stroke="#A7F3D0"
                strokeWidth="0.8"
                strokeLinecap="round"
                opacity="0.85"
              />
              <path
                d="M71 30 Q63 34 57 42"
                stroke="#6EE7B7"
                strokeWidth="0.5"
                strokeLinecap="round"
                opacity="0.6"
              />
            </g>

            {/* Central Upright Leaflet - Breathing Pulse Upward */}
            <g
              className={animated ? 'animate-lgm-leaf-center' : ''}
              style={{ transformOrigin: '50px 50px' }}
            >
              <path
                d="M50 14 C42 25, 43 38, 50 50 C57 38, 58 25, 50 14 Z"
                fill={`url(#lgmEmerald_${uid})`}
                stroke="#34D399"
                strokeWidth="1.1"
              />
              {/* Central Vein with Golden Life-force */}
              <path
                d="M50 14 V48"
                stroke="#FEF3C7"
                strokeWidth="1.1"
                strokeLinecap="round"
              />
              <path
                d="M45 28 L50 33 L55 28"
                stroke="#A7F3D0"
                strokeWidth="0.75"
                strokeLinecap="round"
                opacity="0.8"
              />
              <path
                d="M45 37 L50 42 L55 37"
                stroke="#A7F3D0"
                strokeWidth="0.75"
                strokeLinecap="round"
                opacity="0.8"
              />
            </g>
          </g>

          {/* Natural Rubber Latex Incision Groove (Alur Torehan Pokok Getah) */}
          <path
            d="M28 68 C38 80, 62 80, 72 68"
            stroke={`url(#lgmGold_${uid})`}
            strokeWidth="3.2"
            strokeLinecap="round"
            opacity="0.95"
          />
          <path
            d="M33 72 C42 82, 58 82, 67 72"
            stroke="#F59E0B"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.65"
          />

          {/* Concentric Latex Ripple Wave (Rippling outwards from latex collection spout) */}
          {animated && (
            <g className="animate-ping" style={{ transformOrigin: '50px 72px', animationDuration: '3.2s' }}>
              <ellipse
                cx="50"
                cy="72"
                rx="8"
                ry="3"
                fill="none"
                stroke={`url(#latexDrop_${uid})`}
                strokeWidth="0.75"
                opacity="0.5"
              />
            </g>
          )}

          {/* MOVING FEATURE 4: Iconic Natural Latex Droplet (Titisan Susu Getah Hidup) */}
          <g
            filter={`url(#softShadow_${uid})`}
            className={animated ? 'animate-lgm-latex' : ''}
            style={{ transformOrigin: '50px 60px' }}
          >
            {/* Liquid Droplet Body */}
            <path
              d="M50 47 C42 56, 41 66, 50 75 C59 66, 58 56, 50 47 Z"
              fill={`url(#latexDrop_${uid})`}
              stroke="#D97706"
              strokeWidth="0.9"
            />
            {/* Pure White Glossy Highlights */}
            <ellipse
              cx="48"
              cy="62"
              rx="2.2"
              ry="4.5"
              fill="#FFFFFF"
              opacity="0.95"
              transform="rotate(-15 48 62)"
            />
            <circle cx="51" cy="71" r="1.6" fill="#FFFFFF" opacity="0.9" />
          </g>

          {/* Authority Gold Stars */}
          <circle cx="18" cy="50" r="1.8" fill="#FBBF24" />
          <circle cx="82" cy="50" r="1.8" fill="#FBBF24" />
        </svg>

        {/* Presence Indicator Radar Ring in Corner (Only on medium and larger) */}
        {showPresence && size !== 'xs' && (
          <div className="absolute bottom-0.5 right-0.5 z-20 flex items-center justify-center">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-white"></span>
            </span>
          </div>
        )}
      </div>

      {/* Typography Section (Hidden if iconOnly is true) */}
      {!iconOnly && (
        <div className="flex flex-col justify-center select-none">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`font-black tracking-tight leading-none ${
                size === '2xl'
                  ? 'text-3xl'
                  : size === 'xl'
                  ? 'text-2xl'
                  : size === 'lg'
                  ? 'text-xl'
                  : size === 'sm'
                  ? 'text-base'
                  : size === 'xs'
                  ? 'text-sm'
                  : 'text-lg'
              } ${variant === 'dark' ? 'text-white' : 'text-emerald-950'}`}
            >
              LGM{' '}
              <span
                className={`font-black inline-block ${
                  animated
                    ? 'animate-lgm-gold-text bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 bg-clip-text text-transparent'
                    : 'text-amber-500'
                }`}
              >
                e-Hadir
              </span>
            </span>

            {/* Dynamic Status / Badge with Moving Radar Pulse */}
            <div className="flex items-center gap-1">
              <span className="inline-flex items-center gap-1 text-[9px] font-black px-1.5 py-0.5 rounded-md bg-amber-400/20 text-amber-500 border border-amber-400/30 uppercase tracking-wider shadow-xs">
                {animated && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse inline-block" />
                )}
                Rasmi
              </span>

              {animated && showPresence && size !== 'xs' && size !== 'sm' && (
                <span className="hidden sm:inline-flex items-center gap-1 text-[8px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-lgm-beacon" />
                  Masa Nyata
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 mt-1">
            <span
              className={`text-[11px] font-bold uppercase tracking-wider ${
                variant === 'dark' ? 'text-emerald-300' : 'text-emerald-900'
              }`}
            >
              Lembaga Getah Malaysia
            </span>
            <span className="text-slate-400 text-[10px] hidden sm:inline">&bull;</span>
            <span className="text-[10px] text-slate-500 hidden sm:inline font-medium">
              Malaysian Rubber Board
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
