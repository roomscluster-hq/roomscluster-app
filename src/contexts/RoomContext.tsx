"use client";

import {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useLiveKit } from "@/hooks/useLiveKit";
import { useSocket } from "@/hooks/useSocket";
import { useRoomSettings } from "@/hooks/room/useRoomSettings";
import { RoomContextValue } from "@/lib/room/types";
import { toast } from "sonner";
import { clearSessionCookies } from "@/lib/utils";
import { Socket } from "socket.io-client";
import { useAuthStore } from "@/store/auth.store";
import { useHomeRoute } from "@/hooks/useHomeRoute";

const RoomContext = createContext<RoomContextValue | null>(null);

export function RoomProvider({
  joinCode,
  sessionId,
  children,
}: {
  joinCode: string;
  sessionId: string;
  children: ReactNode;
}) {
  const liveKit = useLiveKit(joinCode);
  const socket = useSocket(joinCode);
  const settings = useRoomSettings(sessionId);
  const { user } = useAuthStore();
  const homeRoute = useHomeRoute();

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingLoading, setRecordingLoading] = useState(false);

  // isCohost as explicit state — set from socket events, not derived from participants
  const [isCohost, setIsCohost] = useState(false);

  // isSpeaker as explicit state — set when user is promoted to speaker
  // Speakers bypass settings restrictions (like co-hosts)
  const [isSpeaker, setIsSpeaker] = useState(false);

  const [isLocked, setIsLocked] = useState(false);

  // Refs
  const onWhiteboardDrawRef = useRef<((event: any) => void) | null>(null);
  const onWhiteboardClearRef = useRef<(() => void) | null>(null);
  const onPromotedRef = useRef<((userId: string) => void) | null>(null);
  const myIdentityRef = useRef<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const toggleLock = useCallback(() => {
    socketRef.current?.emit("session:lock-toggle");
  }, []);

  // Add this helper inside RoomProvider, before the useEffect
  const getRoom = useCallback(async () => {
    if (liveKit.roomRef.current) return liveKit.roomRef.current;

    for (let attempts = 0; attempts < 50; attempts++) {
      await new Promise<void>((resolve) => setTimeout(resolve, 100));
      if (liveKit.roomRef.current) return liveKit.roomRef.current;
    }

    return liveKit.roomRef.current;
  }, [liveKit.roomRef.current]);

  // Track my LiveKit identity
  useEffect(() => {
    if (liveKit.localParticipant) {
      myIdentityRef.current = liveKit.localParticipant.identity;
    }
  }, [liveKit.localParticipant]);

  // Sync isCohost from participants list on initial load
  useEffect(() => {
    if (!socket.participants.length) return;

    // Try multiple identity sources
    const myIdentity =
      myIdentityRef.current ??
      liveKit.roomRef.current?.localParticipant?.identity ??
      user?.id;

    if (!myIdentity) return;

    // Try to find by LiveKit identity first, then by user ID
    let me = socket.participants.find(
      (p) => (p.user?.id ?? p.userId) === myIdentity,
    );

    // If not found and we have auth user ID, try that too
    if (!me && user?.id) {
      me = socket.participants.find(
        (p) => (p.user?.id ?? p.userId) === user.id,
      );
    }

    if (me?.role === "COHOST") {
      setIsCohost(true);
    }
  }, [
    socket.participants,
    liveKit.roomRef.current?.localParticipant?.identity,
    user?.id,
  ]);

  // Keep socketRef in sync
  useEffect(() => {
    socketRef.current = socket.socketRef.current;
  }, [socket.socketRef.current]);

  // ── Handle socket events that need LiveKit reconnection ──
  // We run this once when the socket connects and re-run if the socket
  // reconnects. We use socket.socketRef.current directly so we always
  // attach to the current socket instance.
  useEffect(() => {
    const sock = socket.socketRef.current;
    if (!sock || !socket.isConnected) return;

    const handlePromoted = async (data: { userId: string }) => {
      const room = await getRoom();
      const myIdentity =
        room?.localParticipant?.identity ?? myIdentityRef.current;

      if (myIdentity === data.userId) {
        setIsSpeaker(true);
        toast.success("You can now speak!");
      }

      onPromotedRef.current?.(data.userId);
    };

    const handleDemoted = async (data: {
      userId: string;
      canPublish?: boolean;
    }) => {
      const room = await getRoom();
      const myIdentity =
        room?.localParticipant?.identity ?? myIdentityRef.current;

      if (myIdentity !== data.userId) return;

      setIsSpeaker(false);
      toast("Your speaking access has been removed");

      if (!data.canPublish && room) {
        await room.localParticipant.setMicrophoneEnabled(false).catch(() => {});
        await room.localParticipant.setCameraEnabled(false).catch(() => {});
      }
    };

    const handleBecameCohost = async (data: { userId: string }) => {
      const room = await getRoom();
      const myIdentity =
        room?.localParticipant?.identity ?? myIdentityRef.current;

      if (myIdentity !== data.userId) return;

      setIsCohost(true);
      setIsSpeaker(false);
      toast.success("You are now a co-host!");
    };

    const handleCohostRemoved = async (data: {
      userId: string;
      canPublish?: boolean;
    }) => {
      const room = await getRoom();
      const myIdentity =
        room?.localParticipant?.identity ?? myIdentityRef.current;

      if (myIdentity !== data.userId) return;

      setIsCohost(false);
      setIsSpeaker(false);
      toast("Your co-host access has been removed");

      if (!data.canPublish && room) {
        await room.localParticipant.setMicrophoneEnabled(false).catch(() => {});
        await room.localParticipant.setCameraEnabled(false).catch(() => {});
      }
    };
    const handleSessionEnded = () => {
      clearSessionCookies();
      window.location.href = homeRoute;
    };

    const handleSettingsUpdated = (s: {
      chatEnabled?: boolean;
      participantVideoEnabled?: boolean;
      participantMicEnabled?: boolean;
      waitingRoomEnabled?: boolean;
      recordingEnabled?: boolean;
    }) => {
      settings.updateSettings(s);

      if (!isCohost) {
        const room = liveKit.roomRef.current;
        if (room) {
          if (s.participantMicEnabled === false) {
            room.localParticipant.setMicrophoneEnabled(false).catch(() => {});
          }
          if (s.participantVideoEnabled === false) {
            room.localParticipant.setCameraEnabled(false).catch(() => {});
          }
        }
      }
    };

    const handleWhiteboardDraw = (data: any) => {
      onWhiteboardDrawRef.current?.(data);
    };

    const handleWhiteboardClear = () => {
      onWhiteboardClearRef.current?.();
    };

    const handleRecordingStarted = () => {
      setIsRecording(true);
      setRecordingLoading(false);
      toast.success("Recording started");
    };

    const handleRecordingStopped = () => {
      setIsRecording(false);
      setRecordingLoading(false);
      toast.success("Recording stopped — processing will finish shortly");
    };

    const handleLockToggled = (data: { isLocked: boolean }) => {
      setIsLocked(data.isLocked);
      toast(
        data.isLocked
          ? "Session locked — no new participants can join"
          : "Session unlocked",
      );
    };

    const handleKicked = async (data: { userId: string }) => {
      const myIdentity =
        liveKit.roomRef.current?.localParticipant?.identity ??
        myIdentityRef.current;
      if (myIdentity === data.userId) {
        toast.error("You have been removed from this session");
        await liveKit.disconnect();
        clearSessionCookies();
        window.location.href = "/";
      }
    };

    const handleBanned = async (data: { userId: string }) => {
      const myIdentity =
        liveKit.roomRef.current?.localParticipant?.identity ??
        myIdentityRef.current;
      if (myIdentity === data.userId) {
        toast.error("You have been banned from this session");
        await liveKit.disconnect();
        clearSessionCookies();
        window.location.href = "/";
      }
    };

    const handleSocketError = (data: { message?: string }) => {
      toast.error(data.message ?? "Something went wrong, contact support");
    };

    sock.on("error", handleSocketError);

    sock.on("session:lock-toggled", handleLockToggled);
    sock.on("participant:kicked", handleKicked);
    sock.on("participant:banned", handleBanned);
    sock.on("participant:promoted", handlePromoted);
    sock.on("participant:demoted", handleDemoted);
    sock.on("participant:became-cohost", handleBecameCohost);
    sock.on("participant:cohost-removed", handleCohostRemoved);
    sock.on("session:ended", handleSessionEnded);
    sock.on("settings:updated", handleSettingsUpdated);
    sock.on("whiteboard:draw", handleWhiteboardDraw);
    sock.on("whiteboard:cleared", handleWhiteboardClear);
    sock.on("recording:started", handleRecordingStarted);
    sock.on("recording:stopped", handleRecordingStopped);
    sock.on("error", handleSocketError);

    return () => {
      sock.off("participant:promoted", handlePromoted);
      sock.off("participant:demoted", handleDemoted);
      sock.off("participant:became-cohost", handleBecameCohost);
      sock.off("participant:cohost-removed", handleCohostRemoved);
      sock.off("session:ended", handleSessionEnded);
      sock.off("settings:updated", handleSettingsUpdated);
      sock.off("whiteboard:draw", handleWhiteboardDraw);
      sock.off("whiteboard:cleared", handleWhiteboardClear);
      sock.off("recording:started", handleRecordingStarted);
      sock.off("recording:stopped", handleRecordingStopped);
      sock.off("session:lock-toggled", handleLockToggled);
      sock.off("participant:kicked", handleKicked);
      sock.off("participant:banned", handleBanned);
      sock.off("error", handleSocketError);
    };
  }, [socket.isConnected]); // ← only re-run when connection status changes

  // Callback setters
  const setOnWhiteboardDraw = useCallback(
    (fn: ((event: any) => void) | null) => {
      onWhiteboardDrawRef.current = fn;
    },
    [],
  );

  const setOnWhiteboardClear = useCallback((fn: (() => void) | null) => {
    onWhiteboardClearRef.current = fn;
  }, []);

  const setOnPromoted = useCallback((fn: ((userId: string) => void) | null) => {
    onPromotedRef.current = fn;
  }, []);

  // Recording actions via socket
  const startRecording = useCallback(
    (type: "VIDEO" | "AUDIO" | "BOTH" = "VIDEO") => {
      setRecordingLoading(true);
      socketRef.current?.emit("recording:start", { type });
      setTimeout(() => setRecordingLoading(false), 5000);
    },
    [],
  );

  const stopRecording = useCallback(() => {
    setRecordingLoading(true);
    socketRef.current?.emit("recording:stop");
    setTimeout(() => setRecordingLoading(false), 5000);
  }, []);

  const value: RoomContextValue = {
    // LiveKit state
    localParticipant: liveKit.localParticipant,
    remoteParticipants: liveKit.remoteParticipants,
    isLiveKitConnected: liveKit.isConnected,
    isMuted: liveKit.isMuted,
    isCameraOff: liveKit.isCameraOff,
    isScreenSharing: liveKit.isScreenSharing,
    canPublish: liveKit.canPublish,
    isHost: liveKit.isHost,
    liveKitError: liveKit.error,
    activeSpeakerIds: new Set<string>(), // populated by useLiveKit if needed

    // Socket state
    isSocketConnected: socket.isConnected,
    messages: socket.messages,
    participants: socket.participants,
    raisedHands: socket.raisedHands,
    waitingParticipants: socket.waitingParticipants,
    reactions: socket.reactions,

    // Room settings
    isCohost, // ← now from explicit state
    isSpeaker, // ← now from explicit state - speakers bypass settings
    participantVideoEnabled: settings.participantVideoEnabled,
    participantMicEnabled: settings.participantMicEnabled,
    roomChatEnabled: settings.chatEnabled,
    roomVideoEnabled: settings.participantVideoEnabled,
    roomMicEnabled: settings.participantMicEnabled,
    roomRecordingEnabled: settings.recordingEnabled,

    // Recording
    isRecording,
    recordingLoading,

    // Refs
    socketRef,

    // LiveKit actions
    toggleMic: liveKit.toggleMic,
    toggleCamera: liveKit.toggleCamera,
    toggleScreenShare: liveKit.toggleScreenShare,
    disconnect: liveKit.disconnect,

    // Socket actions
    sendMessage: socket.sendMessage,
    raiseHand: socket.raiseHand,
    lowerHand: socket.lowerHand,
    lowerHandForUser: socket.lowerHandForUser,
    promoteParticipant: socket.promoteParticipant,
    demoteParticipant: socket.demoteParticipant,
    endSession: socket.endSession,
    admitParticipant: socket.admitParticipant,
    admitAll: socket.admitAll,
    rejectParticipant: socket.rejectParticipant,
    rejectAll: socket.rejectAll,
    makeCohost: socket.makeCohost,
    removeCohost: socket.removeCohost,
    kickParticipant: socket.kickParticipant,
    banParticipant: socket.banParticipant,
    deleteMessage: socket.deleteMessage,
    sendReaction: socket.sendReaction,

    // Recording actions
    startRecording,
    stopRecording,

    // Callback setters
    setOnWhiteboardDraw,
    setOnWhiteboardClear,
    setOnPromoted,

    isLocked,
    toggleLock,
  };

  return <RoomContext.Provider value={value}>{children}</RoomContext.Provider>;
}

export function useRoom() {
  const ctx = useContext(RoomContext);
  if (!ctx) throw new Error("useRoom must be used inside RoomProvider");
  return ctx;
}
