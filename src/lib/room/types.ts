import { LocalParticipant, RemoteParticipant } from "livekit-client";
import { Socket } from "socket.io-client";
import { ChatMessage } from "@/types";

export interface RaisedHand {
  userId: string;
  name: string;
  email: string;
}

export interface WaitingParticipant {
  id: string;
  name: string;
  email: string;
  identity: string;
}

export interface RoomSettings {
  chatEnabled?: boolean;
  participantVideoEnabled?: boolean;
  participantMicEnabled?: boolean;
}

export interface RoomState {
  // LiveKit
  localParticipant: LocalParticipant | null;
  remoteParticipants: RemoteParticipant[];
  isLiveKitConnected: boolean;
  isMuted: boolean;
  isCameraOff: boolean;
  isScreenSharing: boolean;
  canPublish: boolean;
  liveKitError: string | null;
  activeSpeakerIds: Set<string>;

  // Socket
  isSocketConnected: boolean;
  messages: ChatMessage[];
  participants: any[];
  raisedHands: RaisedHand[];
  waitingParticipants: WaitingParticipant[];

  // Room settings
  isCohost: boolean;
  participantVideoEnabled: boolean;
  participantMicEnabled: boolean;
  roomChatEnabled: boolean;
  roomVideoEnabled: boolean;
  roomMicEnabled: boolean;

  // Recording
  isRecording: boolean;
  recordingLoading: boolean;
}

export interface RoomActions {
  // LiveKit controls
  toggleMic: () => Promise<void>;
  toggleCamera: () => Promise<void>;
  toggleScreenShare: () => Promise<void>;
  disconnect: () => Promise<void>;

  // Socket controls
  sendMessage: (content: string) => void;
  raiseHand: () => void;
  lowerHand: () => void;
  lowerHandForUser: (userId: string) => void;
  promoteParticipant: (userId: string) => void;
  demoteParticipant: (userId: string) => void;
  endSession: () => void;

  // Waiting room
  admitParticipant: (joinCode: string, waitingParticipantId: string) => void;
  admitAll: (joinCode: string) => void;
  rejectParticipant: (joinCode: string, waitingParticipantId: string) => void;
  rejectAll: (joinCode: string) => void;

  // Co-host
  makeCohost: (userId: string) => void;
  removeCohost: (userId: string) => void;

  // Recording
  startRecording: () => void;
  stopRecording: () => void;

  // Callback setters
  setOnWhiteboardDraw: (fn: ((event: any) => void) | null) => void;
  setOnWhiteboardClear: (fn: (() => void) | null) => void;
  setOnPromoted: (fn: ((userId: string) => void) | null) => void;
}

export interface RoomContextValue extends RoomState, RoomActions {
  socketRef: React.RefObject<Socket | null>;
}

export interface UseLiveKitOptions {
  joinCode: string;
  onError?: (error: string) => void;
}

export interface UseSocketOptions {
  joinCode: string;
  sessionId: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
}
