"use client";

import { useRouter } from "next/navigation";

interface RoomErrorProps {
  error: string;
  isGuest: boolean;
}

export function RoomError({ error, isGuest }: RoomErrorProps) {
  const router = useRouter();

  return (
    <div className="h-screen bg-ink-900 flex items-center justify-center">
      <div className="text-center">
        <p className="text-danger-600 text-lg mb-4">{error}</p>
        <button
          onClick={() => router.push(isGuest ? "/" : "/dashboard")}
          className="text-white underline"
        >
          {isGuest ? "Go Home" : "Back to Dashboard"}
        </button>
      </div>
    </div>
  );
}
