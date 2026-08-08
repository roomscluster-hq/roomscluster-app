import { useState, useEffect, useCallback, useRef } from "react";
import {
  Room,
  RoomEvent,
  LocalParticipant,
  RemoteParticipant,
  Track,
} from "livekit-client";
import { livekitApi } from "@/lib/api";
import { getCookie } from "@/lib/cookies";
import { setLogLevel } from "livekit-client";

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

  // useEffect(() => {
  //   // Prevent double connect
  //   if (connectingRef.current || roomRef.current) return;
  //   connectingRef.current = true;

  //   setLogLevel("silent");
  //   const newRoom = new Room({
  //     adaptiveStream: false,
  //     dynacast: false,
  //   });

  //   const updateParticipants = () => {
  //     setRemoteParticipants([...newRoom.remoteParticipants.values()]);
  //     setLocalParticipant(newRoom.localParticipant);
  //   };

  //   newRoom.on(RoomEvent.ParticipantConnected, updateParticipants);
  //   newRoom.on(RoomEvent.ParticipantDisconnected, updateParticipants);
  //   newRoom.on(RoomEvent.TrackSubscribed, updateParticipants);
  //   newRoom.on(RoomEvent.TrackUnsubscribed, updateParticipants);
  //   newRoom.on(RoomEvent.LocalTrackPublished, updateParticipants);
  //   newRoom.on(RoomEvent.TrackPublished, updateParticipants);
  //   newRoom.on(RoomEvent.LocalTrackUnpublished, updateParticipants);
  //   newRoom.on(RoomEvent.TrackUnpublished, updateParticipants);

  //   newRoom.on(RoomEvent.ConnectionStateChanged, (state) => {
  //     console.log("🟡 CONNECTION STATE:", state);
  //   });

  //   newRoom.on(RoomEvent.SignalConnected, () => {
  //     console.log("🟢 SIGNAL CONNECTED");
  //   });

  //   newRoom.on(RoomEvent.Connected, () => {
  //     console.log("CONNECTED");
  //   });

  //   newRoom.on(RoomEvent.Reconnecting, () => {
  //     console.log("RECONNECTING");
  //   });

  //   newRoom.on(RoomEvent.Reconnected, () => {
  //     console.log("RECONNECTED");
  //   });

  //   newRoom.on(RoomEvent.MediaDevicesError, (e) => {
  //     console.log("MEDIA ERROR", e);
  //   });

  //   newRoom.on(RoomEvent.Disconnected, (reason) => {
  //     console.log("🔴 LIVEKIT DISCONNECTED");
  //     console.log("Reason:", reason);
  //     console.log("Room state:", newRoom.state);

  //     setIsConnected(false);
  //     connectingRef.current = false;
  //   });
  //   newRoom.on(RoomEvent.Connected, () => {
  //     setIsConnected(true);
  //   });
  //   newRoom.on(RoomEvent.LocalTrackUnpublished, (publication) => {
  //     if (publication.track?.source === Track.Source.ScreenShare) {
  //       setIsScreenSharing(false);
  //     }
  //     updateParticipants();
  //   });

  //   async function connect() {
  //     try {
  //       const guestToken = getCookie("guest_token");
  //       const guestServerUrl = getCookie("livekit_server_url");

  //       let token: string;
  //       let serverUrl: string;
  //       let publish = false;

  //       if (guestToken && guestServerUrl) {
  //         token = guestToken;
  //         serverUrl = decodeURIComponent(guestServerUrl);
  //         publish = getCookie("guest_can_publish") === "true";
  //       } else {
  //         const data = await livekitApi.getToken(joinCode);
  //         token = data.token;
  //         serverUrl = data.serverUrl;
  //         publish = data.canPublish;
  //       }

  //       // Don't connect if component was unmounted
  //       if (!connectingRef.current) return;

  //       setCanPublish(publish);
  //       canPublishRef.current = publish;
  //       await newRoom.connect(serverUrl, token);
  //       roomRef.current = newRoom;
  //       setLocalParticipant(newRoom.localParticipant);
  //       setRemoteParticipants([...newRoom.remoteParticipants.values()]);
  //       setIsConnected(true);
  //     } catch (err: any) {
  //       // Ignore React Strict Mode double-mount disconnects
  //       if (
  //         err?.message?.includes("Client initiated disconnect") ||
  //         err?.message?.includes("Abort connection attempt")
  //       ) {
  //         return;
  //       }
  //       connectingRef.current = false;
  //       setError(err.message ?? "Failed to connect to room");
  //       console.error("[useLiveKit] Connection error:", err);
  //     }
  //   }

  //   connect();

  //   return () => {
  //     connectingRef.current = false;
  //     if (roomRef.current) {
  //       roomRef.current.disconnect();
  //       roomRef.current = null;
  //     }
  //   };
  // }, [joinCode]);

  useEffect(() => {
    let cancelled = false;

    const room = new Room({
      adaptiveStream: false,
      dynacast: false,
    });

    connectingRef.current = true;

    const updateParticipants = () => {
      if (cancelled) return;

      setRemoteParticipants([...room.remoteParticipants.values()]);
      setLocalParticipant(room.localParticipant);
    };

    room.on(RoomEvent.ParticipantConnected, updateParticipants);
    room.on(RoomEvent.ParticipantDisconnected, updateParticipants);
    room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
      console.log("🎥 HOST RECEIVED TRACK", {
        participant: participant.identity,
        source: publication.source,
        kind: publication.kind,
        trackSid: publication.trackSid,
      });

      updateParticipants();
    });
    room.on(RoomEvent.TrackUnsubscribed, updateParticipants);
    room.on(RoomEvent.LocalTrackPublished, updateParticipants);
    room.on(RoomEvent.LocalTrackUnpublished, updateParticipants);

    room.on(RoomEvent.ConnectionStateChanged, (state) => {
      console.log("🟡 CONNECTION STATE:", state);
    });

    room.on(RoomEvent.SignalConnected, () => {
      console.log("🟢 SIGNAL CONNECTED");
    });

    room.on(RoomEvent.Connected, () => {
      console.log("🟢 CONNECTED");

      if (!cancelled) {
        setIsConnected(true);
      }
    });

    room.on(RoomEvent.Reconnecting, () => {
      console.log("🟠 RECONNECTING");
    });

    room.on(RoomEvent.Reconnected, () => {
      console.log("🟢 RECONNECTED");

      if (!cancelled) {
        setIsConnected(true);
        updateParticipants();
      }
    });

    room.on(RoomEvent.Disconnected, (reason) => {
      console.log("🔴 DISCONNECTED");
      console.log("Reason:", reason);

      if (!cancelled) {
        setIsConnected(false);
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
          publish = getCookie("guest_can_publish") === "true";
        } else {
          const data = await livekitApi.getToken(joinCode);

          token = data.token;
          serverUrl = data.serverUrl;
          publish = data.canPublish;
        }

        // Effect was cleaned up while token was being fetched
        if (cancelled) {
          console.log("⚠️ Connection cancelled before connect");
          return;
        }

        setCanPublish(publish);
        canPublishRef.current = publish;

        console.log("🔵 Connecting to:", serverUrl);

        await room.connect(serverUrl, token);

        // Effect was cleaned up while connect() was running
        if (cancelled) {
          console.log("⚠️ Connection completed after cleanup");
          await room.disconnect();
          return;
        }

        roomRef.current = room;

        setLocalParticipant(room.localParticipant);
        setRemoteParticipants([...room.remoteParticipants.values()]);

        setIsConnected(true);

        console.log("✅ LiveKit connection successful");
      } catch (err: any) {
        if (cancelled) return;

        console.error("[useLiveKit] Connection error:", err);

        setError(err?.message ?? "Failed to connect to room");
      } finally {
        if (!cancelled) {
          connectingRef.current = false;
        }
      }
    }

    connect();

    return () => {
      console.log("🧹 Cleaning up LiveKit connection");

      cancelled = true;
      connectingRef.current = false;

      room.disconnect();

      if (roomRef.current === room) {
        roomRef.current = null;
      }
    };
  }, [joinCode]);

  // useEffect(() => {
  //   const handleVisibilityChange = () => {
  //     const room = roomRef.current;
  //     if (!room) return;

  //     if (document.visibilityState === "visible") {
  //       if (room.state === "disconnected") {
  //         // Re-run connection by fetching a fresh token
  //         livekitApi.getToken(joinCode).then((data) => {
  //           room.connect(data.serverUrl, data.token).catch(console.error);
  //         });
  //       }
  //     }
  //   };

  //   document.addEventListener("visibilitychange", handleVisibilityChange);
  //   return () =>
  //     document.removeEventListener("visibilitychange", handleVisibilityChange);
  // }, [joinCode]);

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
    setLocalParticipant(room.localParticipant);
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
