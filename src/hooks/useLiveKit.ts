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
  const [remoteParticipants, setRemoteParticipants] = useState<RemoteParticipant[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isCameraOff, setIsCameraOff] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [canPublish, setCanPublish] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    newRoom.on(RoomEvent.Disconnected, () => {
      setIsConnected(false);
      connectingRef.current = false;
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
          publish = false;
        } else {
          const data = await livekitApi.getToken(joinCode);
          token = data.token;
          serverUrl = data.serverUrl;
          publish = data.canPublish;
        }

        // Don't connect if component was unmounted
        if (!connectingRef.current) return;

        roomRef.current = newRoom;
        setCanPublish(publish);
        await newRoom.connect(serverUrl, token);
        setLocalParticipant(newRoom.localParticipant);
        setRemoteParticipants([...newRoom.remoteParticipants.values()]);
        setIsConnected(true);
      } catch (err: any) {
        connectingRef.current = false;
        setError(err.message ?? "Failed to connect to room");
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
        livekitApi.getToken(joinCode).then(data => {
          room.connect(data.serverUrl, data.token).catch(console.error);
        });
      }
    }
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);
  return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
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
    if (roomRef.current) {
      await roomRef.current.disconnect();
      roomRef.current = null;
    }
    connectingRef.current = false;
    setIsConnected(false);
  }, []);

  // Function to update canPublish state externally (e.g., after promotion)
  const updateCanPublish = useCallback((value: boolean) => {
    setCanPublish(value);
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
    error,
    toggleMic,
    toggleCamera,
    toggleScreenShare,
    disconnect,
  };
}