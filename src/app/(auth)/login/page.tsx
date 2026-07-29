"use client";

import { useState } from "react";
import {
  AuthLayout,
  AuthHeader,
  AuthCard,
  LoginForm,
  MagicLinkSuccess,
} from "@/components/auth";

export default function LoginPage() {
  const [magicSent, setMagicSent] = useState(false);

  return (
    <AuthLayout>
      <AuthHeader
        title="RoomsCluster"
        subtitle="Sign in to your account"
      />
      <AuthCard>
        {magicSent ? (
          <MagicLinkSuccess />
        ) : (
          <LoginForm onMagicLinkSent={() => setMagicSent(true)} />
        )}
      </AuthCard>
    </AuthLayout>
  );
}
