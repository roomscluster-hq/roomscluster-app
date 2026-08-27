"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight } from "lucide-react";
import { PasswordInput } from "./PasswordInput";
import { AuthError } from "./AuthError";

export function RegisterForm() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: async (data) => {
      localStorage.setItem("access_token", data.access_token);
      const user = await authApi.me();
      setAuth(user, data.access_token);
      router.replace("/dashboard");
    },
    onError: (err: any) => {
      setError(err.response?.data?.message ?? "Registration failed");
    },
  });

  const isSubmitting = registerMutation.isPending;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;
    setError("");
    registerMutation.mutate({ name, email, password });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <AuthError message={error} />}

      <Input
        label="Full Name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        placeholder="John Doe"
        disabled={isSubmitting}
      />

      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        placeholder="you@example.com"
        disabled={isSubmitting}
      />

      <PasswordInput
        value={password}
        onChange={setPassword}
        helperText="Must be at least 8 characters."
        disabled={isSubmitting}
      />

      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting}
      >
        <span className="flex items-center justify-center gap-2">
          {isSubmitting ? (
            <>
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Creating account...
            </>
          ) : (
            <>
              Get Started
              <ArrowRight size={18} />
            </>
          )}
        </span>
      </Button>

      <p className="text-center text-sm text-ink-700/60">
        Already have an account?{" "}
        <a href="/login" className="text-primary-600 hover:underline font-medium">
          Sign in
        </a>
      </p>
    </form>
  );
}