"use client";

import { useState, useRef, useEffect } from "react";
import { getInitials } from "@/lib/utils";
import { Mic, Star, UserMinus, Hand, Ban, MoreVertical } from "lucide-react";

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
  isCohost: boolean;
  currentUserId: string;
  onPromote: (userId: string) => void;
  onDemote: (userId: string) => void;
  onLowerHand: (userId: string) => void;
  onMakeCohost: (userId: string) => void;
  onRemoveCohost: (userId: string) => void;
  onKick: (userId: string) => void;
  onBan: (userId: string, email: string) => void;
}

function resolveId(p: Participant): string {
  return p.user?.id ?? p.userId;
}

function resolveName(p: Participant): string {
  return p.user?.name ?? p.name ?? p.user?.email ?? p.email ?? "Unknown";
}

function getRoleBadge(role: string) {
  switch (role) {
    case 'HOST':
      return <span className="text-xs bg-primary-700 text-white px-1.5 py-0.5 rounded">Host</span>;
    case 'SPEAKER':
      return <span className="text-xs bg-success-600 text-white px-1.5 py-0.5 rounded">Speaker</span>;
    case 'COHOST':
      return <span className="text-xs bg-primary-600 text-white px-1.5 py-0.5 rounded">Co-host</span>;
    default:
      return <span className="text-xs bg-ink-700 text-white px-1.5 py-0.5 rounded">Guest</span>;
  }
}

function ThreeDotMenu({
  participant,
  hasRaisedHand,
  isHost,
  onPromote,
  onDemote,
  onLowerHand,
  onMakeCohost,
  onRemoveCohost,
  onKick,
  onBan,
}: {
  participant: Participant;
  hasRaisedHand: boolean;
  isHost: boolean;
  onPromote: () => void;
  onDemote: () => void;
  onLowerHand: () => void;
  onMakeCohost: () => void;
  onRemoveCohost: () => void;
  onKick: () => void;
  onBan: () => void;
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
  const isCohost = participant.role === 'COHOST';

  if (isHostRole) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="text-gray-400 hover:text-white p-1 rounded transition cursor-pointer"
        title="Participant options"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-6 z-50 bg-ink-700 border border-white/10 rounded-lg shadow-xl w-44 py-1">
          {/* Speaker controls */}
          {!isSpeaker && !isCohost && (
            <button
              onClick={() => { onPromote(); setOpen(false); }}
              className="w-full text-left px-3 py-2 text-sm text-success-600 hover:bg-white/5 transition flex items-center gap-2 cursor-pointer"
            >
              <Mic className="w-4 h-4" /> Allow to speak
            </button>
          )}
          {isSpeaker && (
            <button
              onClick={() => { onDemote(); setOpen(false); }}
              className="w-full text-left px-3 py-2 text-sm text-warning-500 hover:bg-white/5 transition flex items-center gap-2 cursor-pointer"
            >
              <Mic className="w-4 h-4" /> Remove speaker
            </button>
          )}

          {/* Co-host controls — host only, since co-hosts can't assign other co-hosts */}
          {isHost && !isCohost && (
            <button
              onClick={() => { onMakeCohost(); setOpen(false); }}
              className="w-full text-left px-3 py-2 text-sm text-primary-400 hover:bg-white/5 transition flex items-center gap-2 cursor-pointer"
            >
              <Star className="w-4 h-4" /> Make co-host
            </button>
          )}
          {isHost && isCohost && (
            <button
              onClick={() => { onRemoveCohost(); setOpen(false); }}
              className="w-full text-left px-3 py-2 text-sm text-warning-500 hover:bg-white/5 transition flex items-center gap-2 cursor-pointer"
            >
              <Star className="w-4 h-4" /> Remove co-host
            </button>
          )}

          {/* Lower hand */}
          {hasRaisedHand && (
            <button
              onClick={() => { onLowerHand(); setOpen(false); }}
              className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-white/5 transition flex items-center gap-2 cursor-pointer"
            >
              <Hand className="w-4 h-4" /> Lower hand
            </button>
          )}

          {/* Divider */}
          <div className="border-t border-white/10 my-1" />

          {/* Kick */}
          <button
            onClick={() => { onKick(); setOpen(false); }}
            className="w-full text-left px-3 py-2 text-sm text-danger-100 hover:bg-white/5 transition flex items-center gap-2 cursor-pointer"
          >
            <UserMinus className="w-4 h-4" /> Remove from session
          </button>

          {/* Ban */}
          <button
            onClick={() => { onBan(); setOpen(false); }}
            className="w-full text-left px-3 py-2 text-sm text-danger-600 hover:bg-white/5 transition flex items-center gap-2 cursor-pointer"
          >
            <Ban className="w-4 h-4" /> Ban from session
          </button>
        </div>
      )}
    </div>
  );
}

export function ParticipantsPanel({
  participants,
  raisedHands,
  isHost,
  isCohost,
  currentUserId,
  onPromote,
  onDemote,
  onLowerHand,
  onMakeCohost,
  onRemoveCohost,
  onKick,
  onBan,
}: ParticipantsPanelProps) {
  // Deduplicate raised hands by userId
  const seenRaisedHands = new Set<string>();
  const dedupedRaisedHands = raisedHands.filter(h => {
    if (seenRaisedHands.has(h.userId)) return false;
    seenRaisedHands.add(h.userId);
    return true;
  });
  const raisedHandIds = new Set(dedupedRaisedHands.map(h => h.userId));
  const canManage = isHost || isCohost;

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
      <div className="shrink-0 px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <h3 className="text-white text-sm font-semibold">Participants</h3>
        <span className="bg-ink-700 text-gray-300 text-xs px-2 py-0.5 rounded-full">
          {participants.length}
        </span>
      </div>

      {/* Raised hands section */}
      {dedupedRaisedHands.length > 0 && (
        <div className="shrink-0 px-4 py-2 border-b border-white/10 bg-warning-500/10">
          <p className="text-xs text-warning-500 font-medium mb-2 flex items-center gap-1.5">
            <Hand className="w-3.5 h-3.5" /> Raised hands ({dedupedRaisedHands.length})
          </p>
          <div className="space-y-1">
            {dedupedRaisedHands.map(h => (
              <div key={h.userId} className="flex items-center justify-between">
                <span className="text-gray-300 text-xs">{h.name}</span>
                {canManage && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => { onPromote(h.userId); onLowerHand(h.userId); }}
                      className="text-xs bg-success-600 hover:bg-success-600/80 text-white px-2 py-0.5 rounded transition cursor-pointer"
                    >
                      Allow
                    </button>
                    <button
                      onClick={() => onLowerHand(h.userId)}
                      className="text-xs bg-ink-700 hover:bg-ink-700/70 text-white px-2 py-0.5 rounded transition cursor-pointer"
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
      <div className="flex-1 overflow-y-auto divide-y divide-white/5">
        {sorted.map((p) => {
          const pid = resolveId(p);
          const name = resolveName(p);
          const hasRaisedHand = raisedHandIds.has(pid);
          const isMe = pid === currentUserId;

          return (
            <div key={pid} className="flex items-center justify-between px-4 py-2.5">
              <div className="flex items-center gap-2 min-w-0">
                <div className="relative shrink-0">
                  <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold">
                    {getInitials(name)}
                  </div>
                  {hasRaisedHand && (
                    <span className="absolute -top-1 -right-1">
                      <Hand className="w-3.5 h-3.5 text-warning-500" />
                    </span>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-gray-200 text-sm truncate max-w-25">
                      {name}
                    </span>
                    {isMe && (
                      <span className="text-gray-500 text-xs shrink-0">(you)</span>
                    )}
                  </div>
                  <div className="mt-0.5">
                    {getRoleBadge(p.role)}
                  </div>
                </div>
              </div>

              {/* Three-dot menu — host or co-host, not for self */}
              {canManage && !isMe && (
                <ThreeDotMenu
                  participant={p}
                  hasRaisedHand={hasRaisedHand}
                  isHost={isHost}
                  onPromote={() => { onPromote(pid); onLowerHand(pid); }}
                  onDemote={() => onDemote(pid)}
                  onLowerHand={() => onLowerHand(pid)}
                  onMakeCohost={() => onMakeCohost(pid)}
                  onRemoveCohost={() => onRemoveCohost(pid)}
                  onKick={() => onKick(pid)}
                  onBan={() => onBan(pid, p.email ?? p.user?.email ?? '')}
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