"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  FolderPlus,
  Video,
  Folder as FolderIcon,
  GripVertical,
  CheckCircle,
  Search,
  X,
} from "lucide-react";
import { organizationsApi } from "@/lib/api/organizations.api";
import { StatusBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { formatDateTime } from "@/lib/utils";
import { SessionStatus } from "@/types";
import { useFolderManagement, useSessionManagement } from "@/hooks/dashboard";
import { useUserPreferencesStore } from "@/store/user-preferences.store";
import {
  Breadcrumbs,
  ViewToggle,
  NewFolderForm,
  WorkspaceIndicator,
  EmptyState,
  MoveToFolderModal,
} from "@/components/dashboard/sessions";
import { StatusFilterComponent } from "@/components/dashboard/sessions/StatusFilter";
import type { FolderWithCount } from "@/components/dashboard/sessions/MoveToFolderModal";
import { RecurringSeriesGroup } from "@/components/dashboard/sessions/RecurringSeriesGroup";

// Local alias for the StatusFilter type to avoid conflicts with a runtime export
type StatusFilterType = "ALL" | SessionStatus;

const SESSION_CARD_STYLES: Record<SessionStatus, string> = {
  LIVE: "bg-linear-to-br from-success-600 to-ink-900",
  SCHEDULED: "bg-linear-to-br from-primary-600 to-ink-900",
  ENDED: "bg-linear-to-br from-ink-700 to-ink-900",
};

export default function SessionsExplorerPage() {
  const { sessionsViewMode, setSessionsViewMode } = useUserPreferencesStore();
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Clear search on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && searchQuery) {
        setSearchQuery("");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchQuery]);

  // Local state for view mode with fallback to stored preference
  const viewMode = sessionsViewMode;

  // State for Move to Folder modal
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [isMoving, setIsMoving] = useState(false);

  const {
    currentFolderId,
    folders,
    sessions: allSessions,
    breadcrumbs,
    isLoading,
    isFetching,
    hasMore,
    creatingFolder,
    setCreatingFolder,
    newFolderName,
    setNewFolderName,
    renamingFolderId,
    renameValue,
    setRenameValue,
    dragOverFolderId,
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
    isCreatingFolder,
  } = useFolderManagement(statusFilter);

  const { moveSession, confirmDeleteSession } = useSessionManagement();

  // Handle opening move modal
  const handleOpenMoveModal = (sessionId: string, sessionTitle: string) => {
    setSelectedSession({ id: sessionId, title: sessionTitle });
    setMoveModalOpen(true);
  };

  // Handle move session
  const handleMoveSession = async (
    sessionId: string,
    folderId: string | null,
  ) => {
    setIsMoving(true);
    try {
      await moveSession({ sessionId, folderId });
      setMoveModalOpen(false);
      setSelectedSession(null);
    } finally {
      setIsMoving(false);
    }
  };

  // Get active organization
  const { data: organizations } = useQuery({
    queryKey: ["organizations-mine"],
    queryFn: organizationsApi.listMine,
  });
  const activeOrg = organizations?.find((o) => o.isActive);

  // Deduplicate sessions by id (backend now handles status filtering)
  const sessions = useMemo(() => {
    const seen = new Set<string>();
    return allSessions.filter((s) => {
      if (seen.has(s.id)) return false;
      seen.add(s.id);
      return true;
    });
  }, [allSessions]);

  // Filter by search query
  const filteredSessions = useMemo(() => {
    if (!searchQuery.trim()) return sessions;
    const q = searchQuery.toLowerCase();
    return sessions.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q)
    );
  }, [sessions, searchQuery]);

  // Group sessions by recurrenceRuleId
  const { standaloneSessions, seriesGroups } = useMemo(() => {
    const groups = new Map<string, typeof filteredSessions>();
    const standalone: typeof filteredSessions = [];

    filteredSessions.forEach((s) => {
      if (s.recurrenceRuleId) {
        const existing = groups.get(s.recurrenceRuleId) ?? [];
        groups.set(s.recurrenceRuleId, [...existing, s]);
      } else {
        standalone.push(s);
      }
    });

    return {
      standaloneSessions: standalone,
      seriesGroups: Array.from(groups.entries()).map(([ruleId, sessions]) => ({
        recurrenceRuleId: ruleId,
        sessions,
      })),
    };
  }, [filteredSessions]);

  const isEmpty = folders.length === 0 && allSessions.length === 0;

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6">
        <div className="min-w-0">
          <h1 className="text-xl md:text-2xl font-bold text-ink-900">
            Sessions
          </h1>
          <Breadcrumbs
            breadcrumbs={breadcrumbs}
            onGoToRoot={goToRoot}
            onOpenFolder={openFolder}
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Search input */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-700/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sessions..."
              className="pl-9 pr-4 py-2 text-sm border border-surface-200 rounded-lg bg-surface-0 text-ink-900 placeholder:text-ink-700/40 focus:outline-none focus:ring-2 focus:ring-primary-600 w-48 md:w-64"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-700/40 hover:text-ink-700 cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <ViewToggle viewMode={viewMode} onChange={setSessionsViewMode} />
          <Button
            variant="secondary"
            onClick={() => setCreatingFolder(true)}
            className="cursor-pointer"
          >
            + New Folder
          </Button>
          <Link
            href={`/dashboard/sessions/new${currentFolderId ? `?folder=${currentFolderId}` : ""}`}
          >
            <Button className="cursor-pointer">+ New Session</Button>
          </Link>
        </div>
      </div>

      {/* Status filter */}
      <StatusFilterComponent
        currentFilter={statusFilter}
        onChange={setStatusFilter}
      />

      {/* Search results count */}
      {searchQuery && (
        <p className="text-sm text-ink-700/60 mb-4">
          {filteredSessions.length} result{filteredSessions.length !== 1 ? 's' : ''} for &quot;{searchQuery}&quot;
        </p>
      )}

      {/* Workspace indicator */}
      <WorkspaceIndicator organization={activeOrg} />

      {/* New folder form */}
      {creatingFolder && (
        <NewFolderForm
          value={newFolderName}
          onChange={setNewFolderName}
          onSubmit={handleCreateFolder}
          onCancel={cancelCreatingFolder}
          isLoading={isCreatingFolder}
        />
      )}

      {/* Empty state */}
      {isEmpty && !creatingFolder && (
        <EmptyState
          currentFolderId={currentFolderId}
          onCreateFolder={() => setCreatingFolder(true)}
        />
      )}

      {/* Grid view */}
      {!isEmpty && viewMode === "grid" && (
        <div className="space-y-8">
          {/* Folders */}
          {folders.length > 0 && (
            <FolderGrid
              folders={folders}
              renamingFolderId={renamingFolderId}
              renameValue={renameValue}
              onRenameChange={setRenameValue}
              onRenameSubmit={submitRename}
              onRenameCancel={() => setRenameValue("")}
              onOpenFolder={openFolder}
              onStartRename={startRename}
              onDeleteFolder={confirmDeleteFolder}
              dragOverFolderId={dragOverFolderId}
              onDragOverFolder={handleDragOverFolder}
              onDragLeaveFolder={handleDragLeaveFolder}
              onDropOnFolder={(e, folderId) => {
                const result = handleDropOnFolder(e, folderId);
                if (result) moveSession(result);
              }}
              onCreateFolder={() => setCreatingFolder(true)}
            />
          )}

          {/* Sessions */}
          {(seriesGroups.length > 0 || standaloneSessions.length > 0) && (
            <div className="space-y-6">
              {/* Recurring Series Groups - Full width section */}
              {seriesGroups.length > 0 && (
                <div className="space-y-3">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-ink-900">
                    Recurring Series
                    <span className="text-xs bg-surface-200 text-ink-700 px-2 py-0.5 rounded-full">
                      {seriesGroups.length} series
                    </span>
                  </h3>
                  <div className="space-y-3">
                    {seriesGroups.map((group) => (
                      <RecurringSeriesGroup
                        key={group.recurrenceRuleId}
                        recurrenceRuleId={group.recurrenceRuleId}
                        sessions={group.sessions}
                        onDeleteSession={confirmDeleteSession}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Standalone Sessions Grid */}
              {standaloneSessions.length > 0 && (
                <SessionGrid
                  sessions={standaloneSessions}
                  onDragStart={handleDragStart}
                  currentFolderId={currentFolderId}
                  onMoveToRoot={(sessionId) =>
                    moveSession({ sessionId, folderId: null })
                  }
                  onMoveToFolder={handleOpenMoveModal}
                  onDeleteSession={confirmDeleteSession}
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* List view */}
      {!isEmpty && viewMode === "list" && (
        <SessionList
          folders={folders}
          sessions={filteredSessions}
          renamingFolderId={renamingFolderId}
          renameValue={renameValue}
          onRenameChange={setRenameValue}
          onRenameSubmit={submitRename}
          onOpenFolder={openFolder}
          onStartRename={startRename}
          onDeleteFolder={confirmDeleteFolder}
          onDragStart={handleDragStart}
          currentFolderId={currentFolderId}
          onMoveToRoot={(sessionId) =>
            moveSession({ sessionId, folderId: null })
          }
          onMoveToFolder={handleOpenMoveModal}
          onDeleteSession={confirmDeleteSession}
        />
      )}

      {/* Load more */}
      {!isEmpty && hasMore && (
        <div className="flex justify-center mt-6">
          <Button
            variant="secondary"
            onClick={loadMore}
            loading={isFetching}
            className="cursor-pointer"
          >
            Load more
          </Button>
        </div>
      )}

      {/* Move to Folder Modal */}
      <MoveToFolderModal
        isOpen={moveModalOpen}
        onClose={() => setMoveModalOpen(false)}
        sessionId={selectedSession?.id ?? ""}
        sessionTitle={selectedSession?.title ?? ""}
        currentFolderId={currentFolderId}
        folders={folders as FolderWithCount[]}
        onMove={handleMoveSession}
        isMoving={isMoving}
      />
    </div>
  );
}

// ── Folder Grid Component ────────────────────────────────────────────────
interface FolderGridProps {
  folders: FolderWithCount[];
  renamingFolderId: string | null;
  renameValue: string;
  onRenameChange: (value: string) => void;
  onRenameSubmit: (e: React.FormEvent) => void;
  onRenameCancel: () => void;
  onOpenFolder: (id: string) => void;
  onStartRename: (id: string, name: string) => void;
  onDeleteFolder: (id: string, name: string) => void;
  dragOverFolderId: string | null;
  onDragOverFolder: (e: React.DragEvent, id: string) => void;
  onDragLeaveFolder: () => void;
  onDropOnFolder: (e: React.DragEvent, id: string) => void;
  onCreateFolder: () => void;
}

function FolderGrid({
  folders,
  renamingFolderId,
  renameValue,
  onRenameChange,
  onRenameSubmit,
  onRenameCancel,
  onOpenFolder,
  onStartRename,
  onDeleteFolder,
  dragOverFolderId,
  onDragOverFolder,
  onDragLeaveFolder,
  onDropOnFolder,
  onCreateFolder,
}: FolderGridProps) {
  return (
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
            onDragOver={(e) => onDragOverFolder(e, folder.id)}
            onDragLeave={onDragLeaveFolder}
            onDrop={(e) => onDropOnFolder(e, folder.id)}
            className={`group relative border rounded-card p-5 transition-colors bg-surface-0 ${
              dragOverFolderId === folder.id
                ? "border-primary-500 bg-primary-50"
                : "border-surface-200 hover:shadow-raised"
            }`}
          >
            <FolderMenu
              onRename={() => onStartRename(folder.id, folder.name)}
              onDelete={() => onDeleteFolder(folder.id, folder.name)}
            />

            {renamingFolderId === folder.id ? (
              <form
                onSubmit={onRenameSubmit}
                onClick={(e) => e.stopPropagation()}
              >
                <FolderIcon size={40} className="text-primary-600 mb-3" />
                <input
                  autoFocus
                  value={renameValue}
                  onChange={(e) => onRenameChange(e.target.value)}
                  onBlur={onRenameSubmit}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") onRenameCancel();
                  }}
                  className="w-full text-sm font-medium text-ink-900 border border-primary-500 rounded px-1.5 py-0.5 focus:outline-none focus:ring-2 focus:ring-primary-600"
                />
              </form>
            ) : (
              <div
                onClick={() => onOpenFolder(folder.id)}
                className="cursor-pointer"
              >
                <FolderIcon
                  size={40}
                  className="text-primary-600 mb-3 group-hover:scale-105 transition-transform"
                />
                <p className="text-sm font-medium text-ink-900 truncate">
                  {folder.name}
                </p>
                <p className="text-xs text-ink-700/50 mt-1">
                  {folder._count.sessions} session
                  {folder._count.sessions !== 1 ? "s" : ""}
                  {folder._count.subFolders > 0 &&
                    ` · ${folder._count.subFolders} folder${folder._count.subFolders !== 1 ? "s" : ""}`}
                </p>
              </div>
            )}
          </div>
        ))}

        <button
          onClick={onCreateFolder}
          className="border-2 border-dashed border-surface-200 rounded-card flex flex-col items-center justify-center p-5 text-ink-700/50 hover:border-primary-600 hover:text-primary-600 transition-colors cursor-pointer"
        >
          <FolderPlus size={28} className="mb-2" />
          <span className="text-sm font-medium">Create Folder</span>
        </button>
      </div>
    </div>
  );
}

// ── Session Grid Component ───────────────────────────────────────────────
interface Session {
  id: string;
  title: string;
  status: SessionStatus;
  scheduledAt?: string;
  _count?: {
    participants: number;
    registrations: number;
    recordings: number;
    attendance: number;
  };
}

interface SessionGridProps {
  sessions: Session[];
  onDragStart: (id: string) => void;
  currentFolderId?: string;
  onMoveToRoot: (id: string) => void;
  onMoveToFolder: (id: string, title: string) => void;
  onDeleteSession: (id: string, title: string) => void;
}

function SessionGrid({
  sessions,
  onDragStart,
  currentFolderId,
  onMoveToRoot,
  onMoveToFolder,
  onDeleteSession,
}: SessionGridProps) {
  return (
    <div>
      <h3 className="flex items-center gap-2 text-sm font-semibold text-ink-900 mb-3">
        Individual Sessions
        <span className="text-xs bg-surface-200 text-ink-700 px-2 py-0.5 rounded-full">
          {sessions.length}
        </span>
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {sessions.map((session) => (
          <div
            key={session.id}
            draggable
            onDragStart={() => onDragStart(session.id)}
            className="group relative border border-surface-200 rounded-card overflow-hidden bg-surface-0 hover:shadow-raised transition-shadow cursor-grab active:cursor-grabbing"
          >
            <div
              className={`relative h-24 flex items-center justify-center ${SESSION_CARD_STYLES[session.status]}`}
            >
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
              onMoveToRoot={() => onMoveToRoot(session.id)}
              onMoveToFolder={() => onMoveToFolder(session.id, session.title)}
              onDelete={() => onDeleteSession(session.id, session.title)}
              variant="grid"
            />

            <Link
              href={`/dashboard/sessions/${session.id}`}
              className="block p-4"
            >
              <p className="text-sm font-medium text-ink-900 truncate pr-6">
                {session.title}
              </p>
              <div className="flex items-center gap-3 text-xs text-ink-700/50 mt-1.5">
                <span>
                  {session.scheduledAt
                    ? formatDateTime(session.scheduledAt)
                    : "Instant session"}
                </span>
                {(session._count?.attendance ?? 0) > 0 && (
                  <span>{session._count?.attendance} participants</span>
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
  );
}

// ── Session List Component ───────────────────────────────────────────────
interface SessionListProps {
  folders: FolderWithCount[];
  sessions: Session[];
  renamingFolderId: string | null;
  renameValue: string;
  onRenameChange: (value: string) => void;
  onRenameSubmit: (e: React.FormEvent) => void;
  onOpenFolder: (id: string) => void;
  onStartRename: (id: string, name: string) => void;
  onDeleteFolder: (id: string, name: string) => void;
  onDragStart: (id: string) => void;
  currentFolderId?: string;
  onMoveToRoot: (id: string) => void;
  onMoveToFolder: (id: string, title: string) => void;
  onDeleteSession: (id: string, title: string) => void;
}

function SessionList({
  folders,
  sessions,
  renamingFolderId,
  renameValue,
  onRenameChange,
  onRenameSubmit,
  onOpenFolder,
  onStartRename,
  onDeleteFolder,
  onDragStart,
  currentFolderId,
  onMoveToRoot,
  onMoveToFolder,
  onDeleteSession,
}: SessionListProps) {
  return (
    <Card>
      <div className="divide-y divide-surface-200">
        {folders.map((folder) => (
          <div
            key={folder.id}
            className="flex items-center justify-between px-4 md:px-6 py-3.5 hover:bg-surface-50 transition-colors"
          >
            {renamingFolderId === folder.id ? (
              <form
                onSubmit={onRenameSubmit}
                className="flex items-center gap-3 flex-1"
              >
                <FolderIcon size={20} className="text-primary-600" />
                <input
                  autoFocus
                  value={renameValue}
                  onChange={(e) => onRenameChange(e.target.value)}
                  onBlur={onRenameSubmit}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") onRenameChange("");
                  }}
                  className="text-sm font-medium text-ink-900 border border-primary-500 rounded px-1.5 py-0.5 focus:outline-none focus:ring-2 focus:ring-primary-600"
                />
              </form>
            ) : (
              <>
                <div
                  onClick={() => onOpenFolder(folder.id)}
                  className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                >
                  <FolderIcon size={20} className="text-primary-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink-900 truncate">
                      {folder.name}
                    </p>
                    <p className="text-xs text-ink-700/50">
                      {folder._count.sessions} session
                      {folder._count.sessions !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <FolderMenu
                  onRename={() => onStartRename(folder.id, folder.name)}
                  onDelete={() => onDeleteFolder(folder.id, folder.name)}
                />
              </>
            )}
          </div>
        ))}

        {sessions.map((session) => (
          <div
            key={session.id}
            draggable
            onDragStart={() => onDragStart(session.id)}
            className="group flex items-center justify-between gap-3 px-4 md:px-6 py-3.5 hover:bg-surface-50 transition-colors cursor-grab"
          >
            <Link
              href={`/dashboard/sessions/${session.id}`}
              className="flex items-center gap-3 flex-1 cursor-pointer min-w-0"
            >
              <Video size={18} className="text-primary-600 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink-900 truncate">
                  {session.title}
                </p>
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
                onMoveToRoot={() => onMoveToRoot(session.id)}
                onMoveToFolder={() => onMoveToFolder(session.id, session.title)}
                onDelete={() => onDeleteSession(session.id, session.title)}
                variant="list"
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ── Three-dot menu for folders ────────────────────────────────────────────
function FolderMenu({
  onRename,
  onDelete,
}: {
  onRename: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="absolute top-3 right-3 z-10"
      onClick={(e) => e.stopPropagation()}
    >
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

// ── Three-dot menu for sessions ───────────────────────────────────────────
function SessionMenu({
  currentFolderId,
  onMoveToRoot,
  onMoveToFolder,
  onDelete,
  variant = "grid",
}: {
  currentFolderId?: string;
  onMoveToRoot: () => void;
  onMoveToFolder: () => void;
  onDelete: () => void;
  variant?: "grid" | "list";
}) {
  const [open, setOpen] = useState(false);

  const containerClasses =
    variant === "grid" ? "absolute top-3 right-3 z-10" : "relative";

  const buttonClasses =
    variant === "grid"
      ? "text-white/70 hover:text-white"
      : "text-ink-700/40 hover:text-ink-700 opacity-0 group-hover:opacity-100";

  return (
    <div className={containerClasses} onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setOpen(!open)}
        className={`${buttonClasses} p-1 cursor-pointer transition-opacity`}
      >
        ⋮
      </button>
      {open && (
        <div
          onMouseLeave={() => setOpen(false)}
          className="absolute right-0 mt-1 bg-surface-0 border border-surface-200 rounded-lg shadow-raised w-44 py-1 z-10"
        >
          <button
            onClick={() => {
              onMoveToFolder();
              setOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-sm text-ink-700 hover:bg-surface-50 transition-colors cursor-pointer"
          >
            Move to Folder...
          </button>
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
          <div className="border-t border-surface-200 my-1" />
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
