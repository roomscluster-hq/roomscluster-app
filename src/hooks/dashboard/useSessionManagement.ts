"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sessionsApi } from "@/lib/api";
import { toast } from "sonner";

export function useSessionManagement() {
  const queryClient = useQueryClient();

  const moveSessionMutation = useMutation({
    mutationFn: ({ sessionId, folderId }: { sessionId: string; folderId: string | null }) =>
      sessionsApi.moveToFolder(sessionId, folderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folder-contents"] });
      toast.success("Session moved");
    },
    onError: () => toast.error("Failed to move session"),
  });

  const deleteSessionMutation = useMutation({
    mutationFn: (id: string) => sessionsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folder-contents"] });
      toast.success("Session deleted");
    },
    onError: () => toast.error("Failed to delete session"),
  });

  const confirmDeleteSession = (id: string, title: string) => {
    toast(`Delete "${title}"?`, {
      action: {
        label: "Delete",
        onClick: () => deleteSessionMutation.mutate(id),
      },
      cancel: { label: "Cancel", onClick: () => {} },
      duration: 8000,
    });
  };

  return {
    moveSession: moveSessionMutation.mutate,
    deleteSession: deleteSessionMutation.mutate,
    confirmDeleteSession,
    isMovingSession: moveSessionMutation.isPending,
    isDeletingSession: deleteSessionMutation.isPending,
  };
}
