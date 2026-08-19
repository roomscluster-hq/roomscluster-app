"use client";

import { X, Trash2 } from "lucide-react";

interface BulkActionBarProps {
  count: number;
  onClear: () => void;
  onDelete: () => void;
  deleteLabel?: string;
}

export function BulkActionBar({
  count,
  onClear,
  onDelete,
  deleteLabel = "Delete selected",
}: BulkActionBarProps) {
  if (count === 0) return null;

  return (
    <div className="px-6 py-3 bg-primary-50 border-b border-primary-100 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-primary-700">
          {count} selected
        </span>
        <button
          onClick={onClear}
          className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1 cursor-pointer"
        >
          <X size={14} />
          Clear
        </button>
      </div>
      <button
        onClick={onDelete}
        className="text-sm text-danger-600 hover:text-danger-700 flex items-center gap-1.5 font-medium cursor-pointer"
      >
        <Trash2 size={15} />
        {deleteLabel}
      </button>
    </div>
  );
}