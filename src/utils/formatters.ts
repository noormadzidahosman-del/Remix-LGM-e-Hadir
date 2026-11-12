import { Meeting, MeetingInvitation } from '../types';

export function formatDateMalay(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  const days = ['Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu'];
  const months = [
    'Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun',
    'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'
  ];
  const dayName = days[date.getDay()];
  const day = date.getDate();
  const monthName = months[date.getMonth()];
  const year = date.getFullYear();

  return `${dayName}, ${day} ${monthName} ${year}`;
}

export function formatTimeMalay(timeStr: string): string {
  if (!timeStr) return '';
  const [hourStr, minStr] = timeStr.split(':');
  let hour = parseInt(hourStr, 10);
  const min = minStr || '00';
  const period = hour >= 12 ? (hour >= 19 ? 'Malam' : hour >= 14 ? 'Petang' : 'Tengah Hari') : 'Pagi';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${min} ${period} (${timeStr})`;
}

export function formatDateTimeNice(isoStr: string | null): string {
  if (!isoStr) return '-';
  const d = new Date(isoStr);
  return d.toLocaleString('ms-MY', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getFullRsvpUrl(token: string): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/rsvp/${token}`;
  }
  return `https://lgm-ehadir.gov.my/rsvp/${token}`;
}

/**
 * FR-005 Acceptance Criteria:
 * Teks yang disalin mengandungi nama penerima, tajuk mesyuarat, tarikh, masa, lokasi, dan pautan unik yang tepat.
 */
export function buildWhatsAppInvitationMessage(
  invitation: MeetingInvitation,
  meeting: Meeting
): string {
  const url = getFullRsvpUrl(invitation.rsvp_token);
  const dateFormatted = formatDateMalay(meeting.meeting_date);
  const timeFormatted = `${formatTimeMalay(meeting.start_time)} - ${formatTimeMalay(meeting.end_time)}`;

  return `*LEMBAGA GETAH MALAYSIA (LGM)*
_Jemputan Pengesahan Kehadiran Mesyuarat_

Salam Sejahtera YBhg. Dato' / Dr. / Tuan / Puan ${invitation.invitee_name},

Sukacita dimaklumkan bahawa YBhg. Dato'/Tuan/Puan dijemput menghadiri mesyuarat rasmi seperti butiran berikut:

📌 *Mesyuarat:* ${meeting.title}
📅 *Tarikh:* ${dateFormatted}
⏰ *Masa:* ${timeFormatted}
📍 *Tempat / Lokasi:* ${meeting.location_or_link}

${meeting.agenda_notes ? `📝 *Agenda / Catatan:*\n${meeting.agenda_notes}\n\n` : ''}Mohon kerjasama YBhg. Dato'/Tuan/Puan untuk membuat pengesahan kehadiran (Hadir / Tidak Hadir & Nama Wakil) dalam masa 10 saat melalui pautan rasmi peribadi di bawah:

🔗 *Pautan Pengesahan (Tanpa Kata Laluan):*
${url}

_Sekian, terima kasih._
*Urus Setia Mesyuarat LGM*`;
}

/**
 * FR-006: Salin Peringatan sopan bagi status Belum Respon
 */
export function buildWhatsAppReminderMessage(
  invitation: MeetingInvitation,
  meeting: Meeting
): string {
  const url = getFullRsvpUrl(invitation.rsvp_token);
  const dateFormatted = formatDateMalay(meeting.meeting_date);

  return `*PERINGATAN MESRA: PENGESAHAN KEHADIRAN MESYUARAT LGM*

Salam hormat YBhg. Dato' / Dr. / Tuan / Puan ${invitation.invitee_name},

Pihak Urus Setia memohon jasa baik YBhg. Dato'/Tuan/Puan untuk mengesahkan kehadiran bagi:

📌 *${meeting.title}*
📅 *Tarikh:* ${dateFormatted}
⏰ *Masa:* ${formatTimeMalay(meeting.start_time)}

Sila klik pautan pantas di bawah untuk mengesahkan kehadiran atau menamakan pegawai pengganti/wakil:
🔗 ${url}

Maklum balas awal amat dihargai bagi penentuan kuorum mesyuarat. Terima kasih.

*Urus Setia Mesyuarat LGM*`;
}

export function openWhatsAppDirect(phone: string, text: string) {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const encoded = encodeURIComponent(text);
  const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
  window.open(waUrl, '_blank', 'noopener,noreferrer');
}

export function buildMailtoUrl(invitation: MeetingInvitation, meeting: Meeting): string {
  const subject = encodeURIComponent(`Jemputan Rasmi Mesyuarat LGM: ${meeting.title}`);
  const body = encodeURIComponent(buildWhatsAppInvitationMessage(invitation, meeting));
  return `mailto:${invitation.invitee_email}?subject=${subject}&body=${body}`;
}
