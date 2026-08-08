"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { PasswordInput } from "./PasswordInput";
import { BackToLoginLink } from "./ForgotPasswordForm";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [done, setDone] = useState(false);

  const resetMutation = useMutation({
    mutationFn: () => authApi.resetPassword(token!, password),
    onSuccess: () => setDone(true),
    onError: (err: any) => {
      toast.error(
        err.response?.data?.message ??
          "Invalid or expired reset link. Please request a new one."
      );
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
      <div className="text-center">
        <p className="text-ink-700/60 text-sm mb-4">
          This reset link is invalid or missing. Please request a new one.
        </p>
        <Link href="/forgot-password">
          <Button className="w-full">Request new link</Button>
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="space-y-4">
        <div className="bg-success-50 border border-success-100 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle2 className="text-success-600 shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-sm font-semibold text-success-600">
              Password updated
            </p>
            <p className="text-sm text-success-600/80 mt-1">
              Your password has been reset successfully.
            </p>
          </div>
        </div>
        <Button className="w-full" onClick={() => router.push("/login")}>
          Sign in with new password
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <PasswordInput
        value={password}
        onChange={setPassword}
        label="New Password"
        placeholder="Min. 8 characters"
      />

      <PasswordInput
        value={confirmPassword}
        onChange={setConfirmPassword}
        label="Confirm Password"
        placeholder="Repeat your new password"
      />

      <Button
        type="submit"
        className="w-full"
        loading={resetMutation.isPending}
      >
        Reset password
      </Button>

      <BackToLoginLink />
    </form>
  );
}
