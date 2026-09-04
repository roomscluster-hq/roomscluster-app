"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Plus, Video, Settings, User } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { Spinner } from "@/components/ui/spinner";
import { OrgSwitcher } from "@/components/dashboard/OrgSwitcher";
import { UserMenu } from "@/components/dashboard/UserMenu";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/Logo";
import { PlanBadge } from "@/components/dashboard/PlanBadge";

const NAV_ITEMS = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  { href: "/dashboard/sessions", label: "Sessions", icon: Video, exact: false },
  {
    href: "/dashboard/settings/profile",
    label: "Profile",
    icon: User,
    exact: false,
  },
  {
    href: "/dashboard/settings/organization",
    label: "Settings",
    icon: Settings,
    exact: false,
  },
];

function useIsActive(pathname: string) {
  return (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const isActive = useIsActive(pathname);
  const { isAuthenticated, hasHydrated } = useAuthStore();

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
    <div className="min-h-screen bg-surface-50 md:flex">
      {/* ── Sidebar — desktop/tablet ─────────────────── */}
      <aside className="hidden md:flex md:w-64 md:shrink-0 md:flex-col md:fixed md:inset-y-0 bg-surface-0 border-r border-surface-200">
        <div className="h-16 flex items-center px-5 border-b border-surface-200">
          <Link href="/dashboard" className="flex items-center">
            <Logo
              fallbackSrc="/logo.png"
              width={160}
              height={48}
              className="h-10 object-cover"
              priority
            />
          </Link>
        </div>

        <div className="px-4 py-4 border-b border-surface-200 space-y-3">
          <OrgSwitcher />
          <PlanBadge />
          <Link
            href="/dashboard/sessions/new"
            className="flex items-center justify-center gap-2 w-full bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={18} />
            New Session
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-primary-50 text-primary-700"
                    : "text-ink-700 hover:bg-surface-50",
                )}
              >
                <Icon className="w-4.5 h-4.5" size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-surface-200">
          <UserMenu />
        </div>
      </aside>

      {/* ── Main column ──────────────────────────────── */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Top bar — mobile only */}
        <header className="md:hidden sticky top-0 z-30 bg-surface-0 border-b border-surface-200 px-4 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center">
            <Logo
              fallbackSrc="/logo.png"
              width={140}
              height={40}
              className="h-8 w-auto max-w-35 object-contain"
              priority
            />
          </Link>
          <div className="flex items-center gap-2">
            <OrgSwitcher compact />
            <Link
              href="/dashboard/sessions/new"
              className="p-2 text-ink-700 hover:bg-surface-50 rounded-lg transition-colors"
              aria-label="New session"
            >
              <Plus size={20} />
            </Link>
            <UserMenu compact />
          </div>
        </header>

        <div className="md:hidden bg-surface-0 border-b border-surface-200 px-4 py-2">
          <PlanBadge compact />
        </div>

        {/* Page content */}
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8 pb-20 md:pb-8 max-w-6xl w-full mx-auto">
          {children}
        </main>

        {/* Bottom tab bar — mobile only */}
        <nav
          className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-surface-0 border-t border-surface-200 flex"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition-colors",
                  active ? "text-primary-600" : "text-ink-700/60",
                )}
              >
                <Icon className="w-5 h-5" size={20} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
