import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DatabaseState, DirectoryMember, Meeting, MeetingInvitation } from './src/types';
import { INITIAL_DATA } from './src/data/initialData';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const DB_FILE = path.join(__dirname, 'data', 'db.json');

// Ensure data directory exists
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
}

// Load or initialize DB
function loadDb(): DatabaseState {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const data = JSON.parse(content);
      if (data && data.meetings && data.directory_members) {
        return data;
      }
    }
  } catch (err) {
    console.error('Failed to read db.json, fallback to initial data', err);
  }
  saveDb(INITIAL_DATA);
  return JSON.parse(JSON.stringify(INITIAL_DATA));
}

function saveDb(data: DatabaseState) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save db.json', err);
  }
}

let db: DatabaseState = loadDb();

async function startServer() {
  const app = express();
  app.use(express.json());

  // --- API ROUTES ---

  // Health / Passcode check
  app.post('/api/auth/verify-passcode', (req, res) => {
    const { passcode } = req.body;
    const validPasscode = process.env.VITE_SECRETARIAT_PASSCODE || 'LGM2026';
    if (passcode === validPasscode) {
      return res.json({ success: true, message: 'Akses disahkan.' });
    }
    return res.status(401).json({ success: false, message: 'Kod akses tidak sah. Sila cuba lagi.' });
  });

  // Get all data
  app.get('/api/state', (req, res) => {
    res.json(db);
  });

  // Reset data to seed (useful for QA testing)
  app.post('/api/state/reset', (req, res) => {
    db = JSON.parse(JSON.stringify(INITIAL_DATA));
    saveDb(db);
    res.json({ success: true, data: db });
  });

  // Directory CRUD
  app.get('/api/directory', (req, res) => {
    res.json(db.directory_members);
  });

  app.post('/api/directory', (req, res) => {
    const { full_name, position_unit, email, phone_whatsapp } = req.body;
    if (!full_name || !position_unit || !email || !phone_whatsapp) {
      return res.status(400).json({ error: 'Sila lengkapkan semua medan wajib.' });
    }
    const newMember: DirectoryMember = {
      id: 'dir-' + Math.random().toString(36).substring(2, 9),
      full_name: full_name.trim(),
      position_unit: position_unit.trim(),
      email: email.trim().toLowerCase(),
      phone_whatsapp: phone_whatsapp.trim().replace(/[^0-9]/g, ''),
      is_active: true,
      created_at: new Date().toISOString(),
    };
    db.directory_members.unshift(newMember);
    saveDb(db);
    res.status(201).json(newMember);
  });

  app.put('/api/directory/:id', (req, res) => {
    const { id } = req.params;
    const { full_name, position_unit, email, phone_whatsapp, is_active } = req.body;
    const index = db.directory_members.findIndex(m => m.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Ahli direktori tidak dijumpai.' });
    }
    db.directory_members[index] = {
      ...db.directory_members[index],
      full_name: full_name !== undefined ? full_name.trim() : db.directory_members[index].full_name,
      position_unit: position_unit !== undefined ? position_unit.trim() : db.directory_members[index].position_unit,
      email: email !== undefined ? email.trim().toLowerCase() : db.directory_members[index].email,
      phone_whatsapp: phone_whatsapp !== undefined ? phone_whatsapp.trim().replace(/[^0-9]/g, '') : db.directory_members[index].phone_whatsapp,
      is_active: is_active !== undefined ? Boolean(is_active) : db.directory_members[index].is_active,
    };
    saveDb(db);
    res.json(db.directory_members[index]);
  });

  app.delete('/api/directory/:id', (req, res) => {
    const { id } = req.params;
    const initialLen = db.directory_members.length;
    db.directory_members = db.directory_members.filter(m => m.id !== id);
    if (db.directory_members.length === initialLen) {
      return res.status(404).json({ error: 'Ahli direktori tidak dijumpai.' });
    }
    saveDb(db);
    res.json({ success: true, message: 'Ahli direktori berjaya dipadam.' });
  });

  // Meetings CRUD
  app.get('/api/meetings', (req, res) => {
    res.json(db.meetings);
  });

  app.get('/api/meetings/:id', (req, res) => {
    const meeting = db.meetings.find(m => m.id === req.params.id);
    if (!meeting) {
      return res.status(404).json({ error: 'Mesyuarat tidak dijumpai.' });
    }
    const invitations = db.meeting_invitations.filter(inv => inv.meeting_id === meeting.id);
    res.json({ ...meeting, invitations });
  });

  app.post('/api/meetings', (req, res) => {
    const {
      title,
      meeting_date,
      start_time,
      end_time,
      location_or_link,
      agenda_notes,
      invitations, // array of selected member objects and/or adhoc items
    } = req.body;

    if (!title || !meeting_date || !start_time || !end_time || !location_or_link) {
      return res.status(400).json({ error: 'Semua maklumat bertanda wajib mesti diisi.' });
    }

    if (!Array.isArray(invitations) || invitations.length === 0) {
      return res.status(400).json({ error: 'Sila pilih sekurang-kurangnya 1 orang jemputan mesyuarat.' });
    }

    const meetingId = 'meet-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6);
    const newMeeting: Meeting = {
      id: meetingId,
      title: title.trim(),
      meeting_date,
      start_time,
      end_time,
      location_or_link: location_or_link.trim(),
      agenda_notes: agenda_notes ? agenda_notes.trim() : '',
      status: 'active',
      created_at: new Date().toISOString(),
    };

    // Deduplicate invitations by member_id or email
    const seenMembers = new Set<string>();
    const seenEmails = new Set<string>();
    const newInvitations: MeetingInvitation[] = [];

    for (const inv of invitations) {
      const email = (inv.email || inv.invitee_email || '').trim().toLowerCase();
      const memberId = inv.member_id || inv.id || null;

      if (memberId && seenMembers.has(memberId)) continue;
      if (email && seenEmails.has(email)) continue;

      if (memberId) seenMembers.add(memberId);
      if (email) seenEmails.add(email);

      // Generate random high-entropy token (minimum 16 alphanumeric characters)
      const randomPart = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
      const rsvpToken = `lgm_${randomPart.substring(0, 18)}`;

      newInvitations.push({
        id: 'inv-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
        meeting_id: meetingId,
        member_id: memberId,
        invitee_name: inv.full_name || inv.invitee_name || 'Jemputan',
        invitee_position: inv.position_unit || inv.invitee_position || 'Pegawai',
        invitee_email: email,
        invitee_phone: (inv.phone_whatsapp || inv.invitee_phone || '').replace(/[^0-9]/g, ''),
        rsvp_token: rsvpToken,
        rsvp_status: 'pending',
        representative_name: null,
        absence_reason: null,
        email_sent_at: null,
        responded_at: null,
      });
    }

    if (newInvitations.length === 0) {
      return res.status(400).json({ error: 'Tiada jemputan sah yang dapat ditambah.' });
    }

    db.meetings.unshift(newMeeting);
    db.meeting_invitations.push(...newInvitations);
    saveDb(db);

    res.status(201).json({ ...newMeeting, invitations: newInvitations });
  });

  // Update meeting status (e.g. completed, cancelled, active)
  app.patch('/api/meetings/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const meeting = db.meetings.find(m => m.id === id);
    if (!meeting) {
      return res.status(404).json({ error: 'Mesyuarat tidak dijumpai.' });
    }
    if (!['active', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Status tidak sah.' });
    }
    meeting.status = status;
    saveDb(db);
    res.json(meeting);
  });

  // Delete meeting
  app.delete('/api/meetings/:id', (req, res) => {
    const { id } = req.params;
    const initialLen = db.meetings.length;
    db.meetings = db.meetings.filter(m => m.id !== id);
    db.meeting_invitations = db.meeting_invitations.filter(inv => inv.meeting_id !== id);
    if (db.meetings.length === initialLen) {
      return res.status(404).json({ error: 'Mesyuarat tidak dijumpai.' });
    }
    saveDb(db);
    res.json({ success: true, message: 'Mesyuarat berjaya dipadam.' });
  });

  // Bulk Email Send / Simulate
  app.post('/api/meetings/:id/send-bulk-email', (req, res) => {
    const { id } = req.params;
    const meeting = db.meetings.find(m => m.id === id);
    if (!meeting) {
      return res.status(404).json({ error: 'Mesyuarat tidak dijumpai.' });
    }

    const now = new Date().toISOString();
    let sentCount = 0;
    db.meeting_invitations.forEach(inv => {
      if (inv.meeting_id === id && !inv.email_sent_at) {
        inv.email_sent_at = now;
        sentCount++;
      }
    });

    saveDb(db);
    res.json({
      success: true,
      message: `Jemputan e-mel berjaya dihantar kepada ${sentCount} penerima.`,
      sentCount,
      timestamp: now,
    });
  });

  // Mark single email as sent
  app.post('/api/invitations/:id/mark-email-sent', (req, res) => {
    const { id } = req.params;
    const inv = db.meeting_invitations.find(i => i.id === id);
    if (!inv) {
      return res.status(404).json({ error: 'Jemputan tidak dijumpai.' });
    }
    inv.email_sent_at = new Date().toISOString();
    saveDb(db);
    res.json(inv);
  });

  // Public RSVP by Token (FR-004)
  app.get('/api/rsvp/:token', (req, res) => {
    const { token } = req.params;
    const invitation = db.meeting_invitations.find(inv => inv.rsvp_token === token);
    if (!invitation) {
      return res.status(404).json({
        error: 'Pautan jemputan tidak sah atau telah dibatalkan. Sila hubungi Urus Setia LGM.',
      });
    }

    const meeting = db.meetings.find(m => m.id === invitation.meeting_id);
    if (!meeting) {
      return res.status(404).json({
        error: 'Mesyuarat berkaitan tidak dijumpai atau telah dipadam.',
      });
    }

    res.json({
      invitation,
      meeting: {
        id: meeting.id,
        title: meeting.title,
        meeting_date: meeting.meeting_date,
        start_time: meeting.start_time,
        end_time: meeting.end_time,
        location_or_link: meeting.location_or_link,
        agenda_notes: meeting.agenda_notes,
        status: meeting.status,
      },
    });
  });

  // Submit RSVP (FR-004)
  app.post('/api/rsvp/:token', (req, res) => {
    const { token } = req.params;
    const { rsvp_status, representative_name, absence_reason } = req.body;

    if (!['attending', 'not_attending'].includes(rsvp_status)) {
      return res.status(400).json({ error: 'Status kehadiran mestilah Hadir atau Tidak Hadir.' });
    }

    const invitation = db.meeting_invitations.find(inv => inv.rsvp_token === token);
    if (!invitation) {
      return res.status(404).json({
        error: 'Pautan jemputan tidak sah atau telah dibatalkan. Sila hubungi Urus Setia LGM.',
      });
    }

    const meeting = db.meetings.find(m => m.id === invitation.meeting_id);
    if (!meeting) {
      return res.status(404).json({ error: 'Mesyuarat tidak dijumpai.' });
    }

    if (meeting.status !== 'active') {
      return res.status(400).json({
        error: `Pengesahan kehadiran tidak dapat dikemas kini kerana mesyuarat ini telah berstatus '${meeting.status === 'completed' ? 'Selesai' : 'Dibatalkan'}'.`,
      });
    }

    // Business Rule (PRD 13):
    // Jika ditukar daripada Tidak Hadir kepada Hadir, medan representative_name dan absence_reason
    // akan dikosongkan secara automatik supaya laporan tidak mengelirukan.
    invitation.rsvp_status = rsvp_status;
    invitation.responded_at = new Date().toISOString();

    if (rsvp_status === 'attending') {
      invitation.representative_name = null;
      invitation.absence_reason = null;
    } else {
      invitation.representative_name = representative_name ? representative_name.trim() : null;
      invitation.absence_reason = absence_reason ? absence_reason.trim() : null;
    }

    saveDb(db);
    res.json({
      success: true,
      message: 'Maklum balas kehadiran anda telah berjaya direkodkan.',
      invitation,
    });
  });

  // --- VITE MIDDLEWARE SETUP ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LGM e-Hadir server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
