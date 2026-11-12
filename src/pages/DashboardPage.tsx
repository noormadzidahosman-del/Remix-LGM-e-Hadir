import React, { useState, useEffect } from 'react';
import { Meeting, DirectoryMember } from '../types';
import { fetchMeetings, fetchDirectory, deleteMeeting, subscribeToSync } from '../services/api';
import { formatDateMalay, formatTimeMalay } from '../utils/formatters';
import { MeetingStatusBadge } from '../components/StatusBadge';
import { ConfirmationModal } from '../components/ConfirmationModal';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Search,
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (view: string, param?: string) => void;
  onNotify: (type: 'success' | 'error' | 'info', message: string, title?: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate, onNotify }) => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [directoryCount, setDirectoryCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [tabFilter, setTabFilter] = useState<'all' | 'active' | 'completed' | 'cancelled'>('active');

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<Meeting | null>(null);

  const loadData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const [meetingsData, dirData] = await Promise.all([fetchMeetings(), fetchDirectory()]);
      setMeetings(meetingsData);
      setDirectoryCount(dirData.length);
    } catch (err: any) {
      if (!silent) onNotify('error', 'Gagal memuatkan papan pemuka.');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToSync(() => {
      loadData(true);
    });
    return () => unsubscribe();
  }, []);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMeeting(deleteTarget.id);
      setMeetings(prev => prev.filter(m => m.id !== deleteTarget.id));
      onNotify('success', `Mesyuarat "${deleteTarget.title}" telah dipadam.`);
    } catch (err: any) {
      onNotify('error', err.message || 'Gagal memadam mesyuarat.');
    } finally {
      setDeleteTarget(null);
    }
  };

  const activeMeetings = meetings.filter(m => m.status === 'active');
  const completedMeetings = meetings.filter(m => m.status === 'completed');

  const filteredMeetings = meetings.filter(m => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.location_or_link.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = tabFilter === 'all' ? true : m.status === tabFilter;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-1">
            <TrendingUp className="w-4 h-4" />
            <span>Papan Pemuka Sekretariat Mesyuarat</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Pengurusan & Pengesahan Kehadiran
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Pantau status respon kehadiran Pengarah & Ketua Unit secara masa nyata (One-Click Magic Link).
          </p>
        </div>

        <button
          onClick={() => onNavigate('meetings/new')}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-sm transition-all cursor-pointer self-start md:self-center"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Cipta Mesyuarat Baru</span>
        </button>
      </div>

      {/* KPI Stats Overview */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Mesyuarat Aktif</span>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="text-3xl font-black text-emerald-900 tabular-nums">{activeMeetings.length}</div>
          <p className="text-[11px] text-slate-500 mt-1">Pautan RSVP sedang dibuka</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Mesyuarat Selesai</span>
            <CheckCircle2 className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-3xl font-black text-slate-800 tabular-nums">{completedMeetings.length}</div>
          <p className="text-[11px] text-slate-500 mt-1">Rekod diarkibkan</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Pegawai Direktori</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-3xl font-black text-slate-900 tabular-nums">{directoryCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Pengarah & Ketua Unit LGM</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-900 to-emerald-950 p-5 rounded-2xl text-white shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-200/80 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">One-Click Magic Link</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
              Pantas
            </span>
          </div>
          <div className="text-sm font-semibold text-emerald-100">
            Respon purata &lt; 10 saat tanpa kata laluan
          </div>
          <p className="text-[10px] text-emerald-300/70 mt-2">
            Meningkatkan kadar pengesahan kuorum awal
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        {/* Tab Filters */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs w-full sm:w-auto">
          <button
            onClick={() => setTabFilter('active')}
            className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              tabFilter === 'active'
                ? 'bg-emerald-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-emerald-900'
            }`}
          >
            Akan Datang ({activeMeetings.length})
          </button>
          <button
            onClick={() => setTabFilter('all')}
            className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              tabFilter === 'all'
                ? 'bg-emerald-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-emerald-900'
            }`}
          >
            Semua ({meetings.length})
          </button>
          <button
            onClick={() => setTabFilter('completed')}
            className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              tabFilter === 'completed'
                ? 'bg-emerald-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-emerald-900'
            }`}
          >
            Selesai ({completedMeetings.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Cari tajuk mesyuarat..."
            className="w-full pl-10 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-700"
          />
        </div>
      </div>

      {/* Meetings List */}
      <div className="mt-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-8 h-8 border-3 border-emerald-800 border-t-transparent rounded-full animate-spin" />
            <p className="mt-3 text-xs font-semibold text-slate-500">Memuatkan senarai mesyuarat...</p>
          </div>
        ) : filteredMeetings.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">Tiada Mesyuarat Dijumpai</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? `Tiada rekod mesyuarat sepadan dengan "${searchQuery}".`
                : 'Belum ada mesyuarat dicipta dalam kategori ini.'}
            </p>
            <button
              onClick={() => onNavigate('meetings/new')}
              className="mt-4 px-4 py-2 text-xs font-bold text-white bg-emerald-800 rounded-xl hover:bg-emerald-900 transition-colors cursor-pointer"
            >
              Cipta Mesyuarat Sekarang
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMeetings.map(meeting => (
              <div
                key={meeting.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <MeetingStatusBadge status={meeting.status} />
                    <span className="text-[11px] font-semibold text-slate-500">
                      ID: {meeting.id}
                    </span>
                  </div>

                  <h3
                    onClick={() => onNavigate('meetings/details', meeting.id)}
                    className="text-lg font-bold text-slate-900 group-hover:text-emerald-900 transition-colors cursor-pointer leading-snug"
                  >
                    {meeting.title}
                  </h3>

                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-emerald-800 shrink-0" />
                      <span className="font-semibold text-slate-800">{formatDateMalay(meeting.meeting_date)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-800 shrink-0" />
                      <span>{formatTimeMalay(meeting.start_time)} - {formatTimeMalay(meeting.end_time)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="truncate max-w-xs">{meeting.location_or_link}</span>
                    </div>
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 w-full md:w-auto justify-between md:justify-end">
                  <button
                    onClick={() => setDeleteTarget(meeting)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                    title="Padam mesyuarat"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onNavigate('meetings/details', meeting.id)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-900 hover:bg-emerald-950 shadow-xs transition-all cursor-pointer"
                  >
                    <span>Urus & Pantau Kehadiran</span>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(deleteTarget)}
        title="Sahkan Pemadaman Mesyuarat"
        message={`Adakah anda pasti ingin memadam rekod "${deleteTarget?.title}"? Semua pautan jemputan berkaitan mesyuarat ini akan dibatalkan.`}
        confirmText="Ya, Padam Mesyuarat"
        cancelText="Batal"
        isDestructive={true}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
