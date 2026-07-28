"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SessionStatus } from "@/types";

interface SessionActionsProps {
  status: SessionStatus;
  joinCode: string;
  onStart: () => void;
  onEnd: () => void;
  onDelete: () => void;
  isStarting: boolean;
  isEnding: boolean;
  isDeleting: boolean;
}

export function SessionActions({
  status,
  joinCode,
  onStart,
  onEnd,
  onDelete,
  isStarting,
  isEnding,
  isDeleting,
}: SessionActionsProps) {
  const isLive = status === "LIVE";
  const isEnded = status === "ENDED";

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center shrink-0">
      {!isEnded && (
        <>
          {isLive ? (
            <Link href={`/room/${joinCode}`}>
              <Button className="cursor-pointer whitespace-nowrap">Join Session</Button>
            </Link>
          ) : (
            <Button
              onClick={onStart}
              loading={isStarting}
              className="cursor-pointer whitespace-nowrap"
            >
              Start Session
            </Button>
          )}

          {isLive && (
            <Button
              variant="secondary"
              onClick={onEnd}
              loading={isEnding}
              className="cursor-pointer whitespace-nowrap"
            >
              End Session
            </Button>
          )}
        </>
      )}

      <Button
        variant="danger"
        onClick={onDelete}
        loading={isDeleting}
        className="cursor-pointer whitespace-nowrap"
      >
        Delete
      </Button>
    </div>
  );
}
