import React, { useState, useEffect } from 'react';
import { MeetingWithInvitations, MeetingInvitation } from '../types';
import { fetchMeetings, fetchMeetingDetails } from '../services/api';
import { ExternalLink, X, Users, Calendar, ArrowRight, ShieldCheck } from 'lucide-react';
import { RSVPBadge } from '../components/StatusBadge';

interface RsvpDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectToken: (token: string) => void;
}

export const RsvpDemoModal: React.FC<RsvpDemoModalProps> = ({
  isOpen,
  onClose,
  onSelectToken,
}) => {
  const [meetings, setMeetings] = useState<MeetingWithInvitations[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    fetchMeetings()
      .then(async list => {
        const full = await Promise.all(
          list.slice(0, 3).map(m => fetchMeetingDetails(m.id).catch(() => null))
        );
        setMeetings(full.filter(Boolean) as MeetingWithInvitations[]);
      })
      .finally(() => setLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <ExternalLink className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Pilih Jemputan untuk Pandangan Pengarah (RSVP)
              </h3>
              <p className="text-xs text-slate-500">
                Uji pengalaman One-Click Magic Link dari perspektif penerima tanpa kata laluan.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-6 overflow-y-auto space-y-6">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-500">
              <div className="w-8 h-8 border-3 border-emerald-800 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Memuatkan data jemputan...
            </div>
          ) : meetings.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-8">Tiada mesyuarat aktif dijumpai.</p>
          ) : (
            meetings.map(m => (
              <div key={m.id} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-800" />
                  <span className="text-xs font-bold text-slate-800">{m.title}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {m.invitations.map(inv => (
                    <button
                      key={inv.id}
                      onClick={() => {
                        onSelectToken(inv.rsvp_token);
                        onClose();
                      }}
                      className="p-3 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl text-left transition-all group flex flex-col justify-between cursor-pointer"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="font-bold text-xs text-slate-900 group-hover:text-emerald-900">
                            {inv.invitee_name}
                          </span>
                          <RSVPBadge status={inv.rsvp_status} size="sm" />
                        </div>
                        <div className="text-[11px] text-slate-500 line-clamp-1">
                          {inv.invitee_position}
                        </div>
                      </div>

                      <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-emerald-800 font-bold group-hover:underline">
                        <span>Buka Paparan RSVP Pegawai</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
