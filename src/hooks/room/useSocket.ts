"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { sessionsApi } from "@/lib/api";
import { getCookie } from "@/lib/cookies";
import { ChatMessage } from "@/types";
import { SOCKET_URL, SOCKET_CONFIG } from "@/lib/room/constants";
import { RaisedHand, WaitingParticipant } from "@/lib/room/types";

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  messages: ChatMessage[];
  participants: any[];
  raisedHands: RaisedHand[];
  waitingParticipants: WaitingParticipant[];
  sendMessage: (content: string) => void;
  raiseHand: () => void;
  lowerHand: () => void;
  lowerHandForUser: (userId: string) => void;
  promoteParticipant: (userId: string) => void;
  demoteParticipant: (userId: string) => void;
  admitParticipant: (joinCode: string, waitingParticipantId: string) => void;
  admitAll: (joinCode: string) => void;
  rejectParticipant: (joinCode: string, waitingParticipantId: string) => void;
  rejectAll: (joinCode: string) => void;
  makeCohost: (userId: string) => void;
  removeCohost: (userId: string) => void;
  endSession: () => void;
}

export function useSocket(joinCode: string, sessionId: string): UseSocketReturn {
  const socketRef = useRef<Socket | null>(null);
  const socketJoinedRef = useRef(false);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);
  const [raisedHands, setRaisedHands] = useState<RaisedHand[]>([]);
  const [waitingParticipants, setWaitingParticipants] = useState<WaitingParticipant[]>([]);

  // Load chat history once on mount
  useEffect(() => {
    let cancelled = false;

    async function loadChatHistory() {
      try {
        const history = await sessionsApi.getChatHistory(joinCode);
        if (!cancelled) setMessages(history);
      } catch (err) {
        console.error("[Chat] Failed to load history:", err);
      }
    }

    loadChatHistory();

    return () => {
      cancelled = true;
    };
  }, [joinCode]);

  // Initialize socket connection
  useEffect(() => {
    let cancelled = false;
    socketJoinedRef.current = false;

    const token = localStorage.getItem("access_token") ?? getCookie("guest_token") ?? "";

    if (!token) {
      console.warn("[Socket] No token found");
      return;
    }

    let socket: Socket;
    if (socketRef.current?.connected) {
      socket = socketRef.current;
      socket.removeAllListeners();
    } else {
      socket = io(`${SOCKET_URL}/session`, {
        ...SOCKET_CONFIG,
        auth: { token },
      });
      socketRef.current = socket;
    }

    if (socket.connected) {
      setIsConnected(true);
      socket.emit("room:join", { joinCode });
    }

    socket.on("connect", () => {
      if (cancelled) {
        socket.disconnect();
        return;
      }
      setIsConnected(true);
      socket.emit("room:join", { joinCode });
    });

    socket.on("reconnect", () => {
      if (cancelled) return;
      socket.emit("room:join", { joinCode });
    });

    socket.on("disconnect", () => {
      if (cancelled) return;
      setIsConnected(false);
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
      setParticipants((prev) => {
        const id = data.user?.id ?? data.userId;
        const exists = prev.find((p) => (p.user?.id ?? p.userId) === id);
        return exists ? prev : [...prev, data];
      });
    });

    socket.on("participant:left", (data: { userId: string }) => {
      if (!cancelled) {
        setParticipants((prev) =>
          prev.filter((p) => (p.user?.id ?? p.userId) !== data.userId)
        );
      }
    });

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
      if (!cancelled) {
        setRaisedHands((prev) => prev.filter((h) => h.userId !== data.userId));
      }
    });

    socket.on("waiting:new", (data: WaitingParticipant) => {
      if (!cancelled) {
        setWaitingParticipants((prev) => [...prev, data]);
      }
    });

    socket.on("waiting:participant-admitted", (data: { id: string }) => {
      if (!cancelled) {
        setWaitingParticipants((prev) => prev.filter((p) => p.id !== data.id));
      }
    });

    socket.on("waiting:all-admitted", () => {
      if (!cancelled) setWaitingParticipants([]);
    });

    socket.on("waiting:all-rejected", () => {
      if (!cancelled) setWaitingParticipants([]);
    });

    socket.on("waiting:participant-rejected", (data: { id: string }) => {
      if (!cancelled) {
        setWaitingParticipants((prev) => prev.filter((p) => p.id !== data.id));
      }
    });

    return () => {
      cancelled = true;
      socketJoinedRef.current = false;
      socket.removeAllListeners();
    };
  }, [joinCode, sessionId]);

  // Visibility change handler
  useEffect(() => {
    const handleVisibilityChange = () => {
      const socket = socketRef.current;
      if (!socket) return;

      if (document.visibilityState === "visible") {
        if (!socket.connected) {
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

  const admitParticipant = useCallback((joinCode: string, waitingParticipantId: string) => {
    socketRef.current?.emit("waiting:admit", { joinCode, waitingParticipantId });
  }, []);

  const admitAll = useCallback((joinCode: string) => {
    socketRef.current?.emit("waiting:admit-all", { joinCode });
  }, []);

  const rejectParticipant = useCallback((joinCode: string, waitingParticipantId: string) => {
    socketRef.current?.emit("waiting:reject", { joinCode, waitingParticipantId });
  }, []);

  const rejectAll = useCallback((joinCode: string) => {
    socketRef.current?.emit("waiting:reject-all", { joinCode });
  }, []);

  const makeCohost = useCallback((userId: string) => {
    socketRef.current?.emit("participant:make-cohost", { userId });
  }, []);

  const removeCohost = useCallback((userId: string) => {
    socketRef.current?.emit("participant:remove-cohost", { userId });
  }, []);

  const endSession = useCallback(() => {
    socketRef.current?.emit("session:end");
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    messages,
    participants,
    raisedHands,
    waitingParticipants,
    sendMessage,
    raiseHand,
    lowerHand,
    lowerHandForUser,
    promoteParticipant,
    demoteParticipant,
    admitParticipant,
    admitAll,
    rejectParticipant,
    rejectAll,
    makeCohost,
    removeCohost,
    endSession,
  };
}
