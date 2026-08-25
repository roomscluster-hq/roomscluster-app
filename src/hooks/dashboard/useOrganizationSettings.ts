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
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const [slugDraft, setSlugDraft] = useState<{
    organizationId: string | null;
    value: string;
  }>({ organizationId: null, value: "" });

  const [colorDraft, setColorDraft] = useState<{
    organizationId: string | null;
    value: string;
  }>({
    organizationId: null,
    value: "",
  });
  const [fontDraft, setFontDraft] = useState<{
    organizationId: string | null;
    value: string;
  }>({
    organizationId: null,
    value: "",
  });

  const slugMutation = useMutation({
    mutationFn: (slug: string) =>
      organizationsApi.updateSlug(activeOrg!.id, slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations-mine"] });
      toast.success("Subdomain updated");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message ?? "Failed to update subdomain");
    },
  });

  const brandingMutation = useMutation({
    mutationFn: (data: {
      primaryColor?: string;
      fontFamily?: string;
    }) => organizationsApi.updateDetails(activeOrg!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations-mine"] });
      toast.success("Branding updated");
    },
    onError: () => toast.error("Failed to update branding"),
  });

  const logoMutation = useMutation({
    mutationFn: (file: File) =>
      organizationsApi.uploadLogo(activeOrg!.id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations-mine"] });
      toast.success("Logo updated");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message ?? "Failed to upload logo");
    },
  });

  function handleLogoUpload(file: File) {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }
    logoMutation.mutate(file);
  }

  function submitSlug(e: React.FormEvent) {
    e.preventDefault();
    if (!slugValue.trim()) return;
    slugMutation.mutate(slugValue.trim());
  }

  function submitBranding(e: React.FormEvent) {
    e.preventDefault();
    brandingMutation.mutate({
      primaryColor: primaryColor.trim() || undefined,
      fontFamily: fontFamily.trim() || undefined,
    });
  }

  const { data: organizations } = useQuery({
    queryKey: ["organizations-mine"],
    queryFn: organizationsApi.listMine,
  });

  const activeOrg = organizations?.find((o) => o.isActive);

  const primaryColor =
    colorDraft.organizationId === activeOrg?.id
      ? colorDraft.value
      : (activeOrg?.primaryColor ?? "");
  const setPrimaryColor = (value: string) =>
    setColorDraft({ organizationId: activeOrg?.id ?? null, value });

  const fontFamily =
    fontDraft.organizationId === activeOrg?.id
      ? fontDraft.value
      : (activeOrg?.fontFamily ?? "");
  const setFontFamily = (value: string) =>
    setFontDraft({ organizationId: activeOrg?.id ?? null, value });

  const slugValue =
    slugDraft.organizationId === activeOrg?.id
      ? slugDraft.value
      : (activeOrg?.slug ?? "");
  const setSlugValue = (value: string) => {
    setSlugDraft({ organizationId: activeOrg?.id ?? null, value });
  };
  const canManageOrg =
    activeOrg?.role === "OWNER" || activeOrg?.role === "ADMIN";

  const renameMutation = useMutation({
    mutationFn: (name: string) => organizationsApi.rename(activeOrg!.id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations-mine"] });
      toast.success("Organization renamed");
      setEditingName(false);
    },
    onError: () => toast.error("Failed to rename organization"),
  });

  // Get members and invitations — now enabled for Admin too, not just Owner
  const { data: members, isLoading: membersLoading } = useQuery({
    queryKey: ["org-members", activeOrg?.id],
    queryFn: () => organizationsApi.listMembers(activeOrg!.id),
    enabled: !!activeOrg && canManageOrg,
  });

  const { data: invitations, isLoading: invitesLoading } = useQuery({
    queryKey: ["org-invitations", activeOrg?.id],
    queryFn: () => invitationsApi.listForOrganization(activeOrg!.id),
    enabled: !!activeOrg && canManageOrg,
  });

  const inviteMutation = useMutation({
    mutationFn: (email: string) => invitationsApi.invite(activeOrg!.id, email),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["org-invitations", activeOrg?.id],
      });
      toast.success("Invitation sent");
      setInviteEmail("");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message ?? "Failed to send invitation");
    },
  });

  const revokeMutation = useMutation({
    mutationFn: (invitationId: string) => invitationsApi.revoke(invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["org-invitations", activeOrg?.id],
      });
      toast.success("Invitation revoked");
    },
    onError: () => toast.error("Failed to revoke invitation"),
  });

  const removeMutation = useMutation({
    mutationFn: (userId: string) =>
      organizationsApi.removeMember(activeOrg!.id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["org-members", activeOrg?.id],
      });
      toast.success("Member removed");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message ?? "Failed to remove member");
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({
      userId,
      role,
    }: {
      userId: string;
      role: "HOST" | "ADMIN";
    }) => organizationsApi.updateMemberRole(activeOrg!.id, userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["org-members", activeOrg?.id],
      });
      toast.success("Role updated");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message ?? "Failed to update role");
    },
    onSettled: () => setUpdatingUserId(null),
  });

  const onUpdateRole = (userId: string, role: "HOST" | "ADMIN") => {
    setUpdatingUserId(userId);
    updateRoleMutation.mutate({ userId, role });
  };

  const startEditingName = () => {
    setNameValue(activeOrg?.isPersonal ? "" : (activeOrg?.name ?? ""));
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

  const pendingInvitations = useMemo(
    () => invitations?.filter((i) => i.status === "PENDING") ?? [],
    [invitations],
  );

  const q = search.trim().toLowerCase();
  const filteredMembers = useMemo(
    () =>
      (members ?? []).filter(
        (m) =>
          !q ||
          (m.user.name ?? "").toLowerCase().includes(q) ||
          m.user.email.toLowerCase().includes(q),
      ),
    [members, q],
  );

  const filteredInvitations = useMemo(
    () =>
      pendingInvitations.filter((i) => !q || i.email.toLowerCase().includes(q)),
    [pendingInvitations, q],
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

    inviteEmail,
    setInviteEmail,
    editingName,
    setEditingName,
    nameValue,
    setNameValue,
    search,
    setSearch,

    startEditingName,
    submitRename,
    handleInvite,
    confirmRemoveMember,
    revokeInvitation: revokeMutation.mutate,
    onUpdateRole,

    isRenaming: renameMutation.isPending,
    isInviting: inviteMutation.isPending,
    isRevoking: revokeMutation.isPending,
    isRemoving: removeMutation.isPending,
    updatingUserId,

    slugValue,
    setSlugValue,
    submitSlug,
    isUpdatingSlug: slugMutation.isPending,

    handleLogoUpload,
    primaryColor,
    setPrimaryColor,
    fontFamily,
    setFontFamily,
    submitBranding,
    isUpdatingBranding: brandingMutation.isPending,
    isUpdatingLogo: logoMutation.isPending,
  };
}
