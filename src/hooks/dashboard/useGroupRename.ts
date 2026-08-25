"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { groupsApi, Group } from "@/lib/api/groups.api";

export function useGroupRename(organizationId: string) {
  const queryClient = useQueryClient();
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const renameMutation = useMutation({
    mutationFn: ({ groupId, name }: { groupId: string; name: string }) =>
      groupsApi.update(organizationId, groupId, { name: name.trim() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups", organizationId] });
      toast.success("Group renamed");
      setRenamingId(null);
    },
    onError: () => toast.error("Failed to rename group"),
  });

  function startRename(group: Pick<Group, "id" | "name">) {
    setRenamingId(group.id);
    setRenameValue(group.name);
  }
  function submitRename(e?: React.FormEvent) {
    e?.preventDefault();
    if (!renamingId || !renameValue.trim()) return;
    renameMutation.mutate({ groupId: renamingId, name: renameValue });
  }
  function cancelRename() {
    setRenamingId(null);
  }

  return {
    renamingId,
    renameValue,
    setRenameValue,
    startRename,
    submitRename,
    cancelRename,
    isRenaming: renameMutation.isPending,
  };
}