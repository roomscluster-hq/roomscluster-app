"use client";

interface FormDividerProps {
  text?: string;
}

export function FormDivider({ text = "or" }: FormDividerProps) {
  return (
    <div className="relative flex items-center py-1">
      <div className="grow border-t border-surface-200" />
      <span className="mx-4 text-xs text-ink-700/40">{text}</span>
      <div className="grow border-t border-surface-200" />
    </div>
  );
}
