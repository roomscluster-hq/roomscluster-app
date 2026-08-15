"use client";

import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth.store";

interface SessionUpdateData {
  id: string;
  title: string;
  description: string;
  scheduledAt: string;
  passcode: string;
  isLocked: boolean;
  folderId: string | null;
  status: "SCHEDULED" | "LIVE" | "ENDED";
  updatedAt: string;
}

interface CoHostsChangedData {
  sessionId: string;
  added: string[];
  removed: string[];
}

export function useSessionSocket() {
  const socketRef = useRef<Socket | null>(null);
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    // Get the API base URL from environment or default
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    
    socketRef.current = io(apiUrl, {
      transports: ["websocket"],
      autoConnect: true,
    });

    socketRef.current.on("connect", () => {
      console.log("Socket connected");
    });

    socketRef.current.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    // Listen for session updates
    socketRef.current.on("session:updated", (data: SessionUpdateData) => {
      // Update React Query cache
      queryClient.setQueryData(["session", data.id], (old: any) => {
        if (!old) return old;
        return { ...old, ...data };
      });

      // Invalidate sessions list
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["folder-contents"] });

      // Show toast notification
      toast.info("Session updated", {
        description: `Title: ${data.title}`,
      });
    });

    // Listen for co-host changes
    socketRef.current.on("cohosts:changed", (data: CoHostsChangedData) => {
      // Update the specific session
      queryClient.invalidateQueries({ queryKey: ["session", data.sessionId] });
      
      toast.info("Co-hosts updated", {
        description: `${data.added.length} added, ${data.removed.length} removed`,
      });
    });

    // Listen for session status changes
    socketRef.current.on("session:statusChanged", (data: { sessionId: string; status: string }) => {
      queryClient.invalidateQueries({ queryKey: ["session", data.sessionId] });
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      
      toast.info(`Session is now ${data.status.toLowerCase()}`);
    });
  }, [queryClient]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, []);

  const joinSession = useCallback((sessionId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("session:join", { sessionId });
    }
  }, []);

  const leaveSession = useCallback((sessionId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("session:leave", { sessionId });
    }
  }, []);

  // Auto-connect when user is authenticated
  useEffect(() => {
    if (user) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [user, connect, disconnect]);

  return {
    socket: socketRef.current,
    connect,
    disconnect,
    joinSession,
    leaveSession,
    isConnected: socketRef.current?.connected ?? false,
  };
}
