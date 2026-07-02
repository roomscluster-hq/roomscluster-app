"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";
import { cn } from "@/lib/utils";

export function UserMenu({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-2 rounded-lg hover:bg-surface-50 transition-colors cursor-pointer",
          compact ? "p-1" : "w-full px-2 py-1.5"
        )}
      >
        <div className="w-7 h-7 rounded-full bg-primary-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
          {(user?.name ?? user?.email ?? "?").charAt(0).toUpperCase()}
        </div>
        {!compact && (
          <span className="text-sm text-ink-700 truncate flex-1 text-left">
            {user?.name ?? user?.email}
          </span>
        )}
      </button>

      {open && (
        <div className={cn(
          "absolute mt-2 w-56 bg-surface-0 border border-surface-200 rounded-xl shadow-raised py-1 z-50",
          compact ? "right-0" : "left-0 bottom-full mb-2 mt-0"
        )}>
          <div className="px-3 py-2 border-b border-surface-200">
            <p className="text-sm font-medium text-ink-900 truncate">
              {user?.name ?? "Account"}
            </p>
            <p className="text-xs text-ink-700/50 truncate">{user?.email}</p>
          </div>

          <Link
            href="/dashboard/settings/organization"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 text-sm text-ink-700 hover:bg-surface-50 transition-colors cursor-pointer"
          >
            <span>⚙️</span> Organization Settings
          </Link>

          <button
            onClick={() => {
              setOpen(false);
              clearAuth();
              router.push("/login");
            }}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-danger-600 hover:bg-danger-50 transition-colors text-left cursor-pointer"
          >
            <span>🚪</span> Sign out
          </button>
        </div>
      )}
    </div>
  );
}