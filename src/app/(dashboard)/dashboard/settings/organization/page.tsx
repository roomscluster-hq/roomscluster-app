"use client";

import { useOrganizationSettings } from "@/hooks/dashboard/useOrganizationSettings";
import {
  OrganizationTabs,
  GeneralSettings,
  TeammatesTable,
  GroupsPanel,
  type Tab,
} from "@/components/dashboard/settings";
import { Spinner } from "@/components/ui/spinner";
import { useGroupManagement } from "@/hooks/useGroupManagement";
import { useRouter, useSearchParams } from "next/navigation";

export default function OrganizationSettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = (searchParams.get("tab") as Tab) ?? "general";

  function setTab(next: Tab) {
    router.push(`/dashboard/settings/organization?tab=${next}`);
  }

  const {
    activeOrg,
    filteredMembers,
    filteredInvitations,
    isLoading,
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
    revokeInvitation,
    onUpdateRole,

    // Loading states
    isRenaming,
    isInviting,

    updatingUserId,
  } = useOrganizationSettings();

  const groupManagement = useGroupManagement();

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (activeOrg?.role !== "OWNER" && activeOrg?.role !== "ADMIN") {
    return (
      <div className="max-w-2xl">
        <h1 className="text-xl md:text-2xl font-bold text-ink-900">
          {activeOrg?.name}
        </h1>
        <p className="text-ink-700/60 text-sm">
          Only the organization owner or an admin can manage members and
          invitations.
        </p>
      </div>
    );
  }

  // Owner view with tabs
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl md:text-2xl font-bold text-ink-900">Settings</h1>
        <p className="text-ink-700/60 text-sm mt-1">
          Manage your organization&apos;s workspace and team members.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sub-nav */}
        <aside className="w-full md:w-56 shrink-0">
          <OrganizationTabs activeTab={tab} onChange={setTab} />
        </aside>

        {/* Content */}
        <section className="flex-1 min-w-0">
          {tab === "groups" ? (
            <GroupsPanel {...groupManagement} />
          ) : tab === "general" ? (
            <GeneralSettings
              orgName={activeOrg.name}
              isEditing={editingName}
              editValue={nameValue}
              onEditChange={setNameValue}
              onStartEdit={startEditingName}
              onSubmit={submitRename}
              onCancel={() => setEditingName(false)}
              isLoading={isRenaming}
            />
          ) : (
            <TeammatesTable
              members={filteredMembers}
              invitations={filteredInvitations}
              search={search}
              onSearchChange={setSearch}
              inviteEmail={inviteEmail}
              onInviteEmailChange={setInviteEmail}
              onInvite={handleInvite}
              onRemove={confirmRemoveMember}
              onRevoke={revokeInvitation}
              onUpdateRole={onUpdateRole}
              isLoading={membersLoading || invitesLoading}
              isInviting={isInviting}
              updatingUserId={updatingUserId}
              viewerRole={activeOrg?.role}
            />
          )}
        </section>
      </div>
    </div>
  );
}
