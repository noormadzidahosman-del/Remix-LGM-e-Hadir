import { Meeting } from '../types';

/**
 * Format date-time for iCalendar and Google Calendar
 * Example: 2026-11-26 and 09:30 -> 20261126T013000Z (UTC format)
 */
function formatUtcDateTime(dateStr: string, timeStr: string): string {
  // Assume Malaysia Standard Time (UTC+8)
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hour, minute] = timeStr.split(':').map(Number);
  // Create Date object representing MYT (UTC+8)
  const dt = new Date(Date.UTC(year, month - 1, day, hour - 8, minute, 0));
  return dt.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

/**
 * Generates direct URL to add event to Google Calendar
 */
export function generateGoogleCalendarUrl(meeting: Meeting): string {
  const startUtc = formatUtcDateTime(meeting.meeting_date, meeting.start_time);
  const endUtc = formatUtcDateTime(meeting.meeting_date, meeting.end_time);

  const title = encodeURIComponent(meeting.title);
  const details = encodeURIComponent(
    `Jemputan Mesyuarat Rasmi Lembaga Getah Malaysia (LGM)\n\nAgenda:\n${meeting.agenda_notes || 'Agenda rasmi'}\n\nPengesahan dibuat melalui portal LGM e-Hadir.`
  );
  const location = encodeURIComponent(meeting.location_or_link);

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startUtc}/${endUtc}&details=${details}&location=${location}`;
}

/**
 * Generates .ics file content for Apple Calendar, Outlook, and Android
 */
export function downloadIcsFile(meeting: Meeting): void {
  const startUtc = formatUtcDateTime(meeting.meeting_date, meeting.start_time);
  const endUtc = formatUtcDateTime(meeting.meeting_date, meeting.end_time);
  const nowUtc = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const cleanDescription = (meeting.agenda_notes || 'Mesyuarat Rasmi Lembaga Getah Malaysia')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,');
  const cleanLocation = meeting.location_or_link.replace(/\n/g, ' ').replace(/,/g, '\\,');

  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Lembaga Getah Malaysia//LGM e-Hadir//MS',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:lgm-meet-${meeting.id}-${Date.now()}@lgm.gov.my`,
    `DTSTAMP:${nowUtc}`,
    `DTSTART:${startUtc}`,
    `DTEND:${endUtc}`,
    `SUMMARY:${meeting.title}`,
    `DESCRIPTION:${cleanDescription}`,
    `LOCATION:${cleanLocation}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT30M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Peringatan Mesyuarat LGM (30 minit sebelum)',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  const blob = new Blob([icsLines.join('\r\n')], { type: 'text/calendar;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeTitle = meeting.title.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 30);
  a.download = `Mesyuarat_LGM_${safeTitle}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Smart detection of location: Online meeting link vs Physical venue
 */
export function getSmartLocationLinks(locationOrLink: string): {
  isOnline: boolean;
  onlineUrl?: string;
  isPhysical: boolean;
  googleMapsUrl?: string;
  wazeUrl?: string;
} {
  const text = locationOrLink.toLowerCase();

  // Check for online links
  const urlMatch = locationOrLink.match(/https?:\/\/[^\s]+/);
  if (urlMatch) {
    return {
      isOnline: true,
      onlineUrl: urlMatch[0],
      isPhysical: false,
    };
  }

  // Physical location queries
  const isPhysical = !text.includes('hanya online') && !text.includes('atas talian');
  const query = encodeURIComponent(`${locationOrLink}, Malaysia`);

  return {
    isOnline: text.includes('teams') || text.includes('zoom') || text.includes('meet') || text.includes('webex'),
    onlineUrl: undefined,
    isPhysical,
    googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${query}`,
    wazeUrl: `https://waze.com/ul?q=${query}`,
  };
}
