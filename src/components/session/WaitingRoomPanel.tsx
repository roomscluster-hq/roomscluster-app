"use client";

import { useRoom } from "@/contexts/RoomContext";
import { Button } from "@/components/ui/button";

interface WaitingParticipant {
  id: string;
  name: string;
  email: string;
  identity: string;
}

interface WaitingRoomPanelProps {
  joinCode: string;
}

export function WaitingRoomPanel({ joinCode }: WaitingRoomPanelProps) {
  const { waitingParticipants, admitParticipant, admitAll, rejectParticipant } = useRoom();

  if (waitingParticipants.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-white/40 text-sm">No one is waiting</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Admit all header */}
      <div className="shrink-0 px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <p className="text-white/60 text-xs">
          {waitingParticipants.length} waiting
        </p>
        <button
          onClick={() => admitAll(joinCode)}
          className="text-xs text-primary-400 hover:text-primary-300 font-medium transition cursor-pointer"
        >
          Admit all
        </button>
      </div>

      {/* Waiting list */}
      <div className="flex-1 overflow-y-auto">
        {waitingParticipants.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between px-4 py-3 border-b border-white/5 last:border-0"
          >
            <div className="min-w-0">
              <p className="text-sm text-white truncate">{p.name}</p>
              <p className="text-xs text-white/40 truncate">{p.email}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-2">
              <button
                onClick={() => admitParticipant(joinCode, p.id)}
                className="text-xs bg-primary-600 text-white px-3 py-1 rounded-full hover:bg-primary-700 transition cursor-pointer"
              >
                Admit
              </button>
              <button
                onClick={() => rejectParticipant(joinCode, p.id)}
                className="text-xs text-white/40 hover:text-white/70 transition cursor-pointer"
              >
                Decline
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}