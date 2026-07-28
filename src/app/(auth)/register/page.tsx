"use client";

import {
  AuthLayout,
  AuthHeader,
  AuthCard,
  RegisterForm,
} from "@/components/auth";

export default function RegisterPage() {
  return (
    <AuthLayout>
      <AuthHeader title="RoomsCluster" />
      <AuthCard>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-ink-900 mb-1">
            Create your account
          </h2>
          <p className="text-ink-700/60 text-sm">
            Start hosting sessions in seconds.
          </p>
        </div>
        <RegisterForm />
      </AuthCard>
    </AuthLayout>
  );
}
