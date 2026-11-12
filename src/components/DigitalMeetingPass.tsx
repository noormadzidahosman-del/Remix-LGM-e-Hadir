import React from 'react';
import { Meeting, MeetingInvitation } from '../types';
import { formatDateMalay, formatTimeMalay } from '../utils/formatters';
import { generateGoogleCalendarUrl, downloadIcsFile, getSmartLocationLinks } from '../utils/calendarUtils';
import { LgmEmblem } from './LgmEmblem';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  CalendarPlus,
  Download,
  Navigation,
  RefreshCw,
  Video,
  Share2,
  ShieldCheck,
  QrCode,
} from 'lucide-react';

interface DigitalMeetingPassProps {
  meeting: Meeting;
  invitation: MeetingInvitation;
  onEditResponse: () => void;
  onNotify?: (type: 'success' | 'error' | 'info', message: string, title?: string) => void;
}

export const DigitalMeetingPass: React.FC<DigitalMeetingPassProps> = ({
  meeting,
  invitation,
  onEditResponse,
  onNotify,
}) => {
  const locationInfo = getSmartLocationLinks(meeting.location_or_link);
  const passId = `LGM-${meeting.id.slice(-4).toUpperCase()}-${invitation.rsvp_token.slice(-4).toUpperCase()}`;

  const handleCopyPassDetails = async () => {
    const text = `PAS PENGESAHAN KEHADIRAN RASMI LGM\nMesyuarat: ${meeting.title}\nNama: ${invitation.invitee_name}\nTarikh: ${formatDateMalay(meeting.meeting_date)}\nMasa: ${formatTimeMalay(meeting.start_time)}\nLokasi: ${meeting.location_or_link}\nStatus: DISAHKAN HADIR (Kod: ${passId})`;
    try {
      await navigator.clipboard.writeText(text);
      if (onNotify) onNotify('success', 'Butiran pas mesyuarat telah disalin.');
    } catch (e) {
      // ignore
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-emerald-900/15 overflow-hidden transition-all animate-in zoom-in-95 duration-300">
      {/* Top Header Section (LGM Emerald & Gold) */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-white p-5 sm:p-6 relative">
        <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between pb-3 border-b border-emerald-800/80">
          <div className="flex items-center gap-2.5">
            <LgmEmblem size="xs" variant="dark" iconOnly={true} />
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-300">
                PAS KEHADIRAN DIGITAL RASMI LGM
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold bg-white/10 px-2.5 py-0.5 rounded-full text-emerald-200 border border-white/15">
            ID: {passId}
          </span>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
              Nama Pegawai / Pengarah
            </span>
            <h2 className="text-lg sm:text-xl font-black text-white leading-tight">
              {invitation.invitee_name}
            </h2>
            <p className="text-xs text-emerald-200/90 font-medium mt-0.5">
              {invitation.invitee_position}
            </p>
          </div>

          {/* Official Confirmed Stamp */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-black shadow-inner self-start sm:self-center">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>DISAHKAN HADIR</span>
          </div>
        </div>
      </div>

      {/* Ticket Perforation Notch Line (Realistic Digital Pass Feel) */}
      <div className="relative h-6 bg-slate-50 flex items-center justify-between overflow-hidden px-4">
        <div className="w-4 h-8 bg-slate-100 rounded-r-full -ml-6 shadow-inner border-r border-slate-300" />
        <div className="flex-1 border-b-2 border-dashed border-slate-300 mx-2" />
        <div className="w-4 h-8 bg-slate-100 rounded-l-full -mr-6 shadow-inner border-l border-slate-300" />
      </div>

      {/* Pass Details Body */}
      <div className="p-5 sm:p-6 bg-slate-50/50 space-y-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            Agenda / Tajuk Mesyuarat
          </span>
          <h3 className="text-base font-bold text-slate-900 mt-0.5 leading-snug">
            {meeting.title}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
            <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1 mb-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-800" />
              Tarikh Mesyuarat
            </span>
            <div className="font-bold text-slate-900 text-sm">
              {formatDateMalay(meeting.meeting_date)}
            </div>
          </div>

          <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
            <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1 mb-1">
              <Clock className="w-3.5 h-3.5 text-emerald-800" />
              Waktu Sidang
            </span>
            <div className="font-bold text-slate-900 text-sm font-mono">
              {formatTimeMalay(meeting.start_time)} - {formatTimeMalay(meeting.end_time)}
            </div>
          </div>
        </div>

        <div className="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs text-xs space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-amber-600" />
            Lokasi / Pautan Rasmi
          </span>
          <div className="font-semibold text-slate-800 leading-relaxed select-all">
            {meeting.location_or_link}
          </div>

          {/* Quick Nav Buttons (Waze / Google Maps / Online Join) */}
          <div className="pt-2 flex flex-wrap gap-2">
            {locationInfo.onlineUrl && (
              <a
                href={locationInfo.onlineUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold hover:bg-blue-100 transition-colors"
              >
                <Video className="w-3.5 h-3.5 text-blue-600" />
                <span>Sertai Mesyuarat Online</span>
              </a>
            )}

            {locationInfo.googleMapsUrl && (
              <a
                href={locationInfo.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 text-xs font-semibold transition-colors"
              >
                <Navigation className="w-3.5 h-3.5 text-emerald-700" />
                <span>Google Maps</span>
              </a>
            )}

            {locationInfo.wazeUrl && (
              <a
                href={locationInfo.wazeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-50 text-cyan-900 hover:bg-cyan-100 border border-cyan-200 text-xs font-semibold transition-colors"
              >
                <Navigation className="w-3.5 h-3.5 text-cyan-600" />
                <span>Pandu Waze</span>
              </a>
            )}
          </div>
        </div>

        {/* Digital QR Code Visual for Door Check-in Verification */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between gap-4">
          <div className="flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Pendaftaran Pantas Urus Setia
            </span>
            <p className="text-xs text-slate-700 font-medium mt-0.5">
              Imbas kod QR di kaunter pendaftaran dewan mesyuarat untuk merekodkan ketibaan fizikal anda.
            </p>
            <span className="text-[10px] font-mono font-bold text-emerald-800 block mt-1">
              Token: {invitation.rsvp_token.slice(0, 14)}...
            </span>
          </div>

          {/* Stylized QR Code Graphic */}
          <div className="w-16 h-16 bg-emerald-950 p-1.5 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-emerald-900">
            <QrCode className="w-full h-full text-amber-400" />
          </div>
        </div>

        {/* Action: Add to Calendar 1-Click (Google & .ics) */}
        <div className="pt-2 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            Kunci Masa Dalam Kalendar Peribadi:
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <a
              href={generateGoogleCalendarUrl(meeting)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 shadow-xs transition-colors"
            >
              <CalendarPlus className="w-4 h-4 text-amber-300" />
              <span>Tambah ke Google Calendar</span>
            </a>

            <button
              type="button"
              onClick={() => {
                downloadIcsFile(meeting);
                if (onNotify) onNotify('success', 'Fail kalendar (.ics) telah dimuat turun.');
              }}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 shadow-2xs transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-800" />
              <span>Muat Turun Kalendar (.ics)</span>
            </button>
          </div>
        </div>

        {/* Change Response Option */}
        <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={handleCopyPassDetails}
            className="text-slate-500 hover:text-slate-800 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Salin Butiran Pas</span>
          </button>

          <button
            type="button"
            onClick={onEditResponse}
            className="text-amber-800 hover:text-amber-950 font-bold flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Tukar Status Kehadiran</span>
          </button>
        </div>
      </div>
    </div>
  );
};
