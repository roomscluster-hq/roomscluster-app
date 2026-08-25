"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { groupsApi } from "@/lib/api/groups.api";
import { organizationsApi } from "@/lib/api/organizations.api";

export function useHostAssignment(organizationId: string, groupId: string) {
  const queryClient = useQueryClient();

  const { data: members, isLoading } = useQuery({
    queryKey: ["org-members", organizationId],
    queryFn: () => organizationsApi.listMembers(organizationId),
    enabled: !!organizationId,
  });

  const hosts = (members ?? []).filter((m) => m.role === "HOST");

  const assignMutation = useMutation({
    mutationFn: (hostUserId: string) =>
      groupsApi.assignHosts(organizationId, groupId, [hostUserId]),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org-members", organizationId] });
      toast.success("Host assigned");
    },
    onError: () => toast.error("Failed to assign host"),
  });

  const unassignMutation = useMutation({
    mutationFn: (hostUserId: string) =>
      groupsApi.unassignHost(organizationId, groupId, hostUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org-members", organizationId] });
      toast.success("Host unassigned");
    },
    onError: () => toast.error("Failed to unassign host"),
  });

  function toggleHost(hostUserId: string, currentlyAssigned: boolean) {
    if (currentlyAssigned) {
      unassignMutation.mutate(hostUserId);
    } else {
      assignMutation.mutate(hostUserId);
    }
  }

  return {
    hosts,
    isLoading,
    toggleHost,
    isPendingUserId:
      assignMutation.isPending || unassignMutation.isPending
        ? (assignMutation.variables ?? unassignMutation.variables)
        : null,
  };
}