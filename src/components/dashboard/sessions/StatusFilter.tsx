"use client";

import { SessionStatus } from "@/types";

type StatusFilter = "ALL" | SessionStatus;

interface StatusFilterOption {
  id: StatusFilter;
  label: string;
}

const STATUS_FILTERS: StatusFilterOption[] = [
  { id: "ALL", label: "All" },
  { id: "LIVE", label: "Live" },
  { id: "SCHEDULED", label: "Scheduled" },
  { id: "ENDED", label: "Ended" },
];

interface StatusFilterProps {
  currentFilter: StatusFilter;
  onChange: (filter: StatusFilter) => void;
}

export function StatusFilterComponent({ currentFilter, onChange }: StatusFilterProps) {
  return (
    <div className="flex items-center gap-2 mb-5">
      {STATUS_FILTERS.map((f) => (
        <button
          key={f.id}
          onClick={() => onChange(f.id)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer border ${
            currentFilter === f.id
              ? "bg-primary-600 border-primary-600 text-white"
              : "border-surface-200 text-ink-700/60 hover:bg-surface-50"
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}

export type { StatusFilter };
export { STATUS_FILTERS };
