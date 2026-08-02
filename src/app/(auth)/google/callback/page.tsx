"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { authApi } from "@/lib/api";
import { Spinner } from "@/components/ui/spinner";

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      router.push("/login?error=google_failed");
      return;
    }

    // Store token first so authApi.me() can use it
    localStorage.setItem("access_token", token);

    // Fetch user profile then set auth state
    authApi.me()
      .then((user) => {
        setAuth(user, token);
        router.replace("/dashboard");
      })
      .catch(() => {
        localStorage.removeItem("access_token");
        router.push("/login?error=google_failed");
      });
  }, [searchParams, router, setAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-3">
        <Spinner className="w-8 h-8 mx-auto" />
        <p className="text-sm text-ink-700/60">Signing you in with Google...</p>
      </div>
    </div>
  );
}