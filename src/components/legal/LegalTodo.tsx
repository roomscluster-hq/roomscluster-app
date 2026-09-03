import type { ReactNode } from "react";

/** Inline marker for placeholder values that still need a real answer (usually from legal counsel) before publishing. */
export function LegalTodo({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block bg-warning-50 text-warning-700 px-1.5 py-0.5 rounded text-sm font-medium whitespace-nowrap">
      {children}
    </span>
  );
}
