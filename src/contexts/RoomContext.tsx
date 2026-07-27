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
import {
  Room,
  RoomEvent,
  LocalParticipant,
  RemoteParticipant,
} from "livekit-client";
import { io, Socket } from "socket.io-client";
import { livekitApi, sessionsApi } from "@/lib/api";
import { getCookie } from "@/lib/cookies";
import { ChatMessage } from "@/types";
import { toast } from "sonner";
import { clearSessionCookies } from "@/lib/utils";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:5000";

interface RaisedHand {
  userId: string;
  name: string;
  email: string;
}

interface RoomContextValue {
  // LiveKit
  localParticipant: LocalParticipant | null;
  remoteParticipants: RemoteParticipant[];
  isLiveKitConnected: boolean;
  isMuted: boolean;
  isCameraOff: boolean;
  isScreenSharing: boolean;
  canPublish: boolean;
  liveKitError: string | null;
  toggleMic: () => Promise<void>;
  toggleCamera: () => Promise<void>;
  toggleScreenShare: () => Promise<void>;
  disconnect: () => Promise<void>;
  // Socket
  isSocketConnected: boolean;
  messages: ChatMessage[];
  participants: any[];
  raisedHands: RaisedHand[];
  sendMessage: (content: string) => void;
  raiseHand: () => void;
  lowerHand: () => void;
  lowerHandForUser: (userId: string) => void;
  promoteParticipant: (userId: string) => void;
  demoteParticipant: (userId: string) => void;
  endSession: () => void;
  socketRef: React.RefObject<Socket | null>;
  // Whiteboard callbacks
  setOnWhiteboardDraw: (fn: ((event: any) => void) | null) => void;
  setOnWhiteboardClear: (fn: (() => void) | null) => void;
  setOnPromoted: (fn: ((userId: string) => void) | null) => void;
  isRecording: boolean;
  recordingLoading: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  activeSpeakerIds: Set<string>;
  waitingParticipants: {
    id: string;
    name: string;
    email: string;
    identity: string;
  }[];
  admitParticipant: (joinCode: string, waitingParticipantId: string) => void;
  admitAll: (joinCode: string) => void;
  rejectParticipant: (joinCode: string, waitingParticipantId: string) => void;
  makeCohost: (userId: string) => void;
  removeCohost: (userId: string) => void;
  rejectAll: (joinCode: string) => void;
  isCohost: boolean;
  participantVideoEnabled: boolean;
  participantMicEnabled: boolean;
  roomChatEnabled: boolean;
  roomVideoEnabled: boolean;
  roomMicEnabled: boolean;
}

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
  // ── LiveKit state ──────────────────────────────────
  const roomRef = useRef<Room | null>(null);
  const intentionalDisconnectRef = useRef(false);
  const myIdentityRef = useRef<string | null>(null);
  const [localParticipant, setLocalParticipant] =
    useState<LocalParticipant | null>(null);
  const [remoteParticipants, setRemoteParticipants] = useState<
    RemoteParticipant[]
  >([]);
  const [isLiveKitConnected, setIsLiveKitConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isCameraOff, setIsCameraOff] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [canPublish, setCanPublish] = useState(false);
  const [liveKitError, setLiveKitError] = useState<string | null>(null);
  const [activeSpeakerIds, setActiveSpeakerIds] = useState<Set<string>>(
    new Set(),
  );

  // ── Socket state ───────────────────────────────────
  const socketRef = useRef<Socket | null>(null);
  const socketJoinedRef = useRef(false);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);
  const [raisedHands, setRaisedHands] = useState<RaisedHand[]>([]);
  const [waitingParticipants, setWaitingParticipants] = useState<
    {
      id: string;
      name: string;
      email: string;
      identity: string;
    }[]
  >([]);
  const [isCohost, setIsCohost] = useState(false);
  const [participantVideoEnabled, setParticipantVideoEnabled] = useState(true);
  const [participantMicEnabled, setParticipantMicEnabled] = useState(true);
  const [roomChatEnabled, setRoomChatEnabled] = useState(true);
  const [roomVideoEnabled, setRoomVideoEnabled] = useState(true);
  const [roomMicEnabled, setRoomMicEnabled] = useState(true);

  // ── Callback refs ──────────────────────────────────
  const onWhiteboardDrawRef = useRef<((event: any) => void) | null>(null);
  const onWhiteboardClearRef = useRef<(() => void) | null>(null);
  const onPromotedRef = useRef<((userId: string) => void) | null>(null);

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingLoading, setRecordingLoading] = useState(false);

  useEffect(() => {
    console.log("[RoomProvider] MOUNTED");
    return () => console.log("[RoomProvider] UNMOUNTED");
  }, []);

  // Load initial session settings so room-level state reflects DB on join
  useEffect(() => {
    async function loadSettings() {
      try {
        const API_URL =
          process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";
        const res = await fetch(`${API_URL}/sessions/${sessionId}/settings`);
        if (res.ok) {
          const json = await res.json();
          const s = json.data ?? json;
          setRoomChatEnabled(s.chatEnabled ?? true);
          setRoomVideoEnabled(s.participantVideoEnabled ?? true);
          setRoomMicEnabled(s.participantMicEnabled ?? true);
        }
      } catch {
        // fail silently — defaults to enabled
      }
    }
    loadSettings();
  }, [sessionId]);

  // ── Initialize LiveKit ─────────────────────────────
  useEffect(() => {
    let cancelled = false;
    console.log("[LiveKit useEffect] RUNNING for joinCode:", joinCode);

    const newRoom = new Room({
      adaptiveStream: true,
      dynacast: true,
    });

    const updateParticipants = () => {
      if (!cancelled)
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
      if (!cancelled) setIsLiveKitConnected(false);
    });
    newRoom.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
      if (!cancelled)
        setActiveSpeakerIds(new Set(speakers.map((p) => p.identity)));
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
          setCanPublish(publish);
        }

        // Strict Mode unmounted this before token fetch finished — bail without disconnecting
        if (cancelled) return;

        roomRef.current = newRoom;
        setCanPublish(publish);
        await newRoom.connect(serverUrl, token, {
          autoSubscribe: true,
        });

        // Strict Mode unmounted during connect — only disconnect if intentional
        if (cancelled) {
          if (intentionalDisconnectRef.current) {
            newRoom.disconnect();
          }
          // If not intentional (Strict Mode), just abandon — don't send leave signal
          return;
        }

        setLocalParticipant(newRoom.localParticipant);
        myIdentityRef.current = newRoom.localParticipant.identity;
        setRemoteParticipants([...newRoom.remoteParticipants.values()]);
        setIsLiveKitConnected(true);
      } catch (err: any) {
        if (!cancelled) setLiveKitError(err.message ?? "Failed to connect");
      }
    }

    connect();

    return () => {
      cancelled = true;
      roomRef.current = null;

      if (intentionalDisconnectRef.current) {
        // User clicked Leave or End Session — clean disconnect
        newRoom.disconnect();
      } else {
        // Strict Mode cleanup or hot reload — strip listeners only
        // Never call disconnect here — it sends a leave signal mid-reconnect
        newRoom.off(RoomEvent.ParticipantConnected, updateParticipants);
        newRoom.off(RoomEvent.ParticipantDisconnected, updateParticipants);
        newRoom.off(RoomEvent.TrackSubscribed, updateParticipants);
        newRoom.off(RoomEvent.TrackUnsubscribed, updateParticipants);
        newRoom.off(RoomEvent.LocalTrackPublished, updateParticipants);
        newRoom.off(RoomEvent.TrackPublished, updateParticipants);
        newRoom.off(RoomEvent.TrackUnpublished, updateParticipants);
        newRoom.removeAllListeners(RoomEvent.Disconnected);
      }
    };
  }, [joinCode]);

  // ── Initialize Socket.io ───────────────────────────
  useEffect(() => {
    let cancelled = false;
    socketJoinedRef.current = false;

    // Load chat history once on mount
    async function loadChatHistory() {
      try {
        const history = await sessionsApi.getChatHistory(joinCode);
        if (!cancelled) setMessages(history);
      } catch (err) {
        console.error("[Chat] Failed to load history:", err);
      }
    }

    loadChatHistory(); // ← only called once

    const token =
      localStorage.getItem("access_token") ?? getCookie("guest_token") ?? "";

    if (!token) {
      console.warn("[Socket] No token found");
      return;
    }

    // Reuse existing socket if still connected, otherwise create new one
    let socket: Socket;
    if (socketRef.current?.connected) {
      console.log(
        "[Socket] Reusing existing connection:",
        socketRef.current.id,
      );
      socket = socketRef.current;
      socket.removeAllListeners();
    } else {
      console.log("[Socket] Creating new connection");
      socket = io(`${SOCKET_URL}/session`, {
        auth: { token },
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
      });
      socketRef.current = socket;
    }

    // If already connected, join room immediately
    if (socket.connected) {
      console.log("[Socket] Already connected — joining room:", joinCode);
      setIsSocketConnected(true);
      socket.emit("room:join", { joinCode });
    }

    socket.on("connect", () => {
      if (cancelled) {
        socket.disconnect();
        return;
      }
      console.log("[Socket] Connected:", socket.id, "joining room:", joinCode);
      setIsSocketConnected(true);
      socket.emit("room:join", { joinCode });
    });

    socket.on("reconnect", () => {
      if (cancelled) return;
      socket.emit("room:join", { joinCode });
    });

    socket.on("connect_error", (err) => {
      console.error("[Socket] connect_error:", err.message);
    });

    socket.on("disconnect", (reason) => {
      if (cancelled) return;
      console.log("[Socket] Disconnected:", reason);
      setIsSocketConnected(false);
    });

    socket.on("room:participants", (data: any[]) => {
      if (!cancelled) {
        const seen = new Set<string>();
        const deduped = data.filter((p) => {
          const id = p.user?.id ?? p.userId;
          if (seen.has(id)) return false;
          seen.add(id);
          return true;
        });
        setParticipants(deduped);
      }
    });

    socket.on("participant:joined", (data: any) => {
      if (cancelled) return;
      toast(`${data.name} joined the session`);
      setParticipants((prev) => {
        const id = data.user?.id ?? data.userId;
        const exists = prev.find((p) => (p.user?.id ?? p.userId) === id);
        return exists ? prev : [...prev, data];
      });
    });

    socket.on("participant:left", (data: { userId: string }) => {
      if (!cancelled) {
        setParticipants((prev) =>
          prev.filter((p) => (p.user?.id ?? p.userId) !== data.userId),
        );
      }
    });

    socket.on(
      "participant:promoted",
      async (data: {
        userId: string;
        token?: string;
        serverUrl?: string;
        participantVideoEnabled?: boolean;
        participantMicEnabled?: boolean;
      }) => {
        if (cancelled) return;

        setParticipants((prev) =>
          prev.map((p) =>
            (p.user?.id ?? p.userId) === data.userId
              ? { ...p, role: "SPEAKER" }
              : p,
          ),
        );

        const myIdentity = myIdentityRef.current;
        if (
          myIdentity &&
          myIdentity === data.userId &&
          data.token &&
          data.serverUrl
        ) {
          toast.success("You can now speak!");
          const room = roomRef.current;
          if (room) {
            try {
              // Disable UI flicker: set a "reconnecting" flag so VideoTile shows
              // a brief "Upgrading..." state instead of fully disappearing
              setLiveKitError(null);

              // Use LiveKit's built-in reconnect-in-place: pass the SAME room instance
              // disconnect with shouldStopTracks: false keeps local media devices warm
              await room.disconnect(false); // false = don't stop local tracks (camera/mic stay warm)
              await room.connect(data.serverUrl, data.token, {
                autoSubscribe: true,
              });

              setLocalParticipant(room.localParticipant);
              setCanPublish(true);
              setIsLiveKitConnected(true);

              if (myIdentity.startsWith("guest_") && data.token) {
                const maxAge = 60 * 60 * 4;
                document.cookie = `guest_token=${data.token}; path=/; max-age=${maxAge}; SameSite=Lax`;
                document.cookie = `livekit_server_url=${encodeURIComponent(data.serverUrl)}; path=/; max-age=${maxAge}; SameSite=Lax`;
              }
              console.log(
                "[LiveKit] Reconnected as speaker — canPublish: true",
              );
            } catch (err) {
              console.error("[LiveKit] Failed to reconnect as speaker:", err);
            }

            if (myIdentity === data.userId) {
              const videoAllowed = data.participantVideoEnabled ?? true;
              const micAllowed = data.participantMicEnabled ?? true;
              setParticipantVideoEnabled(videoAllowed);
              setParticipantMicEnabled(micAllowed);

              // If mic is disabled, immediately mute
              if (!micAllowed && room) {
                await room.localParticipant.setMicrophoneEnabled(false);
                setIsMuted(true);
              }
              // If video is disabled, immediately turn off camera
              if (!videoAllowed && room) {
                await room.localParticipant.setCameraEnabled(false);
                setIsCameraOff(true);
              }
            }
          }
        }

        onPromotedRef.current?.(data.userId);
      },
    );

    socket.on(
      "participant:demoted",
      async (data: { userId: string; token?: string; serverUrl?: string }) => {
        if (cancelled) return;

        setParticipants((prev) =>
          prev.map((p) =>
            (p.user?.id ?? p.userId) === data.userId
              ? { ...p, role: "GUEST" }
              : p,
          ),
        );

        const myIdentity = myIdentityRef.current;
        if (
          myIdentity &&
          myIdentity === data.userId &&
          data.token &&
          data.serverUrl
        ) {
          toast("Your speaking access has been removed");
          const room = roomRef.current;
          if (room) {
            try {
              await room.localParticipant.setMicrophoneEnabled(false);
              await room.localParticipant.setCameraEnabled(false);
              await room.disconnect(false); // keep devices warm
              await room.connect(data.serverUrl, data.token, {
                autoSubscribe: true,
              });
              setLocalParticipant(room.localParticipant);
              setCanPublish(false);
              setIsMuted(true);
              setIsCameraOff(true);
              setIsLiveKitConnected(true);
            } catch (err) {
              console.error("[LiveKit] Failed to reconnect as audience:", err);
            }
          }
        }
      },
    );

    socket.on("chat:message", (message: ChatMessage) => {
      if (!cancelled) {
        setMessages((prev) => {
          if (prev.find((m) => m.id === message.id)) return prev;
          return [...prev, message];
        });
      }
    });

    socket.on("hand:raised", (data: RaisedHand) => {
      if (cancelled) return;
      setRaisedHands((prev) => {
        const exists = prev.find((h) => h.userId === data.userId);
        return exists ? prev : [...prev, data];
      });
    });

    socket.on("hand:lowered", (data: { userId: string }) => {
      if (!cancelled)
        setRaisedHands((prev) => prev.filter((h) => h.userId !== data.userId));
    });

    socket.on("whiteboard:draw", (data: any) => {
      if (!cancelled) onWhiteboardDrawRef.current?.(data);
    });

    socket.on("whiteboard:cleared", () => {
      if (!cancelled) onWhiteboardClearRef.current?.();
    });

    socket.on("session:ended", () => {
      if (!cancelled) {
        clearSessionCookies(); 
        window.location.href = "/dashboard";
      }
    });

    socket.on("recording:started", () => {
      if (!cancelled) {
        setIsRecording(true);
        setRecordingLoading(false); 
        toast.success("Recording started"); 
      }
    });

    socket.on("recording:stopped", () => {
      if (!cancelled) {
        setIsRecording(false);
        setRecordingLoading(false); 
        toast.success("Recording stopped — processing will finish shortly"); 
      }
    });

    // Someone joined the waiting room
    socket.on(
      "waiting:new",
      (data: { id: string; name: string; email: string; identity: string }) => {
        if (!cancelled) {
          setWaitingParticipants((prev) => [...prev, data]);
        }
      },
    );

    // A specific participant was admitted
    socket.on(
      "waiting:participant-admitted",
      (data: { id: string; identity: string }) => {
        if (!cancelled) {
          setWaitingParticipants((prev) =>
            prev.filter((p) => p.id !== data.id),
          );
        }
      },
    );

    // All participants were admitted
    socket.on("waiting:all-admitted", () => {
      if (!cancelled) setWaitingParticipants([]);
    });

    socket.on("waiting:all-rejected", () => {
      if (!cancelled) setWaitingParticipants([]);
    });

    // A participant was rejected
    socket.on("waiting:participant-rejected", (data: { id: string }) => {
      if (!cancelled) {
        setWaitingParticipants((prev) => prev.filter((p) => p.id !== data.id));
      }
    });

    socket.on(
      "settings:updated",
      (s: {
        chatEnabled?: boolean;
        participantVideoEnabled?: boolean;
        participantMicEnabled?: boolean;
      }) => {
        if (cancelled) return;
        if (s.chatEnabled !== undefined) setRoomChatEnabled(s.chatEnabled);
        if (s.participantVideoEnabled !== undefined)
          setRoomVideoEnabled(s.participantVideoEnabled);
        if (s.participantMicEnabled !== undefined)
          setRoomMicEnabled(s.participantMicEnabled);
      },
    );

    // Co-host events
    socket.on(
      "participant:became-cohost",
      async (data: { userId: string; token?: string; serverUrl?: string }) => {
        if (cancelled) return;

        setParticipants((prev) =>
          prev.map((p) =>
            p.userId === data.userId ? { ...p, role: "COHOST" } : p,
          ),
        );

        if (data.userId === myIdentityRef.current) {
          setIsCohost(true);
        }

        // If THIS user was promoted to co-host, reconnect with a publish-enabled token
        const myIdentity = myIdentityRef.current;
        if (
          myIdentity &&
          myIdentity === data.userId &&
          data.token &&
          data.serverUrl
        ) {
          toast.success("You are now a co-host!");
          const room = roomRef.current;
          if (room) {
            try {
              await room.disconnect(false);
              await room.connect(data.serverUrl, data.token, {
                autoSubscribe: true,
              });
              setLocalParticipant(room.localParticipant);
              setCanPublish(true);
              setIsLiveKitConnected(true);
              const accessToken = localStorage.getItem("access_token");
              if (!accessToken) {
                // Auth store still has it — rehydrate from cookie or re-login not needed
                // The axios interceptor will use whatever is in localStorage
              }

              // If co-host is a guest (edge case), update their cookie too
              if (myIdentity.startsWith("guest_") && data.token) {
                const maxAge = 60 * 60 * 4;
                document.cookie = `guest_token=${data.token}; path=/; max-age=${maxAge}; SameSite=Lax`;
                document.cookie = `livekit_server_url=${encodeURIComponent(data.serverUrl)}; path=/; max-age=${maxAge}; SameSite=Lax`;
              }
            } catch (err) {
              console.error("[LiveKit] Failed to reconnect as co-host:", err);
            }
          }
        }
      },
    );

    socket.on(
      "participant:cohost-removed",
      async (data: { userId: string; token?: string; serverUrl?: string }) => {
        if (cancelled) return;

        setParticipants((prev) =>
          prev.map((p) =>
            p.userId === data.userId ? { ...p, role: "GUEST" } : p,
          ),
        );

        if (data.userId === myIdentityRef.current) {
          setIsCohost(false);
        }

        // If THIS user was removed as co-host, reconnect with restricted token
        const myIdentity = myIdentityRef.current;
        if (
          myIdentity &&
          myIdentity === data.userId &&
          data.token &&
          data.serverUrl
        ) {
          toast("Your co-host access has been removed");
          const room = roomRef.current;
          if (room) {
            try {
              await room.localParticipant.setMicrophoneEnabled(false);
              await room.localParticipant.setCameraEnabled(false);
              await room.disconnect(false);
              await room.connect(data.serverUrl, data.token, {
                autoSubscribe: true,
              });
              setLocalParticipant(room.localParticipant);
              setCanPublish(false);
              setIsMuted(true);
              setIsCameraOff(true);
              setIsLiveKitConnected(true);
            } catch (err) {
              console.error(
                "[LiveKit] Failed to reconnect after co-host removal:",
                err,
              );
            }
          }
        }
      },
    );

    return () => {
      cancelled = true;
      socketJoinedRef.current = false;

      if (intentionalDisconnectRef.current) {
        socket.emit("room:leave");
        socket.disconnect();
        socketRef.current = null;
        intentionalDisconnectRef.current = false;
      } else {
        // Strict Mode / hot reload — strip listeners, keep connection alive
        socket.removeAllListeners();
      }
    };
  }, [joinCode]);

  // ── Visibility change handler ──────────────────────
  useEffect(() => {
    const handleVisibilityChange = () => {
      const socket = socketRef.current;
      if (!socket) return;

      if (document.visibilityState === "visible") {
        if (!socket.connected) {
          console.log("[Socket] Tab visible — reconnecting");
          socket.connect();
        } else {
          socket.emit("room:join", { joinCode });
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [joinCode]);

  // ── LiveKit controls ───────────────────────────────
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
    setIsLiveKitConnected(false);
  }, []);

  const startRecording = useCallback(async () => {
    //start recording
    setRecordingLoading(true);
    socketRef.current?.emit("recording:start");
    // recordingLoading will be cleared by the recording:started socket event
    // Add a timeout fallback in case the event doesn't come back
    setTimeout(() => setRecordingLoading(false), 5000);
  }, []);

  const stopRecording = useCallback(async () => {
    setRecordingLoading(true);
    socketRef.current?.emit("recording:stop");
    setTimeout(() => setRecordingLoading(false), 5000);
  }, []);

  // ── Socket controls ────────────────────────────────
  const sendMessage = useCallback((content: string) => {
    socketRef.current?.emit("chat:send", { content });
  }, []);

  const raiseHand = useCallback(() => {
    socketRef.current?.emit("hand:raise");
  }, []);

  const lowerHand = useCallback(() => {
    socketRef.current?.emit("hand:lower");
  }, []);

  const lowerHandForUser = useCallback((userId: string) => {
    socketRef.current?.emit("hand:lower:user", { userId });
  }, []);

  const promoteParticipant = useCallback((userId: string) => {
    socketRef.current?.emit("participant:promote", { userId });
  }, []);

  const demoteParticipant = useCallback((userId: string) => {
    socketRef.current?.emit("participant:demote", { userId });
  }, []);

  const endSession = useCallback(() => {
    intentionalDisconnectRef.current = true;
    socketRef.current?.emit("session:end");
  }, []);

  // ── Callback setters ───────────────────────────────
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

  const admitParticipant = useCallback(
    (joinCode: string, waitingParticipantId: string) => {
      socketRef.current?.emit("waiting:admit", {
        joinCode,
        waitingParticipantId,
      });
    },
    [],
  );

  const admitAll = useCallback((joinCode: string) => {
    socketRef.current?.emit("waiting:admit-all", { joinCode });
  }, []);

  const rejectAll = useCallback((joinCode: string) => {
    socketRef.current?.emit("waiting:reject-all", { joinCode });
  }, []);

  const rejectParticipant = useCallback(
    (joinCode: string, waitingParticipantId: string) => {
      socketRef.current?.emit("waiting:reject", {
        joinCode,
        waitingParticipantId,
      });
    },
    [],
  );

  const makeCohost = useCallback((userId: string) => {
    socketRef.current?.emit("participant:make-cohost", { userId });
  }, []);

  const removeCohost = useCallback((userId: string) => {
    socketRef.current?.emit("participant:remove-cohost", { userId });
  }, []);

  return (
    <RoomContext.Provider
      value={{
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
        isSocketConnected,
        messages,
        participants,
        raisedHands,
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
        setOnPromoted,
        isRecording,
        recordingLoading,
        startRecording,
        stopRecording,
        activeSpeakerIds,
        waitingParticipants,
        admitParticipant,
        admitAll,
        rejectParticipant,
        makeCohost,
        removeCohost,
        rejectAll,
        isCohost,
        participantVideoEnabled,
        participantMicEnabled,
        roomChatEnabled,
        roomVideoEnabled,
        roomMicEnabled,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
}

export function useRoom() {
  const ctx = useContext(RoomContext);
  if (!ctx) throw new Error("useRoom must be used inside RoomProvider");
  return ctx;
}
