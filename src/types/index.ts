// ── Enums ──────────────────────────────────────────────
export type SessionStatus = "SCHEDULED" | "LIVE" | "ENDED";
export type ParticipantRole = "HOST" | "COHOST" | "SPEAKER" | "GUEST";
export type UserRole = "OWNER" | "HOST" | "GUEST";

// ── User ───────────────────────────────────────────────
export interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  googleId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationUser {
  id: string;
  role: UserRole;
  organization: Organization;
}

// ── Session ────────────────────────────────────────────
export interface SessionParticipant {
  id: string;
  role: ParticipantRole;
  userId: string;
  user: User;
}

export interface Session {
  id: string;
  title: string;
  description: string | null;
  status: SessionStatus;
  scheduledAt: string | null;
  startedAt: string | null;
  endedAt: string | null;
  joinCode: string;
  passcode: string | null;
  isLocked: boolean;
  hostId: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  host?: User;
  recurrenceRuleId?: string | null;
  occurrenceIndex?: number | null;
  participants?: SessionParticipant[];
  _count?: {
    participants: number;
    registrations: number;
    recordings: number;
    attendance: number;
  };
}

// ── Participant ────────────────────────────────────────
export interface Participant {
  id: string;
  role: ParticipantRole;
  joinedAt: string;
  leftAt: string | null;
  isMuted: boolean;
  isCameraOff: boolean;
  handRaised: boolean;
  user: User;
  _joinedAt?: number; // Internal timestamp for deduplication (frontend only)
}

// ── Chat ───────────────────────────────────────────────
export interface ChatMessage {
  id: string;
  content: string;
  senderName: string;
  senderEmail: string;
  createdAt: string;
}

// ── API response wrapper ───────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

// ── Auth ───────────────────────────────────────────────
export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
  };
}

// ── LiveKit ────────────────────────────────────────────
export interface LiveKitTokenResponse {
  token: string;
  room: string;
  serverUrl: string;
  canPublish: boolean;
  isHost: boolean;
  isGuest?: boolean;
  guestIdentity?: string;
}

export interface AttendanceRecord {
  name: string;
  email: string;
  role: string;
  joinedAt: string;
  leftAt: string | null;
  isGuest: boolean;
}

export interface Folder {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  parentFolderId: string | null;
  ownerId: string;
  organizationId: string;
}