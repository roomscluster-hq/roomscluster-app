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
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      {!isEnded && (
        <>
          {isLive ? (
            <Link href={`/room/${joinCode}`} className="w-full sm:w-auto">
              <Button className="w-full cursor-pointer">Join Session</Button>
            </Link>
          ) : (
            <Button
              onClick={onStart}
              loading={isStarting}
              className="w-full sm:w-auto cursor-pointer"
            >
              Start Session
            </Button>
          )}

          {isLive && (
            <Button
              variant="secondary"
              onClick={onEnd}
              loading={isEnding}
              className="w-full sm:w-auto cursor-pointer"
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
        className="w-full sm:w-auto cursor-pointer"
      >
        Delete Session
      </Button>
    </div>
  );
}
