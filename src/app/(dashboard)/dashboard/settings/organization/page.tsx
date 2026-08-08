"use client";

import { useState } from "react";
import { useOrganizationSettings } from "@/hooks/dashboard/useOrganizationSettings";
import {
  OrganizationTabs,
  GeneralSettings,
  TeammatesTable,
  PersonalWorkspace,
  type Tab,
} from "@/components/dashboard/settings";
import { Spinner } from "@/components/ui/spinner";

export default function OrganizationSettingsPage() {
  const [tab, setTab] = useState<Tab>("general");
  
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
    
    // Loading states
    isRenaming,
    isInviting,
  } = useOrganizationSettings();

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  // Personal workspace view
  if (activeOrg?.isPersonal) {
    return (
      <PersonalWorkspace
        workspaceName={activeOrg.name}
        isEditing={editingName}
        editValue={nameValue}
        onEditChange={setNameValue}
        onStartEdit={startEditingName}
        onSubmit={submitRename}
        onCancel={() => setEditingName(false)}
        isRenaming={isRenaming}
        inviteEmail={inviteEmail}
        onInviteEmailChange={setInviteEmail}
        onInvite={handleInvite}
        isInviting={isInviting}
      />
    );
  }

  // Non-owner view
  if (activeOrg?.role !== "OWNER") {
    return (
      <div className="max-w-2xl">
        <h1 className="text-xl md:text-2xl font-bold text-ink-900 mb-2">{activeOrg?.name}</h1>
        <p className="text-ink-700/60 text-sm">
          Only the organization owner can manage members and invitations.
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
          {tab === "general" ? (
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
              isLoading={membersLoading || invitesLoading}
              isInviting={isInviting}
            />
          )}
        </section>
      </div>
    </div>
  );
}
