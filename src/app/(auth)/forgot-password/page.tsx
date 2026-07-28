"use client";

import { useState } from "react";
import {
  AuthLayout,
  AuthHeader,
  AuthCard,
  ForgotPasswordForm,
  ForgotPasswordSuccess,
  BackToLoginLink,
} from "@/components/auth";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);

  return (
    <AuthLayout>
      <AuthHeader title="RoomsCluster" />
      <AuthCard>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-ink-900 mb-2">
            Reset your password
          </h2>
          <p className="text-ink-700/60 text-sm">
            Enter your email address and we'll send you a link to reset your
            password.
          </p>
        </div>

        {sent ? <ForgotPasswordSuccess /> : <ForgotPasswordForm onSuccess={() => setSent(true)} />}

        <BackToLoginLink />
      </AuthCard>
    </AuthLayout>
  );
}
