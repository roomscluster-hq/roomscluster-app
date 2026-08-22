"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { authApi } from "@/lib/api";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";
import { resolveHomeRoute } from "@/hooks/resolveHomeRoute";

export function MagicLinkContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      return;
    }

    authApi
      .verifyMagicLink(token)
      .then(async (data) => {
        localStorage.setItem("access_token", data.access_token);
        const user = await authApi.me();
        setAuth(user, data.access_token);
        const homeRoute = await resolveHomeRoute();
        router.replace(homeRoute);
      })
      .catch((err) => {
        const message =
          err.response?.data?.message ??
          "This magic link is invalid or has expired.";
        setError(message);
      });
  }, [token, router, setAuth]);

  if (!token || error) {
    const message = error ?? "Invalid magic link — no token found.";

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-sm space-y-4">
          <div className="w-14 h-14 rounded-full bg-danger-50 flex items-center justify-center mx-auto">
            <svg
              className="w-7 h-7 text-danger-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-ink-900">Link Expired</h2>
          <p className="text-sm text-ink-700/60">{message}</p>
          <Link
            href="/login"
            className="inline-block text-sm font-medium text-primary-600 hover:underline"
          >
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-3">
        <Spinner className="w-8 h-8 mx-auto" />
        <p className="text-sm text-ink-700/60">Signing you in...</p>
      </div>
    </div>
  );
}
