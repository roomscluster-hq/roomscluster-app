"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { groupsApi } from "@/lib/api/groups.api";
import { organizationsApi } from "@/lib/api/organizations.api";
import { GroupMembersTable } from "@/components/dashboard/settings";
import { GroupHeaderCard } from "@/components/dashboard/settings/GroupHeaderCard";
import { HostAssignmentPanel } from "@/components/dashboard/settings/HostAssignmentPanel";
import { SegmentedTabs } from "@/components/ui/segmented-tabs";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useEnrollmentManagement } from "@/hooks/dashboard";
import { useGroupRename } from "@/hooks/dashboard/useGroupRename";

export default function GroupDetailPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const [tab, setTab] = useState<"members" | "hosts">("members");

  const { data: organizations } = useQuery({
    queryKey: ["organizations-mine"],
    queryFn: organizationsApi.listMine,
  });
  const activeOrg = organizations?.find((o) => o.isActive);

  const { data, isLoading: groupLoading } = useQuery({
    queryKey: ["groups", activeOrg?.id],
    queryFn: () => groupsApi.list(activeOrg!.id),
    enabled: !!activeOrg?.id,
  });
  const group = data?.groups.find((g) => g.id === groupId);

  const enrollment = useEnrollmentManagement(groupId);
  const rename = useGroupRename(activeOrg?.id ?? "");

  if (groupLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-1.5 text-sm text-ink-700/60 mb-4">
        <Link href="/dashboard/settings/organization?tab=groups" className="hover:text-ink-900">
          Groups
        </Link>
        <ChevronRight size={14} />
        <span className="text-ink-900 font-medium">{group?.name ?? "Group"}</span>
      </div>

      <GroupHeaderCard
        groupId={groupId}
        name={group?.name ?? ""}
        description={group?.description}
        memberCount={group?._count?.enrollments ?? 0}
        sessionCount={group?._count?.sessions ?? 0}
        renamingId={rename.renamingId}
        renameValue={rename.renameValue}
        onRenameValueChange={rename.setRenameValue}
        onStartRename={() => group && rename.startRename(group)}
        onSubmitRename={rename.submitRename}
        onCancelRename={rename.cancelRename}
        isRenaming={rename.isRenaming}
      />

      <div className="mb-4">
        <SegmentedTabs
          value={tab}
          onChange={setTab}
          options={[
            { value: "members", label: "Members" },
            { value: "hosts", label: "Hosts" },
          ]}
        />
      </div>

      {tab === "members" ? (
        <GroupMembersTable {...enrollment} hideSummary />
      ) : (
        <Card>
          <div className="p-6">
            {activeOrg && (
              <HostAssignmentPanel organizationId={activeOrg.id} groupId={groupId} />
            )}
          </div>
        </Card>
      )}
    </div>
  );
}