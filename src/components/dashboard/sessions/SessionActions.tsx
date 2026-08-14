"use client";

import Link from "next/link";
import { Play, Video, Square, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SessionStatus } from "@/types";

interface SessionActionsProps {
  sessionId: string;
  status: SessionStatus;
  joinCode: string;
  onStart: () => void;
  onEnd: () => void;
  onDelete: () => void;
  isStarting: boolean;
  isEnding: boolean;
  isDeleting: boolean;
  isCohost: boolean;
}

export function SessionActions({
  sessionId,
  status,
  joinCode,
  onStart,
  onEnd,
  onDelete,
  isStarting,
  isEnding,
  isDeleting,
  isCohost,
}: SessionActionsProps) {
  const isLive = status === "LIVE";
  const isEnded = status === "ENDED";
  const isScheduled = status === "SCHEDULED";

  return (
    <div className="flex items-center gap-2 shrink-0">
      {/* Edit button - only for scheduled sessions */}
      {isScheduled && (
        <Link href={`/dashboard/sessions/${sessionId}/edit`}>
          <Button
            variant="secondary"
            className="cursor-pointer gap-2"
            title="Edit session"
          >
            <Pencil size={18} />
            <span className="hidden sm:inline">Edit</span>
          </Button>
        </Link>
      )}

      {!isEnded && (
        <>
          {isLive ? (
            <Link href={`/room/${joinCode}`} target="_blank" rel="noopener noreferrer">
              <Button className="cursor-pointer gap-2">
                <Video size={18} />
                <span className="hidden sm:inline">Join</span>
              </Button>
            </Link>
          ) : (
            <Button
              onClick={onStart}
              loading={isStarting}
              className="cursor-pointer gap-2"
            >
              <Play size={18} />
              <span className="hidden sm:inline">Start</span>
            </Button>
          )}

          {isLive && (
            <Button
              variant="secondary"
              onClick={onEnd}
              loading={isEnding}
              className="cursor-pointer gap-2"
            >
              <Square size={18} />
              <span className="hidden sm:inline">End</span>
            </Button>
          )}
        </>
      )}

      {!isCohost && (
        <Button
          variant="danger"
          onClick={onDelete}
          loading={isDeleting}
          className="cursor-pointer gap-2"
          title="Delete session"
        >
          <Trash2 size={18} />
          <span className="hidden sm:inline">Delete</span>
        </Button>
      )}
    </div>
  );
}
