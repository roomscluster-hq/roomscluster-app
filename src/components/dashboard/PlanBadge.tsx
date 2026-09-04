"use client";

import { useState } from "react";
import { useActiveOrganization } from "@/hooks/useOrganizationsMine";
import Link from "next/link";

const PLAN_LABEL: Record<string, string> = {
  FREE: "Free",
  PRO: "Pro",
  BUSINESS: "Business",
  ENTERPRISE: "Enterprise",
};

export function PlanBadge({ compact }: { compact?: boolean }) {
  const { activeOrg } = useActiveOrganization();

  const [now] = useState(() => Date.now());

  if (!activeOrg) return null;

  const trialEndsAt = activeOrg.trialEndsAt ? new Date(activeOrg.trialEndsAt) : null;
  const isOnTrial = trialEndsAt && trialEndsAt.getTime() > now;
  const daysLeft = isOnTrial
    ? Math.max(1, Math.ceil((trialEndsAt.getTime() - now) / 86_400_000))
    : null;

  return (
    <Link
      href="/dashboard/settings/organization?tab=billing"
      className={`flex items-center justify-center gap-1.5 rounded-lg font-medium transition-colors ${
        isOnTrial
          ? "bg-primary-50 text-primary-700 hover:bg-primary-100"
          : "bg-surface-100 text-ink-700 hover:bg-surface-200"
      } ${compact ? "text-xs px-2.5 py-1" : "text-sm px-3 py-2"}`}
    >
      {isOnTrial
        ? `Pro Trial · ${daysLeft} day${daysLeft === 1 ? "" : "s"} left`
        : PLAN_LABEL[activeOrg.plan] ?? activeOrg.plan}
    </Link>
  );
}