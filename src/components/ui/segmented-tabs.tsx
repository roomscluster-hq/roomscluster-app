"use client";

interface SegmentedTabsProps<T extends string> {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}

export function SegmentedTabs<T extends string>({
  value,
  options,
  onChange,
}: SegmentedTabsProps<T>) {
  return (
    <div className="flex bg-surface-50 rounded-lg p-1 gap-1 w-fit">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-4 py-1.5 rounded text-sm font-medium transition-colors cursor-pointer ${
            value === opt.value
              ? "bg-surface-0 text-ink-900 shadow-raised"
              : "text-ink-700/60 hover:text-ink-700"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}