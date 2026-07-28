"use client";

import { Suspense } from "react";
import {
  AuthLayout,
  AuthHeader,
  AuthCard,
  ResetPasswordForm,
} from "@/components/auth";
import { Spinner } from "@/components/ui/spinner";

export default function ResetPasswordPage() {
  return (
    <AuthLayout>
      <AuthHeader
        title="RoomsCluster"
        subtitle="Reset your password"
      />
      <AuthCard>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-ink-900 mb-2">
            Choose a new password
          </h2>
          <p className="text-ink-700/60 text-sm">
            Make it strong and memorable. At least 8 characters.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </AuthCard>
    </AuthLayout>
  );
}
