"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { organizationsApi } from "@/lib/api/organizations.api";
import { invitationsApi } from "@/lib/api/invitations.api";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

export default function OrganizationSettingsPage() {
  const queryClient = useQueryClient();
  const [inviteEmail, setInviteEmail] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState("");

  const { data: organizations } = useQuery({
    queryKey: ["organizations-mine"],
    queryFn: organizationsApi.listMine,
  });

  const activeOrg = organizations?.find((o) => o.isActive);

  const renameMutation = useMutation({
    mutationFn: (name: string) => organizationsApi.rename(activeOrg!.id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations-mine"] });
      toast.success("Organization renamed");
      setEditingName(false);
    },
    onError: () => toast.error("Failed to rename organization"),
  });

  function startEditingName() {
    setNameValue(activeOrg?.isPersonal ? "" : activeOrg?.name ?? "");
    setEditingName(true);
  }

  function submitRename(e: React.FormEvent) {
    e.preventDefault();
    if (!nameValue.trim()) return;
    renameMutation.mutate(nameValue.trim());
  }

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

  const revokeMutation = useMutation({
    mutationFn: (invitationId: string) => invitationsApi.revoke(invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org-invitations", activeOrg?.id] });
      toast.success("Invitation revoked");
    },
    onError: () => toast.error("Failed to revoke invitation"),
  });

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

  function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    inviteMutation.mutate(inviteEmail.trim());
  }

  function confirmRemoveMember(userId: string, name: string) {
    toast(`Remove ${name} from this organization?`, {
      action: {
        label: "Remove",
        onClick: () => removeMutation.mutate(userId),
      },
      cancel: { label: "Cancel", onClick: () => {} },
      duration: 8000,
    });
  }

  if (!activeOrg) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (activeOrg.isPersonal) {
    return (
      <div className="max-w-2xl">
        {editingName ? (
          <form onSubmit={submitRename} className="flex items-center gap-2 mb-2">
            <input
              autoFocus
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              placeholder="Workspace name"
              className="text-2xl font-bold text-gray-900 border-b-2 border-blue-500 focus:outline-none px-0.5"
            />
            <Button type="submit" size="sm" loading={renameMutation.isPending}>
              Save
            </Button>
            <button
              type="button"
              onClick={() => setEditingName(false)}
              className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer"
            >
              Cancel
            </button>
          </form>
        ) : (
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-2xl font-bold text-gray-900">Workspace Settings</h1>
            <button
              onClick={startEditingName}
              className="text-xs text-blue-600 hover:underline cursor-pointer"
            >
              Rename
            </button>
          </div>
        )}
        <p className="text-gray-500 text-sm">
          This is your personal workspace. Invite a teammate to turn it into a
          shared organization.
        </p>

        <Card className="mt-6">
          <CardContent className="pt-6">
            <form onSubmit={handleInvite} className="flex gap-2">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="teammate@example.com"
                required
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button type="submit" loading={inviteMutation.isPending}>
                Send Invite
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (activeOrg.role !== "OWNER") {
    return (
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{activeOrg.name}</h1>
        <p className="text-gray-500 text-sm">
          Only the organization owner can manage members and invitations.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      {editingName ? (
        <form onSubmit={submitRename} className="flex items-center gap-2 mb-2">
          <input
            autoFocus
            value={nameValue}
            onChange={(e) => setNameValue(e.target.value)}
            placeholder="Organization name"
            className="text-2xl font-bold text-gray-900 border-b-2 border-blue-500 focus:outline-none px-0.5"
          />
          <Button type="submit" size="sm" loading={renameMutation.isPending}>
            Save
          </Button>
          <button
            type="button"
            onClick={() => setEditingName(false)}
            className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer"
          >
            Cancel
          </button>
        </form>
      ) : (
        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-2xl font-bold text-gray-900">{activeOrg.name}</h1>
          <button
            onClick={startEditingName}
            className="text-xs text-blue-600 hover:underline cursor-pointer"
          >
            Rename
          </button>
        </div>
      )}
      <p className="text-gray-500 text-sm mb-8">
        Manage members and invitations for your organization.
      </p>

      {/* Invite form */}
      <Card className="mb-6">
        <CardHeader>
          <h2 className="font-semibold text-gray-900">Invite a teammate</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInvite} className="flex gap-2">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="teammate@example.com"
              required
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button type="submit" loading={inviteMutation.isPending} className="cursor-pointer">
              Send Invite
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Pending invitations */}
      <Card className="mb-6">
        <CardHeader>
          <h2 className="font-semibold text-gray-900">
            Pending Invitations ({invitations?.filter((i) => i.status === "PENDING").length ?? 0})
          </h2>
        </CardHeader>
        <CardContent>
          {invitesLoading ? (
            <div className="flex justify-center py-6">
              <Spinner />
            </div>
          ) : !invitations || invitations.filter((i) => i.status === "PENDING").length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No pending invitations</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {invitations
                .filter((i) => i.status === "PENDING")
                .map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm text-gray-900">{inv.email}</p>
                      <p className="text-xs text-gray-400">
                        Invited {new Date(inv.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => revokeMutation.mutate(inv.id)}
                      className="text-sm text-red-500 hover:text-red-700 transition cursor-pointer"
                    >
                      Revoke
                    </button>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Members list */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-gray-900">Members ({members?.length ?? 0})</h2>
        </CardHeader>
        <CardContent>
          {membersLoading ? (
            <div className="flex justify-center py-6">
              <Spinner />
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {members?.map((m) => (
                <div key={m.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                      {(m.user.name ?? m.user.email).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">{m.user.name ?? m.user.email}</p>
                      <p className="text-xs text-gray-400">{m.user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        m.role === "OWNER"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {m.role === "OWNER" ? "Owner" : "Host"}
                    </span>
                    {m.role !== "OWNER" && (
                      <button
                        onClick={() =>
                          confirmRemoveMember(m.user.id, m.user.name ?? m.user.email)
                        }
                        className="text-sm text-red-500 hover:text-red-700 transition cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}