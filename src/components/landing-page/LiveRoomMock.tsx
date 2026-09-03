"use client";

import { useEffect, useState } from "react";
import { UserCheck } from "lucide-react";

// ── Animated mock of the live room UI — the hero's signature element ──
export function LiveRoomMock() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 2200);
    return () => clearInterval(interval);
  }, []);

  const messages = [
    { name: "Amaka", text: "Can you share the slides after?" },
    { name: "David", text: "Loud and clear 👍" },
    { name: "Priya", text: "Joining from Lagos!" },
  ];
  const visibleMessage = messages[tick % messages.length];

  return (
    <div className="relative mx-auto w-full max-w-2xl">
      <div className="bg-ink-900 rounded-modal shadow-2xl border border-white/10 overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-white text-sm font-medium">
              Cohort 4 · Live Class
            </span>
            <span className="flex items-center gap-1 text-xs bg-success-600 text-white px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              LIVE
            </span>
          </div>
          <span className="text-xs text-white/40">37 enrolled</span>
        </div>

        {/* Video tiles */}
        <div className="grid grid-cols-2 gap-1.5 p-3">
          {["AM", "DK", "PR", "+34"].map((initials, i) => (
            <div
              key={i}
              className="aspect-video rounded-lg bg-linear-to-br from-ink-700 to-ink-900 flex items-center justify-center"
            >
              <span className="text-white/60 text-xs font-semibold">
                {initials}
              </span>
            </div>
          ))}
        </div>

        {/* Chat strip */}
        <div className="px-3 pb-3">
          <div className="bg-white/5 rounded-lg px-3 py-2 flex items-start gap-2 transition-opacity duration-500">
            <span className="text-primary-500 text-xs font-medium shrink-0">
              {visibleMessage.name}
            </span>
            <span className="text-white/70 text-xs truncate">
              {visibleMessage.text}
            </span>
          </div>
        </div>
      </div>

      {/* Floating chip — enrollment gate */}
      <div className="absolute -top-4 -left-4 bg-surface-0 rounded-full shadow-raised border border-surface-200 pl-2 pr-3.5 py-1.5 hidden sm:flex items-center gap-1.5">
        <span className="w-6 h-6 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 shrink-0">
          <UserCheck size={13} />
        </span>
        <span className="text-xs font-medium text-ink-900">
          Members only
        </span>
      </div>

      {/* Floating stat card */}
      <div className="absolute -bottom-4 -right-4 bg-surface-0 rounded-card shadow-raised border border-surface-200 px-4 py-3 hidden sm:block">
        <p className="text-xs text-ink-700/50">Recording &amp; transcript</p>
        <p className="text-sm font-bold text-ink-900">Saved automatically</p>
      </div>
    </div>
  );
}
