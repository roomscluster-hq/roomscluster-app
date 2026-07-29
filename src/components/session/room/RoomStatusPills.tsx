"use client";

interface RoomStatusPillsProps {
  isLiveKitConnected: boolean;
  sessionTitle?: string;
  startedAt?: string;
  elapsedSeconds: number;
  isGuest: boolean;
  guestName?: string;
  formatElapsed: (seconds: number) => string;
}

export function RoomStatusPills({
  isLiveKitConnected,
  sessionTitle,
  startedAt,
  elapsedSeconds,
  isGuest,
  guestName,
  formatElapsed,
}: RoomStatusPillsProps) {
  return (
    <div className="fixed top-3 md:top-5 left-3 md:left-5 z-40 flex items-center gap-2 flex-wrap max-w-[75vw]">
      <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
        <span
          className={`w-2 h-2 rounded-full ${isLiveKitConnected ? "bg-success-500" : "bg-warning-500"} animate-pulse`}
        />
        <span className="font-mono text-xs text-white tracking-wider uppercase">
          {isLiveKitConnected ? "Live" : "Connecting"}
        </span>
      </div>
      <div className="hidden sm:flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 min-w-0">
        <span className="text-white/90 text-xs truncate max-w-[30vw]">
          {sessionTitle ?? "Session"}
        </span>
      </div>
      {isLiveKitConnected && startedAt && (
        <div className="hidden sm:flex items-center bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
          <span className="font-mono text-xs text-white/70">
            {formatElapsed(elapsedSeconds)}
          </span>
        </div>
      )}
      {isGuest && (
        <div className="hidden md:flex items-center bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
          <span className="text-xs text-white/70">Guest: {guestName}</span>
        </div>
      )}
    </div>
  );
}
