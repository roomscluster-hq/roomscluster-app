"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  /** Fraction of viewport height the sheet occupies. Defaults to "auto" (content-sized, capped at 85vh). */
  height?: "auto" | "tall";
}

export function BottomSheet({ open, onClose, title, children, height = "auto" }: BottomSheetProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open, mounted]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-ink-900/60"
      />
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 bg-ink-800 rounded-t-modal border-t border-white/10 flex flex-col",
          height === "tall" ? "h-[85vh]" : "max-h-[75vh]"
        )}
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex justify-center pt-2.5 pb-1 shrink-0">
          <span className="h-1 w-10 rounded-full bg-white/20" />
        </div>
        {title && (
          <div className="px-4 pb-2 shrink-0 flex items-center justify-between">
            <h2 className="text-white text-sm font-semibold">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-1 -mr-1"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 20 20" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5L5 15M5 5l10 10" />
              </svg>
            </button>
          </div>
        )}
        <div className="flex-1 min-h-0 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
