"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Group, groupsApi } from "@/lib/api/groups.api";
import { organizationsApi } from "@/lib/api/organizations.api";
import { parseCsvEmails } from "@/lib/utils/parseCsv";

export function useGroupManagement() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const pageSize = 25;

  const [newGroupName, setNewGroupName] = useState("");
  const [creatingGroup, setCreatingGroup] = useState(false);

  const [bulkCreateOpen, setBulkCreateOpen] = useState(false);
  const [bulkCreateText, setBulkCreateText] = useState("");

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const { data: organizations, isLoading: orgsLoading } = useQuery({
    queryKey: ["organizations-mine"],
    queryFn: organizationsApi.listMine,
  });
  const activeOrg = organizations?.find((o) => o.isActive);

  const { data, isLoading: groupsLoading } = useQuery({
    queryKey: ["groups", activeOrg?.id, page],
    queryFn: () => groupsApi.list(activeOrg!.id, page, pageSize),
    enabled: !!activeOrg?.id,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["groups", activeOrg?.id] });

  const createMutation = useMutation({
    mutationFn: (name: string) =>
      groupsApi.create(activeOrg!.id, { name: name.trim() }),
    onSuccess: () => {
      invalidate();
      toast.success("Group created");
      setNewGroupName("");
      setCreatingGroup(false);
    },
    onError: () => toast.error("Failed to create group"),
  });

  const bulkCreateMutation = useMutation({
    mutationFn: (names: string[]) =>
      groupsApi.bulkCreate(
        activeOrg!.id,
        names.map((name) => ({ name })),
      ),
    onSuccess: (result) => {
      invalidate();
      toast.success(`Created ${result.created} group(s)`);
      setBulkCreateText("");
      setBulkCreateOpen(false);
    },
    onError: () => toast.error("Failed to create groups"),
  });

  const renameMutation = useMutation({
    mutationFn: ({ groupId, name }: { groupId: string; name: string }) =>
      groupsApi.update(activeOrg!.id, groupId, { name: name.trim() }),
    onSuccess: () => {
      invalidate();
      toast.success("Group renamed");
      setRenamingId(null);
    },
    onError: () => toast.error("Failed to rename group"),
  });

  const removeMutation = useMutation({
    mutationFn: (groupId: string) => groupsApi.remove(activeOrg!.id, groupId),
    onSuccess: () => {
      invalidate();
      toast.success("Group deleted");
      setDeleteTarget(null);
    },
    onError: () => toast.error("Failed to delete group"),
  });

  const bulkRemoveMutation = useMutation({
    mutationFn: (groupIds: string[]) =>
      groupsApi.bulkRemove(activeOrg!.id, groupIds),
    onSuccess: (result) => {
      invalidate();
      toast.success(`Deleted ${result.deleted} group(s)`);
      setSelectedIds(new Set());
      setBulkDeleteOpen(false);
    },
    onError: () => toast.error("Failed to delete groups"),
  });

  function handleCreateGroup(e: React.FormEvent) {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    createMutation.mutate(newGroupName);
  }

  function handleBulkCreateSubmit(e: React.FormEvent) {
    e.preventDefault();
    const names = bulkCreateText
      .split("\n")
      .map((n) => n.trim())
      .filter(Boolean);
    if (names.length === 0) return;
    bulkCreateMutation.mutate(names);
  }

  function confirmDeleteGroup(id: string, name: string) {
    setDeleteTarget({ id, name });
  }

  function executeDelete() {
    if (deleteTarget) removeMutation.mutate(deleteTarget.id);
  }

  function executeBulkDelete() {
    bulkRemoveMutation.mutate([...selectedIds]);
  }

  function startRename(group: Group) {
    setRenamingId(group.id);
    setRenameValue(group.name);
  }

  function submitRename(e: React.FormEvent) {
    e.preventDefault();
    if (!renamingId || !renameValue.trim()) return;
    renameMutation.mutate({ groupId: renamingId, name: renameValue });
  }

  function cancelRename() {
    setRenamingId(null);
  }

  async function handleCsvUpload(file: File) {
    try {
      const emails = await parseCsvEmails(file);
      if (emails.length === 0) {
        toast.error("No valid emails found in that file");
        return;
      }
      setBulkCreateText(emails.join("\n"));
    } catch {
      toast.error("Couldn't read that file");
    }
  }

  return {
    activeOrg,
    groups: data?.groups ?? [],
    page,
    setPage,
    totalPages: data?.totalPages ?? 1,
    isLoading: orgsLoading || groupsLoading,

    newGroupName,
    setNewGroupName,
    creatingGroup,
    setCreatingGroup,
    handleCreateGroup,
    isCreating: createMutation.isPending,

    bulkCreateOpen,
    setBulkCreateOpen,
    bulkCreateText,
    setBulkCreateText,
    handleBulkCreateSubmit,
    isBulkCreating: bulkCreateMutation.isPending,

    selectedIds,
    setSelectedIds,

    deleteTarget,
    confirmDeleteGroup,
    cancelDelete: () => setDeleteTarget(null),
    executeDelete,
    isDeleting: removeMutation.isPending,

    bulkDeleteOpen,
    setBulkDeleteOpen,
    executeBulkDelete,
    isBulkDeleting: bulkRemoveMutation.isPending,
    handleCsvUpload,

    renamingId,
    renameValue,
    setRenameValue,
    startRename,
    submitRename,
    cancelRename,
    isRenaming: renameMutation.isPending,
  };
}
