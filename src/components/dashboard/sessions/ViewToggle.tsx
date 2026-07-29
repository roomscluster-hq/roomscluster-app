"use client";

type ViewMode = "grid" | "list";

interface ViewToggleProps {
  viewMode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export function ViewToggle({ viewMode, onChange }: ViewToggleProps) {
  return (
    <div className="flex bg-surface-50 rounded-lg p-1 gap-1">
      <button
        onClick={() => onChange("grid")}
        className={`px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${
          viewMode === "grid"
            ? "bg-surface-0 text-ink-900 shadow-raised"
            : "text-ink-700/60 hover:text-ink-700"
        }`}
      >
        Grid
      </button>
      <button
        onClick={() => onChange("list")}
        className={`px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${
          viewMode === "list"
            ? "bg-surface-0 text-ink-900 shadow-raised"
            : "text-ink-700/60 hover:text-ink-700"
        }`}
      >
        List
      </button>
    </div>
  );
}
