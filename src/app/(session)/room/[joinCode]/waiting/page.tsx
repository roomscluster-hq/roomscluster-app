"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { sessionsApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { getCookie } from "@/lib/cookies";
import { io, Socket } from "socket.io-client";

// This page is shown to participants when waiting room is enabled.
// URL: /room/[joinCode]/waiting

export default function WaitingRoomPage() {
  const { joinCode } = useParams<{ joinCode: string }>();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [status, setStatus] = useState<"waiting" | "admitted" | "rejected">("waiting");
  const [socket, setSocket] = useState<Socket | null>(null);

  const guestName = getCookie("guest_name");
  const guestEmail = getCookie("guest_email");
  const identity = user?.id ?? getCookie("guest_identity") ?? "";
  const name = user?.name ?? user?.email ?? guestName ?? "Guest";
  const email = user?.email ?? guestEmail ?? "";

  const { data: session } = useQuery({
    queryKey: ["session-room", joinCode],
    queryFn: () => sessionsApi.getByJoinCode(joinCode),
  });

  useEffect(() => {
    if (!session || !identity) return;

    const token = localStorage.getItem("access_token");
    const s = io(`${process.env.NEXT_PUBLIC_SOCKET_URL}/session`, {
      auth: { token: token ?? "" },
      transports: ["websocket"],
    });

    setSocket(s);

    s.on("connect", () => {
      // Tell the room we're waiting
      s.emit("waiting:join", { joinCode });
    });

    // Host admitted us individually or via admit-all
    s.on("waiting:admitted", (data: { identity: string }) => {
      if (data.identity === identity || data.identity === "all") {
        setStatus("admitted");
        setTimeout(() => {
          router.replace(`/room/${joinCode}`);
        }, 1500);
      }
    });

    // Host rejected us
    s.on("waiting:rejected", (data: { identity: string }) => {
      if (data.identity === identity) {
        setStatus("rejected");
      }
    });

    return () => {
      s.disconnect();
    };
  }, [session, identity, joinCode, router]);

  return (
    <div className="min-h-screen bg-ink-900 flex items-center justify-center px-4">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl max-w-sm w-full p-8 text-center">

        {status === "waiting" && (
          <>
            {/* Animated waiting indicator */}
            <div className="flex items-center justify-center gap-1.5 mb-6">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2.5 h-2.5 rounded-full bg-primary-500 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>

            <h1 className="text-xl font-bold text-white mb-2">
              Waiting to be admitted
            </h1>
            <p className="text-white/60 text-sm mb-1">
              {session?.title ?? "Session"}
            </p>
            <p className="text-white/40 text-xs">
              The host will let you in shortly. Please wait here.
            </p>

            <div className="mt-6 bg-white/5 rounded-lg px-4 py-3">
              <p className="text-white/60 text-xs">Joining as</p>
              <p className="text-white text-sm font-medium mt-0.5">{name}</p>
              {email && <p className="text-white/40 text-xs">{email}</p>}
            </div>
          </>
        )}

        {status === "admitted" && (
          <>
            <div className="w-14 h-14 rounded-full bg-success-500/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✅</span>
            </div>
            <h1 className="text-xl font-bold text-white mb-2">You're in!</h1>
            <p className="text-white/60 text-sm">Taking you to the session...</p>
          </>
        )}

        {status === "rejected" && (
          <>
            <div className="w-14 h-14 rounded-full bg-danger-500/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">❌</span>
            </div>
            <h1 className="text-xl font-bold text-white mb-2">
              Entry declined
            </h1>
            <p className="text-white/60 text-sm mb-6">
              The host has declined your request to join this session.
            </p>
            <button
              onClick={() => router.push("/")}
              className="text-sm text-primary-400 hover:text-primary-300 transition"
            >
              Return home
            </button>
          </>
        )}
      </div>
    </div>
  );
}