import React, { useState } from 'react';
import { Meeting, MeetingInvitation } from '../types';
import { buildWhatsAppInvitationMessage, openWhatsAppDirect } from '../utils/formatters';
import {
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  X,
  Phone,
  Share2,
  ChevronRight,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

interface WhatsAppDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  meeting: Meeting;
  invitations: MeetingInvitation[];
  onNotify?: (type: 'success' | 'error' | 'info', message: string, title?: string) => void;
}

export const WhatsAppDispatchModal: React.FC<WhatsAppDispatchModalProps> = ({
  isOpen,
  onClose,
  meeting,
  invitations,
  onNotify,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sentSet, setSentSet] = useState<Set<string>>(new Set());

  if (!isOpen || invitations.length === 0) return null;

  const currentInv = invitations[currentIndex] || invitations[0];
  const isDone = sentSet.has(currentInv.id);
  const progressPercent = Math.round((sentSet.size / invitations.length) * 100);

  const messageText = buildWhatsAppInvitationMessage(currentInv, meeting);

  const handleSendAndNext = () => {
    // Open WhatsApp
    openWhatsAppDirect(currentInv.invitee_phone, messageText);

    // Mark as sent in queue
    setSentSet(prev => {
      const next = new Set(prev);
      next.add(currentInv.id);
      return next;
    });

    if (onNotify) {
      onNotify('success', `Jemputan untuk ${currentInv.invitee_name} telah dibuka di WhatsApp.`);
    }

    // Auto move to next unsent if available
    if (currentIndex < invitations.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleSkip = () => {
    if (currentIndex < invitations.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-950 to-emerald-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-emerald-950 flex items-center justify-center shadow-md">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Pembantu Giliran WhatsApp</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-800 text-amber-300 border border-emerald-700">
                  Pantas
                </span>
              </div>
              <p className="text-xs text-emerald-200/90 mt-0.5">
                Hantar jemputan satu demi satu secara berurutan dengan satu klik.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="bg-slate-100 p-3 px-6 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className="font-semibold text-slate-700">
            Kemajuan: <span className="font-bold text-emerald-900">{sentSet.size}</span> daripada{' '}
            <span className="font-bold text-slate-900">{invitations.length}</span> dihantar
          </div>
          <div className="w-32 bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-600 h-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="font-mono font-bold text-emerald-800">{progressPercent}%</span>
        </div>

        {/* Invitee Card in Queue */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
            <span className="font-bold uppercase tracking-wider text-emerald-800">
              Penerima #{currentIndex + 1}
            </span>
            <div className="flex items-center gap-1">
              {sentSet.has(currentInv.id) ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Telah Dihantar
                </span>
              ) : (
                <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  Dalam Giliran
                </span>
              )}
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <h4 className="text-base font-bold text-slate-900">{currentInv.invitee_name}</h4>
            <p className="text-xs text-slate-600 font-medium mt-0.5">{currentInv.invitee_position}</p>
            <div className="mt-2 flex items-center gap-2 text-xs font-mono text-emerald-800 font-bold">
              <Phone className="w-3.5 h-3.5" />
              <span>+{currentInv.invitee_phone}</span>
            </div>
          </div>

          {/* Message Preview Box */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Pratonton Teks Rasmi WhatsApp:
            </span>
            <div className="p-3 bg-emerald-50/40 rounded-xl border border-emerald-100 text-[11px] text-slate-700 max-h-36 overflow-y-auto font-sans leading-relaxed whitespace-pre-wrap select-all">
              {messageText}
            </div>
          </div>
        </div>

        {/* Queue Actions */}
        <div className="p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            type="button"
            disabled={currentIndex === 0}
            onClick={handlePrev}
            className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl disabled:opacity-30 cursor-pointer"
          >
            Sebelumnya
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSkip}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl cursor-pointer"
            >
              Langkau
            </button>

            <button
              type="button"
              onClick={handleSendAndNext}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl shadow-md transition-all cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-amber-300" />
              <span>Hantar WhatsApp & Seterusnya</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
