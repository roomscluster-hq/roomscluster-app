"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { sessionsApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { StatusBadge } from "@/components/ui/badge";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import { SessionsListSkeleton } from "@/components/dashboard/SessionsListSkeleton";

export default function DashboardPage() {
  const { user } = useAuthStore();

  const { data: sessions, isLoading } = useQuery({
    queryKey: ["sessions"],
    queryFn: sessionsApi.getAll,
  });

  const stats = {
    total: sessions?.length ?? 0,
    live: sessions?.filter((s) => s.status === "LIVE").length ?? 0,
    scheduled: sessions?.filter((s) => s.status === "SCHEDULED").length ?? 0,
  };

  const recentSessions = sessions?.slice(0, 5) ?? [];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name ?? "Host"} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage your webinar sessions
          </p>
        </div>
        <Link
          href="/dashboard/sessions/new"
          className="bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
        >
          + New Session
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Sessions", value: stats.total, color: "text-gray-900" },
          { label: "Live Now", value: stats.live, color: "text-green-600" },
          { label: "Scheduled", value: stats.scheduled, color: "text-blue-600" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="py-6">
              <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Sessions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Recent Sessions</h2>
            <Link
              href="/dashboard/sessions"
              className="text-sm text-blue-600 hover:underline"
            >
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
              <p className="text-gray-400 text-sm">No sessions yet.</p>
              <Link
                href="/dashboard/sessions/new"
                className="mt-3 inline-block text-sm text-blue-600 hover:underline"
              >
                Create your first session →
              </Link>
            </div>
          </CardContent>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentSessions.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between px-6 py-4"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{s.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {s.scheduledAt
                      ? formatDateTime(s.scheduledAt)
                      : "Instant session"}
                    {" · "}
                    {s._count?.participants ?? 0} participant
                    {(s._count?.participants ?? 0) !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={s.status} />
                  <Link
                    href={`/dashboard/sessions/${s.id}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Manage →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}