import { useState, useEffect, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { ChatMessage } from "@/types";
import { getCookie } from "@/lib/cookies";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:5000";

interface RaisedHand {
  userId: string;
  name: string;
  email: string;
}

interface UseSocketCallbacks {
  onWhiteboardDraw?: (event: any) => void;
  onWhiteboardClear?: () => void;
  onPromoted?: (userId: string) => void;
}

export function useSocket(joinCode: string, callbacks?: UseSocketCallbacks) {
  const socketRef = useRef<Socket | null>(null);
  const joinedRef = useRef(false);
  const callbacksRef = useRef(callbacks);

  // Keep callbacks ref updated without re-running effect
  useEffect(() => {
    callbacksRef.current = callbacks;
  });

  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);
  const [raisedHands, setRaisedHands] = useState<RaisedHand[]>([]);

  useEffect(() => {
    // If socket already exists and is connected, don't create another
    if (socketRef.current?.connected) return;

    const token =
      localStorage.getItem("access_token") ??
      getCookie("guest_token") ?? "";

    const socket = io(`${SOCKET_URL}/session`, {
      auth: { token },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("[Socket] Connected:", socket.id);
      setIsConnected(true);

      // Only join room once per socket instance
      if (!joinedRef.current) {
        joinedRef.current = true;
        socket.emit("room:join", { joinCode });
        console.log("[Socket] Joined room:", joinCode);
      }
    });

    socket.on("reconnect", () => {
      console.log("[Socket] Reconnected — rejoining room");
      joinedRef.current = true;
      socket.emit("room:join", { joinCode });
      console.log("[Socket] Rejoined room:", joinCode);
    });

    socket.on("connect_error", (err) => {
      console.error("[Socket] Connection error:", err.message);
    });

    socket.on("disconnect", (reason) => {
      console.log("[Socket] Disconnected:", reason);
      setIsConnected(false);
      joinedRef.current = false; // ← Reset so we rejoin on reconnect
    });

    // ── Participants ──────────────────────────────────
    socket.on("room:participants", (data: any[]) => {
      setParticipants(data);
    });

    socket.on("participant:joined", (data: any) => {
      setParticipants((prev) => {
        const exists = prev.find((p) => p.user?.id === data.userId);
        return exists ? prev : [...prev, data];
      });
    });

    socket.on("participant:left", (data: { userId: string }) => {
      setParticipants((prev) =>
        prev.filter((p) => p.user?.id !== data.userId)
      );
    });

    socket.on("participant:promoted", (data: { userId: string }) => {
      console.log("[Socket] participant:promoted:", data.userId);
      setParticipants((prev) =>
        prev.map((p) =>
          p.user?.id === data.userId ? { ...p, role: "SPEAKER" } : p
        )
      );
      callbacksRef.current?.onPromoted?.(data.userId);
    });

    socket.on("participant:demoted", (data: { userId: string }) => {
      setParticipants((prev) =>
        prev.map((p) =>
          p.user?.id === data.userId ? { ...p, role: "GUEST" } : p
        )
      );
    });

    // ── Chat ─────────────────────────────────────────
    socket.on("chat:message", (message: ChatMessage) => {
      console.log("[Socket] chat:message received:", message.content);
      setMessages((prev) => [...prev, message]);
    });

    // ── Hand raise ────────────────────────────────────
    socket.on("hand:raised", (data: RaisedHand) => {
      console.log("[Socket] hand:raised received:", data);
      setRaisedHands((prev) => {
        const exists = prev.find((h) => h.userId === data.userId);
        return exists ? prev : [...prev, data];
      });
    });

    socket.on("hand:lowered", (data: { userId: string }) => {
      setRaisedHands((prev) =>
        prev.filter((h) => h.userId !== data.userId)
      );
    });

    // ── Whiteboard ────────────────────────────────────
    socket.on("whiteboard:draw", (data: any) => {
      callbacksRef.current?.onWhiteboardDraw?.(data);
    });

    socket.on("whiteboard:cleared", () => {
      callbacksRef.current?.onWhiteboardClear?.();
    });

    // ── Session ended ─────────────────────────────────
    socket.on("session:ended", () => {
      window.location.href = "/dashboard";
    });

    return () => {
      console.log("[Socket] Cleanup — disconnecting");
      joinedRef.current = false;
      socket.emit("room:leave");
      socket.disconnect();
      socketRef.current = null;
    };
  }, [joinCode]);

  const sendMessage = useCallback((content: string) => {
    if (!socketRef.current?.connected) {
      console.warn("[Socket] Cannot send — not connected");
      return;
    }
    socketRef.current.emit("chat:send", { content });
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

  const endSession = useCallback(() => {
    socketRef.current?.emit("session:end");
  }, []);

  return {
    socketRef,
    isConnected,
    messages,
    participants,
    raisedHands,
    sendMessage,
    raiseHand,
    lowerHand,
    lowerHandForUser,
    promoteParticipant,
    endSession,
  };
}