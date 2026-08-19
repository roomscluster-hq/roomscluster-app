"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Video } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { groupsApi } from "@/lib/api/groups.api";
import { organizationsApi } from "@/lib/api/organizations.api";
import { GroupMembersTable } from "@/components/dashboard/settings";
import { Spinner } from "@/components/ui/spinner";
import { useEnrollmentManagement } from "@/hooks/dashboard";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function GroupDetailPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const router = useRouter();

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

  if (groupLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <button
        onClick={() =>
          router.push("/dashboard/settings/organization?tab=groups")
        }
        className="flex items-center gap-1.5 text-sm text-ink-700/60 hover:text-ink-900 mb-4 cursor-pointer"
      >
        <ArrowLeft size={16} />
        Back to Groups
      </button>

      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-ink-900">
          {group?.name ?? "Group"}
        </h1>
        {group?.description && (
          <p className="text-ink-700/60 text-sm mt-1">{group.description}</p>
        )}
      </div>

      <Link href={`/dashboard/sessions/new?groupId=${groupId}`}>
        <Button size="sm">
          <Video size={16} />
          New Session
        </Button>
      </Link>

      <GroupMembersTable {...enrollment} />
    </div>
  );
}
