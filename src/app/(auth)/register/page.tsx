"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight } from "lucide-react";

export default function RegisterPage() {
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
      setTimeout(() => {
        router.replace("/dashboard");
      }, 100);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message ?? "Registration failed");
    },
  });

  function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    registerMutation.mutate({ name, email, password });
  }

  return (
    <div className="min-h-screen bg-surface-0 sm:bg-surface-50 flex items-center justify-center sm:p-4 relative overflow-hidden">
      <div className="hidden sm:block absolute -top-24 -right-24 w-96 h-96 bg-primary-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="hidden sm:block absolute -bottom-24 -left-24 w-96 h-96 bg-primary-100/40 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md p-6 sm:p-0">
        <div className="flex flex-col items-center mb-8">
          <div className="mb-4">
            <Image
              src="/favicon.png"
              alt="RoomsCluster"
              width={80}
              height={80}
              className="rounded-full"
              style={{ 
                backgroundColor: 'transparent',
                mixBlendMode: 'multiply'
              }}
              priority
            />
          </div>
          <h1 className="text-2xl font-bold text-ink-900">RoomsCluster</h1>
        </div>

        <div className="bg-surface-0 sm:rounded-2xl sm:shadow-raised sm:border sm:border-surface-200 p-6 sm:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-ink-900 mb-1">Create your account</h2>
            <p className="text-ink-700/60 text-sm">Start hosting sessions in seconds.</p>
          </div>

          {error && (
            <div className="bg-danger-50 text-danger-600 text-sm rounded-lg px-4 py-2.5 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            <Input
              label="Full Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="John Doe"
            />
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
            <div>
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
              <p className="text-xs text-ink-700/40 mt-1">Must be at least 8 characters.</p>
            </div>

            <Button
              type="submit"
              className="w-full"
              loading={registerMutation.isPending}
            >
              <span className="flex items-center justify-center gap-2">
                Get Started
                <ArrowRight size={18} />
              </span>
            </Button>

            <p className="text-center text-sm text-ink-700/60">
              Already have an account?{" "}
              <a href="/login" className="text-primary-600 hover:underline font-medium">
                Sign in
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
