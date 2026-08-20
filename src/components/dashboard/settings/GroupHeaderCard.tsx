"use client";

import Link from "next/link";
import { Layers, Users, Video, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GroupHeaderCardProps {
  groupId: string;
  name: string;
  description?: string | null;
  memberCount: number;
  sessionCount: number;
  renamingId: string | null;
  renameValue: string;
  onRenameValueChange: (v: string) => void;
  onStartRename: () => void;
  onSubmitRename: (e: React.FormEvent) => void;
  onCancelRename: () => void;
  isRenaming: boolean;
}

export function GroupHeaderCard({
  groupId,
  name,
  description,
  memberCount,
  sessionCount,
  renamingId,
  renameValue,
  onRenameValueChange,
  onStartRename,
  onSubmitRename,
  onCancelRename,
  isRenaming,
}: GroupHeaderCardProps) {
  const isEditing = renamingId === groupId;

  return (
    <div className="bg-surface-0 border border-surface-200 rounded-xl p-6 mb-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-4 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
            <Layers size={22} />
          </div>
          <div className="min-w-0">
            {isEditing ? (
              <form onSubmit={onSubmitRename} className="flex items-center gap-2">
                <input
                  autoFocus
                  value={renameValue}
                  onChange={(e) => onRenameValueChange(e.target.value)}
                  onBlur={() => onSubmitRename({} as React.FormEvent)}
                  disabled={isRenaming}
                  className="text-xl font-bold text-ink-900 bg-surface-0 border border-surface-200 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-600"
                />
                <button
                  type="button"
                  onClick={onCancelRename}
                  disabled={isRenaming}
                  className="text-xs text-ink-700/50 hover:text-ink-700 cursor-pointer"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-2 group">
                <h1 className="text-xl md:text-2xl font-bold text-ink-900">{name}</h1>
                <button
                  onClick={onStartRename}
                  title="Rename group"
                  className="opacity-0 group-hover:opacity-100 text-ink-700/40 hover:text-primary-600 transition-opacity cursor-pointer"
                >
                  <Pencil size={15} />
                </button>
              </div>
            )}
            {description && (
              <p className="text-ink-700/60 text-sm mt-1">{description}</p>
            )}
            <div className="flex items-center gap-2 mt-3">
              <span className="inline-flex items-center gap-1.5 bg-surface-50 border border-surface-200 rounded-full px-3 py-1 text-xs text-ink-700">
                <Users size={13} />
                {memberCount} member{memberCount !== 1 ? "s" : ""}
              </span>
              <span className="inline-flex items-center gap-1.5 bg-surface-50 border border-surface-200 rounded-full px-3 py-1 text-xs text-ink-700">
                <Video size={13} />
                {sessionCount} session{sessionCount !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>

        <Link href={`/dashboard/sessions/new?groupId=${groupId}`}>
          <Button size="sm">
            <Video size={16} />
            New Session
          </Button>
        </Link>
      </div>
    </div>
  );
}