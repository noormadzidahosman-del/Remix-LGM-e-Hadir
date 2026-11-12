import React, { useState, useEffect } from 'react';
import { MeetingWithInvitations, MeetingInvitation } from '../types';
import {
  fetchMeetingDetails,
  updateMeetingStatus,
  deleteMeeting,
  sendBulkEmail,
  subscribeToSync,
} from '../services/api';
import {
  formatDateMalay,
  formatTimeMalay,
  formatDateTimeNice,
  buildWhatsAppInvitationMessage,
  buildWhatsAppReminderMessage,
  openWhatsAppDirect,
  getFullRsvpUrl,
} from '../utils/formatters';
import { exportToCSV, exportToPDF, PdfExportMode } from '../utils/exportUtils';
import { RSVPBadge, MeetingStatusBadge } from '../components/StatusBadge';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { QuorumGauge } from '../components/QuorumGauge';
import { WhatsAppDispatchModal } from '../components/WhatsAppDispatchModal';
import {
  Calendar,
  Clock,
  MapPin,
  FileText,
  Users,
  Send,
  Download,
  Share2,
  Copy,
  ExternalLink,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Mail,
  MessageSquare,
  ArrowLeft,
  BellRing,
  FileSpreadsheet,
  Check,
  ChevronDown,
  Trash2,
  Sparkles,
  FileCheck,
  Layers,
} from 'lucide-react';

interface MeetingDetailsPageProps {
  meetingId: string;
  onBack: () => void;
  onOpenRsvp: (token: string) => void;
  onNotify: (type: 'success' | 'error' | 'info', message: string, title?: string) => void;
}

export const MeetingDetailsPage: React.FC<MeetingDetailsPageProps> = ({
  meetingId,
  onBack,
  onOpenRsvp,
  onNotify,
}) => {
  const [meeting, setMeeting] = useState<MeetingWithInvitations | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'attending' | 'not_attending' | 'pending'>('all');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Modals
  const [isBulkEmailModalOpen, setIsBulkEmailModalOpen] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [isPdfChoiceModalOpen, setIsPdfChoiceModalOpen] = useState(false);

  // Scroll detection for Sticky Action Bar (UI #3)
  const [showStickyBar, setShowStickyBar] = useState(false);

  const loadMeeting = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const data = await fetchMeetingDetails(meetingId);
      setMeeting(data);
    } catch (err: any) {
      if (!silent) onNotify('error', 'Gagal memuatkan maklumat mesyuarat.');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadMeeting();

    const unsubscribe = subscribeToSync(() => {
      loadMeeting(true);
    });

    const interval = setInterval(() => {
      loadMeeting(true);
    }, 3000);

    const handleScroll = () => {
      if (window.scrollY > 280) {
        setShowStickyBar(true);
      } else {
        setShowStickyBar(false);
      }
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      unsubscribe();
      clearInterval(interval);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [meetingId]);

  if (loading && !meeting) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-800 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-sm font-semibold text-slate-600">Memuatkan data mesyuarat...</p>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900">Mesyuarat Tidak Dijumpai</h2>
        <p className="text-sm text-slate-500 mt-1">
          Rekod mesyuarat ini mungkin telah dipadam atau pautan tidak sah.
        </p>
        <button
          onClick={onBack}
          className="mt-6 px-4 py-2 text-sm font-semibold text-emerald-800 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors"
        >
          Kembali ke Senarai Mesyuarat
        </button>
      </div>
    );
  }

  const invitations = meeting.invitations || [];
  const total = invitations.length;
  const attending = invitations.filter(i => i.rsvp_status === 'attending').length;
  const notAttending = invitations.filter(i => i.rsvp_status === 'not_attending').length;
  const pending = invitations.filter(i => i.rsvp_status === 'pending').length;
  const attendanceRate = total > 0 ? Math.round((attending / total) * 100) : 0;
  const unsentEmailCount = invitations.filter(i => !i.email_sent_at).length;

  const handleCopyWhatsApp = async (invitation: MeetingInvitation) => {
    const text = buildWhatsAppInvitationMessage(invitation, meeting);
    try {
      await navigator.clipboard.writeText(text);
      setCopiedToken(invitation.rsvp_token);
      setTimeout(() => setCopiedToken(null), 2500);
      onNotify('success', `Mesej WhatsApp untuk ${invitation.invitee_name} berjaya disalin!`, 'Mesej Disalin!');
    } catch (err) {
      onNotify('error', 'Gagal menyalin mesej ke papan keratan.');
    }
  };

  const handleCopyReminder = async (invitation: MeetingInvitation) => {
    const text = buildWhatsAppReminderMessage(invitation, meeting);
    try {
      await navigator.clipboard.writeText(text);
      onNotify('success', `Mesej peringatan susulan untuk ${invitation.invitee_name} disalin!`, 'Peringatan Disalin!');
    } catch (err) {
      onNotify('error', 'Gagal menyalin peringatan.');
    }
  };

  const handleSendBulkEmailConfirm = async () => {
    try {
      setIsSendingEmail(true);
      const res = await sendBulkEmail(meeting.id);
      setIsBulkEmailModalOpen(false);
      onNotify('success', res.message, 'E-mel Dihantar');
      loadMeeting(true);
    } catch (err: any) {
      onNotify('error', err.message || 'Gagal menghantar e-mel pukal.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleStatusChange = async (newStatus: 'active' | 'completed' | 'cancelled') => {
    try {
      await updateMeetingStatus(meeting.id, newStatus);
      setMeeting(prev => (prev ? { ...prev, status: newStatus } : null));
      onNotify('success', `Status mesyuarat dikemas kini kepada "${newStatus}".`);
    } catch (err: any) {
      onNotify('error', err.message || 'Gagal menukar status mesyuarat.');
    }
  };

  const handleDeleteMeeting = async () => {
    try {
      await deleteMeeting(meeting.id);
      onNotify('success', `Mesyuarat "${meeting.title}" berjaya dipadam.`);
      onBack();
    } catch (err: any) {
      onNotify('error', err.message || 'Gagal memadam mesyuarat.');
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  const handleGeneratePdf = (mode: PdfExportMode) => {
    exportToPDF(meeting, invitations, mode);
    setIsPdfChoiceModalOpen(false);
    onNotify(
      'success',
      mode === 'sign_in_sheet'
        ? 'Borang Pendaftaran Meja Urus Setia (dengan kolum tandatangan) dijana!'
        : 'Laporan Kehadiran Rasmi LGM berjaya dimuat turun.'
    );
  };

  // Filter invitations table
  const filteredInvitations = invitations.filter(inv => {
    const matchesSearch =
      inv.invitee_name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      inv.invitee_position.toLowerCase().includes(searchFilter.toLowerCase()) ||
      inv.invitee_email.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (inv.representative_name && inv.representative_name.toLowerCase().includes(searchFilter.toLowerCase()));

    const matchesStatus = statusFilter === 'all' ? true : inv.rsvp_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
      {/* UI #3: STICKY FLOATING ACTION BAR (Appears on Scroll) */}
      {showStickyBar && (
        <div className="fixed top-16 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-md py-2.5 px-4 sm:px-8 animate-in slide-in-from-top-2 duration-200">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <h4 className="text-xs font-bold text-slate-900 truncate max-w-md hidden sm:block">
                {meeting.title}
              </h4>
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <span className="tabular-nums">{attending}/{total} Hadir</span>
                <span>&bull;</span>
                <span className="tabular-nums">{attendanceRate}% Kuorum</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsDispatchModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-2xs transition-all cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Giliran WhatsApp</span>
              </button>

              <button
                onClick={() => setIsPdfChoiceModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 shadow-2xs transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-800" />
                <span>Eksport PDF</span>
              </button>

              <button
                onClick={() => exportToCSV(meeting, invitations)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 shadow-2xs transition-all cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-800" />
                <span>CSV</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top back button & breadcrumbs */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-900 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Senarai</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Status Switcher Dropdown */}
          <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-xl border border-slate-200 text-xs">
            <span className="font-semibold text-slate-500">Status:</span>
            <MeetingStatusBadge status={meeting.status} />
            <select
              value={meeting.status}
              onChange={e => handleStatusChange(e.target.value as any)}
              className="bg-transparent font-medium text-slate-700 outline-hidden cursor-pointer"
            >
              <option value="active">Aktif (Buka RSVP)</option>
              <option value="completed">Selesai (Tutup RSVP)</option>
              <option value="cancelled">Dibatalkan</option>
            </select>
          </div>

          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
            title="Padam Rekod Mesyuarat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Meeting Banner Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden p-6 sm:p-8 relative">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-900 via-emerald-700 to-amber-500" />

        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
                Mesyuarat Rasmi LGM
              </span>
              <MeetingStatusBadge status={meeting.status} />
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              {meeting.title}
            </h1>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
              <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <Calendar className="w-4 h-4 text-emerald-800 shrink-0" />
                <span className="font-semibold text-slate-800">{formatDateMalay(meeting.meeting_date)}</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <Clock className="w-4 h-4 text-emerald-800 shrink-0" />
                <span className="font-semibold text-slate-800 tabular-nums">
                  {formatTimeMalay(meeting.start_time)} - {formatTimeMalay(meeting.end_time)}
                </span>
              </div>
              <div className="sm:col-span-2 flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span className="font-medium text-slate-700 select-all">{meeting.location_or_link}</span>
              </div>
            </div>

            {meeting.agenda_notes && (
              <div className="mt-4 p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/60 text-xs text-slate-700">
                <div className="font-bold uppercase tracking-wider text-[10px] text-slate-500 mb-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Agenda & Catatan Mesyuarat</span>
                </div>
                <p className="whitespace-pre-line leading-relaxed">{meeting.agenda_notes}</p>
              </div>
            )}
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0 min-w-[230px]">
            {/* UX #4: Pembantu Giliran WhatsApp */}
            <button
              onClick={() => setIsDispatchModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-xs transition-all cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-white" />
              <span>Giliran WhatsApp Pantas</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white font-extrabold">
                Baru
              </span>
            </button>

            <button
              onClick={() => setIsBulkEmailModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-900 hover:bg-emerald-950 shadow-xs transition-all cursor-pointer"
            >
              <Send className="w-4 h-4 text-amber-400" />
              <span>Hantar E-mel Pukal</span>
              {unsentEmailCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-500 text-slate-950 font-black tabular-nums">
                  {unsentEmailCount}
                </span>
              )}
            </button>

            {/* UX #5: Pilihan Eksport PDF Rasmi vs Borang Pendaftaran Meja */}
            <button
              onClick={() => setIsPdfChoiceModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 shadow-2xs transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-800" />
              <span>Eksport PDF LGM</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={() => exportToCSV(meeting, invitations)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 shadow-2xs transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-800" />
              <span>Eksport CSV (Excel)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Statistics Cards + Circular Quorum Gauge (UI #2 & UI #5) */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Invitees */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Jumlah Jemputan</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums">{total}</div>
          <div className="text-[11px] text-slate-500 mt-1">100% penerima berdaftar</div>
        </div>

        {/* Attending */}
        <div className="bg-emerald-50/70 p-5 rounded-2xl border border-emerald-200 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-900 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Hadir</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-800 tabular-nums">{attending}</div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1 tabular-nums">
            {total > 0 ? Math.round((attending / total) * 100) : 0}% daripada kuorum
          </div>
        </div>

        {/* Not Attending */}
        <div className="bg-rose-50/70 p-5 rounded-2xl border border-rose-200 shadow-2xs">
          <div className="flex items-center justify-between text-rose-900 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Tidak Hadir</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-700 tabular-nums">{notAttending}</div>
          <div className="text-[11px] text-rose-600 font-semibold mt-1 tabular-nums">
            {invitations.filter(i => i.representative_name).length} ada wakil pengganti
          </div>
        </div>

        {/* Pending */}
        <div className="bg-amber-50/70 p-5 rounded-2xl border border-amber-200 shadow-2xs">
          <div className="flex items-center justify-between text-amber-900 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Belum Respon</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-800 tabular-nums">{pending}</div>
          <div className="text-[11px] text-amber-700 font-semibold mt-1">
            Perlu tindakan susulan
          </div>
        </div>

        {/* UI #2: CIRCULAR QUORUM GAUGE CARD */}
        <div className="col-span-1 md:col-span-2 lg:col-span-1 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-center">
          <QuorumGauge attending={attending} total={total} size="sm" />
        </div>
      </div>

      {/* Invitations Table Section */}
      <div className="mt-8 bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        {/* Table Filters & Search Header */}
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">
              Senarai Jemputan & Maklum Balas Kehadiran
            </h2>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full tabular-nums">
              {filteredInvitations.length} rekod
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status Pills */}
            <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer tabular-nums ${
                  statusFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua ({total})
              </button>
              <button
                onClick={() => setStatusFilter('attending')}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer tabular-nums ${
                  statusFilter === 'attending'
                    ? 'bg-emerald-100 text-emerald-900 shadow-2xs'
                    : 'text-slate-600 hover:text-emerald-800'
                }`}
              >
                Hadir ({attending})
              </button>
              <button
                onClick={() => setStatusFilter('not_attending')}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer tabular-nums ${
                  statusFilter === 'not_attending'
                    ? 'bg-rose-100 text-rose-900 shadow-2xs'
                    : 'text-slate-600 hover:text-rose-800'
                }`}
              >
                Tidak Hadir ({notAttending})
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer tabular-nums ${
                  statusFilter === 'pending'
                    ? 'bg-amber-100 text-amber-900 shadow-2xs'
                    : 'text-slate-600 hover:text-amber-800'
                }`}
              >
                Belum Respon ({pending})
              </button>
            </div>

            {/* Search Input */}
            <input
              type="text"
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              placeholder="Cari pegawai / wakil..."
              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-700"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4 w-12 text-center">Bil</th>
                <th className="py-3.5 px-4">Nama Pengarah / Pegawai</th>
                <th className="py-3.5 px-4">Jawatan & Bahagian</th>
                <th className="py-3.5 px-4">Status RSVP</th>
                <th className="py-3.5 px-4">Nama Wakil / Sebab Tidak Hadir</th>
                <th className="py-3.5 px-4">Masa Respon</th>
                <th className="py-3.5 px-4 text-right">Tindakan Pantas (WhatsApp / Uji Pautan)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvitations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    Tiada rekod jemputan berpadanan dengan penapis.
                  </td>
                </tr>
              ) : (
                filteredInvitations.map((inv, index) => {
                  const isPending = inv.rsvp_status === 'pending';
                  const isCopied = copiedToken === inv.rsvp_token;

                  return (
                    <tr
                      key={inv.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      <td className="py-3.5 px-4 text-center font-medium text-slate-400 tabular-nums">
                        {index + 1}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-[13px]">
                          {inv.invitee_name}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2 mt-0.5">
                          <span>{inv.invitee_email}</span>
                          <span>&bull;</span>
                          <span className="tabular-nums">+{inv.invitee_phone}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-700 max-w-[220px]">
                        {inv.invitee_position}
                      </td>

                      <td className="py-3.5 px-4">
                        <RSVPBadge status={inv.rsvp_status} size="sm" />
                      </td>

                      <td className="py-3.5 px-4 max-w-[240px]">
                        {inv.rsvp_status === 'not_attending' ? (
                          <div className="space-y-0.5">
                            {inv.representative_name ? (
                              <div className="font-semibold text-slate-900 text-xs">
                                <span className="text-slate-500 font-normal">Wakil: </span>
                                {inv.representative_name}
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">Tiada wakil dinamakan</span>
                            )}
                            {inv.absence_reason && (
                              <div className="text-[11px] text-slate-600 line-clamp-2">
                                <span className="text-slate-500 font-normal">Sebab: </span>
                                {inv.absence_reason}
                              </div>
                            )}
                          </div>
                        ) : inv.rsvp_status === 'attending' ? (
                          <span className="text-emerald-700 font-medium">Disahkan Hadir Sendiri</span>
                        ) : (
                          <span className="text-slate-400 italic">-</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap font-mono text-[11px] tabular-nums">
                        {formatDateTimeNice(inv.responded_at)}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Salin WhatsApp */}
                          <button
                            type="button"
                            onClick={() => handleCopyWhatsApp(inv)}
                            title="Salin templat jemputan WhatsApp rasmi"
                            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              isCopied
                                ? 'bg-emerald-700 text-white shadow-xs'
                                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                            }`}
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                            <span>{isCopied ? 'Disalin' : 'Salin WhatsApp'}</span>
                          </button>

                          {/* Direct WA Web Launch */}
                          <button
                            type="button"
                            onClick={() => {
                              const text = isPending
                                ? buildWhatsAppReminderMessage(inv, meeting)
                                : buildWhatsAppInvitationMessage(inv, meeting);
                              openWhatsAppDirect(inv.invitee_phone, text);
                            }}
                            title="Buka terus WhatsApp Web / Aplikasi"
                            className="p-1.5 text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors cursor-pointer"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>

                          {/* Salin Peringatan (khusus untuk Belum Respon) */}
                          {isPending && (
                            <button
                              type="button"
                              onClick={() => handleCopyReminder(inv)}
                              title="Salin mesej peringatan sopan (Follow-up)"
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-300 transition-colors cursor-pointer"
                            >
                              <BellRing className="w-3.5 h-3.5 text-amber-700" />
                              <span className="hidden sm:inline">Peringatan</span>
                            </button>
                          )}

                          {/* Uji Pautan RSVP Penerima */}
                          <button
                            type="button"
                            onClick={() => onOpenRsvp(inv.rsvp_token)}
                            title="Buka Halaman RSVP Pegawai Ini (One-Click Magic Link)"
                            className="flex items-center gap-1 p-1.5 text-slate-500 hover:text-emerald-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* UX #5: PDF CHOICE MODAL (Status Report vs Physical Sign-in Sheet) */}
      {isPdfChoiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 p-6">
            <h3 className="text-base font-bold text-slate-900 mb-2">Pilih Format Eksport PDF Rasmi LGM</h3>
            <p className="text-xs text-slate-500 mb-4">
              Sila pilih jenis dokumen PDF yang ingin dijana mengikut keperluan mesyuarat:
            </p>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => handleGeneratePdf('status_report')}
                className="w-full p-4 rounded-2xl border border-slate-200 hover:border-emerald-600 bg-slate-50 hover:bg-emerald-50/60 text-left transition-all group flex items-start gap-3 cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-950">
                    1. Laporan Pengesahan Kehadiran Rasmi
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    Lengkap dengan status terkini (*Hadir/Tidak/Wakil*), metrik kuorum, dan catatan untuk Pengerusi & Urus Setia.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleGeneratePdf('sign_in_sheet')}
                className="w-full p-4 rounded-2xl border border-slate-200 hover:border-amber-600 bg-slate-50 hover:bg-amber-50/60 text-left transition-all group flex items-start gap-3 cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center shrink-0 mt-0.5">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-950">
                    2. Borang Kehadiran & Tandatangan Fizikal
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    Format pendaftaran di meja pintu mesyuarat dengan kolum waktu ketibaan dan ruangan tandatangan pen kosong.
                  </p>
                </div>
              </button>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 text-right">
              <button
                type="button"
                onClick={() => setIsPdfChoiceModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UX #4: WHATSAPP DISPATCH MODAL */}
      <WhatsAppDispatchModal
        isOpen={isDispatchModalOpen}
        onClose={() => setIsDispatchModalOpen(false)}
        meeting={meeting}
        invitations={invitations}
        onNotify={onNotify}
      />

      {/* Bulk Email Confirmation Modal */}
      {isBulkEmailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 p-6 sm:p-7">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
                <Send className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Hantar Jemputan E-mel Pukal</h3>
                <p className="text-xs text-slate-500">
                  Edaran Pautan Pantas Rasmi kepada Semua Jemputan
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3 text-xs text-slate-600">
              <p>
                Sistem akan menghantar jemputan mesyuarat berserta pautan One-Click RSVP unik kepada
                semua jemputan yang belum dihantar e-mel rasmi.
              </p>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex justify-between py-1">
                  <span className="font-medium text-slate-500">Jumlah Jemputan:</span>
                  <span className="font-bold text-slate-800 tabular-nums">{total} orang</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="font-medium text-slate-500">Belum Dihantar E-mel:</span>
                  <span className="font-bold text-emerald-800 tabular-nums">{unsentEmailCount} orang</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="font-medium text-slate-500">Sudah Dihantar:</span>
                  <span className="font-bold text-slate-600 tabular-nums">{total - unsentEmailCount} orang</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsBulkEmailModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isSendingEmail}
                onClick={handleSendBulkEmailConfirm}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isSendingEmail ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5 text-amber-300" />
                )}
                <span>Sahkan & Hantar Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Padam Rekod Mesyuarat"
        message={`Adakah anda pasti ingin memadam mesyuarat "${meeting.title}" berserta semua data kehadiran jemputannya? Tindakan ini tidak boleh dipulihkan.`}
        confirmText="Ya, Padam Mesyuarat"
        cancelText="Batal"
        isDestructive={true}
        onConfirm={handleDeleteMeeting}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
};
