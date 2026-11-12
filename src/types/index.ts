export interface DirectoryMember {
  id: string;
  full_name: string;
  position_unit: string;
  email: string;
  phone_whatsapp: string;
  is_active: boolean;
  created_at: string;
}

export type MeetingStatus = 'active' | 'completed' | 'cancelled';
export type RSVPStatus = 'pending' | 'attending' | 'not_attending';

export interface Meeting {
  id: string;
  title: string;
  meeting_date: string; // YYYY-MM-DD
  start_time: string;   // HH:MM
  end_time: string;     // HH:MM
  location_or_link: string;
  agenda_notes: string;
  status: MeetingStatus;
  created_at: string;
}

export interface MeetingInvitation {
  id: string;
  meeting_id: string;
  member_id: string | null;
  invitee_name: string;
  invitee_position: string;
  invitee_email: string;
  invitee_phone: string;
  rsvp_token: string;
  rsvp_status: RSVPStatus;
  representative_name: string | null;
  absence_reason: string | null;
  email_sent_at: string | null;
  responded_at: string | null;
}

export interface MeetingWithInvitations extends Meeting {
  invitations: MeetingInvitation[];
}

export interface DatabaseState {
  directory_members: DirectoryMember[];
  meetings: Meeting[];
  meeting_invitations: MeetingInvitation[];
}
