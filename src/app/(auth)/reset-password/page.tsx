"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { authApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Eye, EyeOff, CheckCircle2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [done, setDone] = useState(false);

  const resetMutation = useMutation({
    mutationFn: () => authApi.resetPassword(token!, password),
    onSuccess: () => setDone(true),
    onError: (err: any) => {
      toast.error(err.response?.data?.message ?? "Invalid or expired reset link. Please request a new one.");
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    resetMutation.mutate();
  }

  // No token in URL — broken/missing link
  if (!token) {
    return (
      <div className="bg-surface-0 sm:rounded-2xl sm:shadow-raised sm:border sm:border-surface-200 p-6 sm:p-8 text-center">
        <p className="text-ink-700/60 text-sm mb-4">
          This reset link is invalid or missing. Please request a new one.
        </p>
        <Link href="/forgot-password">
          <Button className="w-full">Request new link</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-surface-0 sm:rounded-2xl sm:shadow-raised sm:border sm:border-surface-200 p-6 sm:p-8">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-ink-900 mb-2">Choose a new password</h2>
        <p className="text-ink-700/60 text-sm">
          Make it strong and memorable. At least 8 characters.
        </p>
      </div>

      {done ? (
        <div className="space-y-4">
          <div className="bg-success-50 border border-success-100 rounded-lg p-4 flex items-start gap-3">
            <CheckCircle2 className="text-success-600 shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-sm font-semibold text-success-600">Password updated</p>
              <p className="text-sm text-success-600/80 mt-1">
                Your password has been reset successfully.
              </p>
            </div>
          </div>
          <Button className="w-full" onClick={() => router.push("/login")}>
            Sign in with new password
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* New password */}
          <div>
            <label className="text-sm font-medium text-ink-700 block mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Min. 8 characters"
                className="w-full h-10 border border-surface-200 bg-surface-0 rounded-lg pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-700/40 hover:text-ink-700"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirm password */}
          <div>
            <label className="text-sm font-medium text-ink-700 block mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Repeat your new password"
                className="w-full h-10 border border-surface-200 bg-surface-0 rounded-lg pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-700/40 hover:text-ink-700"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            loading={resetMutation.isPending}
          >
            Reset password
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
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-surface-0 sm:bg-surface-50 flex items-center justify-center sm:p-4 relative overflow-hidden">
      <div className="hidden sm:block absolute -top-24 -right-24 w-96 h-96 bg-primary-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="hidden sm:block absolute -bottom-24 -left-24 w-96 h-96 bg-primary-100/40 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md p-6 sm:p-0">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-ink-900 flex items-center justify-center mb-4">
            <span className="text-white font-bold text-sm">RC</span>
          </div>
          <h1 className="text-2xl font-bold text-ink-900">RoomsCluster</h1>
          <p className="text-ink-700/60 text-sm mt-1">Reset your password</p>
        </div>

        <Suspense
          fallback={
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          }
        >
          <ResetPasswordContent />
        </Suspense>
      </div>
    </div>
  );
}