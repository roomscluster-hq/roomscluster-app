"use client";

import { useState, useRef, useEffect } from "react";
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
import { toast } from "sonner";

type ViewMode = "grid" | "list";

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

  console.log("active org:", activeOrg);

  const [viewMode, setViewMode] = useState<ViewMode>("grid");
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
  const sessions = accumulatedSessions;
  const isEmpty = folders.length === 0 && sessions.length === 0;
  const hasMore = contents?.pagination.hasMore ?? false;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sessions</h1>

          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
            <button onClick={goToRoot} className="hover:text-blue-600 transition cursor-pointer">
              All Sessions
            </button>
            {breadcrumbs?.map((b) => (
              <span key={b.id} className="flex items-center gap-1.5">
                <span className="text-gray-300">/</span>
                <button
                  onClick={() => openFolder(b.id)}
                  className="hover:text-blue-600 transition cursor-pointer"
                >
                  {b.name}
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1.5 rounded text-xs font-medium transition cursor-pointer ${
                viewMode === "grid"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 rounded text-xs font-medium transition cursor-pointer ${
                viewMode === "list"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
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

      {/* Active workspace indicator */}
      {activeOrg && (
        <div className="flex items-center gap-2 mb-5 text-sm">
          <span className="w-5 h-5 rounded bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
            {activeOrg.name.charAt(0).toUpperCase()}
          </span>
          <span className="text-gray-500">
            Viewing{" "}
            <strong className="text-gray-700">
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
          className="flex items-center gap-2 mb-4 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3"
        >
          <span className="text-lg">📁</span>
          <input
            autoFocus
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Folder name"
            className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="text-sm text-gray-500 hover:text-gray-700 px-2 cursor-pointer"
          >
            Cancel
          </button>
        </form>
      )}

      {/* Empty state */}
      {isEmpty && !creatingFolder && (
        <Card>
          <div className="py-16 text-center">
            <p className="text-gray-400 text-sm">This folder is empty.</p>
            <div className="flex items-center justify-center gap-4 mt-3">
              <button
                onClick={() => setCreatingFolder(true)}
                className="text-sm text-blue-600 hover:underline cursor-pointer"
              >
                Create a folder
              </button>
              <span className="text-gray-300">·</span>
              <Link
                href={`/dashboard/sessions/new${currentFolderId ? `?folder=${currentFolderId}` : ""}`}
                className="text-sm text-blue-600 hover:underline cursor-pointer"
              >
                Create a session
              </Link>
            </div>
          </div>
        </Card>
      )}

      {/* Grid view */}
      {!isEmpty && viewMode === "grid" && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {folders.map((folder) => (
            <div
              key={folder.id}
              onDragOver={(e) => handleDragOverFolder(e, folder.id)}
              onDragLeave={handleDragLeaveFolder}
              onDrop={(e) => handleDropOnFolder(e, folder.id)}
              className={`group relative border rounded-xl p-4 transition ${
                dragOverFolderId === folder.id
                  ? "border-blue-400 bg-blue-50"
                  : "border-gray-100 hover:border-gray-200 hover:shadow-sm"
              }`}
            >
              <FolderMenu
                onRename={() => startRename(folder.id, folder.name)}
                onDelete={() => confirmDeleteFolder(folder.id, folder.name)}
              />

              {renamingFolderId === folder.id ? (
                <form onSubmit={submitRename} onClick={(e) => e.stopPropagation()}>
                  <div className="text-3xl mb-2">📁</div>
                  <input
                    autoFocus
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={submitRename}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") setRenamingFolderId(null);
                    }}
                    className="w-full text-sm font-medium text-gray-900 border border-blue-400 rounded px-1.5 py-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </form>
              ) : (
                <div onClick={() => openFolder(folder.id)} className="cursor-pointer">
                  <div className="text-3xl mb-2">📁</div>
                  <p className="text-sm font-medium text-gray-900 truncate">{folder.name}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {folder._count.sessions} session{folder._count.sessions !== 1 ? "s" : ""}
                    {folder._count.subFolders > 0 &&
                      ` · ${folder._count.subFolders} folder${folder._count.subFolders !== 1 ? "s" : ""}`}
                  </p>
                </div>
              )}
            </div>
          ))}

          {sessions.map((session) => (
            <div
              key={session.id}
              draggable
              onDragStart={() => handleDragStart(session.id)}
              className="group relative border border-gray-100 rounded-xl p-4 hover:border-gray-200 hover:shadow-sm transition cursor-grab"
            >
              <SessionMenu
                currentFolderId={currentFolderId}
                onMoveToRoot={() =>
                  moveSessionMutation.mutate({ sessionId: session.id, folderId: null })
                }
                onDelete={() => confirmDeleteSession(session.id, session.title)}
              />
              <Link href={`/dashboard/sessions/${session.id}`} className="cursor-pointer">
                <div className="text-3xl mb-2">🎥</div>
                <p className="text-sm font-medium text-gray-900 truncate pr-6">
                  {session.title}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <StatusBadge status={session.status} />
                </div>
                <p className="text-xs text-gray-400 mt-1.5">
                  {session.scheduledAt
                    ? formatDateTime(session.scheduledAt)
                    : "Instant session"}
                </p>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* List view */}
      {!isEmpty && viewMode === "list" && (
        <Card>
          <div className="divide-y divide-gray-100">
            {folders.map((folder) => (
              <div
                key={folder.id}
                onDragOver={(e) => handleDragOverFolder(e, folder.id)}
                onDragLeave={handleDragLeaveFolder}
                onDrop={(e) => handleDropOnFolder(e, folder.id)}
                className={`flex items-center justify-between px-6 py-3.5 transition ${
                  dragOverFolderId === folder.id ? "bg-blue-50" : "hover:bg-gray-50"
                }`}
              >
                {renamingFolderId === folder.id ? (
                  <form onSubmit={submitRename} className="flex items-center gap-3 flex-1">
                    <span className="text-xl">📁</span>
                    <input
                      autoFocus
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onBlur={submitRename}
                      onKeyDown={(e) => {
                        if (e.key === "Escape") setRenamingFolderId(null);
                      }}
                      className="text-sm font-medium text-gray-900 border border-blue-400 rounded px-1.5 py-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </form>
                ) : (
                  <div
                    onClick={() => openFolder(folder.id)}
                    className="flex items-center gap-3 cursor-pointer flex-1"
                  >
                    <span className="text-xl">📁</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{folder.name}</p>
                      <p className="text-xs text-gray-400">
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
                className="flex items-center justify-between px-6 py-3.5 hover:bg-gray-50 transition cursor-grab"
              >
                <Link
                  href={`/dashboard/sessions/${session.id}`}
                  className="flex items-center gap-3 flex-1 cursor-pointer"
                >
                  <span className="text-xl">🎥</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{session.title}</p>
                    <p className="text-xs text-gray-400">
                      {session.scheduledAt
                        ? formatDateTime(session.scheduledAt)
                        : "Instant session"}
                    </p>
                  </div>
                </Link>
                <div className="flex items-center gap-3">
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
        className="text-gray-400 hover:text-gray-700 opacity-0 group-hover:opacity-100 transition p-1 cursor-pointer"
      >
        ⋮
      </button>
      {open && (
        <div
          onMouseLeave={() => setOpen(false)}
          className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg w-36 py-1"
        >
          <button
            onClick={() => {
              onRename();
              setOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition cursor-pointer"
          >
            Rename
          </button>
          <button
            onClick={() => {
              onDelete();
              setOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition cursor-pointer"
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
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setOpen(!open)}
        className="text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
      >
        ⋮
      </button>
      {open && (
        <div
          onMouseLeave={() => setOpen(false)}
          className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg w-40 py-1 z-10"
        >
          {currentFolderId && (
            <button
              onClick={() => {
                onMoveToRoot();
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition cursor-pointer"
            >
              Move to All Sessions
            </button>
          )}
          <button
            onClick={() => {
              onDelete();
              setOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition cursor-pointer"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}