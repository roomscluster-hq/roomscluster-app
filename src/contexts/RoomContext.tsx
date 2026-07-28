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
  // Use our custom hooks
  const liveKit = useLiveKit(joinCode);
  const socket = useSocket(joinCode);
  const settings = useRoomSettings(sessionId);
  
  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingLoading, setRecordingLoading] = useState(false);

  // Refs for callbacks
  const onWhiteboardDrawRef = useRef<((event: any) => void) | null>(null);
  const onWhiteboardClearRef = useRef<(() => void) | null>(null);
  const onPromotedRef = useRef<((userId: string) => void) | null>(null);
  const myIdentityRef = useRef<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Set identity ref when local participant is available
  useEffect(() => {
    if (liveKit.localParticipant) {
      myIdentityRef.current = liveKit.localParticipant.identity;
    }
  }, [liveKit.localParticipant]);

  // Store socket in ref when available
  useEffect(() => {
    if (socket.socketRef.current) {
      socketRef.current = socket.socketRef.current;
    }
  }, [socket.socketRef.current]);

  // Handle socket events that need LiveKit reconnection
  useEffect(() => {
    const sock = socket.socketRef.current;
    if (!sock) return;

    const handleParticipantPromoted = async (data: {
      userId: string;
      token?: string;
      serverUrl?: string;
      participantVideoEnabled?: boolean;
      participantMicEnabled?: boolean;
    }) => {
      const myIdentity = myIdentityRef.current;
      if (
        myIdentity &&
        myIdentity === data.userId &&
        data.token &&
        data.serverUrl &&
        liveKit.room
      ) {
        toast.success("You can now speak!");
        try {
          await liveKit.room.disconnect(false);
          await liveKit.room.connect(data.serverUrl, data.token, {
            autoSubscribe: true,
          });
        } catch (err) {
          console.error("[LiveKit] Failed to reconnect as speaker:", err);
        }
      }

      onPromotedRef.current?.(data.userId);
    };

    const handleParticipantDemoted = async (data: {
      userId: string;
      token?: string;
      serverUrl?: string;
    }) => {
      const myIdentity = myIdentityRef.current;
      if (
        myIdentity &&
        myIdentity === data.userId &&
        data.token &&
        data.serverUrl &&
        liveKit.room
      ) {
        toast("Your speaking access has been removed");
        try {
          await liveKit.room.localParticipant.setMicrophoneEnabled(false);
          await liveKit.room.localParticipant.setCameraEnabled(false);
          await liveKit.room.disconnect(false);
          await liveKit.room.connect(data.serverUrl, data.token, {
            autoSubscribe: true,
          });
        } catch (err) {
          console.error("[LiveKit] Failed to reconnect as audience:", err);
        }
      }
    };

    const handleCohostAdded = async (data: {
      userId: string;
      token?: string;
      serverUrl?: string;
    }) => {
      const myIdentity = myIdentityRef.current;
      if (
        myIdentity &&
        myIdentity === data.userId &&
        data.token &&
        data.serverUrl &&
        liveKit.room
      ) {
        toast.success("You are now a co-host!");
        try {
          await liveKit.room.disconnect(false);
          await liveKit.room.connect(data.serverUrl, data.token, {
            autoSubscribe: true,
          });
        } catch (err) {
          console.error("[LiveKit] Failed to reconnect as co-host:", err);
        }
      }
    };

    const handleCohostRemoved = async (data: {
      userId: string;
      token?: string;
      serverUrl?: string;
    }) => {
      const myIdentity = myIdentityRef.current;
      if (
        myIdentity &&
        myIdentity === data.userId &&
        data.token &&
        data.serverUrl &&
        liveKit.room
      ) {
        toast("Your co-host access has been removed");
        try {
          await liveKit.room.localParticipant.setMicrophoneEnabled(false);
          await liveKit.room.localParticipant.setCameraEnabled(false);
          await liveKit.room.disconnect(false);
          await liveKit.room.connect(data.serverUrl, data.token, {
            autoSubscribe: true,
          });
        } catch (err) {
          console.error(
            "[LiveKit] Failed to reconnect after co-host removal:",
            err
          );
        }
      }
    };

    const handleSessionEnded = () => {
      clearSessionCookies();
      window.location.href = "/dashboard";
    };

    const handleSettingsUpdated = (s: {
      chatEnabled?: boolean;
      participantVideoEnabled?: boolean;
      participantMicEnabled?: boolean;
    }) => {
      settings.updateSettings(s);
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

    sock.on("participant:promoted", handleParticipantPromoted);
    sock.on("participant:demoted", handleParticipantDemoted);
    sock.on("participant:became-cohost", handleCohostAdded);
    sock.on("participant:cohost-removed", handleCohostRemoved);
    sock.on("session:ended", handleSessionEnded);
    sock.on("settings:updated", handleSettingsUpdated);
    sock.on("whiteboard:draw", handleWhiteboardDraw);
    sock.on("whiteboard:cleared", handleWhiteboardClear);
    sock.on("recording:started", handleRecordingStarted);
    sock.on("recording:stopped", handleRecordingStopped);

    return () => {
      sock.off("participant:promoted", handleParticipantPromoted);
      sock.off("participant:demoted", handleParticipantDemoted);
      sock.off("participant:became-cohost", handleCohostAdded);
      sock.off("participant:cohost-removed", handleCohostRemoved);
      sock.off("session:ended", handleSessionEnded);
      sock.off("settings:updated", handleSettingsUpdated);
      sock.off("whiteboard:draw", handleWhiteboardDraw);
      sock.off("whiteboard:cleared", handleWhiteboardClear);
      sock.off("recording:started", handleRecordingStarted);
      sock.off("recording:stopped", handleRecordingStopped);
    };
  }, [socket.isConnected, liveKit.room, settings]);

  // Callback setters
  const setOnWhiteboardDraw = useCallback(
    (fn: ((event: any) => void) | null) => {
      onWhiteboardDrawRef.current = fn;
    },
    []
  );

  const setOnWhiteboardClear = useCallback((fn: (() => void) | null) => {
    onWhiteboardClearRef.current = fn;
  }, []);

  const setOnPromoted = useCallback((fn: ((userId: string) => void) | null) => {
    onPromotedRef.current = fn;
  }, []);

  // Recording actions
  const startRecording = useCallback(async () => {
    setRecordingLoading(true);
    socketRef.current?.emit("recording:start");
    // Fallback timeout
    setTimeout(() => setRecordingLoading(false), 5000);
  }, []);

  const stopRecording = useCallback(async () => {
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
    liveKitError: liveKit.error,
    activeSpeakerIds: liveKit.activeSpeakerIds,

    // Socket state
    isSocketConnected: socket.isConnected,
    messages: socket.messages,
    participants: socket.participants,
    raisedHands: socket.raisedHands,
    waitingParticipants: [], // Not implemented in existing hook

    // Room settings
    isCohost: false,
    participantVideoEnabled: settings.participantVideoEnabled,
    participantMicEnabled: settings.participantMicEnabled,
    roomChatEnabled: settings.chatEnabled,
    roomVideoEnabled: settings.participantVideoEnabled,
    roomMicEnabled: settings.participantMicEnabled,

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

    // Recording actions
    startRecording,
    stopRecording,

    // Callback setters
    setOnWhiteboardDraw,
    setOnWhiteboardClear,
    setOnPromoted,
  };

  return (
    <RoomContext.Provider value={value}>{children}</RoomContext.Provider>
  );
}

export function useRoom() {
  const ctx = useContext(RoomContext);
  if (!ctx) throw new Error("useRoom must be used inside RoomProvider");
  return ctx;
}
