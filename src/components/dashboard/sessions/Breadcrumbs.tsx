"use client";

import { ChevronRight } from "lucide-react";

interface Breadcrumb {
  id: string;
  name: string;
}

interface BreadcrumbsProps {
  breadcrumbs?: Breadcrumb[];
  onGoToRoot: () => void;
  onOpenFolder: (id: string) => void;
}

export function Breadcrumbs({ breadcrumbs, onGoToRoot, onOpenFolder }: BreadcrumbsProps) {
  return (
    <div className="flex items-center gap-1.5 text-sm text-ink-700/60 mt-1 overflow-x-auto">
      <button 
        onClick={onGoToRoot} 
        className="hover:text-primary-600 transition-colors cursor-pointer shrink-0"
      >
        All Sessions
      </button>
      {breadcrumbs?.map((b) => (
        <span key={b.id} className="flex items-center gap-1.5 shrink-0">
          <ChevronRight size={14} className="text-ink-700/30" />
          <button
            onClick={() => onOpenFolder(b.id)}
            className="hover:text-primary-600 transition-colors cursor-pointer"
          >
            {b.name}
          </button>
        </span>
      ))}
    </div>
  );
}
