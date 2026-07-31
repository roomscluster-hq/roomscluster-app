"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Folder,
  FolderOpen,
  FolderX,
  ChevronRight,
  ChevronDown,
  Search,
  X,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Folder as FolderType } from "@/types";

export interface FolderWithCount extends FolderType {
  _count: {
    sessions: number;
    subFolders: number;
  };
}

interface MoveToFolderModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly sessionId: string;
  readonly sessionTitle: string;
  readonly currentFolderId: string | undefined;
  readonly folders: FolderWithCount[];
  readonly onMove: (sessionId: string, folderId: string | null) => void;
  readonly isMoving: boolean;
}

interface FolderNode extends FolderWithCount {
  children: FolderNode[];
  level: number;
}

interface FolderTreeItemProps {
  readonly folder: FolderNode;
  readonly isExpanded: boolean;
  readonly isSelected: boolean;
  readonly isCurrentFolder: boolean;
  readonly onToggleExpand: (folderId: string) => void;
  readonly onSelect: (folderId: string) => void;
  readonly searchQuery: string;
}

function buildFolderTree(folders: FolderWithCount[]): FolderNode[] {
  const folderMap = new Map<string, FolderNode>();
  const rootFolders: FolderNode[] = [];

  // First pass: create nodes
  folders.forEach((folder) => {
    folderMap.set(folder.id, {
      ...folder,
      children: [],
      level: 0,
    });
  });

  // Second pass: build tree structure
  folders.forEach((folder) => {
    const node = folderMap.get(folder.id);
    if (!node) return;

    if (folder.parentFolderId) {
      const parent = folderMap.get(folder.parentFolderId);
      if (parent) {
        node.level = parent.level + 1;
        parent.children.push(node);
      }
    } else {
      rootFolders.push(node);
    }
  });

  return rootFolders;
}

function filterFoldersBySearch(
  folders: FolderNode[],
  query: string
): FolderNode[] {
  if (!query.trim()) return folders;

  const searchTerm = query.toLowerCase();

  return folders.filter((folder) => {
    const matchesSearch = folder.name.toLowerCase().includes(searchTerm);
    const hasMatchingChildren = filterFoldersBySearch(
      folder.children,
      query
    ).length > 0;

    return matchesSearch || hasMatchingChildren;
  });
}

function FolderTreeItem({
  folder,
  isExpanded,
  isSelected,
  isCurrentFolder,
  onToggleExpand,
  onSelect,
  searchQuery,
}: FolderTreeItemProps): React.ReactElement {
  const hasChildren = folder.children.length > 0;
  const isEmpty = folder._count.sessions === 0;

  const handleToggle = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onToggleExpand(folder.id);
    },
    [folder.id, onToggleExpand]
  );

  const handleSelect = useCallback(() => {
    if (!isCurrentFolder) {
      onSelect(folder.id);
    }
  }, [folder.id, isCurrentFolder, onSelect]);

  const getFolderIcon = (): React.ReactElement => {
    if (isEmpty) {
      return <FolderX size={18} className="text-ink-400" />;
    }
    if (isExpanded) {
      return <FolderOpen size={18} className="text-primary-600" />;
    }
    return <Folder size={18} className="text-primary-600" />;
  };

  const filteredChildren = useMemo(
    () =>
      searchQuery
        ? filterFoldersBySearch(folder.children, searchQuery)
        : folder.children,
    [folder.children, searchQuery]
  );

  return (
    <div className="select-none">
      <div
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer
          transition-colors duration-150
          ${
            isCurrentFolder
              ? "bg-surface-100 cursor-not-allowed opacity-60"
              : isSelected
              ? "bg-primary-50 border border-primary-200"
              : "hover:bg-surface-50"
          }
        `}
        style={{ paddingLeft: `${12 + folder.level * 20}px` }}
        onClick={handleSelect}
        role="button"
        tabIndex={isCurrentFolder ? -1 : 0}
        aria-disabled={isCurrentFolder}
        aria-selected={isSelected}
      >
        {hasChildren ? (
          <button
            onClick={handleToggle}
            className="p-0.5 hover:bg-surface-200 rounded transition-colors focus:outline-none focus:ring-1 focus:ring-primary-500"
            aria-label={isExpanded ? "Collapse folder" : "Expand folder"}
            type="button"
          >
            {isExpanded ? (
              <ChevronDown size={16} className="text-ink-500" />
            ) : (
              <ChevronRight size={16} className="text-ink-500" />
            )}
          </button>
        ) : (
          <span className="w-5" />
        )}

        <span className="flex-shrink-0">{getFolderIcon()}</span>

        <span className="flex-1 text-sm text-ink-900 truncate">
          {folder.name}
        </span>

        <span
          className={`text-xs ${
            isEmpty ? "text-ink-400" : "text-ink-500"
          }`}
        >
          ({folder._count.sessions})
        </span>

        {isCurrentFolder && (
          <span className="text-xs text-ink-400 ml-2">Current</span>
        )}
      </div>

      {isExpanded && filteredChildren.length > 0 && (
        <div className="mt-1">
          {filteredChildren.map((child) => (
            <FolderTreeItem
              key={child.id}
              folder={child}
              isExpanded={false}
              isSelected={false}
              isCurrentFolder={false}
              onToggleExpand={onToggleExpand}
              onSelect={onSelect}
              searchQuery={searchQuery}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function MoveToFolderModal({
  isOpen,
  onClose,
  sessionId,
  sessionTitle,
  currentFolderId,
  folders,
  onMove,
  isMoving,
}: MoveToFolderModalProps): React.ReactElement | null {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set()
  );

  const folderTree = useMemo(() => buildFolderTree(folders), [folders]);

  const filteredTree = useMemo(
    () => filterFoldersBySearch(folderTree, searchQuery),
    [folderTree, searchQuery]
  );

  const handleToggleExpand = useCallback((folderId: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  }, []);

  const handleSelect = useCallback((folderId: string) => {
    setSelectedFolderId(folderId);
  }, []);

  const handleMoveToRoot = useCallback(() => {
    setSelectedFolderId("root");
  }, []);

  const handleMove = useCallback(() => {
    if (selectedFolderId === null) return;

    const targetFolderId = selectedFolderId === "root" ? null : selectedFolderId;
    onMove(sessionId, targetFolderId);
  }, [selectedFolderId, sessionId, onMove]);

  const handleClose = useCallback(() => {
    if (!isMoving) {
      setSearchQuery("");
      setSelectedFolderId(null);
      onClose();
    }
  }, [isMoving, onClose]);

  const getSelectedFolderName = useCallback((): string => {
    if (selectedFolderId === "root") return "All Sessions";
    const folder = folders.find((f) => f.id === selectedFolderId);
    return folder?.name ?? "";
  }, [selectedFolderId, folders]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative bg-surface-0 rounded-xl shadow-raised w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200">
          <div className="flex items-center gap-3">
            <Folder size={20} className="text-primary-600" />
            <div>
              <h2 className="text-lg font-semibold text-ink-900">
                Move Session
              </h2>
              <p className="text-sm text-ink-500 truncate max-w-[200px]">
                {sessionTitle}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isMoving}
            className="p-2 hover:bg-surface-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Close modal"
            type="button"
          >
            <X size={20} className="text-ink-500" />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-3 border-b border-surface-200">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
            />
            <Input
              type="text"
              placeholder="Search folders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              disabled={isMoving}
            />
          </div>
        </div>

        {/* Folder Tree */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Root option */}
          <div
            className={`
              flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer
              transition-colors duration-150 mb-2
              ${
                currentFolderId === undefined
                  ? "bg-surface-100 cursor-not-allowed opacity-60"
                  : selectedFolderId === "root"
                  ? "bg-primary-50 border border-primary-200"
                  : "hover:bg-surface-50"
              }
            `}
            onClick={
              currentFolderId === undefined ? undefined : handleMoveToRoot
            }
            role="button"
            tabIndex={currentFolderId === undefined ? -1 : 0}
            aria-disabled={currentFolderId === undefined}
          >
            <ArrowLeft size={18} className="text-ink-500" />
            <span className="flex-1 text-sm text-ink-900">All Sessions</span>
            {currentFolderId === undefined && (
              <span className="text-xs text-ink-400">Current</span>
            )}
          </div>

          <div className="border-t border-surface-200 pt-2">
            {filteredTree.length === 0 ? (
              <div className="text-center py-8">
                <FolderX size={40} className="mx-auto text-ink-300 mb-2" />
                <p className="text-sm text-ink-500">
                  {searchQuery
                    ? "No folders match your search"
                    : "No folders available"}
                </p>
              </div>
            ) : (
              filteredTree.map((folder) => (
                <FolderTreeItem
                  key={folder.id}
                  folder={folder}
                  isExpanded={expandedFolders.has(folder.id)}
                  isSelected={selectedFolderId === folder.id}
                  isCurrentFolder={currentFolderId === folder.id}
                  onToggleExpand={handleToggleExpand}
                  onSelect={handleSelect}
                  searchQuery={searchQuery}
                />
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-surface-200 bg-surface-50 rounded-b-xl">
          <div className="text-sm text-ink-500">
            {selectedFolderId ? (
              <span>
                Move to: <strong className="text-ink-900">{getSelectedFolderName()}</strong>
              </span>
            ) : (
              <span>Select a destination</span>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={handleClose}
              disabled={isMoving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleMove}
              disabled={selectedFolderId === null || isMoving}
              loading={isMoving}
            >
              {isMoving ? "Moving..." : "Move"}
            </Button>
          </div>
        </div>

        {/* Loading Overlay */}
        {isMoving && (
          <div className="absolute inset-0 bg-surface-0/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center z-10">
            <Loader2 size={40} className="animate-spin text-primary-600 mb-4" />
            <p className="text-sm text-ink-600 font-medium">Moving session...</p>
          </div>
        )}
      </div>
    </div>
  );
}
