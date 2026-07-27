"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const resetMutation = useMutation({
    mutationFn: () => authApi.forgotPassword(email),
    onSuccess: () => setSent(true),
    onError: () => toast.error("Something went wrong. Please try again."),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    resetMutation.mutate();
  }

  return (
    <div className="min-h-screen bg-surface-0 sm:bg-surface-50 flex items-center justify-center sm:p-4 relative overflow-hidden">
      <div className="hidden sm:block absolute -top-24 -right-24 w-96 h-96 bg-primary-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="hidden sm:block absolute -bottom-24 -left-24 w-96 h-96 bg-primary-100/40 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md p-6 sm:p-0">
        <div className="flex flex-col items-center mb-8">
          <Image
            src="/favicon.png"
            alt="RoomsCluster"
            width={64}
            height={64}
            className="mb-4"
            priority
          />
          <h1 className="text-2xl font-bold text-ink-900">RoomsCluster</h1>
        </div>

        <div className="bg-surface-0 sm:rounded-2xl sm:shadow-raised sm:border sm:border-surface-200 p-6 sm:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-ink-900 mb-2">Reset your password</h2>
            <p className="text-ink-700/60 text-sm">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          {sent ? (
            <div className="bg-success-50 border border-success-100 rounded-lg p-4 flex items-start gap-3">
              <CheckCircle2 className="text-success-600 shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-sm font-semibold text-success-600">Check your inbox</p>
                <p className="text-sm text-success-600/80 mt-1">
                  If an account exists for that email, we've sent instructions to reset your password.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
              />
              <Button type="submit" className="w-full" loading={resetMutation.isPending}>
                Send reset link
              </Button>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-surface-200 flex justify-center">
            <Link
              href="/login"
              className="flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:underline"
            >
              <ArrowLeft size={16} />
              Return to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
