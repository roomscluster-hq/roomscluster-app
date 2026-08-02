"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { PasswordInput } from "./PasswordInput";
import { FormDivider } from "./FormDivider";

interface LoginFormProps {
  onMagicLinkSent?: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";

export function LoginForm({ onMagicLinkSent }: LoginFormProps) {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: async (data) => {
      localStorage.setItem("access_token", data.access_token);
      const user = await authApi.me();
      setAuth(user, data.access_token);
      toast.success("Welcome back!");
      router.replace("/dashboard");
    },
    onError: () => {
      toast.error("Invalid email or password");
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  }

  function handleMagicLink() {
    if (!email.trim()) {
      toast.error("Enter your email first");
      return;
    }
    onMagicLinkSent?.();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        label="Email Address"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        placeholder="you@example.com"
      />

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-medium text-ink-700">Password</label>
          <Link
            href="/forgot-password"
            className="text-sm text-primary-600 hover:underline font-medium"
          >
            Forgot password?
          </Link>
        </div>
        <PasswordInput
          value={password}
          onChange={setPassword}
          label=""
          required
        />
      </div>

      <Button type="submit" className="w-full" loading={loginMutation.isPending}>
        Sign In
      </Button>

      <FormDivider />

      {/* Google Sign In */}
      <a
        href={`${API_URL}/auth/google`}
        className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-surface-200 rounded-lg hover:bg-surface-50 transition-colors text-sm font-medium text-ink-700"
      >
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Continue with Google
      </a>

      {/* Magic link */}
      <Button
        type="button"
        variant="secondary"
        className="w-full"
        onClick={handleMagicLink}
      >
        Email me a magic link
      </Button>

      <p className="text-center text-sm text-ink-700/60">
        No account?{" "}
        <a href="/register" className="text-primary-600 hover:underline font-medium">
          Register
        </a>
      </p>
    </form>
  );
}