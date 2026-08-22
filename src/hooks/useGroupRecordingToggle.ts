"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { groupsApi } from "@/lib/api/groups.api";

export function useGroupRecordingToggle(organizationId: string, groupId: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (membersCanViewRecordings: boolean) =>
      groupsApi.update(organizationId, groupId, { membersCanViewRecordings }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups", organizationId] });
      toast.success("Setting updated");
    },
    onError: () => toast.error("Failed to update setting"),
  });

  return {
    toggle: mutation.mutate,
    isToggling: mutation.isPending,
  };
}