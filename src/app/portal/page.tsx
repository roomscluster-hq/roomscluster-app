"use client";

import { useQuery } from "@tanstack/react-query";
import { portalApi } from "@/lib/api/portal.api";
import { useActiveOrganization } from "@/hooks/useOrganizationsMine";
import { OrgSwitcher } from "@/components/dashboard/OrgSwitcher";
import { Spinner } from "@/components/ui/spinner";
import { Inbox } from "lucide-react";
import { PortalGroupSection } from "@/components/portal/PortalGroupSection";
import { UserMenu } from "@/components/dashboard/UserMenu";

export default function PortalPage() {
  const { activeOrg } = useActiveOrganization();

  const { data, isLoading } = useQuery({
    queryKey: ["portal-dashboard"],
    queryFn: portalApi.getMyDashboard,
  });

  const groups = data?.groups ?? [];

  return (
    <div className="min-h-screen bg-surface-50">
      <header className="bg-surface-0 border-b border-surface-200 px-4 md:px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-ink-900">
            {activeOrg?.name ?? "My Sessions"}
          </h1>
          <p className="text-xs text-ink-700/50">Member Portal</p>
        </div>
        <div className="flex items-center gap-2">
          <OrgSwitcher compact />
          <UserMenu compact />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 md:px-8 py-8 space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Spinner />
          </div>
        ) : groups.length === 0 ? (
          <div className="text-center py-20">
            <Inbox size={40} className="mx-auto text-ink-700/30 mb-3" />
            <p className="text-ink-900 font-medium">No groups yet</p>
            <p className="text-sm text-ink-700/50 mt-1">
              Groups you&apos;re enrolled in will show up here.
            </p>
          </div>
        ) : (
          groups.map((g) => <PortalGroupSection key={g.group.id} data={g} />)
        )}
      </main>
    </div>
  );
}
