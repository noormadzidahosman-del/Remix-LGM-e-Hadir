import React, { useState, useEffect } from 'react';
import { Meeting, MeetingInvitation, DirectoryMember } from '../types';
import { fetchRSVPData, submitRSVP, fetchDirectory } from '../services/api';
import { formatDateMalay, formatTimeMalay } from '../utils/formatters';
import { getSmartLocationLinks } from '../utils/calendarUtils';
import { LgmEmblem } from '../components/LgmEmblem';
import { DigitalMeetingPass } from '../components/DigitalMeetingPass';
import {
  Calendar,
  Clock,
  MapPin,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  UserCheck,
  RefreshCw,
  Navigation,
  Video,
  Sparkles,
  Users,
} from 'lucide-react';

interface RsvpPageProps {
  token: string;
  onNavigateHome?: () => void;
  onNotify?: (type: 'success' | 'error' | 'info', message: string, title?: string) => void;
}

export const RsvpPage: React.FC<RsvpPageProps> = ({ token, onNavigateHome, onNotify }) => {
  const [loading, setLoading] = useState(true);
  const [invitation, setInvitation] = useState<MeetingInvitation | null>(null);
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [directoryMembers, setDirectoryMembers] = useState<DirectoryMember[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  // Decision state: 'attending' | 'not_attending' | null
  const [selectedChoice, setSelectedChoice] = useState<'attending' | 'not_attending' | null>(null);
  const [representativeName, setRepresentativeName] = useState('');
  const [absenceReason, setAbsenceReason] = useState('');

  // Editing existing response state
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [submitSuccessMsg, setSubmitSuccessMsg] = useState('');
  const [networkError, setNetworkError] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      const [data, dirList] = await Promise.all([
        fetchRSVPData(token),
        fetchDirectory().catch(() => []),
      ]);
      setInvitation(data.invitation);
      setMeeting(data.meeting);
      setDirectoryMembers(dirList);

      // Pre-fill form if previously responded
      if (data.invitation.rsvp_status !== 'pending') {
        setSelectedChoice(data.invitation.rsvp_status);
        setRepresentativeName(data.invitation.representative_name || '');
        setAbsenceReason(data.invitation.absence_reason || '');
      }
    } catch (err: any) {
      setErrorMessage(
        err.message || 'Pautan jemputan tidak sah atau telah dibatalkan. Sila hubungi Urus Setia LGM.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  // One-Click "Hadir" handler with tactile feel & celebration micro-interaction (UI #4)
  const handleQuickAttending = async () => {
    setNetworkError('');
    setIsSubmitting(true);
    try {
      const res = await submitRSVP(token, {
        rsvp_status: 'attending',
        representative_name: null,
        absence_reason: null,
      });

      setInvitation(res.invitation);
      setSelectedChoice('attending');
      setIsEditing(false);
      setShowCelebration(true);
      setSubmitSuccessMsg('Terima kasih. Pengesahan KEHADIRAN anda telah berjaya direkodkan.');
      setTimeout(() => setShowCelebration(false), 4000);

      if (onNotify) {
        onNotify('success', 'Kehadiran anda berjaya direkodkan!', 'Pas Kehadiran Dijana');
      }
    } catch (err: any) {
      setNetworkError(err.message || 'Gagal menyambung ke pelayan. Sila cuba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit "Tidak Hadir" with optional representative & reason
  const handleSubmitNotAttending = async (e: React.FormEvent) => {
    e.preventDefault();
    setNetworkError('');
    setIsSubmitting(true);
    try {
      const res = await submitRSVP(token, {
        rsvp_status: 'not_attending',
        representative_name: representativeName.trim() || null,
        absence_reason: absenceReason.trim() || null,
      });

      setInvitation(res.invitation);
      setSelectedChoice('not_attending');
      setIsEditing(false);
      setSubmitSuccessMsg('Maklum balas TIDAK HADIR anda telah berjaya direkodkan.');
      if (onNotify) {
        onNotify('info', 'Maklum balas ketidakhadiran telah direkodkan.', 'Pengesahan Direkodkan');
      }
    } catch (err: any) {
      setNetworkError(err.message || 'Gagal menyimpan maklum balas. Sila cuba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 border-4 border-emerald-800 border-t-amber-500 rounded-full animate-spin mb-4" />
        <h2 className="text-base font-bold text-slate-800">Menyemak Pautan Rasmi LGM...</h2>
        <p className="text-xs text-slate-500 mt-1">Sila tunggu sebentar.</p>
      </div>
    );
  }

  // Error State: Invalid or Expired Token
  if (errorMessage || !invitation || !meeting) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-slate-200 text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-100">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Pautan Tidak Sah</h2>
          <p className="mt-3 text-sm text-slate-600 leading-relaxed font-medium">
            {errorMessage || 'Pautan jemputan tidak sah atau telah dibatalkan. Sila hubungi Urus Setia LGM.'}
          </p>

          <div className="mt-6 pt-6 border-t border-slate-100 text-xs text-slate-500 space-y-1">
            <p className="font-semibold text-slate-700">Urus Setia Lembaga Getah Malaysia</p>
            <p>E-mel: urussetia@lgm.gov.my</p>
            <p>Bangunan Getah Asli, 148 Jalan Ampang, Kuala Lumpur</p>
          </div>

          {onNavigateHome && (
            <button
              onClick={onNavigateHome}
              className="mt-6 w-full py-2.5 px-4 rounded-xl text-xs font-bold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 transition-colors cursor-pointer"
            >
              Kembali ke Laman Utama
            </button>
          )}
        </div>
      </div>
    );
  }

  const isMeetingClosed = meeting.status !== 'active';
  const hasResponded = invitation.rsvp_status !== 'pending' && !isEditing;
  const isAttending = invitation.rsvp_status === 'attending' && !isEditing;
  const locationInfo = getSmartLocationLinks(meeting.location_or_link);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-slate-100 py-6 px-4 sm:px-6 flex flex-col items-center">
      {/* Celebration Particle Effect (UI #4) */}
      {showCelebration && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden">
          <div className="p-4 bg-emerald-900/90 text-amber-300 font-bold text-sm rounded-2xl shadow-2xl flex items-center gap-2 border border-amber-400 animate-bounce">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <span>Kehadiran Anda Telah Disahkan! Pas Digital Dijana.</span>
          </div>
        </div>
      )}

      {/* Main Container Mobile-First */}
      <div className="w-full max-w-lg space-y-5 animate-in fade-in duration-200">
        {/* Top Header Card */}
        <div className="bg-emerald-950 text-white rounded-3xl p-5 shadow-lg border-b-4 border-amber-500 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <LgmEmblem size="sm" variant="dark" />
            <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-900/90 text-amber-300 border border-emerald-700/60 uppercase">
              One-Click RSVP
            </span>
          </div>

          <div className="mt-4 pt-3 border-t border-emerald-900/70">
            <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400/90">
              Jemputan Khas Pengesahan Kehadiran
            </div>
            <h1 className="text-lg sm:text-xl font-black text-white mt-0.5 leading-snug">
              {invitation.invitee_name}
            </h1>
            <p className="text-xs text-emerald-200/90 font-medium mt-0.5">
              {invitation.invitee_position}
            </p>
          </div>
        </div>

        {/* Success Alert */}
        {submitSuccessMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-xs font-bold text-emerald-900 flex items-center gap-2.5 shadow-xs animate-in zoom-in-95 duration-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{submitSuccessMsg}</span>
          </div>
        )}

        {/* Network Error Alert */}
        {networkError && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs font-semibold text-red-800 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p>{networkError}</p>
              <button
                type="button"
                onClick={loadData}
                className="mt-1 font-bold underline hover:text-red-950 cursor-pointer"
              >
                Muat semula pautan
              </button>
            </div>
          </div>
        )}

        {/* STATE A: MEETING IS CLOSED / COMPLETED */}
        {isMeetingClosed ? (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Pengesahan Kehadiran Telah Ditutup</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Mesyuarat ini telah ditandakan sebagai {meeting.status === 'completed' ? 'Selesai' : 'Dibatalkan'} oleh Urus Setia LGM.
            </p>
          </div>
        ) : isAttending ? (
          /* STATE B: CONFIRMED ATTENDING -> SHOW DIGITAL BOARDING PASS (UI #1 & UX #1, #3) */
          <div className="space-y-4">
            <DigitalMeetingPass
              meeting={meeting}
              invitation={invitation}
              onEditResponse={() => setIsEditing(true)}
              onNotify={onNotify}
            />
          </div>
        ) : hasResponded && invitation.rsvp_status === 'not_attending' ? (
          /* STATE C: CONFIRMED NOT ATTENDING */
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center shrink-0">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Status Pengesahan Anda
                </span>
                <h3 className="text-lg font-black text-rose-700 leading-tight">
                  DISAHKAN TIDAK HADIR
                </h3>
                <span className="text-[11px] text-slate-400">
                  Direkodkan pada:{' '}
                  {invitation.responded_at
                    ? new Date(invitation.responded_at).toLocaleString('ms-MY')
                    : 'Baru sahaja'}
                </span>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2.5 text-xs">
              <div>
                <span className="font-semibold text-slate-500 text-[11px]">Pegawai Wakil Dinamakan:</span>
                <p className="font-bold text-slate-900 mt-0.5 text-sm">
                  {invitation.representative_name || 'Tiada pegawai wakil dinamakan.'}
                </p>
              </div>

              {invitation.absence_reason && (
                <div className="pt-2 border-t border-slate-200/60">
                  <span className="font-semibold text-slate-500 text-[11px]">Sebab Ketidakhadiran:</span>
                  <p className="text-slate-700 mt-0.5">{invitation.absence_reason}</p>
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="w-full py-3 px-4 rounded-2xl text-xs font-bold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4 text-emerald-700" />
                <span>Tukar Jawapan (Batal Ketidakhadiran)</span>
              </button>
            </div>
          </div>
        ) : (
          /* STATE D: PENDING OR EDITING - MAKE DECISION FORM */
          <div className="space-y-5">
            {/* Meeting Details Card */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200/90 space-y-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Butiran Mesyuarat Rasmi
                </span>
                <h2 className="text-base sm:text-lg font-black text-slate-900 mt-2 leading-snug">
                  {meeting.title}
                </h2>
              </div>

              <div className="space-y-2.5 text-xs text-slate-700 pt-1">
                <div className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <Calendar className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Tarikh</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {formatDateMalay(meeting.meeting_date)}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <Clock className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Masa</span>
                    <span className="font-bold text-slate-900 text-sm font-mono">
                      {formatTimeMalay(meeting.start_time)} - {formatTimeMalay(meeting.end_time)}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Tempat / Lokasi</span>
                    <span className="font-semibold text-slate-800 leading-relaxed block select-all">
                      {meeting.location_or_link}
                    </span>

                    {/* Quick nav helper buttons */}
                    <div className="pt-2 flex flex-wrap gap-2">
                      {locationInfo.onlineUrl && (
                        <a
                          href={locationInfo.onlineUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-bold"
                        >
                          <Video className="w-3 h-3 text-blue-600" />
                          <span>Pautan Mesyuarat Online</span>
                        </a>
                      )}
                      {locationInfo.googleMapsUrl && (
                        <a
                          href={locationInfo.googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-semibold"
                        >
                          <Navigation className="w-3 h-3 text-emerald-700" />
                          <span>Google Maps</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {meeting.agenda_notes && (
                  <div className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <FileText className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Agenda</span>
                      <p className="font-medium text-slate-700 whitespace-pre-line text-xs mt-0.5 leading-relaxed">
                        {meeting.agenda_notes}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Decision Buttons Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-5">
              <div className="text-center">
                <h3 className="text-base font-black text-slate-900">
                  {isEditing ? 'Kemas Kini Pengesahan Kehadiran' : 'Sila Buat Pengesahan Kehadiran'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pengesahan terus direkodkan ke sistem urus setia dalam masa kurang 10 saat.
                </p>
              </div>

              {/* Two Big Responsive Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Green HADIR Button */}
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleQuickAttending}
                  className="min-h-[58px] py-4 px-5 rounded-2xl text-base font-black text-white bg-emerald-700 hover:bg-emerald-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting && selectedChoice === 'attending' ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-6 h-6 text-amber-300" />
                      <span>HADIR</span>
                    </>
                  )}
                </button>

                {/* Red TIDAK HADIR Button */}
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setSelectedChoice('not_attending')}
                  className={`min-h-[58px] py-4 px-5 rounded-2xl text-base font-black transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 ${
                    selectedChoice === 'not_attending'
                      ? 'bg-rose-700 text-white shadow-md'
                      : 'bg-rose-50 text-rose-800 border-2 border-rose-300 hover:bg-rose-100'
                  }`}
                >
                  <XCircle className="w-6 h-6" />
                  <span>TIDAK HADIR</span>
                </button>
              </div>

              {/* Expandable Form if TIDAK HADIR with Smart Representative Suggestions (UX #2) */}
              {selectedChoice === 'not_attending' && (
                <form
                  onSubmit={handleSubmitNotAttending}
                  className="pt-4 border-t border-slate-100 space-y-4 animate-in fade-in duration-200"
                >
                  <div className="p-3 bg-rose-50/70 rounded-2xl border border-rose-200 text-xs text-rose-900">
                    <span className="font-bold">Pengesahan Tidak Hadir:</span> Sila pilih atau isi
                    nama pegawai wakil pengganti serta sebab ketidakhadiran.
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Nama Pegawai Wakil / Pengganti <span className="text-slate-400 font-normal">(Opsyenal)</span>
                    </label>
                    <input
                      type="text"
                      value={representativeName}
                      onChange={e => setRepresentativeName(e.target.value)}
                      placeholder="cth: Ir. Ahmad Zaki bin Mansor (Ketua Penyelidik Kanan)"
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:bg-white focus:outline-hidden"
                    />

                    {/* Smart Representative Quick Suggestions (UX #2) */}
                    {directoryMembers.length > 0 && (
                      <div className="mt-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          Cadangan Pantas Pegawai Kanan LGM:
                        </span>
                        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                          {directoryMembers
                            .filter(m => m.full_name !== invitation.invitee_name)
                            .slice(0, 5)
                            .map(m => (
                              <button
                                key={m.id}
                                type="button"
                                onClick={() =>
                                  setRepresentativeName(`${m.full_name} (${m.position_unit})`)
                                }
                                className="text-[10px] font-medium bg-slate-100 hover:bg-emerald-50 hover:text-emerald-900 border border-slate-200 px-2 py-0.5 rounded-lg transition-colors cursor-pointer text-left"
                              >
                                + {m.full_name}
                              </button>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Sebab Tidak Hadir <span className="text-slate-400 font-normal">(Opsyenal)</span>
                    </label>
                    <textarea
                      rows={2}
                      value={absenceReason}
                      onChange={e => setAbsenceReason(e.target.value)}
                      placeholder="cth: Menghadiri mesyuarat bersama pihak kementerian / urusan rasmi luar"
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-3 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer"
                      >
                        Batal
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 py-3 px-5 rounded-xl text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Hantar Pengesahan Tidak Hadir</span>
                          <ArrowRight className="w-3.5 h-3.5 text-rose-200" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Footer info & helpdesk */}
        <div className="pt-4 text-center text-[11px] text-slate-500 space-y-1">
          <p className="font-semibold text-slate-600">
            Lembaga Getah Malaysia &bull; Portal Rasmi e-Hadir
          </p>
          <p className="text-slate-400">
            Sebarang pertanyaan, sila hubungi Urus Setia Mesyuarat di talian 03-9206 2000.
          </p>
          {onNavigateHome && (
            <div className="pt-3">
              <button
                type="button"
                onClick={onNavigateHome}
                className="text-[11px] text-emerald-800 hover:underline font-bold"
              >
                Log Masuk Urus Setia / Papan Pemuka
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
