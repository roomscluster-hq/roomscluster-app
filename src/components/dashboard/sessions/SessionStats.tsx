"use client";

import { Card, CardContent } from "@/components/ui/card";

interface SessionStatsProps {
  participants: number;
  registrations: number;
  scheduledAt?: string | null;
  formatDateTime: (date: string) => string;
}

export function SessionStats({ participants, registrations, scheduledAt, formatDateTime }: SessionStatsProps) {
  const stats = [
    { label: "Participants", value: participants },
    { label: "Registrations", value: registrations },
    {
      label: "Scheduled",
      value: scheduledAt ? formatDateTime(scheduledAt) : "Instant",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="py-5">
            <p className="text-xs text-ink-700/60 mb-1">{stat.label}</p>
            <p className="text-xl font-bold text-ink-900">{stat.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
