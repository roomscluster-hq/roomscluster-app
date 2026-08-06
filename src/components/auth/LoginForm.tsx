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
import { cn, isValidEmail } from "@/lib/utils";

interface LoginFormProps {
  onMagicLinkSent?: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";

type AuthMethod = "password" | "magic-link";

export function LoginForm({ onMagicLinkSent }: LoginFormProps) {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [method, setMethod] = useState<AuthMethod>("password");
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [magicLinkLoading, setMagicLinkLoading] = useState(false);

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
    
    // Validate email format
    if (!isValidEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }
    
    if (method === "password") {
      loginMutation.mutate({ email, password });
    }
  }

  async function handleMagicLink() {
    if (!email.trim()) {
      toast.error("Enter your email first");
      return;
    }
    
    if (!isValidEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }
    setMagicLinkLoading(true);
    try {
      await authApi.sendMagicLink(email);
      setMagicLinkSent(true);
      onMagicLinkSent?.();
      toast.success("Magic link sent! Check your email.");
    } catch {
      toast.error("Failed to send magic link. Please try again.");
    } finally {
      setMagicLinkLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Method Tabs */}
      <div className="bg-surface-100 rounded-lg p-1 flex gap-1 dark:bg-surface-50">
        <button
          type="button"
          onClick={() => setMethod("password")}
          className={cn(
            "flex-1 py-2 px-3 text-sm font-medium rounded-md transition-all duration-200",
            method === "password"
              ? "bg-surface-0 text-ink-900 shadow-sm"
              : "text-ink-600 hover:text-ink-800"
          )}
        >
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Password
          </span>
        </button>
        <button
          type="button"
          onClick={() => setMethod("magic-link")}
          className={cn(
            "flex-1 py-2 px-3 text-sm font-medium rounded-md transition-all duration-200",
            method === "magic-link"
              ? "bg-surface-0 text-ink-900 shadow-sm"
              : "text-ink-600 hover:text-ink-800"
          )}
        >
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Magic Link
          </span>
        </button>
      </div>

      {/* Email Field */}
      <div>
        <Input
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setEmailError(""); // Clear error on type
          }}
          required
          placeholder="you@example.com"
          error={emailError}
        />
      </div>

      {/* Password Field - Only show for password method */}
      {method === "password" && (
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
      )}

      {/* Magic Link Info - Only show for magic link method */}
      {method === "magic-link" && !magicLinkSent && (
        <p className="text-sm text-ink-600 bg-surface-50 p-3 rounded-lg">
          We&apos;ll email you a magic link that signs you in instantly — no password needed.
        </p>
      )}

      {/* Submit Button */}
      {method === "password" ? (
        <Button type="submit" className="w-full" loading={loginMutation.isPending}>
          Sign In
        </Button>
      ) : magicLinkSent ? (
        <div className="text-center py-4 px-4 bg-success-50 border border-success-100 rounded-lg">
          <div className="w-10 h-10 rounded-full bg-success-100 flex items-center justify-center mx-auto mb-2">
            <svg className="w-5 h-5 text-success-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-success-700">Check your email!</p>
          <p className="text-xs text-success-600 mt-1">
            We sent a magic link to <strong>{email}</strong>
          </p>
          <button
            type="button"
            onClick={() => {
              setMagicLinkSent(false);
              setEmail("");
            }}
            className="text-xs text-success-600 hover:underline mt-3 inline-block"
          >
            Use a different email
          </button>
        </div>
      ) : (
        <Button
          type="button"
          className="w-full"
          onClick={handleMagicLink}
          loading={magicLinkLoading}
        >
          Send Magic Link
        </Button>
      )}

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

      <p className="text-center text-sm text-ink-700/60">
        No account?{" "}
        <a href="/register" className="text-primary-600 hover:underline font-medium">
          Register
        </a>
      </p>
    </form>
  );
}
