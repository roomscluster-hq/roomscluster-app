"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { sessionsApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { getCookie } from "@/lib/cookies";
import { useRoom } from "@/contexts/RoomContext";
import { toast } from "sonner";

export function useRoomSession() {
  const { joinCode } = useParams<{ joinCode: string }>() as { joinCode: string };
  const { user, isAuthenticated } = useAuthStore();
  
  const [handRaised, setHandRaised] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const warnedRef = useRef(false);

  const isGuest = !isAuthenticated;
  const guestName = getCookie("guest_name");
  const currentUserId = user?.id ?? getCookie("guest_identity") ?? "";

  const {
    localParticipant,
    remoteParticipants,
    isLiveKitConnected,
    isMuted,
    isCameraOff,
    isScreenSharing,
    canPublish,
    liveKitError,
    toggleMic,
    toggleCamera,
    toggleScreenShare,
    disconnect,
    messages,
    participants,
    raisedHands,
    activeSpeakerIds,
    sendMessage,
    raiseHand,
    lowerHand,
    lowerHandForUser,
    promoteParticipant,
    demoteParticipant,
    endSession,
    socketRef,
    setOnWhiteboardDraw,
    setOnWhiteboardClear,
    isRecording,
    recordingLoading,
    startRecording,
    stopRecording,
    waitingParticipants,
    roomChatEnabled,
    roomVideoEnabled,
    roomMicEnabled,
    roomRecordingEnabled,
    isCohost,
    isSpeaker,
    isLocked,
    toggleLock,
    reactions,
    deleteMessage,
    sendReaction,
    admitParticipant,
    admitAll,
    rejectParticipant,
    rejectAll,
    makeCohost,
    removeCohost,
    kickParticipant,
    banParticipant,
  } = useRoom();

  const { data: session, isLoading } = useQuery({
    queryKey: ["session-room", joinCode],
    queryFn: () => sessionsApi.getByJoinCode(joinCode),
  });

  const isHost = !isGuest && session?.hostId === user?.id;
  const canManage = isHost || isCohost;

  // Join session (authenticated users only)
  useEffect(() => {
    if (session && !isGuest) {
      sessionsApi.join(joinCode).catch(() => {});
    }
  }, [session, joinCode, isGuest]);

  // Elapsed timer + 4-hour warning
  useEffect(() => {
    if (!session?.startedAt) return;
    const startTime = new Date(session.startedAt).getTime();

    function updateElapsed() {
      const seconds = Math.floor((Date.now() - startTime) / 1000);
      setElapsedSeconds(seconds);
      const tenMinutesBeforeLimit = 4 * 60 * 60 - 10 * 60;
      if (seconds >= tenMinutesBeforeLimit && !warnedRef.current) {
        warnedRef.current = true;
        toast("This session will end automatically in 10 minutes (4-hour limit)", {
          duration: 10000,
        });
      }
    }

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [session?.startedAt]);

  // Auto-switch to waiting tab when first guest arrives
  const prevWaitingCountRef = useRef(0);
  useEffect(() => {
    const prevCount = prevWaitingCountRef.current;
    prevWaitingCountRef.current = waitingParticipants.length;
    if (canManage && prevCount === 0 && waitingParticipants.length > 0) {
      toast("Someone is waiting to join", { duration: 4000 });
    }
  }, [waitingParticipants.length, canManage]);

  function formatElapsed(seconds: number) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  function handleRaiseHand() {
    if (handRaised) {
      lowerHand();
      setHandRaised(false);
    } else {
      raiseHand();
      setHandRaised(true);
    }
  }

  function handleStartRecording(type: 'VIDEO' | 'AUDIO' | 'BOTH' = 'VIDEO') {
    startRecording(type);
  }

  function handleStopRecording() {
    stopRecording();
  }

  return {
    joinCode,
    session,
    isLoading,
    isGuest,
    guestName,
    currentUserId,
    isHost,
    canManage,
    handRaised,
    elapsedSeconds,
    liveKitError,
    
    // Room state
    localParticipant,
    remoteParticipants,
    isLiveKitConnected,
    isMuted,
    isCameraOff,
    isScreenSharing,
    canPublish,
    messages,
    participants,
    raisedHands,
    activeSpeakerIds,
    isRecording,
    recordingLoading,
    waitingParticipants,
    roomChatEnabled,
    roomVideoEnabled,
    roomMicEnabled,
    roomRecordingEnabled,
    socketRef,
    isCohost,
    isSpeaker,
    isLocked,
    reactions,
    
    // Actions
    formatElapsed,
    handleRaiseHand,
    handleStartRecording,
    handleStopRecording,
    toggleMic,
    toggleCamera,
    toggleScreenShare,
    disconnect,
    sendMessage,
    promoteParticipant,
    demoteParticipant,
    lowerHandForUser,
    endSession,
    admitParticipant,
    admitAll,
    rejectParticipant,
    rejectAll,
    makeCohost,
    removeCohost,
    kickParticipant,
    banParticipant,
    deleteMessage,
    sendReaction,
    setOnWhiteboardDraw,
    setOnWhiteboardClear,
    toggleLock,
  };
}
