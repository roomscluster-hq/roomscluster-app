"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [mode, setMode] = useState<"credentials" | "magic">("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [magicSent, setMagicSent] = useState(false);
  const [error, setError] = useState("");

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
    setError("");
    loginMutation.mutate({ email, password });
  }

  function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setMagicSent(true);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 w-full max-w-md p-8">

        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">RoomsCluster</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to your account</p>
        </div>

        {/* Mode toggle */}
        <div className="flex rounded-lg border border-gray-200 p-1 mb-6">
          <button
            onClick={() => setMode("credentials")}
            className={`flex-1 text-sm py-1.5 rounded-md transition font-medium ${mode === "credentials"
                ? "bg-blue-600 text-white"
                : "text-gray-500 hover:text-gray-700"
              }`}
          >
            Password
          </button>
          <button
            onClick={() => setMode("magic")}
            className={`flex-1 text-sm py-1.5 rounded-md transition font-medium ${mode === "magic"
                ? "bg-blue-600 text-white"
                : "text-gray-500 hover:text-gray-700"
              }`}
          >
            Magic Link
          </button>
        </div>

        {magicSent ? (
          <div className="bg-green-50 text-green-700 text-sm rounded-lg px-4 py-3 text-center">
            ✅ Check your email for the magic link!
          </div>
        ) : mode === "credentials" ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
            <Button
              type="submit"
              className="w-full"
              loading={loginMutation.isPending}
            >
              Sign In
            </Button>
            <p className="text-center text-sm text-gray-500">
              No account?{" "}
              <a href="/register" className="text-blue-600 hover:underline font-medium">
                Register
              </a>
            </p>
          </form>
        ) : (
          <form onSubmit={handleMagicLink} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
            <Button type="submit" className="w-full">
              Send Magic Link
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}