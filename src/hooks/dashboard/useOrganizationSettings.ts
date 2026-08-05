"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { organizationsApi } from "@/lib/api/organizations.api";
import { invitationsApi } from "@/lib/api/invitations.api";
import { toast } from "sonner";

export function useOrganizationSettings() {
  const queryClient = useQueryClient();
  const [inviteEmail, setInviteEmail] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState("");
  const [search, setSearch] = useState("");

  // Get active organization
  const { data: organizations } = useQuery({
    queryKey: ["organizations-mine"],
    queryFn: organizationsApi.listMine,
  });

  const activeOrg = organizations?.find((o) => o.isActive);

  // Rename mutation
  const renameMutation = useMutation({
    mutationFn: (name: string) => organizationsApi.rename(activeOrg!.id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations-mine"] });
      toast.success("Organization renamed");
      setEditingName(false);
    },
    onError: () => toast.error("Failed to rename organization"),
  });

  // Get members and invitations
  const { data: members, isLoading: membersLoading } = useQuery({
    queryKey: ["org-members", activeOrg?.id],
    queryFn: () => organizationsApi.listMembers(activeOrg!.id),
    enabled: !!activeOrg && activeOrg.role === "OWNER",
  });

  const { data: invitations, isLoading: invitesLoading } = useQuery({
    queryKey: ["org-invitations", activeOrg?.id],
    queryFn: () => invitationsApi.listForOrganization(activeOrg!.id),
    enabled: !!activeOrg && activeOrg.role === "OWNER",
  });

  // Invite mutation
  const inviteMutation = useMutation({
    mutationFn: (email: string) => invitationsApi.invite(activeOrg!.id, email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org-invitations", activeOrg?.id] });
      toast.success("Invitation sent");
      setInviteEmail("");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message ?? "Failed to send invitation");
    },
  });

  // Revoke mutation
  const revokeMutation = useMutation({
    mutationFn: (invitationId: string) => invitationsApi.revoke(invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org-invitations", activeOrg?.id] });
      toast.success("Invitation revoked");
    },
    onError: () => toast.error("Failed to revoke invitation"),
  });

  // Remove member mutation
  const removeMutation = useMutation({
    mutationFn: (userId: string) => organizationsApi.removeMember(activeOrg!.id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org-members", activeOrg?.id] });
      toast.success("Member removed");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message ?? "Failed to remove member");
    },
  });

  // Handlers
  const startEditingName = () => {
    setNameValue(activeOrg?.isPersonal ? "" : activeOrg?.name ?? "");
    setEditingName(true);
  };

  const submitRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameValue.trim()) return;
    renameMutation.mutate(nameValue.trim());
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    inviteMutation.mutate(inviteEmail.trim());
  };

  const confirmRemoveMember = (userId: string, name: string) => {
    toast(`Remove ${name} from this organization?`, {
      action: {
        label: "Remove",
        onClick: () => removeMutation.mutate(userId),
      },
      cancel: { label: "Cancel", onClick: () => {} },
      duration: 8000,
    });
  };

  // Filtered data
  const pendingInvitations = useMemo(
    () => invitations?.filter((i) => i.status === "PENDING") ?? [],
    [invitations]
  );

  const q = search.trim().toLowerCase();
  const filteredMembers = useMemo(
    () =>
      (members ?? []).filter(
        (m) =>
          !q ||
          (m.user.name ?? "").toLowerCase().includes(q) ||
          m.user.email.toLowerCase().includes(q)
      ),
    [members, q]
  );

  const filteredInvitations = useMemo(
    () => pendingInvitations.filter((i) => !q || i.email.toLowerCase().includes(q)),
    [pendingInvitations, q]
  );

  return {
    activeOrg,
    members,
    invitations,
    pendingInvitations,
    filteredMembers,
    filteredInvitations,
    isLoading: !activeOrg,
    membersLoading,
    invitesLoading,
    
    // Form states
    inviteEmail,
    setInviteEmail,
    editingName,
    setEditingName,
    nameValue,
    setNameValue,
    search,
    setSearch,
    
    // Actions
    startEditingName,
    submitRename,
    handleInvite,
    confirmRemoveMember,
    revokeInvitation: revokeMutation.mutate,
    
    // Loading states
    isRenaming: renameMutation.isPending,
    isInviting: inviteMutation.isPending,
    isRevoking: revokeMutation.isPending,
    isRemoving: removeMutation.isPending,
  };
}
