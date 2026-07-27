"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { foldersApi } from "@/lib/api/folders.api";
import { organizationsApi } from "@/lib/api/organizations.api";
import { sessionsApi } from "@/lib/api";
import { StatusBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { formatDateTime } from "@/lib/utils";
import { SessionStatus } from "@/types";
import { CheckCircle, ChevronRight, Folder, FolderPlus, GripVertical, Video } from "lucide-react";
import { toast } from "sonner";

type ViewMode = "grid" | "list";
type StatusFilter = "ALL" | SessionStatus;

const STATUS_FILTERS: { id: StatusFilter; label: string }[] = [
  { id: "ALL", label: "All" },
  { id: "LIVE", label: "Live" },
  { id: "SCHEDULED", label: "Scheduled" },
  { id: "ENDED", label: "Ended" },
];

const SESSION_CARD_STYLES: Record<SessionStatus, string> = {
  LIVE: "bg-linear-to-br from-success-600 to-ink-900",
  SCHEDULED: "bg-linear-to-br from-primary-600 to-ink-900",
  ENDED: "bg-linear-to-br from-ink-700 to-ink-900",
};

export default function SessionsExplorerPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const currentFolderId = searchParams.get("folder") ?? undefined;

  // Show which workspace is currently active, so it's unmistakable
  // where folders/sessions created here will land
  const { data: organizations } = useQuery({
    queryKey: ["organizations-mine"],
    queryFn: organizationsApi.listMine,
  });
  const activeOrg = organizations?.find((o) => o.isActive);

  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [renamingFolderId, setRenamingFolderId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);
  const draggedSessionId = useRef<string | null>(null);

  // Accumulated pagination state — resets whenever the folder changes
  const [accumulatedFolders, setAccumulatedFolders] = useState<any[]>([]);
  const [accumulatedSessions, setAccumulatedSessions] = useState<any[]>([]);
  const [skip, setSkip] = useState(0);
  const TAKE = 30;

  // Reset accumulation when navigating to a different folder
  useEffect(() => {
    setAccumulatedFolders([]);
    setAccumulatedSessions([]);
    setSkip(0);
  }, [currentFolderId]);

  // ── Queries ──────────────────────────────────────────
  const { data: contents, isLoading, isFetching } = useQuery({
    queryKey: ["folder-contents", currentFolderId, skip],
    queryFn: () => foldersApi.getContents(currentFolderId, skip, TAKE),
  });

  // Append new page's results to the accumulated lists
  useEffect(() => {
    if (!contents) return;
    if (skip === 0) {
      // First page — replace rather than append (handles refetch-on-mutation correctly)
      setAccumulatedFolders(contents.folders);
      setAccumulatedSessions(contents.sessions);
    } else {
      setAccumulatedFolders((prev) => [...prev, ...contents.folders]);
      setAccumulatedSessions((prev) => [...prev, ...contents.sessions]);
    }
  }, [contents, skip]);

  function loadMore() {
    if (contents?.pagination.nextSkip != null) {
      setSkip(contents.pagination.nextSkip);
    }
  }

  const { data: breadcrumbs } = useQuery({
    queryKey: ["folder-breadcrumbs", currentFolderId],
    queryFn: () => foldersApi.getBreadcrumbs(currentFolderId!),
    enabled: !!currentFolderId,
  });

  // ── Mutations ────────────────────────────────────────
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

  const deleteFolderMutation = useMutation({
    mutationFn: (id: string) => foldersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folder-contents"] });
      toast.success("Folder deleted");
    },
    onError: () => toast.error("Failed to delete folder"),
  });

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

  // ── Handlers ─────────────────────────────────────────
  function openFolder(folderId: string) {
    router.push(`/dashboard/sessions?folder=${folderId}`);
  }

  function goToRoot() {
    router.push("/dashboard/sessions");
  }

  function handleCreateFolder(e: React.FormEvent) {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    createFolderMutation.mutate(newFolderName.trim());
  }

  function startRename(folderId: string, currentName: string) {
    setRenamingFolderId(folderId);
    setRenameValue(currentName);
  }

  function submitRename(e: React.FormEvent) {
    e.preventDefault();
    if (!renamingFolderId || !renameValue.trim()) return;
    renameFolderMutation.mutate({ id: renamingFolderId, name: renameValue.trim() });
  }

  function confirmDeleteFolder(id: string, name: string) {
    toast(`Delete "${name}" and everything inside it?`, {
      action: {
        label: "Delete",
        onClick: () => deleteFolderMutation.mutate(id),
      },
      cancel: { label: "Cancel", onClick: () => {} },
      duration: 8000,
    });
  }

  function confirmDeleteSession(id: string, title: string) {
    toast(`Delete "${title}"?`, {
      action: {
        label: "Delete",
        onClick: () => deleteSessionMutation.mutate(id),
      },
      cancel: { label: "Cancel", onClick: () => {} },
      duration: 8000,
    });
  }

  // Drag and drop handlers
  function handleDragStart(sessionId: string) {
    draggedSessionId.current = sessionId;
  }

  function handleDragOverFolder(e: React.DragEvent, folderId: string) {
    e.preventDefault();
    setDragOverFolderId(folderId);
  }

  function handleDragLeaveFolder() {
    setDragOverFolderId(null);
  }

  function handleDropOnFolder(e: React.DragEvent, folderId: string) {
    e.preventDefault();
    setDragOverFolderId(null);
    const sessionId = draggedSessionId.current;
    if (!sessionId) return;
    moveSessionMutation.mutate({ sessionId, folderId });
    draggedSessionId.current = null;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  const folders = accumulatedFolders;
  const allSessions = accumulatedSessions;
  const sessions =
    statusFilter === "ALL" ? allSessions : allSessions.filter((s) => s.status === statusFilter);
  const isEmpty = folders.length === 0 && allSessions.length === 0;
  const hasMore = contents?.pagination.hasMore ?? false;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6">
        <div className="min-w-0">
          <h1 className="text-xl md:text-2xl font-bold text-ink-900">Sessions</h1>

          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-sm text-ink-700/60 mt-1 overflow-x-auto">
            <button onClick={goToRoot} className="hover:text-primary-600 transition-colors cursor-pointer shrink-0">
              All Sessions
            </button>
            {breadcrumbs?.map((b) => (
              <span key={b.id} className="flex items-center gap-1.5 shrink-0">
                <ChevronRight size={14} className="text-ink-700/30" />
                <button
                  onClick={() => openFolder(b.id)}
                  className="hover:text-primary-600 transition-colors cursor-pointer"
                >
                  {b.name}
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* View toggle */}
          <div className="flex bg-surface-50 rounded-lg p-1 gap-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${
                viewMode === "grid"
                  ? "bg-surface-0 text-ink-900 shadow-raised"
                  : "text-ink-700/60 hover:text-ink-700"
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${
                viewMode === "list"
                  ? "bg-surface-0 text-ink-900 shadow-raised"
                  : "text-ink-700/60 hover:text-ink-700"
              }`}
            >
              List
            </button>
          </div>

          <Button variant="secondary" onClick={() => setCreatingFolder(true)} className="cursor-pointer">
            + New Folder
          </Button>
          <Link
            href={`/dashboard/sessions/new${currentFolderId ? `?folder=${currentFolderId}` : ""}`}
          >
            <Button className="cursor-pointer">+ New Session</Button>
          </Link>
        </div>
      </div>

      {/* Status filter chips */}
      <div className="flex items-center gap-2 mb-5">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setStatusFilter(f.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer border ${
              statusFilter === f.id
                ? "bg-primary-600 border-primary-600 text-white"
                : "border-surface-200 text-ink-700/60 hover:bg-surface-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Active workspace indicator */}
      {activeOrg && (
        <div className="flex items-center gap-2 mb-5 text-sm">
          <span className="w-5 h-5 rounded bg-primary-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
            {activeOrg.name.charAt(0).toUpperCase()}
          </span>
          <span className="text-ink-700/60">
            Viewing{" "}
            <strong className="text-ink-700">
              {activeOrg.isPersonal ? "your Personal Workspace" : activeOrg.name}
            </strong>
            {activeOrg.role === "OWNER" && !activeOrg.isPersonal && " · seeing everyone's sessions"}
          </span>
        </div>
      )}

      {/* New folder input */}
      {creatingFolder && (
        <form
          onSubmit={handleCreateFolder}
          className="flex items-center gap-2 mb-4 bg-primary-50 border border-primary-100 rounded-lg px-4 py-3"
        >
          <Folder size={20} className="text-primary-600 shrink-0" />
          <input
            autoFocus
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Folder name"
            className="flex-1 bg-surface-0 border border-surface-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
          />
          <Button type="submit" size="sm" loading={createFolderMutation.isPending} className="cursor-pointer">
            Create
          </Button>
          <button
            type="button"
            onClick={() => {
              setCreatingFolder(false);
              setNewFolderName("");
            }}
            className="text-sm text-ink-700/60 hover:text-ink-700 px-2 cursor-pointer"
          >
            Cancel
          </button>
        </form>
      )}

      {/* Empty state */}
      {isEmpty && !creatingFolder && (
        <Card>
          <div className="py-16 text-center">
            <p className="text-ink-700/40 text-sm">This folder is empty.</p>
            <div className="flex items-center justify-center gap-4 mt-3">
              <button
                onClick={() => setCreatingFolder(true)}
                className="text-sm text-primary-600 hover:underline cursor-pointer"
              >
                Create a folder
              </button>
              <span className="text-ink-700/30">·</span>
              <Link
                href={`/dashboard/sessions/new${currentFolderId ? `?folder=${currentFolderId}` : ""}`}
                className="text-sm text-primary-600 hover:underline cursor-pointer"
              >
                Create a session
              </Link>
            </div>
          </div>
        </Card>
      )}

      {/* Grid view */}
      {!isEmpty && viewMode === "grid" && (
        <div className="space-y-8">
          {folders.length > 0 && (
            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-ink-900 mb-3">
                Folders
                <span className="text-xs bg-surface-200 text-ink-700 px-2 py-0.5 rounded-full">
                  {folders.length}
                </span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {folders.map((folder) => (
                  <div
                    key={folder.id}
                    onDragOver={(e) => handleDragOverFolder(e, folder.id)}
                    onDragLeave={handleDragLeaveFolder}
                    onDrop={(e) => handleDropOnFolder(e, folder.id)}
                    className={`group relative border rounded-card p-5 transition-colors bg-surface-0 ${
                      dragOverFolderId === folder.id
                        ? "border-primary-500 bg-primary-50"
                        : "border-surface-200 hover:shadow-raised"
                    }`}
                  >
                    <FolderMenu
                      onRename={() => startRename(folder.id, folder.name)}
                      onDelete={() => confirmDeleteFolder(folder.id, folder.name)}
                    />

                    {renamingFolderId === folder.id ? (
                      <form onSubmit={submitRename} onClick={(e) => e.stopPropagation()}>
                        <Folder size={40} className="text-primary-600 mb-3" />
                        <input
                          autoFocus
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onBlur={submitRename}
                          onKeyDown={(e) => {
                            if (e.key === "Escape") setRenamingFolderId(null);
                          }}
                          className="w-full text-sm font-medium text-ink-900 border border-primary-500 rounded px-1.5 py-0.5 focus:outline-none focus:ring-2 focus:ring-primary-600"
                        />
                      </form>
                    ) : (
                      <div onClick={() => openFolder(folder.id)} className="cursor-pointer">
                        <Folder size={40} className="text-primary-600 mb-3 group-hover:scale-105 transition-transform" />
                        <p className="text-sm font-medium text-ink-900 truncate">{folder.name}</p>
                        <p className="text-xs text-ink-700/50 mt-1">
                          {folder._count.sessions} session{folder._count.sessions !== 1 ? "s" : ""}
                          {folder._count.subFolders > 0 &&
                            ` · ${folder._count.subFolders} folder${folder._count.subFolders !== 1 ? "s" : ""}`}
                        </p>
                      </div>
                    )}
                  </div>
                ))}

                <button
                  onClick={() => setCreatingFolder(true)}
                  className="border-2 border-dashed border-surface-200 rounded-card flex flex-col items-center justify-center p-5 text-ink-700/50 hover:border-primary-600 hover:text-primary-600 transition-colors cursor-pointer"
                >
                  <FolderPlus size={28} className="mb-2" />
                  <span className="text-sm font-medium">Create Folder</span>
                </button>
              </div>
            </div>
          )}

          {allSessions.length > 0 && (
            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-ink-900 mb-3">
                Sessions
                <span className="text-xs bg-surface-200 text-ink-700 px-2 py-0.5 rounded-full">
                  {sessions.length}
                </span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    draggable
                    onDragStart={() => handleDragStart(session.id)}
                    className="group relative border border-surface-200 rounded-card overflow-hidden bg-surface-0 hover:shadow-raised transition-shadow cursor-grab active:cursor-grabbing"
                  >
                    <div className={`relative h-24 flex items-center justify-center ${SESSION_CARD_STYLES[session.status as SessionStatus]}`}>
                      <Video size={32} className="text-white/30" />
                      <div className="absolute top-2.5 left-2.5">
                        <StatusBadge status={session.status} className="bg-white/90" />
                      </div>
                      <div className="absolute bottom-2.5 left-2.5 text-white/40 opacity-0 group-hover:opacity-100 transition-opacity">
                        <GripVertical size={16} />
                      </div>
                    </div>

                    <SessionMenu
                      currentFolderId={currentFolderId}
                      onMoveToRoot={() =>
                        moveSessionMutation.mutate({ sessionId: session.id, folderId: null })
                      }
                      onDelete={() => confirmDeleteSession(session.id, session.title)}
                    />

                    <Link href={`/dashboard/sessions/${session.id}`} className="block p-4">
                      <p className="text-sm font-medium text-ink-900 truncate pr-6">
                        {session.title}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-ink-700/50 mt-1.5">
                        <span>
                          {session.scheduledAt ? formatDateTime(session.scheduledAt) : "Instant session"}
                        </span>
                        {(session._count?.participants ?? 0) > 0 && (
                          <span>{session._count.participants} participants</span>
                        )}
                      </div>
                      {(session._count?.recordings ?? 0) > 0 && (
                        <span className="inline-flex items-center gap-1 mt-2 text-xs text-success-600 bg-success-50 px-2 py-0.5 rounded">
                          <CheckCircle size={12} />
                          Recorded
                        </span>
                      )}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* List view */}
      {!isEmpty && viewMode === "list" && (
        <Card>
          <div className="divide-y divide-surface-200">
            {folders.map((folder) => (
              <div
                key={folder.id}
                onDragOver={(e) => handleDragOverFolder(e, folder.id)}
                onDragLeave={handleDragLeaveFolder}
                onDrop={(e) => handleDropOnFolder(e, folder.id)}
                className={`flex items-center justify-between px-4 md:px-6 py-3.5 transition-colors ${
                  dragOverFolderId === folder.id ? "bg-primary-50" : "hover:bg-surface-50"
                }`}
              >
                {renamingFolderId === folder.id ? (
                  <form onSubmit={submitRename} className="flex items-center gap-3 flex-1">
                    <Folder size={20} className="text-primary-600" />
                    <input
                      autoFocus
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onBlur={submitRename}
                      onKeyDown={(e) => {
                        if (e.key === "Escape") setRenamingFolderId(null);
                      }}
                      className="text-sm font-medium text-ink-900 border border-primary-500 rounded px-1.5 py-0.5 focus:outline-none focus:ring-2 focus:ring-primary-600"
                    />
                  </form>
                ) : (
                  <div
                    onClick={() => openFolder(folder.id)}
                    className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                  >
                    <Folder size={20} className="text-primary-600 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink-900 truncate">{folder.name}</p>
                      <p className="text-xs text-ink-700/50">
                        {folder._count.sessions} session{folder._count.sessions !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                )}
                <FolderMenu
                  onRename={() => startRename(folder.id, folder.name)}
                  onDelete={() => confirmDeleteFolder(folder.id, folder.name)}
                />
              </div>
            ))}

            {sessions.map((session) => (
              <div
                key={session.id}
                draggable
                onDragStart={() => handleDragStart(session.id)}
                className="flex items-center justify-between gap-3 px-4 md:px-6 py-3.5 hover:bg-surface-50 transition-colors cursor-grab"
              >
                <Link
                  href={`/dashboard/sessions/${session.id}`}
                  className="flex items-center gap-3 flex-1 cursor-pointer min-w-0"
                >
                  <Video size={18} className="text-primary-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink-900 truncate">{session.title}</p>
                    <p className="text-xs text-ink-700/50">
                      {session.scheduledAt
                        ? formatDateTime(session.scheduledAt)
                        : "Instant session"}
                    </p>
                  </div>
                </Link>
                <div className="flex items-center gap-3 shrink-0">
                  <StatusBadge status={session.status} />
                  <SessionMenu
                    currentFolderId={currentFolderId}
                    onMoveToRoot={() =>
                      moveSessionMutation.mutate({ sessionId: session.id, folderId: null })
                    }
                    onDelete={() => confirmDeleteSession(session.id, session.title)}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Load more */}
      {!isEmpty && hasMore && (
        <div className="flex justify-center mt-6">
          <Button
            variant="secondary"
            onClick={loadMore}
            loading={isFetching && skip !== 0}
            className="cursor-pointer"
          >
            Load more
          </Button>
        </div>
      )}
    </div>
  );
}

// ── Three-dot menu for folders ─────────────────────────
function FolderMenu({
  onRename,
  onDelete,
}: {
  onRename: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="absolute top-3 right-3 z-10" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setOpen(!open)}
        className="text-ink-700/40 hover:text-ink-700 opacity-0 group-hover:opacity-100 transition-opacity p-1 cursor-pointer"
      >
        ⋮
      </button>
      {open && (
        <div
          onMouseLeave={() => setOpen(false)}
          className="absolute right-0 mt-1 bg-surface-0 border border-surface-200 rounded-lg shadow-raised w-36 py-1"
        >
          <button
            onClick={() => {
              onRename();
              setOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-sm text-ink-700 hover:bg-surface-50 transition-colors cursor-pointer"
          >
            Rename
          </button>
          <button
            onClick={() => {
              onDelete();
              setOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-sm text-danger-600 hover:bg-danger-50 transition-colors cursor-pointer"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

// ── Three-dot menu for sessions (move fallback for non-drag users) ──
function SessionMenu({
  currentFolderId,
  onMoveToRoot,
  onDelete,
}: {
  currentFolderId?: string;
  onMoveToRoot: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="absolute top-3 right-3 z-10" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setOpen(!open)}
        className="text-white/70 hover:text-white p-1 cursor-pointer"
      >
        ⋮
      </button>
      {open && (
        <div
          onMouseLeave={() => setOpen(false)}
          className="absolute right-0 mt-1 bg-surface-0 border border-surface-200 rounded-lg shadow-raised w-40 py-1 z-10"
        >
          {currentFolderId && (
            <button
              onClick={() => {
                onMoveToRoot();
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm text-ink-700 hover:bg-surface-50 transition-colors cursor-pointer"
            >
              Move to All Sessions
            </button>
          )}
          <button
            onClick={() => {
              onDelete();
              setOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-sm text-danger-600 hover:bg-danger-50 transition-colors cursor-pointer"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
