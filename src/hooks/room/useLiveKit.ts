"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Room, RoomEvent, LocalParticipant, RemoteParticipant } from "livekit-client";
import { livekitApi } from "@/lib/api";
import { getCookie } from "@/lib/cookies";

interface UseLiveKitReturn {
  room: Room | null;
  localParticipant: LocalParticipant | null;
  remoteParticipants: RemoteParticipant[];
  isConnected: boolean;
  isMuted: boolean;
  isCameraOff: boolean;
  isScreenSharing: boolean;
  canPublish: boolean;
  error: string | null;
  activeSpeakerIds: Set<string>;
  toggleMic: () => Promise<void>;
  toggleCamera: () => Promise<void>;
  toggleScreenShare: () => Promise<void>;
  disconnect: () => Promise<void>;
}

export function useLiveKit(joinCode: string): UseLiveKitReturn {
  const roomRef = useRef<Room | null>(null);
  const intentionalDisconnectRef = useRef(false);
  const [localParticipant, setLocalParticipant] = useState<LocalParticipant | null>(null);
  const [remoteParticipants, setRemoteParticipants] = useState<RemoteParticipant[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isCameraOff, setIsCameraOff] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [canPublish, setCanPublish] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSpeakerIds, setActiveSpeakerIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;

    const room = new Room({
      adaptiveStream: true,
      dynacast: true,
    });

    const updateParticipants = () => {
      if (!cancelled) {
        setRemoteParticipants([...room.remoteParticipants.values()]);
      }
    };

    room.on(RoomEvent.ParticipantConnected, updateParticipants);
    room.on(RoomEvent.ParticipantDisconnected, updateParticipants);
    room.on(RoomEvent.TrackSubscribed, updateParticipants);
    room.on(RoomEvent.TrackUnsubscribed, updateParticipants);
    room.on(RoomEvent.LocalTrackPublished, updateParticipants);
    room.on(RoomEvent.TrackPublished, updateParticipants);
    room.on(RoomEvent.TrackUnpublished, updateParticipants);
    room.on(RoomEvent.Disconnected, () => {
      if (!cancelled) setIsConnected(false);
    });
    room.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
      if (!cancelled) {
        setActiveSpeakerIds(new Set(speakers.map((p) => p.identity)));
      }
    });

    async function connect() {
      try {
        const guestToken = getCookie("guest_token");
        const guestServerUrl = getCookie("livekit_server_url");

        let token: string;
        let serverUrl: string;
        let publish = false;

        if (guestToken && guestServerUrl) {
          token = guestToken;
          serverUrl = decodeURIComponent(guestServerUrl);
        } else {
          const data = await livekitApi.getToken(joinCode);
          token = data.token;
          serverUrl = data.serverUrl;
          publish = data.canPublish;
        }

        if (cancelled) return;

        roomRef.current = room;
        setCanPublish(publish);
        await room.connect(serverUrl, token, { autoSubscribe: true });

        if (cancelled) {
          if (intentionalDisconnectRef.current) {
            room.disconnect();
          }
          return;
        }

        setLocalParticipant(room.localParticipant);
        setRemoteParticipants([...room.remoteParticipants.values()]);
        setIsConnected(true);
      } catch (err: any) {
        if (!cancelled) setError(err.message ?? "Failed to connect");
      }
    }

    connect();

    return () => {
      cancelled = true;
      roomRef.current = null;

      if (intentionalDisconnectRef.current) {
        room.disconnect();
      } else {
        room.off(RoomEvent.ParticipantConnected, updateParticipants);
        room.off(RoomEvent.ParticipantDisconnected, updateParticipants);
        room.off(RoomEvent.TrackSubscribed, updateParticipants);
        room.off(RoomEvent.TrackUnsubscribed, updateParticipants);
        room.off(RoomEvent.LocalTrackPublished, updateParticipants);
        room.off(RoomEvent.TrackPublished, updateParticipants);
        room.off(RoomEvent.TrackUnpublished, updateParticipants);
        room.removeAllListeners(RoomEvent.Disconnected);
      }
    };
  }, [joinCode]);

  const toggleMic = useCallback(async () => {
    const room = roomRef.current;
    if (!room || !canPublish) return;
    const enabled = !room.localParticipant.isMicrophoneEnabled;
    await room.localParticipant.setMicrophoneEnabled(enabled);
    setIsMuted(!enabled);
  }, [canPublish]);

  const toggleCamera = useCallback(async () => {
    const room = roomRef.current;
    if (!room || !canPublish) return;
    const enabled = !room.localParticipant.isCameraEnabled;
    await room.localParticipant.setCameraEnabled(enabled);
    setIsCameraOff(!enabled);
  }, [canPublish]);

  const toggleScreenShare = useCallback(async () => {
    const room = roomRef.current;
    if (!room || !canPublish) return;
    const enabled = !room.localParticipant.isScreenShareEnabled;
    await room.localParticipant.setScreenShareEnabled(enabled);
    setIsScreenSharing(enabled);
  }, [canPublish]);

  const disconnect = useCallback(async () => {
    intentionalDisconnectRef.current = true;
    const room = roomRef.current;
    if (room) {
      await room.disconnect();
      roomRef.current = null;
    }
    setIsConnected(false);
  }, []);

  return {
    room: roomRef.current,
    localParticipant,
    remoteParticipants,
    isConnected,
    isMuted,
    isCameraOff,
    isScreenSharing,
    canPublish,
    error,
    activeSpeakerIds,
    toggleMic,
    toggleCamera,
    toggleScreenShare,
    disconnect,
  };
}
