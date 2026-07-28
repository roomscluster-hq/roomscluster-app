"use client";

import { useState, useCallback } from "react";
import { Socket } from "socket.io-client";
import { toast } from "sonner";

interface UseRecordingReturn {
  isRecording: boolean;
  recordingLoading: boolean;
  startRecording: () => void;
  stopRecording: () => void;
}

export function useRecording(socket: Socket | null): UseRecordingReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingLoading, setRecordingLoading] = useState(false);

  const startRecording = useCallback(() => {
    setRecordingLoading(true);
    socket?.emit("recording:start");
    // Fallback timeout in case event doesn't come back
    setTimeout(() => setRecordingLoading(false), 5000);
  }, [socket]);

  const stopRecording = useCallback(() => {
    setRecordingLoading(true);
    socket?.emit("recording:stop");
    setTimeout(() => setRecordingLoading(false), 5000);
  }, [socket]);

  return {
    isRecording,
    recordingLoading,
    startRecording,
    stopRecording,
  };
}

export function useRecordingEvents(
  socket: Socket | null,
  onStart: () => void,
  onStop: () => void
) {
  useState(() => {
    if (!socket) return;

    socket.on("recording:started", () => {
      onStart();
      toast.success("Recording started");
    });

    socket.on("recording:stopped", () => {
      onStop();
      toast.success("Recording stopped — processing will finish shortly");
    });

    return () => {
      socket.off("recording:started");
      socket.off("recording:stopped");
    };
  });
}
