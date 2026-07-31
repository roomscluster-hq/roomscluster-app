"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { livekitApi, sessionsApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

export default function GuestJoinPage() {
  const { joinCode } = useParams<{ joinCode: string }>();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { data: session, isLoading } = useQuery({
    queryKey: ["session-public", joinCode],
    queryFn: () => sessionsApi.getByJoinCode(joinCode),
    retry: false,
  });

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const tokenData = await livekitApi.getGuestToken(joinCode, name, email);
      const maxAge = 60 * 60 * 4;

      document.cookie = `guest_token=${tokenData.token}; path=/; max-age=${maxAge}; SameSite=Lax`;
      document.cookie = `guest_name=${encodeURIComponent(name)}; path=/; max-age=${maxAge}; SameSite=Lax`;
      document.cookie = `guest_email=${encodeURIComponent(email)}; path=/; max-age=${maxAge}; SameSite=Lax`;
      document.cookie = `guest_identity=${encodeURIComponent(tokenData.guestIdentity ?? "")}; path=/; max-age=${maxAge}; SameSite=Lax`;
      document.cookie = `livekit_server_url=${encodeURIComponent(tokenData.serverUrl ?? "")}; path=/; max-age=${maxAge}; SameSite=Lax`;
      document.cookie = `guest_can_publish=${tokenData.canPublish}; path=/; max-age=${maxAge}; SameSite=Lax`;

      // ── Waiting room gate ────────────────────────────
      if (session?.id) {
        try {
          const API_URL =
            process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";
          const res = await fetch(`${API_URL}/sessions/${session.id}/settings`);
          if (res.ok) {
            const json = await res.json();
            const settings = json.data ?? json;
            if (settings.waitingRoomEnabled) {
              window.location.href = `/room/${joinCode}/waiting`;
              return;
            }
          }
        } catch {
          // Fetch failed — let guest through without waiting room
        }
      }

      window.location.href = `/room/${joinCode}`;
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
            "Failed to join session";
      setError(message);
      toast.error(message);
      setLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Spinner className="text-white w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🎙️</span>
          </div>
          <h1 className="text-xl font-bold text-white">
            {session?.title ?? "Join Session"}
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Enter your details to join as a guest
          </p>
          {session?.status === "LIVE" && (
            <span className="inline-block mt-2 text-xs bg-green-500 text-white px-3 py-1 rounded-full">
              🔴 LIVE NOW
            </span>
          )}
          {session?.status === "SCHEDULED" && (
            <span className="inline-block mt-2 text-xs bg-yellow-500 text-white px-3 py-1 rounded-full">
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

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Email Address <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="john@example.com"
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            loading={loading}
            disabled={session?.status !== "LIVE"}
          >
            {session?.status === "LIVE"
              ? "Join Session"
              : "Session Not Started"}
          </Button>
        </form>

        <p className="text-center text-xs text-gray-500 mt-4">
          By joining, you agree to our terms of service
        </p>
      </div>
    </div>
  );
}
