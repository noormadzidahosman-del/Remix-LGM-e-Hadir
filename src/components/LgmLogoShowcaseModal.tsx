import React, { useState } from 'react';
import { LgmEmblem } from './LgmEmblem';
import { X, Sparkles, Droplets, RotateCw, Shield, Eye, CheckCircle2, Play, Pause, Zap } from 'lucide-react';

interface LgmLogoShowcaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LgmLogoShowcaseModal: React.FC<LgmLogoShowcaseModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [speed, setSpeed] = useState<'normal' | 'fast' | 'slow'>('normal');
  const [isPaused, setIsPaused] = useState(false);
  const [variant, setVariant] = useState<'dark' | 'light'>('dark');
  const [activeHighlight, setActiveHighlight] = useState<string | null>(null);
  const [dripTrigger, setDripTrigger] = useState(0);

  if (!isOpen) return null;

  const features = [
    {
      id: 'orbit',
      icon: <RotateCw className="w-4 h-4 text-amber-400" />,
      title: 'Gelung Orbit Emas Berputar',
      subtitle: 'Rotating Gold Seal Orbit',
      desc: 'Gelung emas berlingkar 360° melambangkan kitaran tadbir urus rasmi dan integriti mesyuarat berterusan.',
    },
    {
      id: 'latex',
      icon: <Droplets className="w-4 h-4 text-emerald-300" />,
      title: 'Titisan Susu Getah Elastik Hidup',
      subtitle: 'Living Rubber Latex Droplet',
      desc: 'Titisan cecair putih susu getah asli berdenyut lembut dengan pantulan kilauan cahaya spesifik LGM.',
    },
    {
      id: 'leaves',
      icon: <Sparkles className="w-4 h-4 text-emerald-400" />,
      title: 'Daun Hevea Brasiliensis Berayun',
      subtitle: 'Organic Swaying Trifoliate Leaves',
      desc: 'Tiga helai daun getah rasmi berayun lembut mencerminkan kemampanan dan kemajuan inovasi getah.',
    },
    {
      id: 'sheen',
      icon: <Zap className="w-4 h-4 text-yellow-300" />,
      title: 'Pancaran Kilauan Cahaya Logam',
      subtitle: 'Metallic Luminous Sheen Sweep',
      desc: 'Laluan kilau cahaya menyapu permukaan lambang setiap beberapa saat untuk kemasan premium korporat.',
    },
    {
      id: 'presence',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
      title: 'Radar Kehadiran Masa Nyata',
      subtitle: 'Live Attendance Pulse Beacon',
      desc: 'Isyarat gelombang radar hijau menandakan sistem e-Hadir sedia menerima respon kehadiran 24 jam.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden text-white relative">
        {/* Glow ambient background behind modal */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-emerald-800/40 relative z-10 bg-emerald-950/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-400/10 rounded-xl border border-amber-400/20 text-amber-400">
              <Sparkles className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                Ciri-Ciri Bergerak Logo LGM e-Hadir
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Dinamik 60 FPS
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Pameran interaktif elemen gerakan lambang rasmi Lembaga Getah Malaysia.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Logo Stage / Display Area */}
        <div
          className={`py-10 px-6 flex flex-col items-center justify-center transition-colors relative border-b border-emerald-800/30 ${
            variant === 'dark'
              ? 'bg-gradient-to-b from-slate-950 to-emerald-950/60'
              : 'bg-gradient-to-b from-slate-100 to-emerald-50 text-slate-900'
          }`}
        >
          {/* Subtle grid pattern background */}
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#10B981_1px,transparent_1px)] [background-size:16px_16px]" />

          {/* Interactive Logo Stage */}
          <div
            className="relative p-6 rounded-3xl backdrop-blur-md transition-all duration-300 flex flex-col items-center cursor-pointer group"
            onClick={() => setDripTrigger(prev => prev + 1)}
            title="Klik untuk gelombang titisan getah tambahan!"
          >
            <LgmEmblem
              key={`${variant}-${isPaused}-${speed}-${dripTrigger}`}
              size="2xl"
              variant={variant}
              animated={!isPaused}
              interactive={true}
              showPresence={true}
            />

            <span className="mt-4 text-[11px] font-semibold text-emerald-400/90 dark:text-emerald-300 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
              <Droplets className="w-3.5 h-3.5 animate-bounce text-amber-400" />
              Sentuh atau klik logo untuk mencetuskan gelombang cecair susu getah
            </span>
          </div>

          {/* Interactive Controls Bar */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4 z-10">
            {/* Play/Pause Button */}
            <button
              onClick={() => setIsPaused(!isPaused)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isPaused
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              <span>{isPaused ? 'Mula Animasi' : 'Jeda Gerakan'}</span>
            </button>

            {/* Drip Trigger */}
            <button
              onClick={() => setDripTrigger(prev => prev + 1)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <Droplets className="w-3.5 h-3.5" />
              <span>Titisan Getah ({dripTrigger})</span>
            </button>

            {/* Background Theme Toggle */}
            <button
              onClick={() => setVariant(variant === 'dark' ? 'light' : 'dark')}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Mod: {variant === 'dark' ? 'Latar Gelap' : 'Latar Cerah'}</span>
            </button>
          </div>
        </div>

        {/* Feature Explanations Grid */}
        <div className="p-6 max-h-72 overflow-y-auto space-y-3 bg-slate-900/90">
          <div className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center justify-between pb-1">
            <span>Komponen Gerakan Dinamik (Moving Features)</span>
            <span className="text-slate-400 font-normal">5 Ciri Utama</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {features.map(f => (
              <div
                key={f.id}
                onMouseEnter={() => setActiveHighlight(f.id)}
                onMouseLeave={() => setActiveHighlight(null)}
                className={`p-3 rounded-2xl border transition-all ${
                  activeHighlight === f.id
                    ? 'bg-emerald-950/80 border-emerald-400 shadow-md scale-[1.02]'
                    : 'bg-slate-800/60 border-slate-700/60 hover:border-emerald-500/50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1.5 bg-emerald-900/40 rounded-lg">{f.icon}</div>
                  <div>
                    <h4 className="text-xs font-bold text-white leading-tight">{f.title}</h4>
                    <span className="text-[10px] text-slate-400 block">{f.subtitle}</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed mt-1">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950/90 border-t border-emerald-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Shield className="w-4 h-4 text-amber-400" />
            <span>Hak Cipta Terpelihara Lembaga Getah Malaysia &bull; e-Hadir</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-sm"
          >
            Kembali ke Aplikasi
          </button>
        </div>
      </div>
    </div>
  );
};
