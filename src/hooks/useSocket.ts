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

interface WaitingParticipant {
  id: string;
  name: string;
  email: string;
  identity: string;
}

export function useSocket(joinCode: string) {
  const socketRef = useRef<Socket | null>(null);
  const joinedRef = useRef(false);

  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);
  const [raisedHands, setRaisedHands] = useState<RaisedHand[]>([]);
  const [waitingParticipants, setWaitingParticipants] = useState<
    WaitingParticipant[]
  >([]);
  const [reactions, setReactions] = useState<any[]>([]);

  useEffect(() => {
    if (socketRef.current && !socketRef.current.connected) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    if (socketRef.current?.connected) return;

    const token =
      localStorage.getItem("access_token") ?? getCookie("guest_token") ?? "";

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
      if (!joinedRef.current) {
        joinedRef.current = true;
        socket.emit("room:join", { joinCode });
      }
    });

    socket.on("reconnect", () => {
      joinedRef.current = true;
      socket.emit("room:join", { joinCode });
    });

    socket.on("connect_error", (err) => {
      console.error("[Socket] Connection error:", err.message);
    });

    socket.on("disconnect", (reason) => {
      console.log("[Socket] Disconnected:", reason);
      setIsConnected(false);
      joinedRef.current = false;
    });

    // ── Participants ──────────────────────────────────
    socket.on("room:participants", (data: any[]) => {
      setParticipants(data);
    });

    socket.on("participant:joined", (data: any) => {
      const id = data.user?.id ?? data.userId;
      const timestamp = Date.now();
      console.log('[Socket] participant:joined:', id, data.role, data.email);
      setParticipants((prev) => {
        // Always remove any stale entry for this user (by id or guest email)
        const filtered = prev.filter((p) => {
          const pid = p.user?.id ?? p.userId;
          const sameId = pid === id;
          const sameGuestEmail = data.isGuest && p.email === data.email;
          return !sameId && !sameGuestEmail;
        });
        // Add user with join timestamp for race condition protection
        return [...filtered, { ...data, _joinedAt: timestamp }];
      });
    });

    socket.on("participant:left", (data: { userId: string; email?: string }) => {
      console.log('[Socket] participant:left:', data.userId);
      setParticipants((prev) =>
        prev.filter((p) => {
          const id = p.user?.id ?? p.userId;
          const matchesId = id === data.userId;
          const matchesEmail = data.email && p.email === data.email;

          // Not this user - keep them
          if (!matchesId && !matchesEmail) return true;

          // If they rejoined within the last 2 seconds, keep them
          // This handles the race condition where left arrives after joined
          if (p._joinedAt && Date.now() - p._joinedAt < 2000) {
            console.log(`[Socket] Ignoring participant:left for ${data.userId} - rejoined recently`);
            return true;
          }

          // Truly left - remove them
          return false;
        }),
      );
    });

    // Role updates — update participants array
    // Token refresh is handled in RoomContext via direct socket listeners
    socket.on("participant:promoted", (data: { userId: string }) => {
      setParticipants((prev) =>
        prev.map((p) => {
          const id = p.user?.id ?? p.userId;
          return id === data.userId ? { ...p, role: "SPEAKER" } : p;
        }),
      );
    });

    socket.on("participant:demoted", (data: { userId: string }) => {
      setParticipants((prev) =>
        prev.map((p) => {
          const id = p.user?.id ?? p.userId;
          return id === data.userId ? { ...p, role: "GUEST" } : p;
        }),
      );
    });

    socket.on("participant:became-cohost", (data: { userId: string }) => {
      setParticipants((prev) =>
        prev.map((p) => {
          const id = p.user?.id ?? p.userId;
          return id === data.userId ? { ...p, role: "COHOST" } : p;
        }),
      );
    });

    socket.on("participant:cohost-removed", (data: { userId: string }) => {
      setParticipants((prev) =>
        prev.map((p) => {
          const id = p.user?.id ?? p.userId;
          return id === data.userId ? { ...p, role: "GUEST" } : p;
        }),
      );
    });

    // ── Chat ─────────────────────────────────────────
    socket.on("chat:message", (message: ChatMessage) => {
      setMessages((prev) => {
        if (prev.find((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
    });

    socket.on("chat:message-deleted", ({ messageId }: { messageId: string }) => {
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    });

    // ── Hand raise ────────────────────────────────────
    socket.on("hand:raised", (data: RaisedHand) => {
      setRaisedHands((prev) => {
        const exists = prev.find((h) => h.userId === data.userId);
        return exists ? prev : [...prev, data];
      });
    });

    socket.on("hand:lowered", (data: { userId: string }) => {
      setRaisedHands((prev) => prev.filter((h) => h.userId !== data.userId));
    });

    // ── Waiting room ──────────────────────────────────
    socket.on("waiting:new", (data: WaitingParticipant) => {
      setWaitingParticipants((prev) => [...prev, data]);
    });

    socket.on("waiting:participant-admitted", (data: { id: string }) => {
      setWaitingParticipants((prev) => prev.filter((p) => p.id !== data.id));
    });

    socket.on("waiting:all-admitted", () => {
      setWaitingParticipants([]);
    });

    socket.on("waiting:participant-rejected", (data: { id: string }) => {
      setWaitingParticipants((prev) => prev.filter((p) => p.id !== data.id));
    });

    socket.on("waiting:all-rejected", () => {
      setWaitingParticipants([]);
    });

    // ── Reactions ────────────────────────────────────
    socket.on("reaction:received", (reaction: any) => {
      setReactions((prev) => [...prev, { ...reaction, x: Math.random() * 70 + 15 }]);
      // Auto-remove after 3.5 seconds
      setTimeout(() => {
        setReactions((prev) => prev.filter((r) => r.id !== reaction.id));
      }, 3500);
    });

    return () => {
      console.log("[Socket] Cleanup — disconnecting");
      joinedRef.current = false;
      socket.emit("room:leave");
      socket.disconnect();
      socketRef.current = null;
    };
  }, [joinCode]);

  // ── Actions ───────────────────────────────────────
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
    socketRef.current?.emit("session:end");
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

  const rejectParticipant = useCallback(
    (joinCode: string, waitingParticipantId: string) => {
      socketRef.current?.emit("waiting:reject", {
        joinCode,
        waitingParticipantId,
      });
    },
    [],
  );

  const rejectAll = useCallback((joinCode: string) => {
    socketRef.current?.emit("waiting:reject-all", { joinCode });
  }, []);

  const makeCohost = useCallback((userId: string) => {
    socketRef.current?.emit("participant:make-cohost", { userId });
  }, []);

  const removeCohost = useCallback((userId: string) => {
    socketRef.current?.emit("participant:remove-cohost", { userId });
  }, []);

  const kickParticipant = useCallback((userId: string) => {
    socketRef.current?.emit("participant:kick", { userId });
  }, []);

  const banParticipant = useCallback((userId: string, email: string) => {
    socketRef.current?.emit("participant:ban", { userId, email });
  }, []);

  const deleteMessage = useCallback((messageId: string) => {
    socketRef.current?.emit("chat:delete", { messageId });
  }, []);

  const sendReaction = useCallback((emoji: string) => {
    socketRef.current?.emit("reaction:send", { emoji });
  }, []);

  return {
    socketRef,
    isConnected,
    messages,
    participants,
    raisedHands,
    waitingParticipants,
    reactions,
    sendMessage,
    raiseHand,
    lowerHand,
    lowerHandForUser,
    promoteParticipant,
    demoteParticipant,
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
  };
}
