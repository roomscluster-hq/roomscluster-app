"use client";

import { useState, useRef, useEffect } from "react";
import { getInitials } from "@/lib/utils";

interface Participant {
  userId: string;
  user?: { id: string; name?: string; email?: string; image?: string | null };
  name: string;
  email: string;
  role: string;
  isGuest?: boolean;
}

interface RaisedHand {
  userId: string;
  name: string;
  email: string;
}

interface ParticipantsPanelProps {
  participants: Participant[];
  raisedHands: RaisedHand[];
  isHost: boolean;
  currentUserId: string;
  onPromote: (userId: string) => void;
  onDemote: (userId: string) => void;
  onLowerHand: (userId: string) => void;
}

// Resolve the actual ID regardless of whether it's nested or flat
function resolveId(p: Participant): string {
  return p.user?.id ?? p.userId;
}

// Resolve display name
function resolveName(p: Participant): string {
  return p.user?.name ?? p.name ?? p.user?.email ?? p.email ?? "Unknown";
}

function getRoleBadge(role: string) {
  switch (role) {
    case 'HOST':
      return <span className="text-xs bg-purple-600 text-white px-1.5 py-0.5 rounded">Host</span>;
    case 'SPEAKER':
      return <span className="text-xs bg-green-600 text-white px-1.5 py-0.5 rounded">Speaker</span>;
    case 'COHOST':
      return <span className="text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded">Co-host</span>;
    default:
      return <span className="text-xs bg-gray-600 text-white px-1.5 py-0.5 rounded">Guest</span>;
  }
}

function ThreeDotMenu({
  participant,
  hasRaisedHand,
  onPromote,
  onDemote,
  onLowerHand,
}: {
  participant: Participant;
  hasRaisedHand: boolean;
  onPromote: () => void;
  onDemote: () => void;
  onLowerHand: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isSpeaker = participant.role === 'SPEAKER';
  const isHostRole = participant.role === 'HOST';

  if (isHostRole) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="text-gray-400 hover:text-white p-1 rounded transition"
        title="Participant options"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-6 z-50 bg-gray-700 border border-gray-600 rounded-lg shadow-xl w-44 py-1">
          {!isSpeaker && (
            <button
              onClick={() => { onPromote(); setOpen(false); }}
              className="w-full text-left px-3 py-2 text-sm text-green-400 hover:bg-gray-600 transition flex items-center gap-2"
            >
              <span>🎤</span> Allow to speak
            </button>
          )}
          {isSpeaker && (
            <button
              onClick={() => { onDemote(); setOpen(false); }}
              className="w-full text-left px-3 py-2 text-sm text-yellow-400 hover:bg-gray-600 transition flex items-center gap-2"
            >
              <span>🔇</span> Remove speaker
            </button>
          )}
          {hasRaisedHand && (
            <button
              onClick={() => { onLowerHand(); setOpen(false); }}
              className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-600 transition flex items-center gap-2"
            >
              <span>✋</span> Lower hand
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function ParticipantsPanel({
  participants,
  raisedHands,
  isHost,
  currentUserId,
  onPromote,
  onDemote,
  onLowerHand,
}: ParticipantsPanelProps) {
  const raisedHandIds = new Set(raisedHands.map(h => h.userId));

  // Deduplicate by resolved ID before sorting
  const seen = new Set<string>();
  const deduped = participants.filter(p => {
    const id = resolveId(p);
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });

  const order: Record<string, number> = { HOST: 0, COHOST: 1, SPEAKER: 2, GUEST: 3 };
  const sorted = [...deduped].sort((a, b) => {
    return (order[a.role] ?? 3) - (order[b.role] ?? 3);
  });

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-gray-700 flex items-center justify-between">
        <h3 className="text-white text-sm font-semibold">Participants</h3>
        <span className="bg-gray-600 text-gray-300 text-xs px-2 py-0.5 rounded-full">
          {participants.length}
        </span>
      </div>

      {/* Raised hands section */}
      {raisedHands.length > 0 && (
        <div className="flex-shrink-0 px-4 py-2 border-b border-gray-700 bg-yellow-500/5">
          <p className="text-xs text-yellow-400 font-medium mb-2">
            ✋ Raised hands ({raisedHands.length})
          </p>
          <div className="space-y-1">
            {raisedHands.map(h => (
              <div key={h.userId} className="flex items-center justify-between">
                <span className="text-gray-300 text-xs">{h.name}</span>
                {isHost && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => { onPromote(h.userId); onLowerHand(h.userId); }}
                      className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-0.5 rounded transition"
                    >
                      Allow
                    </button>
                    <button
                      onClick={() => onLowerHand(h.userId)}
                      className="text-xs bg-gray-600 hover:bg-gray-500 text-white px-2 py-0.5 rounded transition"
                    >
                      Lower
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Participant list */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-700/50">
        {sorted.map((p) => {
          const pid = resolveId(p);
          const name = resolveName(p);
          const hasRaisedHand = raisedHandIds.has(pid);
          const isMe = pid === currentUserId;

          return (
            <div key={pid} className="flex items-center justify-between px-4 py-2.5">

              {/* Avatar + info */}
              <div className="flex items-center gap-2 min-w-0">
                {/* Avatar with hand emoji overlay */}
                <div className="relative flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                    {getInitials(name)}
                  </div>
                  {hasRaisedHand && (
                    <span className="absolute -top-1 -right-1 text-xs leading-none">✋</span>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-gray-200 text-sm truncate max-w-[100px]">
                      {name}
                    </span>
                    {isMe && (
                      <span className="text-gray-500 text-xs flex-shrink-0">(you)</span>
                    )}
                  </div>
                  <div className="mt-0.5">
                    {getRoleBadge(p.role)}
                  </div>
                </div>
              </div>

              {/* Three-dot menu — host only, not for self */}
              {isHost && !isMe && (
                <ThreeDotMenu
                  participant={p}
                  hasRaisedHand={hasRaisedHand}
                  onPromote={() => { onPromote(pid); onLowerHand(pid); }}
                  onDemote={() => onDemote(pid)}
                  onLowerHand={() => onLowerHand(pid)}
                />
              )}
            </div>
          );
        })}

        {participants.length === 0 && (
          <div className="px-4 py-8 text-center text-gray-500 text-sm">
            No participants yet
          </div>
        )}
      </div>
    </div>
  );
}