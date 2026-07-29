"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { foldersApi } from "@/lib/api/folders.api";
import { toast } from "sonner";

const TAKE = 30;

export function useFolderManagement() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const currentFolderId = searchParams.get("folder") ?? undefined;

  const [creatingFolder, setCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [renamingFolderId, setRenamingFolderId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);
  const draggedSessionId = useRef<string | null>(null);

  // Pagination state
  const [accumulatedFolders, setAccumulatedFolders] = useState<any[]>([]);
  const [accumulatedSessions, setAccumulatedSessions] = useState<any[]>([]);
  const [skip, setSkip] = useState(0);

  // Reset accumulation when navigating to a different folder
  useEffect(() => {
    // Defer state updates to avoid calling setState synchronously inside effect
    const t = setTimeout(() => {
      setAccumulatedFolders([]);
      setAccumulatedSessions([]);
      setSkip(0);
    }, 0);

    return () => clearTimeout(t);
  }, [currentFolderId]);

  // Fetch folder contents
  const { data: contents, isLoading, isFetching } = useQuery({
    queryKey: ["folder-contents", currentFolderId, skip],
    queryFn: () => foldersApi.getContents(currentFolderId, skip, TAKE),
  });

  // Fetch breadcrumbs
  const { data: breadcrumbs } = useQuery({
    queryKey: ["folder-breadcrumbs", currentFolderId],
    queryFn: () => foldersApi.getBreadcrumbs(currentFolderId!),
    enabled: !!currentFolderId,
  });

  // Append new page's results
  useEffect(() => {
    if (!contents) return;
    // Defer state updates to avoid synchronous setState within the effect body
    const t = setTimeout(() => {
      if (skip === 0) {
        setAccumulatedFolders(contents.folders);
        setAccumulatedSessions(contents.sessions);
      } else {
        setAccumulatedFolders((prev) => [...prev, ...contents.folders]);
        setAccumulatedSessions((prev) => [...prev, ...contents.sessions]);
      }
    }, 0);

    return () => clearTimeout(t);
  }, [contents]);
  
  // Reset skip when contents change
  useEffect(() => {
    if (skip !== 0) {
      // Defer state update to avoid synchronous setState within effect body
      const t = setTimeout(() => setSkip(0), 0);
      return () => clearTimeout(t);
    }
  }, [contents]);

  // Load more
  const loadMore = () => {
    if (contents?.pagination.nextSkip != null) {
      setSkip(contents.pagination.nextSkip);
    }
  };

  // Navigation
  const openFolder = (folderId: string) => {
    router.push(`/dashboard/sessions?folder=${folderId}`);
  };

  const goToRoot = () => {
    router.push("/dashboard/sessions");
  };

  // Create folder
  const createFolderMutation = useMutation({
    mutationFn: (name: string) =>
      foldersApi.create({ name, parentFolderId: currentFolderId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folder-contents"] });
      toast.success("Folder created");
      setCreatingFolder(false);
      setNewFolderName("");
    },
    onError: () => toast.error("Failed to create folder"),
  });

  // Rename folder
  const renameFolderMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      foldersApi.rename(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folder-contents"] });
      queryClient.invalidateQueries({ queryKey: ["folder-breadcrumbs"] });
      toast.success("Folder renamed");
      setRenamingFolderId(null);
    },
    onError: () => toast.error("Failed to rename folder"),
  });

  // Delete folder
  const deleteFolderMutation = useMutation({
    mutationFn: (id: string) => foldersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folder-contents"] });
      toast.success("Folder deleted");
    },
    onError: () => toast.error("Failed to delete folder"),
  });

  // Handlers
  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    createFolderMutation.mutate(newFolderName.trim());
  };

  const startRename = (folderId: string, currentName: string) => {
    setRenamingFolderId(folderId);
    setRenameValue(currentName);
  };

  const submitRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (!renamingFolderId || !renameValue.trim()) return;
    renameFolderMutation.mutate({ id: renamingFolderId, name: renameValue.trim() });
  };

  const confirmDeleteFolder = (id: string, name: string) => {
    toast(`Delete "${name}" and everything inside it?`, {
      action: {
        label: "Delete",
        onClick: () => deleteFolderMutation.mutate(id),
      },
      cancel: { label: "Cancel", onClick: () => {} },
      duration: 8000,
    });
  };

  // Drag and drop
  const handleDragStart = (sessionId: string) => {
    draggedSessionId.current = sessionId;
  };

  const handleDragOverFolder = (e: React.DragEvent, folderId: string) => {
    e.preventDefault();
    setDragOverFolderId(folderId);
  };

  const handleDragLeaveFolder = () => {
    setDragOverFolderId(null);
  };

  const handleDropOnFolder = (e: React.DragEvent, folderId: string) => {
    e.preventDefault();
    setDragOverFolderId(null);
    const sessionId = draggedSessionId.current;
    if (!sessionId) return;
    return { sessionId, folderId };
  };

  const cancelCreatingFolder = () => {
    setCreatingFolder(false);
    setNewFolderName("");
  };

  return {
    currentFolderId,
    folders: accumulatedFolders,
    sessions: accumulatedSessions,
    breadcrumbs,
    isLoading,
    isFetching,
    hasMore: contents?.pagination.hasMore ?? false,
    
    // Folder creation
    creatingFolder,
    setCreatingFolder,
    newFolderName,
    setNewFolderName,
    
    // Folder renaming
    renamingFolderId,
    renameValue,
    setRenameValue,
    
    // Drag and drop
    dragOverFolderId,
    draggedSessionId,
    
    // Actions
    openFolder,
    goToRoot,
    loadMore,
    handleCreateFolder,
    startRename,
    submitRename,
    confirmDeleteFolder,
    handleDragStart,
    handleDragOverFolder,
    handleDragLeaveFolder,
    handleDropOnFolder,
    cancelCreatingFolder,
    
    // Loading states
    isCreatingFolder: createFolderMutation.isPending,
    isRenamingFolder: renameFolderMutation.isPending,
  };
}
