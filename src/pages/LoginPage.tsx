import React, { useState } from 'react';
import { LgmEmblem } from '../components/LgmEmblem';
import { LgmLogoShowcaseModal } from '../components/LgmLogoShowcaseModal';
import { KeyRound, ArrowRight, ShieldCheck, CheckCircle2, Sparkles } from 'lucide-react';
import { verifyPasscode } from '../services/api';

interface LoginPageProps {
  onSuccess: () => void;
  onPreviewRsvp?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess, onPreviewRsvp }) => {
  const [passcode, setPasscode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showLogoModal, setShowLogoModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) {
      setErrorMsg('Sila masukkan kod akses.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const isValid = await verifyPasscode(passcode);
      if (isValid) {
        onSuccess();
      } else {
        // FR-001 Acceptance Criteria:
        // Jika salah, paparkan mesej ralat: "Kod akses tidak sah. Sila cuba lagi."
        setErrorMsg('Kod akses tidak sah. Sila cuba lagi.');
      }
    } catch (err) {
      setErrorMsg('Kod akses tidak sah. Sila cuba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative corporate watermark background */}
      <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
        <svg className="w-[800px] h-[800px] text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
          <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z" />
        </svg>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        {/* Emblem & Title */}
        <div className="flex flex-col items-center text-center">
          <div
            onClick={() => setShowLogoModal(true)}
            className="p-3 bg-gradient-to-b from-white/15 to-white/5 rounded-3xl backdrop-blur-md border border-white/20 shadow-2xl mb-4 relative cursor-pointer group transition-all hover:scale-105 hover:border-amber-400/50"
            title="Klik untuk membuka Pameran Ciri Bergerak Logo LGM"
          >
            <LgmEmblem size="2xl" variant="dark" iconOnly={true} />
            <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-emerald-950/95 text-amber-300 text-[10px] font-bold px-3 py-0.5 rounded-full border border-amber-400/40 shadow-lg flex items-center gap-1.5 whitespace-nowrap group-hover:border-amber-300">
              <Sparkles className="w-3 h-3 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
              <span>Ciri Bergerak Dinamik</span>
            </div>
          </div>

          <h1 className="text-2xl font-black text-white tracking-tight sm:text-3xl mt-1">
            LGM{' '}
            <span className="animate-lgm-gold-text bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 bg-clip-text text-transparent">
              e-Hadir
            </span>
          </h1>
          <p className="mt-1 text-sm text-emerald-200/90 font-medium">
            Sistem Pengesahan Kehadiran Mesyuarat Pantas
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-emerald-300/70">
              Lembaga Getah Malaysia (Malaysian Rubber Board)
            </span>
            <button
              type="button"
              onClick={() => setShowLogoModal(true)}
              className="text-[10px] font-bold text-amber-300 hover:text-amber-200 underline underline-offset-2 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Info Gerakan Logo</span>
            </button>
          </div>
        </div>

        {/* Login Card */}
        <div className="mt-8 bg-white/95 backdrop-blur-md py-8 px-6 shadow-2xl rounded-3xl sm:px-10 border border-emerald-100">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                Log Masuk Urus Setia / Sekretariat
              </h2>
              <p className="text-xs text-slate-500">
                Sila masukkan Kod Akses Bersama untuk mengurus mesyuarat.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="passcode"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Kod Akses Bersama (Passcode)
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="h-5 w-5" />
                </div>
                <input
                  type="password"
                  id="passcode"
                  value={passcode}
                  onChange={e => {
                    setPasscode(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder="cth: LGM2026"
                  autoComplete="current-password"
                  autoFocus
                  className="block w-full pl-11 pr-4 py-3 text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-700 focus:bg-white focus:outline-hidden text-base tracking-widest placeholder:tracking-normal placeholder:text-slate-400 transition-all font-mono"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2 animate-in fade-in duration-150">
                <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-emerald-900 hover:bg-emerald-950 focus:ring-4 focus:ring-emerald-300 transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Masuk ke Papan Pemuka</span>
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </>
              )}
            </button>
          </form>

          {/* Quick Helper for Testers */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
              <span className="font-medium text-slate-600">Kod Lalai Default:</span>
              <button
                type="button"
                onClick={() => setPasscode('LGM2026')}
                className="font-mono font-bold text-emerald-800 bg-emerald-100/80 hover:bg-emerald-200 px-2 py-1 rounded cursor-pointer transition-colors"
                title="Klik untuk mengisi automatik"
              >
                LGM2026
              </button>
            </div>

            {onPreviewRsvp && (
              <button
                type="button"
                onClick={onPreviewRsvp}
                className="w-full text-center text-xs font-semibold text-amber-700 hover:text-amber-800 py-1.5 transition-colors cursor-pointer"
              >
                Ingin cuba Pautan Pantas RSVP Penerima (One-Click)? Klik di sini
              </button>
            )}
          </div>
        </div>

        {/* Security / System Footnote */}
        <div className="mt-6 text-center text-xs text-emerald-200/60 flex items-center justify-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
          <span>Sistem Dalaman Rasmi Lembaga Getah Malaysia &bull; Versi 1.0</span>
        </div>
      </div>

      {/* Interactive Moving Logo Showcase Modal */}
      <LgmLogoShowcaseModal
        isOpen={showLogoModal}
        onClose={() => setShowLogoModal(false)}
      />
    </div>
  );
};
