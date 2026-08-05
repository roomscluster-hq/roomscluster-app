import { useState, useEffect, useCallback, useRef } from "react";
import {
  Room,
  RoomEvent,
  LocalParticipant,
  RemoteParticipant,
} from "livekit-client";
import { livekitApi } from "@/lib/api";
import { getCookie } from "@/lib/cookies";

export function useLiveKit(joinCode: string) {
  const roomRef = useRef<Room | null>(null);
  const connectingRef = useRef(false);
  const [localParticipant, setLocalParticipant] =
    useState<LocalParticipant | null>(null);
  const [remoteParticipants, setRemoteParticipants] = useState<
    RemoteParticipant[]
  >([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isCameraOff, setIsCameraOff] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [canPublish, setCanPublish] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canPublishRef = useRef(false);

  useEffect(() => {
    // Prevent double connect
    if (connectingRef.current || roomRef.current) return;
    connectingRef.current = true;

    const newRoom = new Room({
      adaptiveStream: true,
      dynacast: true,
    });

    const updateParticipants = () => {
      setRemoteParticipants([...newRoom.remoteParticipants.values()]);
    };

    newRoom.on(RoomEvent.ParticipantConnected, updateParticipants);
    newRoom.on(RoomEvent.ParticipantDisconnected, updateParticipants);
    newRoom.on(RoomEvent.TrackSubscribed, updateParticipants);
    newRoom.on(RoomEvent.TrackUnsubscribed, updateParticipants);
    newRoom.on(RoomEvent.LocalTrackPublished, updateParticipants);
    newRoom.on(RoomEvent.TrackPublished, updateParticipants);
    newRoom.on(RoomEvent.TrackUnpublished, updateParticipants);
    newRoom.on(RoomEvent.Disconnected, () => {
      setIsConnected(false);
      connectingRef.current = false;
    });
    newRoom.on(RoomEvent.Connected, () => {
      setIsConnected(true);
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
          publish = getCookie("guest_can_publish") === "true";
          console.log('[useLiveKit] Guest token found, canPublish:', publish);
        } else {
          const data = await livekitApi.getToken(joinCode);
          token = data.token;
          serverUrl = data.serverUrl;
          publish = data.canPublish;
          console.log('[useLiveKit] Token from API, canPublish:', publish, 'isHost:', data.isHost, 'isGuest:', data.isGuest);
        }

        // Don't connect if component was unmounted
        if (!connectingRef.current) return;

        roomRef.current = newRoom;
        setCanPublish(publish);
        canPublishRef.current = publish;
        console.log('[useLiveKit] Connecting with canPublish:', publish);
        await newRoom.connect(serverUrl, token);
        setLocalParticipant(newRoom.localParticipant);
        setRemoteParticipants([...newRoom.remoteParticipants.values()]);
        setIsConnected(true);
        console.log('[useLiveKit] Connected successfully');
      } catch (err: any) {
        connectingRef.current = false;
        setError(err.message ?? "Failed to connect to room");
        console.error('[useLiveKit] Connection error:', err);
      }
    }

    connect();

    return () => {
      connectingRef.current = false;
      if (roomRef.current) {
        roomRef.current.disconnect();
        roomRef.current = null;
      }
    };
  }, [joinCode]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      const room = roomRef.current;
      if (!room) return;

      if (document.visibilityState === "visible") {
        if (room.state === "disconnected") {
          console.log("[LiveKit] Tab visible — reconnecting");
          // Re-run connection by fetching a fresh token
          livekitApi.getToken(joinCode).then((data) => {
            room.connect(data.serverUrl, data.token).catch(console.error);
          });
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [joinCode]);

  const toggleMic = useCallback(async () => {
    const room = roomRef.current;
    if (!room || !canPublishRef.current) return;
    const enabled = !room.localParticipant.isMicrophoneEnabled;
    await room.localParticipant.setMicrophoneEnabled(enabled);
    setIsMuted(!enabled);
  }, []); // ← no dependency needed since we use ref

  const toggleCamera = useCallback(async () => {
    const room = roomRef.current;
    if (!room || !canPublishRef.current) return;
    const enabled = !room.localParticipant.isCameraEnabled;
    await room.localParticipant.setCameraEnabled(enabled);
    setIsCameraOff(!enabled);
  }, []); // ← no dependency needed

  const toggleScreenShare = useCallback(async () => {
    const room = roomRef.current;
    if (!room || !canPublishRef.current) return;
    const enabled = !room.localParticipant.isScreenShareEnabled;
    await room.localParticipant.setScreenShareEnabled(enabled);
    setIsScreenSharing(enabled);
  }, []); // ← no dependency needed

  const disconnect = useCallback(async () => {
    if (roomRef.current) {
      await roomRef.current.disconnect();
      roomRef.current = null;
    }
    connectingRef.current = false;
    setIsConnected(false);
  }, []);

  // Function to update canPublish state externally (e.g., after promotion)
  const updateCanPublish = useCallback((value: boolean) => {
    console.log('[LiveKit] updateCanPublish called:', value, 'current:', canPublishRef.current);
    canPublishRef.current = value;
    setCanPublish(value);
  }, []);

  // Sync local participant after reconnect (token refresh)
  const syncLocalParticipant = useCallback(() => {
    if (roomRef.current?.localParticipant) {
      setLocalParticipant(roomRef.current.localParticipant);
      setRemoteParticipants([...roomRef.current.remoteParticipants.values()]);
    }
  }, []);

  return {
    roomRef,
    localParticipant,
    remoteParticipants,
    isConnected,
    isMuted,
    isCameraOff,
    isScreenSharing,
    canPublish,
    updateCanPublish,
    syncLocalParticipant,
    error,
    toggleMic,
    toggleCamera,
    toggleScreenShare,
    disconnect,
  };
}
