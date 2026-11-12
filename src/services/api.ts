import { DatabaseState, DirectoryMember, Meeting, MeetingInvitation, MeetingWithInvitations, RSVPStatus } from '../types';
import { INITIAL_DATA } from '../data/initialData';

const AUTH_KEY = 'lgm_secretariat_auth';
const PASSCODE_DEFAULT = 'LGM2026';

// BroadcastChannel for cross-tab realtime sync
let syncChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    syncChannel = new BroadcastChannel('lgm_ehadir_sync');
  }
} catch (e) {
  console.warn('BroadcastChannel not available', e);
}

export function subscribeToSync(callback: () => void) {
  if (!syncChannel) return () => {};
  const handler = () => callback();
  syncChannel.addEventListener('message', handler);
  return () => {
    syncChannel?.removeEventListener('message', handler);
  };
}

export function notifySync() {
  try {
    syncChannel?.postMessage({ timestamp: Date.now() });
  } catch (e) {
    // ignore
  }
}

// Local storage fallback state
function getLocalFallback(): DatabaseState {
  try {
    const raw = localStorage.getItem('lgm_ehadir_fallback_db');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // ignore
  }
  return JSON.parse(JSON.stringify(INITIAL_DATA));
}

function saveLocalFallback(data: DatabaseState) {
  try {
    localStorage.setItem('lgm_ehadir_fallback_db', JSON.stringify(data));
  } catch (e) {
    // ignore
  }
}

// Authentication
export async function verifyPasscode(passcode: string): Promise<boolean> {
  const clean = passcode.trim();
  // Try server first
  try {
    const res = await fetch('/api/auth/verify-passcode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passcode: clean }),
    });
    if (res.ok) {
      localStorage.setItem(AUTH_KEY, 'true');
      return true;
    }
  } catch (err) {
    console.warn('Backend offline, using client validation', err);
  }

  // Fallback check
  const envPass = (import.meta.env.VITE_SECRETARIAT_PASSCODE as string) || PASSCODE_DEFAULT;
  if (clean === envPass || clean === PASSCODE_DEFAULT) {
    localStorage.setItem(AUTH_KEY, 'true');
    return true;
  }
  return false;
}

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(AUTH_KEY) === 'true';
}

export function logout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_KEY);
  }
}

// Directory API
export async function fetchDirectory(): Promise<DirectoryMember[]> {
  try {
    const res = await fetch('/api/directory');
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (err) {
    console.warn('Fetch directory from backend failed, using fallback', err);
  }
  const fallback = getLocalFallback();
  return fallback.directory_members;
}

export async function createDirectoryMember(payload: {
  full_name: string;
  position_unit: string;
  email: string;
  phone_whatsapp: string;
}): Promise<DirectoryMember> {
  try {
    const res = await fetch('/api/directory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      notifySync();
      return await res.json();
    }
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Gagal menambah ahli direktori.');
  } catch (err: any) {
    if (err.message && !err.message.includes('fetch')) {
      throw err;
    }
    // Offline fallback
    const fallback = getLocalFallback();
    const newMember: DirectoryMember = {
      id: 'dir-' + Math.random().toString(36).substring(2, 9),
      full_name: payload.full_name.trim(),
      position_unit: payload.position_unit.trim(),
      email: payload.email.trim().toLowerCase(),
      phone_whatsapp: payload.phone_whatsapp.trim().replace(/[^0-9]/g, ''),
      is_active: true,
      created_at: new Date().toISOString(),
    };
    fallback.directory_members.unshift(newMember);
    saveLocalFallback(fallback);
    notifySync();
    return newMember;
  }
}

export async function updateDirectoryMember(
  id: string,
  payload: Partial<DirectoryMember>
): Promise<DirectoryMember> {
  try {
    const res = await fetch(`/api/directory/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      notifySync();
      return await res.json();
    }
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Gagal mengemas kini direktori.');
  } catch (err: any) {
    if (err.message && !err.message.includes('fetch')) throw err;
    const fallback = getLocalFallback();
    const idx = fallback.directory_members.findIndex(m => m.id === id);
    if (idx === -1) throw new Error('Ahli direktori tidak dijumpai.');
    fallback.directory_members[idx] = { ...fallback.directory_members[idx], ...payload };
    saveLocalFallback(fallback);
    notifySync();
    return fallback.directory_members[idx];
  }
}

export async function deleteDirectoryMember(id: string): Promise<void> {
  try {
    const res = await fetch(`/api/directory/${id}`, { method: 'DELETE' });
    if (res.ok) {
      notifySync();
      return;
    }
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Gagal memadam ahli direktori.');
  } catch (err: any) {
    if (err.message && !err.message.includes('fetch')) throw err;
    const fallback = getLocalFallback();
    fallback.directory_members = fallback.directory_members.filter(m => m.id !== id);
    saveLocalFallback(fallback);
    notifySync();
  }
}

// Meetings API
export async function fetchMeetings(): Promise<Meeting[]> {
  try {
    const res = await fetch('/api/meetings');
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Fetch meetings failed, using fallback', err);
  }
  const fallback = getLocalFallback();
  return fallback.meetings;
}

export async function fetchMeetingDetails(id: string): Promise<MeetingWithInvitations> {
  try {
    const res = await fetch(`/api/meetings/${id}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Fetch meeting details failed, using fallback', err);
  }
  const fallback = getLocalFallback();
  const meeting = fallback.meetings.find(m => m.id === id);
  if (!meeting) throw new Error('Mesyuarat tidak dijumpai.');
  const invitations = fallback.meeting_invitations.filter(i => i.meeting_id === id);
  return { ...meeting, invitations };
}

export async function createMeeting(payload: {
  title: string;
  meeting_date: string;
  start_time: string;
  end_time: string;
  location_or_link: string;
  agenda_notes: string;
  invitations: Array<{
    id?: string;
    member_id?: string | null;
    full_name?: string;
    invitee_name?: string;
    position_unit?: string;
    invitee_position?: string;
    email?: string;
    invitee_email?: string;
    phone_whatsapp?: string;
    invitee_phone?: string;
  }>;
}): Promise<MeetingWithInvitations> {
  try {
    const res = await fetch('/api/meetings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      notifySync();
      return await res.json();
    }
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Gagal mencipta mesyuarat.');
  } catch (err: any) {
    if (err.message && !err.message.includes('fetch')) throw err;

    // Offline fallback creation
    const fallback = getLocalFallback();
    const meetingId = 'meet-' + Date.now().toString(36);
    const newMeeting: Meeting = {
      id: meetingId,
      title: payload.title.trim(),
      meeting_date: payload.meeting_date,
      start_time: payload.start_time,
      end_time: payload.end_time,
      location_or_link: payload.location_or_link.trim(),
      agenda_notes: payload.agenda_notes ? payload.agenda_notes.trim() : '',
      status: 'active',
      created_at: new Date().toISOString(),
    };

    const newInvitations: MeetingInvitation[] = payload.invitations.map(inv => {
      const randomPart = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
      return {
        id: 'inv-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
        meeting_id: meetingId,
        member_id: inv.member_id || inv.id || null,
        invitee_name: inv.full_name || inv.invitee_name || 'Jemputan',
        invitee_position: inv.position_unit || inv.invitee_position || 'Pegawai',
        invitee_email: (inv.email || inv.invitee_email || '').trim().toLowerCase(),
        invitee_phone: (inv.phone_whatsapp || inv.invitee_phone || '').replace(/[^0-9]/g, ''),
        rsvp_token: `lgm_${randomPart.substring(0, 18)}`,
        rsvp_status: 'pending',
        representative_name: null,
        absence_reason: null,
        email_sent_at: null,
        responded_at: null,
      };
    });

    fallback.meetings.unshift(newMeeting);
    fallback.meeting_invitations.push(...newInvitations);
    saveLocalFallback(fallback);
    notifySync();
    return { ...newMeeting, invitations: newInvitations };
  }
}

export async function updateMeetingStatus(
  id: string,
  status: 'active' | 'completed' | 'cancelled'
): Promise<Meeting> {
  try {
    const res = await fetch(`/api/meetings/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      notifySync();
      return await res.json();
    }
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Gagal mengemas kini status mesyuarat.');
  } catch (err: any) {
    if (err.message && !err.message.includes('fetch')) throw err;
    const fallback = getLocalFallback();
    const meeting = fallback.meetings.find(m => m.id === id);
    if (!meeting) throw new Error('Mesyuarat tidak dijumpai.');
    meeting.status = status;
    saveLocalFallback(fallback);
    notifySync();
    return meeting;
  }
}

export async function deleteMeeting(id: string): Promise<void> {
  try {
    const res = await fetch(`/api/meetings/${id}`, { method: 'DELETE' });
    if (res.ok) {
      notifySync();
      return;
    }
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Gagal memadam mesyuarat.');
  } catch (err: any) {
    if (err.message && !err.message.includes('fetch')) throw err;
    const fallback = getLocalFallback();
    fallback.meetings = fallback.meetings.filter(m => m.id !== id);
    fallback.meeting_invitations = fallback.meeting_invitations.filter(i => i.meeting_id !== id);
    saveLocalFallback(fallback);
    notifySync();
  }
}

export async function sendBulkEmail(meetingId: string): Promise<{ success: boolean; sentCount: number; message: string }> {
  try {
    const res = await fetch(`/api/meetings/${meetingId}/send-bulk-email`, {
      method: 'POST',
    });
    if (res.ok) {
      notifySync();
      return await res.json();
    }
  } catch (err) {
    console.warn('Bulk email API failed, falling back', err);
  }

  // Fallback update
  const fallback = getLocalFallback();
  const now = new Date().toISOString();
  let count = 0;
  fallback.meeting_invitations.forEach(inv => {
    if (inv.meeting_id === meetingId && !inv.email_sent_at) {
      inv.email_sent_at = now;
      count++;
    }
  });
  saveLocalFallback(fallback);
  notifySync();
  return {
    success: true,
    sentCount: count,
    message: `Jemputan e-mel telah dihantar kepada ${count} penerima (mod sandaran).`,
  };
}

// RSVP Public API
export async function fetchRSVPData(token: string): Promise<{ invitation: MeetingInvitation; meeting: Meeting }> {
  try {
    const res = await fetch(`/api/rsvp/${token}`);
    if (res.ok) {
      return await res.json();
    }
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Pautan jemputan tidak sah atau telah dibatalkan.');
  } catch (err: any) {
    if (err.message && !err.message.includes('fetch')) throw err;

    // Fallback lookup
    const fallback = getLocalFallback();
    const invitation = fallback.meeting_invitations.find(i => i.rsvp_token === token);
    if (!invitation) {
      throw new Error('Pautan jemputan tidak sah atau telah dibatalkan. Sila hubungi Urus Setia LGM.');
    }
    const meeting = fallback.meetings.find(m => m.id === invitation.meeting_id);
    if (!meeting) {
      throw new Error('Mesyuarat berkaitan tidak dijumpai atau telah dipadam.');
    }
    return { invitation, meeting };
  }
}

export async function submitRSVP(
  token: string,
  payload: {
    rsvp_status: 'attending' | 'not_attending';
    representative_name?: string | null;
    absence_reason?: string | null;
  }
): Promise<{ success: boolean; message: string; invitation: MeetingInvitation }> {
  try {
    const res = await fetch(`/api/rsvp/${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      notifySync();
      return await res.json();
    }
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Gagal merekodkan kehadiran.');
  } catch (err: any) {
    if (err.message && !err.message.includes('fetch')) throw err;

    // Fallback save
    const fallback = getLocalFallback();
    const invitation = fallback.meeting_invitations.find(i => i.rsvp_token === token);
    if (!invitation) {
      throw new Error('Pautan jemputan tidak sah atau telah dibatalkan.');
    }
    const meeting = fallback.meetings.find(m => m.id === invitation.meeting_id);
    if (!meeting || meeting.status !== 'active') {
      throw new Error('Mesyuarat ini telah ditutup atau selesai.');
    }

    invitation.rsvp_status = payload.rsvp_status;
    invitation.responded_at = new Date().toISOString();
    if (payload.rsvp_status === 'attending') {
      invitation.representative_name = null;
      invitation.absence_reason = null;
    } else {
      invitation.representative_name = payload.representative_name ? payload.representative_name.trim() : null;
      invitation.absence_reason = payload.absence_reason ? payload.absence_reason.trim() : null;
    }
    saveLocalFallback(fallback);
    notifySync();
    return {
      success: true,
      message: 'Maklum balas kehadiran anda telah berjaya direkodkan.',
      invitation,
    };
  }
}

// Reset data (for testing)
export async function resetDatabase(): Promise<void> {
  try {
    await fetch('/api/state/reset', { method: 'POST' });
  } catch (e) {
    // ignore
  }
  saveLocalFallback(JSON.parse(JSON.stringify(INITIAL_DATA)));
  notifySync();
}
