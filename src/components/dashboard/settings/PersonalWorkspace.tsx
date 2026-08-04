"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PersonalWorkspaceProps {
  workspaceName: string;
  isEditing: boolean;
  editValue: string;
  onEditChange: (value: string) => void;
  onStartEdit: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isRenaming: boolean;
  inviteEmail: string;
  onInviteEmailChange: (value: string) => void;
  onInvite: (e: React.FormEvent) => void;
  isInviting: boolean;
}

export function PersonalWorkspace({
  workspaceName,
  isEditing,
  editValue,
  onEditChange,
  onStartEdit,
  onSubmit,
  onCancel,
  isRenaming,
  inviteEmail,
  onInviteEmailChange,
  onInvite,
  isInviting,
}: PersonalWorkspaceProps) {
  return (
    <div className="max-w-2xl">
      {isEditing ? (
        <form onSubmit={onSubmit} className="flex items-center gap-2 mb-2">
          <input
            autoFocus
            value={editValue}
            onChange={(e) => onEditChange(e.target.value)}
            placeholder="Workspace name"
            className="text-xl md:text-2xl font-bold text-ink-900 bg-transparent border-b-2 border-primary-600 focus:outline-none px-0.5"
          />
          <Button type="submit" size="sm" loading={isRenaming}>
            Save
          </Button>
          <button
            type="button"
            onClick={onCancel}
            className="text-sm text-ink-700/60 hover:text-ink-700 cursor-pointer"
          >
            Cancel
          </button>
        </form>
      ) : (
        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-xl md:text-2xl font-bold text-ink-900">Workspace Settings</h1>
          <button
            onClick={onStartEdit}
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
          <form onSubmit={onInvite} className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => onInviteEmailChange(e.target.value)}
              placeholder="colleague@company.com"
              required
              className="flex-1 bg-surface-0 text-ink-900 placeholder:text-ink-700/40 border border-surface-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
            <Button type="submit" loading={isInviting}>
              Send Invite
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
