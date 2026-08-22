"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { livekitApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { Ban, Lock, GraduationCap, Radio, Calendar, UserX } from "lucide-react";
import { cn } from "@/lib/utils";
import { invitesApi } from "@/lib/api/invites.api";

export default function InviteJoinPage() {
  const { token } = useParams<{ token: string }>();
  const [name, setName] = useState("");
  const [passcode, setPasscode] = useState("");
  const [passcodeError, setPasscodeError] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSessionLocked, setIsSessionLocked] = useState(false);
  const [isBanned, setIsBanned] = useState(false);

  const {
    data: invite,
    isLoading,
    isError,
    error: resolveError,
  } = useQuery({
    queryKey: ["invite", token],
    queryFn: () => invitesApi.resolve(token),
    retry: false,
  });

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!invite) return;

    setLoading(true);

    try {
      const tokenData = await livekitApi.getGuestToken(
        invite.joinCode,
        name,
        invite.memberEmail,
        passcode || undefined,
      );
      const maxAge = 60 * 60 * 4;

      document.cookie = `guest_token=${tokenData.token}; path=/; max-age=${maxAge}; SameSite=Lax`;
      document.cookie = `guest_name=${encodeURIComponent(name)}; path=/; max-age=${maxAge}; SameSite=Lax`;
      document.cookie = `guest_email=${encodeURIComponent(invite.memberEmail)}; path=/; max-age=${maxAge}; SameSite=Lax`;
      document.cookie = `guest_identity=${encodeURIComponent(tokenData.guestIdentity ?? "")}; path=/; max-age=${maxAge}; SameSite=Lax`;
      document.cookie = `livekit_server_url=${encodeURIComponent(tokenData.serverUrl ?? "")}; path=/; max-age=${maxAge}; SameSite=Lax`;
      document.cookie = `guest_can_publish=${tokenData.canPublish}; path=/; max-age=${maxAge}; SameSite=Lax`;

      // ── Waiting room gate — same check as the standard guest join page ──
      try {
        const API_URL =
          process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";
        const res = await fetch(
          `${API_URL}/sessions/${invite.sessionId}/settings`,
        );
        if (res.ok) {
          const json = await res.json();
          const settings = json.data ?? json;
          if (settings.waitingRoomEnabled) {
            window.location.href = `/room/${invite.joinCode}/waiting`;
            return;
          }
        }
      } catch {
        // Fetch failed — let them through without waiting room
      }

      window.location.href = `/room/${invite.joinCode}`;
    } catch (err: any) {
      const message =
        err.response?.data?.message ?? err.message ?? "Failed to join";

      if (
        message.toLowerCase().includes("passcode") ||
        message.toLowerCase().includes("incorrect")
      ) {
        setPasscodeError("Incorrect passcode. Please try again.");
      } else if (message.toLowerCase().includes("banned")) {
        setIsBanned(true);
        setLoading(false);
        return;
      } else if (message.toLowerCase().includes("locked")) {
        setIsSessionLocked(true);
        setLoading(false);
        return;
      } else {
        setError(message);
        toast.error(message);
      }
      setLoading(false);
    }
  }

  // ── Loading ──────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Spinner className="text-white w-8 h-8" />
      </div>
    );
  }

  // ── Invalid / expired / no-longer-enrolled invite ─────
  if (isError) {
    const message =
      (resolveError as any)?.response?.data?.message ??
      "This invite link is no longer valid.";

    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
            <UserX className="w-8 h-8 text-white/60" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            Can&apos;t Join Session
          </h2>
          <p className="text-white/60 text-sm">{message}</p>
          <p className="text-white/40 text-xs mt-4">
            Contact the host if you believe this is a mistake.
          </p>
        </div>
      </div>
    );
  }

  // ── Banned state ────────────────────────────────────
  if (isBanned) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-danger-600/20 flex items-center justify-center mx-auto mb-4">
            <Ban className="w-8 h-8 text-danger-600" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-white/60 text-sm">
            You have been banned from this session and cannot join.
          </p>
        </div>
      </div>
    );
  }

  // ── Session locked state ─────────────────────────────
  if (isSessionLocked) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-white/60" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Session Locked</h2>
          <p className="text-white/60 text-sm">
            The host has locked this session. No new participants can join at
            this time.
          </p>
        </div>
      </div>
    );
  }

  // ── Join form ────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">
            {invite?.sessionTitle ?? "Join Session"}
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Joining as{" "}
            <span className="text-gray-200">{invite?.memberEmail}</span>
          </p>
          {invite?.sessionStatus === "LIVE" && (
            <span className="inline-flex items-center gap-1.5 mt-2 text-xs bg-green-500 text-white px-3 py-1 rounded-full">
              <Radio className="w-3 h-3" />
              LIVE NOW
            </span>
          )}
          {invite?.sessionStatus === "SCHEDULED" && (
            <span className="inline-flex items-center gap-1.5 mt-2 text-xs bg-yellow-500 text-white px-3 py-1 rounded-full">
              <Calendar className="w-3 h-3" />
              Session hasn&apos;t started yet
            </span>
          )}
        </div>

        {error && (
          <div className="bg-red-900/50 text-red-300 text-sm rounded-lg px-4 py-2.5 mb-4 border border-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Your Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="John Doe"
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
            />
          </div>

          {invite?.requiresPasscode && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Session Passcode <span className="text-red-400">*</span>
              </label>
              <input
                type="password"
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  setPasscodeError("");
                }}
                required
                placeholder="Enter passcode"
                className={cn(
                  "w-full bg-gray-700 border text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 placeholder-gray-400",
                  passcodeError
                    ? "border-danger-500 focus:ring-danger-500"
                    : "border-gray-600 focus:ring-blue-500",
                )}
              />
              {passcodeError && (
                <p className="text-xs text-danger-600 mt-1">
                  {passcodeError}
                </p>
              )}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={invite?.sessionStatus !== "LIVE" || loading}
          >
            {invite?.sessionStatus === "LIVE"
              ? "Join Session"
              : "Session Not Started"}
          </Button>
        </form>
      </div>
    </div>
  );
}