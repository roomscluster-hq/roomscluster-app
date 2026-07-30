"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { sessionsApi } from "@/lib/api";
import { organizationsApi } from "@/lib/api/organizations.api";
import { useAuthStore } from "@/store/auth.store";
import { StatusBadge } from "@/components/ui/badge";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import { SessionsListSkeleton } from "@/components/dashboard/SessionsListSkeleton";
import { Activity, ArrowRight, Calendar, Clock, Users, Video } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const { data: sessions, isLoading } = useQuery({
    queryKey: ["sessions", "ALL"],
    queryFn: () => sessionsApi.getAll("ALL"),
  });

  const { data: organizations } = useQuery({
    queryKey: ["organizations-mine"],
    queryFn: organizationsApi.listMine,
  });
  const activeOrg = organizations?.find((o) => o.isActive);

  const stats = {
    total: sessions?.length ?? 0,
    live: sessions?.filter((s) => s.status === "LIVE").length ?? 0,
    scheduled: sessions?.filter((s) => s.status === "SCHEDULED").length ?? 0,
    participants: sessions?.reduce((sum, s) => sum + (s._count?.attendance ?? 0), 0) ?? 0,
  };

  const recentSessions = sessions?.slice(0, 5) ?? [];

  const nextSession = useMemo(() => {
    if (!sessions) return null;

    return sessions
      .filter((s) => s.status === "SCHEDULED" && s.scheduledAt)
      .sort((a, b) => new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime())[0] ?? null;
  }, [sessions]);

  return (
    <div>
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-2xl font-bold text-ink-900 truncate">
          Welcome back, {user?.name ?? "Host"} 👋
        </h1>
        <p className="text-ink-700/60 text-sm mt-1">
          Here&apos;s what&apos;s happening with your sessions today.
        </p>
      </div>

      {/* Stats — horizontal scroll on mobile, grid on desktop */}
      <div className="flex md:grid md:grid-cols-4 gap-4 mb-6 md:mb-8 overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 snap-x snap-mandatory md:overflow-visible">
        {[
          {
            label: "Live now",
            value: stats.live,
            icon: <span className="w-2 h-2 rounded-full bg-success-600 animate-pulse" />,
          },
          { label: "Scheduled", value: stats.scheduled, icon: <Calendar size={18} className="text-ink-700/40" /> },
          { label: "Total sessions", value: stats.total, icon: <Video size={18} className="text-ink-700/40" /> },
          { label: "Total participants", value: stats.participants, icon: <Users size={18} className="text-ink-700/40" /> },
        ].map((stat) => (
          <Card key={stat.label} className="shrink-0 w-[70vw] sm:w-56 md:w-auto snap-start">
            <CardContent className="py-5 flex flex-col justify-between h-28">
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink-700/60">{stat.label}</span>
                {stat.icon}
              </div>
              <span className="text-3xl font-bold text-ink-900">{stat.value}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Sessions */}
        <Card className="lg:col-span-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-ink-900">Recent Sessions</h2>
              <Link href="/dashboard/sessions" className="text-sm text-primary-600 hover:underline">
                View all
              </Link>
            </div>
          </CardHeader>

          {isLoading ? (
            <CardContent>
              <div className="flex justify-center py-8">
                <SessionsListSkeleton />
              </div>
            </CardContent>
          ) : recentSessions.length === 0 ? (
            <CardContent>
              <div className="py-12 text-center">
                <p className="text-ink-700/40 text-sm">No sessions yet.</p>
                <Link
                  href="/dashboard/sessions/new"
                  className="mt-3 inline-block text-sm text-primary-600 hover:underline"
                >
                  Create your first session →
                </Link>
              </div>
            </CardContent>
          ) : (
            <>
              {/* Table — desktop */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-surface-50 text-ink-700/50 text-xs uppercase tracking-wide">
                      <th className="px-6 py-3 font-medium border-b border-surface-200">Title</th>
                      <th className="px-6 py-3 font-medium border-b border-surface-200">Status</th>
                      <th className="px-6 py-3 font-medium border-b border-surface-200">Time</th>
                      <th className="px-6 py-3 font-medium border-b border-surface-200 text-right">Participants</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-200">
                    {recentSessions.map((s) => (
                      <tr
                        key={s.id}
                        onClick={() => router.push(`/dashboard/sessions/${s.id}`)}
                        className="hover:bg-surface-50 transition-colors cursor-pointer"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600 shrink-0">
                              <Video size={16} />
                            </div>
                            <span className="font-medium text-ink-900 truncate">{s.title}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={s.status} />
                        </td>
                        <td className="px-6 py-4 text-ink-700/60">
                          {s.scheduledAt ? formatDateTime(s.scheduledAt) : "Instant session"}
                        </td>
                        <td className="px-6 py-4 text-right text-ink-900">{s._count?.attendance ?? 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Stacked list — mobile */}
              <div className="md:hidden divide-y divide-surface-200">
                {recentSessions.map((s) => (
                  <Link
                    key={s.id}
                    href={`/dashboard/sessions/${s.id}`}
                    className="flex items-center justify-between gap-3 px-4 py-4 hover:bg-surface-50 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink-900 truncate">{s.title}</p>
                      <p className="text-xs text-ink-700/50 mt-0.5">
                        {s.scheduledAt ? formatDateTime(s.scheduledAt) : "Instant session"}
                        {" · "}
                        {s._count?.attendance ?? 0} participant
                        {(s._count?.attendance ?? 0) !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <StatusBadge status={s.status} />
                  </Link>
                ))}
              </div>
            </>
          )}
        </Card>

        {/* Right column */}
        <div className="lg:col-span-4 space-y-6">
          {nextSession && (
            <div className="bg-primary-600 text-white rounded-card p-6 relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-1.5 text-white/70 text-xs font-medium mb-2">
                  <Clock size={14} />
                  Up next
                </div>
                <h3 className="font-semibold text-lg mb-1 truncate">{nextSession.title}</h3>
                <p className="text-white/70 text-sm mb-5">
                  {formatDateTime(nextSession.scheduledAt!)}
                </p>
                <Link
                  href={`/dashboard/sessions/${nextSession.id}`}
                  className="inline-flex items-center gap-2 bg-white text-primary-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-surface-50 transition-colors"
                >
                  View session
                  <ArrowRight size={16} />
                </Link>
              </div>
              <Activity className="absolute -right-4 -bottom-4 text-white/10" size={140} />
            </div>
          )}

          {activeOrg && (
            <Card>
              <CardContent className="py-5">
                <h3 className="font-semibold text-ink-900 mb-4 text-sm">Workspace</h3>
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-9 h-9 rounded-lg bg-primary-600 text-white text-sm font-bold flex items-center justify-center shrink-0">
                    {activeOrg.name.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink-900 truncate">
                      {activeOrg.isPersonal ? "Personal Workspace" : activeOrg.name}
                    </p>
                    <p className="text-xs text-ink-700/50">
                      {activeOrg.role === "OWNER" ? "Owner" : "Member"}
                      {!activeOrg.isPersonal && ` · ${activeOrg.memberCount} member${activeOrg.memberCount !== 1 ? "s" : ""}`}
                    </p>
                  </div>
                </div>
                <Link
                  href="/dashboard/settings/organization"
                  className="text-sm text-primary-600 hover:underline font-medium"
                >
                  Manage workspace →
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
