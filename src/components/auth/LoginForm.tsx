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
