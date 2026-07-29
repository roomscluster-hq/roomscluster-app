"use client";

import { Folder } from "lucide-react";

interface FolderCardProps {
  folder: {
    id: string;
    name: string;
    _count: {
      sessions: number;
      subFolders: number;
    };
  };
  isRenaming: boolean;
  renameValue: string;
  onRenameChange: (value: string) => void;
  onRenameSubmit: (e: React.FormEvent) => void;
  onRenameCancel: () => void;
  onOpen: () => void;
  onStartRename: () => void;
  onDelete: () => void;
  isDragOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
}

export function FolderCard({
  folder,
  isRenaming,
  renameValue,
  onRenameChange,
  onRenameSubmit,
  onRenameCancel,
  onOpen,
  onStartRename,
  onDelete,
  isDragOver,
  onDragOver,
  onDragLeave,
  onDrop,
}: FolderCardProps) {
  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`group relative border rounded-card p-5 transition-colors bg-surface-0 ${
        isDragOver
          ? "border-primary-500 bg-primary-50"
          : "border-surface-200 hover:shadow-raised"
      }`}
    >
      {/* Menu button - simplified */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            // Show menu logic here
          }}
          className="p-1 hover:bg-surface-100 rounded"
        >
          <span className="sr-only">Menu</span>
          <svg className="w-4 h-4 text-ink-700" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
      </div>

      {isRenaming ? (
        <form onSubmit={onRenameSubmit} onClick={(e) => e.stopPropagation()}>
          <Folder size={40} className="text-primary-600 mb-3" />
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
        <div onClick={onOpen} className="cursor-pointer">
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
  );
}
