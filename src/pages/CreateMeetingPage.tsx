import React, { useState, useEffect } from 'react';
import { DirectoryMember } from '../types';
import { fetchDirectory, createMeeting } from '../services/api';
import {
  Calendar,
  Clock,
  MapPin,
  FileText,
  Users,
  UserPlus,
  Trash2,
  Check,
  AlertCircle,
  ArrowRight,
  ShieldAlert,
  Info,
} from 'lucide-react';

interface CreateMeetingPageProps {
  onSuccess: (meetingId: string) => void;
  onCancel: () => void;
  onNotify: (type: 'success' | 'error' | 'info', message: string, title?: string) => void;
}

interface AdhocInvitee {
  id: string;
  name: string;
  position: string;
  email: string;
  phone: string;
}

export const CreateMeetingPage: React.FC<CreateMeetingPageProps> = ({
  onSuccess,
  onCancel,
  onNotify,
}) => {
  // Form fields
  const [title, setTitle] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [startTime, setStartTime] = useState('09:30');
  const [endTime, setEndTime] = useState('12:30');
  const [locationOrLink, setLocationOrLink] = useState('');
  const [agendaNotes, setAgendaNotes] = useState('');

  // Invitee selection
  const [directoryMembers, setDirectoryMembers] = useState<DirectoryMember[]>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(new Set());
  const [adhocInvitees, setAdhocInvitees] = useState<AdhocInvitee[]>([]);

  // Adhoc form inline modal or drawer
  const [showAdhocForm, setShowAdhocForm] = useState(false);
  const [adhocName, setAdhocName] = useState('');
  const [adhocPosition, setAdhocPosition] = useState('');
  const [adhocEmail, setAdhocEmail] = useState('');
  const [adhocPhone, setAdhocPhone] = useState('');
  const [adhocError, setAdhocError] = useState('');

  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingDirectory, setIsLoadingDirectory] = useState(true);

  useEffect(() => {
    // Set default tomorrow date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 7);
    const dateStr = tomorrow.toISOString().split('T')[0];
    setMeetingDate(dateStr);

    fetchDirectory()
      .then(members => {
        setDirectoryMembers(members);
        // Pre-select active members by default for convenience
        const initialSelected = new Set(members.map(m => m.id));
        setSelectedMemberIds(initialSelected);
      })
      .catch(() => {
        onNotify('error', 'Gagal memuatkan direktori pegawai.');
      })
      .finally(() => {
        setIsLoadingDirectory(false);
      });
  }, []);

  const toggleSelectMember = (id: string) => {
    setSelectedMemberIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    setSelectedMemberIds(new Set(directoryMembers.map(m => m.id)));
  };

  const handleDeselectAll = () => {
    setSelectedMemberIds(new Set());
  };

  const handleAddAdhoc = (e: React.FormEvent) => {
    e.preventDefault();
    setAdhocError('');

    if (!adhocName.trim() || !adhocPosition.trim() || !adhocEmail.trim() || !adhocPhone.trim()) {
      setAdhocError('Sila lengkapkan semua medan jemputan ad-hoc.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adhocEmail.trim())) {
      setAdhocError('Format e-mel jemputan tidak sah.');
      return;
    }

    // Check duplicate with existing ad-hoc or selected directory
    const cleanEmail = adhocEmail.trim().toLowerCase();
    const existingAdhoc = adhocInvitees.find(a => a.email.toLowerCase() === cleanEmail);
    if (existingAdhoc) {
      setAdhocError('Jemputan dengan e-mel ini sudah wujud dalam senarai.');
      return;
    }

    const newAdhoc: AdhocInvitee = {
      id: 'adhoc-' + Math.random().toString(36).substring(2, 9),
      name: adhocName.trim(),
      position: adhocPosition.trim(),
      email: cleanEmail,
      phone: adhocPhone.trim().replace(/[^0-9]/g, ''),
    };

    setAdhocInvitees(prev => [...prev, newAdhoc]);
    setAdhocName('');
    setAdhocPosition('');
    setAdhocEmail('');
    setAdhocPhone('');
    setShowAdhocForm(false);
    onNotify('info', `Jemputan ad-hoc "${newAdhoc.name}" telah ditambah.`);
  };

  const removeAdhoc = (id: string) => {
    setAdhocInvitees(prev => prev.filter(a => a.id !== id));
  };

  const totalInvitedCount = selectedMemberIds.size + adhocInvitees.length;

  const handleSubmitMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Validations (FR-003)
    if (!title.trim() || !meetingDate || !startTime || !endTime || !locationOrLink.trim()) {
      setFormError('Sila lengkapkan semua butiran wajib mesyuarat.');
      return;
    }

    if (totalInvitedCount === 0) {
      setFormError('Sila pilih sekurang-kurangnya 1 orang jemputan daripada direktori atau jemputan ad-hoc.');
      return;
    }

    // Construct invitations payload
    const selectedMembers = directoryMembers.filter(m => selectedMemberIds.has(m.id));
    const invitationsPayload = [
      ...selectedMembers.map(m => ({
        member_id: m.id,
        invitee_name: m.full_name,
        invitee_position: m.position_unit,
        invitee_email: m.email,
        invitee_phone: m.phone_whatsapp,
      })),
      ...adhocInvitees.map(a => ({
        member_id: null,
        invitee_name: a.name,
        invitee_position: a.position,
        invitee_email: a.email,
        invitee_phone: a.phone,
      })),
    ];

    try {
      setIsSubmitting(true);
      const createdMeeting = await createMeeting({
        title: title.trim(),
        meeting_date: meetingDate,
        start_time: startTime,
        end_time: endTime,
        location_or_link: locationOrLink.trim(),
        agenda_notes: agendaNotes.trim(),
        invitations: invitationsPayload,
      });

      onNotify('success', `Mesyuarat "${createdMeeting.title}" berjaya dicipta berserta ${createdMeeting.invitations.length} Pautan Pantas!`);
      onSuccess(createdMeeting.id);
    } catch (err: any) {
      setFormError(err.message || 'Ralat mencipta mesyuarat.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200">
        <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-1">
          <Calendar className="w-4 h-4" />
          <span>Pengurusan Mesyuarat</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Cipta Mesyuarat Baru & Jana Pautan RSVP
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Isi maklumat mesyuarat rasmi dan pilih senarai Pengarah atau Ketua Unit yang terlibat. Sistem
          akan menjana Pautan Pantas peribadi yang unik untuk setiap jemputan secara automatik.
        </p>
      </div>

      <form onSubmit={handleSubmitMeeting} className="mt-8 space-y-8">
        {formError && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-sm font-semibold text-red-800 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
            <span>{formError}</span>
          </div>
        )}

        {/* Section 1: Meeting Details */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h2 className="text-lg font-bold text-slate-900">Maklumat Utama Mesyuarat</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Tajuk Mesyuarat Rasmi <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="cth: Mesyuarat Jawatankuasa Pengurusan Tertinggi LGM Bil. 5/2026"
                className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-700 focus:bg-white focus:outline-hidden font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Tarikh Mesyuarat <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={meetingDate}
                    onChange={e => setMeetingDate(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-700 focus:bg-white focus:outline-hidden font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Masa Mula <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-700 focus:bg-white focus:outline-hidden font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Masa Tamat <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-700 focus:bg-white focus:outline-hidden font-medium"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Lokasi Fizikal atau Pautan Dalam Talian (Online) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <MapPin className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  value={locationOrLink}
                  onChange={e => setLocationOrLink(e.target.value)}
                  placeholder="cth: Bilik Mesyuarat Utama, Tingkat 16, Bangunan Getah Asli, Jalan Ampang / MS Teams"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-700 focus:bg-white focus:outline-hidden font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Agenda Ringkas / Catatan Penting <span className="text-slate-400 font-normal">(Opsyenal)</span>
              </label>
              <textarea
                rows={4}
                value={agendaNotes}
                onChange={e => setAgendaNotes(e.target.value)}
                placeholder="1. Perutusan Pengerusi&#10;2. Pengesahan Minit Mesyuarat Lalu&#10;3. Pembentangan Kertas Cadangan..."
                className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-700 focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Invitee Selection */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Pemilihan Jemputan Mesyuarat</h2>
                <p className="text-xs text-slate-500">
                  Tandakan nama jemputan dari Direktori Tetap atau masukkan jemputan ad-hoc.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <button
                type="button"
                onClick={handleSelectAll}
                className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
              >
                Pilih Semua
              </button>
              <button
                type="button"
                onClick={handleDeselectAll}
                className="px-2.5 py-1 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Nyahpilih Semua
              </button>
              <button
                type="button"
                onClick={() => setShowAdhocForm(true)}
                className="flex items-center gap-1 px-3 py-1 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors cursor-pointer border border-amber-300/50"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Jemputan Luar / Ad-hoc</span>
              </button>
            </div>
          </div>

          {/* Directory Member Checklist */}
          <div>
            <div className="flex items-center justify-between mb-3 text-xs font-bold text-slate-700 uppercase tracking-wider">
              <span>Direktori Tetap Pegawai ({selectedMemberIds.size} dipilih)</span>
            </div>

            {isLoadingDirectory ? (
              <div className="p-8 text-center text-xs text-slate-500">Memuatkan direktori...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
                {directoryMembers.map(member => {
                  const isChecked = selectedMemberIds.has(member.id);
                  return (
                    <label
                      key={member.id}
                      className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-emerald-50/70 border-emerald-300 text-slate-900 shadow-xs'
                          : 'bg-slate-50 border-slate-200/80 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleSelectMember(member.id)}
                        className="mt-1 w-4 h-4 rounded text-emerald-800 focus:ring-emerald-700 border-slate-300"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-900 leading-tight">
                          {member.full_name}
                        </div>
                        <div className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                          {member.position_unit}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 font-mono">
                          {member.email} &bull; {member.phone_whatsapp}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Ad-hoc Invitees List if any */}
          {adhocInvitees.length > 0 && (
            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-2.5">
                Jemputan Luar / Ad-hoc ({adhocInvitees.length})
              </h4>
              <div className="space-y-2">
                {adhocInvitees.map(adhoc => (
                  <div
                    key={adhoc.id}
                    className="flex items-center justify-between p-3 bg-amber-50/60 rounded-xl border border-amber-200 text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900">{adhoc.name}</span>
                      <span className="text-slate-600 ml-1.5">({adhoc.position})</span>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {adhoc.email} &bull; {adhoc.phone}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAdhoc(adhoc.id)}
                      className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Inline Summary Count */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">Jumlah Penerima Jemputan:</span>
            <span className="font-bold text-sm text-emerald-950 bg-white px-3 py-1 rounded-lg border border-slate-200">
              {totalInvitedCount} Orang Jemputan
            </span>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto px-6 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-200 bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Cipta Mesyuarat & Jana Pautan Pantas</span>
                <ArrowRight className="w-4 h-4 text-amber-300" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Adhoc Form Modal */}
      {showAdhocForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Tambah Jemputan Luar / Ad-hoc
            </h3>

            {adhocError && (
              <div className="mb-3 p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
                {adhocError}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Penuh</label>
                <input
                  type="text"
                  value={adhocName}
                  onChange={e => setAdhocName(e.target.value)}
                  placeholder="cth: Ir. Haris bin Omar"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Jawatan / Agensi Luar</label>
                <input
                  type="text"
                  value={adhocPosition}
                  onChange={e => setAdhocPosition(e.target.value)}
                  placeholder="cth: Wakil Kementerian Perladangan & Komoditi"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Alamat E-mel</label>
                <input
                  type="email"
                  value={adhocEmail}
                  onChange={e => setAdhocEmail(e.target.value)}
                  placeholder="cth: haris@kpk.gov.my"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">No. Telefon (WhatsApp)</label>
                <input
                  type="text"
                  value={adhocPhone}
                  onChange={e => setAdhocPhone(e.target.value)}
                  placeholder="cth: 60129876543"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-700 font-mono"
                />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAdhocForm(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleAddAdhoc}
                className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg cursor-pointer"
              >
                Tambah Jemputan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
