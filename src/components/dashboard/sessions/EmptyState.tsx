"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";

interface EmptyStateProps {
  currentFolderId?: string;
  onCreateFolder: () => void;
}

export function EmptyState({ currentFolderId, onCreateFolder }: EmptyStateProps) {
  return (
    <Card>
      <div className="py-16 text-center">
        <p className="text-ink-700/40 text-sm">This folder is empty.</p>
        <div className="flex items-center justify-center gap-4 mt-3">
          <button
            onClick={onCreateFolder}
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
  );
}
