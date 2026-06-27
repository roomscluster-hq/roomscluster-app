"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";
import { Spinner } from "@/components/ui/spinner";
import { OrgSwitcher } from "@/components/dashboard/OrgSwitcher";
import { UserMenu } from "@/components/dashboard/UserMenu";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, user, clearAuth, hasHydrated } = useAuthStore();

  useEffect(() => {
    // Only redirect once we know the real auth state — not before hydration
    if (hasHydrated && !isAuthenticated) {
      router.push("/login");
    }
  }, [hasHydrated, isAuthenticated, router]);

  // Show spinner while hydrating OR while redirecting an unauthenticated user
  if (!hasHydrated || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="text-xl font-bold text-gray-900">
            RoomsCluster
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="text-sm text-gray-600 hover:text-gray-900 transition"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/sessions"
              className="text-sm text-gray-600 hover:text-gray-900 transition"
            >
              Sessions
            </Link>
            <div className="flex items-center gap-3">
              <OrgSwitcher />
              <UserMenu />
            </div>
          </div>
        </div>
      </nav>

      {/* Page content */}
      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}