"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [magicSent, setMagicSent] = useState(false);

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: async (data) => {
      localStorage.setItem("access_token", data.access_token);
      const user = await authApi.me();
      setAuth(user, data.access_token);
      toast.success("Welcome back!");
      setTimeout(() => {
        router.replace("/dashboard");
      }, 100);
    },
    onError: () => {
      toast.error("Invalid email or password");
    },
  });

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  }

  function handleMagicLink() {
    if (!email.trim()) {
      toast.error("Enter your email first");
      return;
    }
    setMagicSent(true);
  }

  return (
    <div className="min-h-screen bg-surface-0 sm:bg-surface-50 flex items-center justify-center sm:p-4 relative overflow-hidden">
      <div className="hidden sm:block absolute -top-24 -right-24 w-96 h-96 bg-primary-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="hidden sm:block absolute -bottom-24 -left-24 w-96 h-96 bg-primary-100/40 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md p-6 sm:p-0">
        <div className="flex flex-col items-center mb-8">
          <Image
            src="/logo.png"
            alt="RoomsCluster"
            width={64}
            height={64}
            className="mb-4"
            priority
          />
          <h1 className="text-2xl font-bold text-ink-900">RoomsCluster</h1>
          <p className="text-ink-700/60 text-sm mt-1">Sign in to your account</p>
        </div>

        <div className="bg-surface-0 sm:rounded-2xl sm:shadow-raised sm:border sm:border-surface-200 p-6 sm:p-8">
          {magicSent ? (
            <div className="bg-success-50 text-success-600 text-sm rounded-lg px-4 py-3 text-center">
              ✅ Check your email for the magic link!
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-5">
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
              />

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-ink-700">Password</label>
                  <Link href="/forgot-password" className="text-sm text-primary-600 hover:underline font-medium">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full h-10 border border-surface-200 bg-surface-0 rounded-lg pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-700/40 hover:text-ink-700"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                loading={loginMutation.isPending}
              >
                Sign In
              </Button>

              <div className="relative flex items-center py-1">
                <div className="grow border-t border-surface-200" />
                <span className="mx-4 text-xs text-ink-700/40">or</span>
                <div className="grow border-t border-surface-200" />
              </div>

              <Button type="button" variant="secondary" className="w-full" onClick={handleMagicLink}>
                Email me a magic link
              </Button>

              <p className="text-center text-sm text-ink-700/60">
                No account?{" "}
                <a href="/register" className="text-primary-600 hover:underline font-medium">
                  Register
                </a>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
