import React, { useState } from 'react';
import { LgmEmblem } from './LgmEmblem';
import { LgmLogoShowcaseModal } from './LgmLogoShowcaseModal';
import { Calendar, Users, PlusCircle, LogOut, ExternalLink, RefreshCw, Sparkles } from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, param?: string) => void;
  onLogout: () => void;
  onResetData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onLogout,
  onResetData,
}) => {
  const [showLogoModal, setShowLogoModal] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-900/10 shadow-xs">
        {/* Top Corporate Bar */}
        <div className="bg-emerald-950 text-white text-[11px] py-1 px-4 sm:px-8 border-b border-amber-600/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span className="font-medium text-emerald-100">
              Portal Rasmi Pengesahan Kehadiran Mesyuarat Pengurusan Tertinggi LGM
            </span>
          </div>
          <div className="flex items-center gap-3 text-emerald-200/90 text-xs">
            {/* Moving Logo Feature Trigger */}
            <button
              onClick={() => setShowLogoModal(true)}
              title="Ketahui & Uji Ciri-Ciri Bergerak Logo LGM e-Hadir"
              className="flex items-center gap-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-400/30 text-[11px] font-bold transition-all cursor-pointer shadow-xs"
            >
              <Sparkles className="w-3 h-3 text-amber-300 animate-spin" style={{ animationDuration: '4s' }} />
              <span>Ciri Logo Bergerak</span>
            </button>

            <span className="hidden md:inline text-slate-500">&bull;</span>
            <span className="hidden md:inline">Zon Urus Setia & Pentadbiran</span>
            <button
              onClick={onResetData}
              title="Pulihkan data sampel asal untuk ujian QA"
              className="flex items-center gap-1 hover:text-amber-300 transition-colors text-[11px] opacity-80 hover:opacity-100 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset Data Ujian</span>
            </button>
          </div>
        </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div
            className="cursor-pointer select-none py-1"
            onClick={() => onNavigate('dashboard')}
          >
            <LgmEmblem size="md" variant="light" />
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => onNavigate('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                currentView === 'dashboard' || currentView.startsWith('meetings')
                  ? 'bg-emerald-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-emerald-900 hover:bg-emerald-50'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Senarai Mesyuarat</span>
            </button>

            <button
              onClick={() => onNavigate('directory')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                currentView === 'directory'
                  ? 'bg-emerald-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-emerald-900 hover:bg-emerald-50'
              }`}
            >
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Direktori Pegawai</span>
            </button>

            <button
              onClick={() => onNavigate('meetings/new')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold bg-amber-600 text-white hover:bg-amber-700 shadow-xs transition-all cursor-pointer ml-1"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Cipta Mesyuarat</span>
            </button>

            <div className="h-6 w-px bg-slate-200 mx-2 hidden sm:block" />

            {/* Quick RSVP Demo Button */}
            <button
              onClick={() => onNavigate('rsvp-demo')}
              title="Cuba Halaman RSVP Penerima (One-Click Magic Link)"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
              <span>Pratonton RSVP</span>
            </button>

            <button
              onClick={onLogout}
              title="Log Keluar Sekretariat"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-500 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Keluar</span>
            </button>
          </nav>
        </div>
      </div>
    </header>

    {/* Moving Logo Feature Showcase Modal */}
    <LgmLogoShowcaseModal
      isOpen={showLogoModal}
      onClose={() => setShowLogoModal(false)}
    />
  </>
  );
};
