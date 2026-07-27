"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { organizationsApi } from "@/lib/api/organizations.api";
import { invitationsApi } from "@/lib/api/invitations.api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Building2, Search, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";

type Tab = "general" | "teammates";

const TABS: { id: Tab; label: string; icon: typeof Building2 }[] = [
  { id: "general", label: "General", icon: Building2 },
  { id: "teammates", label: "Teammates", icon: Users },
];

export default function OrganizationSettingsPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>("general");
  const [inviteEmail, setInviteEmail] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState("");
  const [search, setSearch] = useState("");

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
              className="text-xl md:text-2xl font-bold text-ink-900 border-b-2 border-primary-600 focus:outline-none px-0.5"
            />
            <Button type="submit" size="sm" loading={renameMutation.isPending}>
              Save
            </Button>
            <button
              type="button"
              onClick={() => setEditingName(false)}
              className="text-sm text-ink-700/60 hover:text-ink-700 cursor-pointer"
            >
              Cancel
            </button>
          </form>
        ) : (
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-xl md:text-2xl font-bold text-ink-900">Workspace Settings</h1>
            <button
              onClick={startEditingName}
              className="text-xs text-primary-600 hover:underline cursor-pointer"
            >
              Rename
            </button>
          </div>
        )}
        <p className="text-ink-700/60 text-sm">
          This is your personal workspace. Invite a teammate to turn it into a
          shared organization.
        </p>

        <Card className="mt-6">
          <CardContent className="pt-6">
            <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="teammate@example.com"
                required
                className="flex-1 border border-surface-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
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
        <h1 className="text-xl md:text-2xl font-bold text-ink-900 mb-2">{activeOrg.name}</h1>
        <p className="text-ink-700/60 text-sm">
          Only the organization owner can manage members and invitations.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl md:text-2xl font-bold text-ink-900">Settings</h1>
        <p className="text-ink-700/60 text-sm mt-1">
          Manage your organization's workspace and team members.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sub-nav */}
        <aside className="w-full md:w-56 shrink-0">
          <nav className="flex md:flex-col gap-1 overflow-x-auto">
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm whitespace-nowrap transition-colors cursor-pointer ${
                    active
                      ? "bg-surface-0 border border-surface-200 shadow-raised text-primary-600 font-semibold"
                      : "text-ink-700/60 hover:bg-surface-50"
                  }`}
                >
                  <Icon size={18} />
                  {t.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <section className="flex-1 min-w-0">
          {tab === "general" ? (
            <Card>
              <CardContent className="py-6">
                <h2 className="font-semibold text-ink-900 mb-4">Organization name</h2>
                {editingName ? (
                  <form onSubmit={submitRename} className="flex items-center gap-2">
                    <input
                      autoFocus
                      value={nameValue}
                      onChange={(e) => setNameValue(e.target.value)}
                      placeholder="Organization name"
                      className="flex-1 border border-surface-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
                    />
                    <Button type="submit" size="sm" loading={renameMutation.isPending}>
                      Save
                    </Button>
                    <button
                      type="button"
                      onClick={() => setEditingName(false)}
                      className="text-sm text-ink-700/60 hover:text-ink-700 cursor-pointer px-2"
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-ink-900">{activeOrg.name}</span>
                    <button
                      onClick={startEditingName}
                      className="text-sm text-primary-600 hover:underline cursor-pointer"
                    >
                      Rename
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              {/* Header */}
              <div className="p-6 border-b border-surface-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="font-semibold text-ink-900">Organization Teammates</h2>
                  <p className="text-sm text-ink-700/50 mt-0.5">
                    {members?.length ?? 0} member{(members?.length ?? 0) !== 1 ? "s" : ""}
                    {pendingInvitations.length > 0 &&
                      ` · ${pendingInvitations.length} pending invitation${pendingInvitations.length !== 1 ? "s" : ""}`}
                  </p>
                </div>
                <form onSubmit={handleInvite} className="flex gap-2">
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="teammate@example.com"
                    required
                    className="w-48 sm:w-56 border border-surface-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
                  />
                  <Button type="submit" size="sm" loading={inviteMutation.isPending} className="shrink-0">
                    <UserPlus size={16} />
                    Invite
                  </Button>
                </form>
              </div>

              {/* Search */}
              <div className="px-6 py-3 bg-surface-50 border-b border-surface-200">
                <div className="relative max-w-sm">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-700/40" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Filter by name or email..."
                    className="w-full bg-surface-0 border border-surface-200 rounded-lg pl-9 pr-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
                  />
                </div>
              </div>

              {/* Table */}
              {membersLoading || invitesLoading ? (
                <div className="flex justify-center py-10">
                  <Spinner />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-surface-50 text-ink-700/50 text-xs uppercase tracking-wide">
                        <th className="px-6 py-3 font-medium border-b border-surface-200">Name</th>
                        <th className="px-6 py-3 font-medium border-b border-surface-200">Role</th>
                        <th className="px-6 py-3 font-medium border-b border-surface-200">Status</th>
                        <th className="px-6 py-3 font-medium border-b border-surface-200 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-200">
                      {filteredMembers.map((m) => (
                        <tr key={m.id} className="hover:bg-surface-50 transition-colors">
                          <td className="px-6 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-primary-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                                {(m.user.name ?? m.user.email).charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-ink-900 truncate">{m.user.name ?? m.user.email}</p>
                                <p className="text-xs text-ink-700/40 truncate">{m.user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-3.5">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide ${
                                m.role === "OWNER" ? "bg-primary-100 text-primary-700" : "bg-surface-200 text-ink-700"
                              }`}
                            >
                              {m.role === "OWNER" ? "Owner" : "Host"}
                            </span>
                          </td>
                          <td className="px-6 py-3.5">
                            <span className="flex items-center gap-2 text-ink-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-success-600" />
                              Active
                            </span>
                          </td>
                          <td className="px-6 py-3.5 text-right">
                            {m.role !== "OWNER" && (
                              <button
                                onClick={() => confirmRemoveMember(m.user.id, m.user.name ?? m.user.email)}
                                className="text-danger-600 hover:text-danger-700 transition-colors cursor-pointer"
                              >
                                Remove
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}

                      {filteredInvitations.map((inv) => (
                        <tr key={inv.id} className="hover:bg-surface-50 transition-colors">
                          <td className="px-6 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-surface-200 text-ink-700 text-xs font-bold flex items-center justify-center shrink-0">
                                {inv.email.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-ink-900 truncate">{inv.email}</p>
                                <p className="text-xs text-ink-700/40">
                                  Invited {new Date(inv.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-3.5">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide bg-surface-200 text-ink-700">
                              {inv.role === "OWNER" ? "Owner" : "Host"}
                            </span>
                          </td>
                          <td className="px-6 py-3.5">
                            <span className="flex items-center gap-2 text-ink-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-warning-500" />
                              Invited
                            </span>
                          </td>
                          <td className="px-6 py-3.5 text-right">
                            <button
                              onClick={() => revokeMutation.mutate(inv.id)}
                              className="text-danger-600 hover:text-danger-700 transition-colors cursor-pointer"
                            >
                              Revoke
                            </button>
                          </td>
                        </tr>
                      ))}

                      {filteredMembers.length === 0 && filteredInvitations.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-6 py-10 text-center text-ink-700/40">
                            No teammates match "{search}"
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}
