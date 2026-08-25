"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface ForgotPasswordFormProps {
  onSuccess: () => void;
}

export function ForgotPasswordForm({ onSuccess }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("");

  const resetMutation = useMutation({
    mutationFn: () => authApi.forgotPassword(email),
    onSuccess: () => onSuccess(),
    onError: () => toast.error("Something went wrong. Please try again."),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    resetMutation.mutate();
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
      <Button
        type="submit"
        className="w-full"
        disabled={resetMutation.isPending}
      >
        {resetMutation.isPending ? "Sending..." : "Send reset link"}
      </Button>
    </form>
  );
}

export function ForgotPasswordSuccess() {
  return (
    <div className="bg-success-50 border border-success-100 rounded-lg p-4 flex items-start gap-3">
      <CheckCircle2 className="text-success-600 shrink-0 mt-0.5" size={20} />
      <div>
        <p className="text-sm font-semibold text-success-600">Check your inbox</p>
        <p className="text-sm text-success-600/80 mt-1">
          If an account exists for that email, we've sent instructions to reset
          your password.
        </p>
      </div>
    </div>
  );
}

export function BackToLoginLink() {
  return (
    <div className="mt-6 pt-6 border-t border-surface-200 flex justify-center">
      <Link
        href="/login"
        className="flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:underline"
      >
        <ArrowLeft size={16} />
        Return to login
      </Link>
    </div>
  );
}
