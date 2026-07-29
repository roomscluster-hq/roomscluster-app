"use client";

export function RecordingPill() {
  return (
    <div className="fixed top-3 md:top-5 right-3 md:right-5 z-40 flex items-center gap-2 bg-danger-600/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-danger-600/30">
      <span className="w-2 h-2 rounded-full bg-danger-600 animate-pulse" />
      <span className="font-mono text-xs text-white uppercase tracking-tight">
        Recording
      </span>
    </div>
  );
}
