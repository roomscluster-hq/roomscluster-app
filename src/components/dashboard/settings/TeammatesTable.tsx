"use client";

import { Loader2, Search, UserPlus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

interface Member {
  id: string;
  role: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  createdAt: string;
}

interface TeammatesTableProps {
  members: Member[];
  invitations: Invitation[];
  search: string;
  onSearchChange: (value: string) => void;
  inviteEmail: string;
  onInviteEmailChange: (value: string) => void;
  onInvite: (e: React.FormEvent) => void;
  onRemove: (userId: string, name: string) => void;
  onRevoke: (invitationId: string) => void;
  onUpdateRole?: (memberId: string, role: "HOST" | "ADMIN") => void;
  isLoading: boolean;
  isInviting: boolean;
  updatingUserId?: string | null;
  viewerRole?: "OWNER" | "ADMIN" | "HOST";
  maxTeammates: number | null;
  teammatesUsed: number;
  onUpgradeClick: () => void;
}

export function TeammatesTable({
  members,
  invitations,
  search,
  onSearchChange,
  inviteEmail,
  onInviteEmailChange,
  onInvite,
  onRemove,
  onRevoke,
  onUpdateRole,
  isLoading,
  isInviting,
  updatingUserId,
  viewerRole,
  maxTeammates,
  teammatesUsed,
  onUpgradeClick,
}: TeammatesTableProps) {
  if (isLoading) {
    return (
      <Card>
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      </Card>
    );
  }

  const atLimit = maxTeammates !== null && teammatesUsed >= maxTeammates;

  return (
    <Card>
      {/* Header */}
      <div className="p-6 border-b border-surface-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-semibold text-ink-900">Organization Teammates</h2>
          <p className="text-sm text-ink-700/50 mt-0.5">
            {members.length} member{members.length !== 1 ? "s" : ""}
            {invitations.length > 0 &&
              ` · ${invitations.length} pending invitation${invitations.length !== 1 ? "s" : ""}`}
          </p>
          <p className="text-xs text-ink-700/40 mt-0.5">
            {maxTeammates === null
              ? `${teammatesUsed} teammate slot${teammatesUsed === 1 ? "" : "s"} used`
              : `${teammatesUsed} of ${maxTeammates} teammate slot${maxTeammates === 1 ? "" : "s"} used`}
          </p>
        </div>

        {atLimit ? (
          <button
            onClick={onUpgradeClick}
            className="flex items-center gap-2 text-sm font-medium bg-primary-50 text-primary-700 px-4 py-2 rounded-lg hover:bg-primary-100 cursor-pointer shrink-0"
          >
            <UserPlus size={16} />
            Upgrade to add more teammates
          </button>
        ) : (
          <form onSubmit={onInvite} className="flex flex-wrap gap-2">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => onInviteEmailChange(e.target.value)}
              placeholder="colleague@example.com"
              required
              className="flex-1 min-w-45 sm:w-56 sm:flex-none bg-surface-0 text-ink-900 placeholder:text-ink-700/40 border border-surface-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
            <Button
              type="submit"
              size="sm"
              disabled={isInviting}
              className="shrink-0"
            >
              {isInviting ? <Spinner /> : <UserPlus size={16} />}
              Invite
            </Button>
          </form>
        )}
      </div>

      {/* Search */}
      <div className="px-6 py-3 bg-surface-50 border-b border-surface-200">
        <div className="relative max-w-sm">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-700/40"
          />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Filter by name or email..."
            className="w-full bg-surface-0 text-ink-900 placeholder:text-ink-700/40 border border-surface-200 rounded-lg pl-9 pr-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-surface-50 text-ink-700/50 text-xs uppercase tracking-wide">
              <th className="px-6 py-3 font-medium border-b border-surface-200">
                Name
              </th>
              <th className="px-6 py-3 font-medium border-b border-surface-200">
                Role
              </th>
              <th className="px-6 py-3 font-medium border-b border-surface-200">
                Status
              </th>
              <th className="px-6 py-3 font-medium border-b border-surface-200 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-200">
            {members.map((m) => (
              <tr key={m.id} className="hover:bg-surface-50 transition-colors">
                <td className="px-6 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                      {(m.user.name ?? m.user.email).charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-ink-900 truncate">
                        {m.user.name ?? m.user.email}
                      </p>
                      <p className="text-xs text-ink-700/40 truncate">
                        {m.user.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-3.5">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide ${
                      m.role === "OWNER"
                        ? "bg-primary-100 text-primary-700"
                        : "bg-surface-200 text-ink-700"
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
                    <div className="flex items-center justify-end gap-2">
                      {onUpdateRole && (
                        <div className="flex items-center gap-1.5">
                          {viewerRole === "OWNER" ? (
                            <select
                              value={m.role}
                              disabled={updatingUserId === m.user.id}
                              onChange={(e) =>
                                onUpdateRole(
                                  m.user.id,
                                  e.target.value as "HOST" | "ADMIN",
                                )
                              }
                              className="text-xs border border-surface-200 rounded-md px-2 py-1 bg-surface-0 disabled:opacity-50"
                            >
                              <option value="HOST">Host</option>
                              <option value="ADMIN">Admin</option>
                            </select>
                          ) : (
                            <select
                              value={m.role}
                              disabled
                              title="Only the organization owner can change roles"
                              className="text-xs border border-surface-200 rounded-md px-2 py-1 bg-surface-100 text-ink-700/50 cursor-not-allowed opacity-70"
                            >
                              <option value="HOST">Host</option>
                              <option value="ADMIN">Admin</option>
                            </select>
                          )}
                          {updatingUserId === m.user.id && (
                            <Loader2
                              size={14}
                              className="animate-spin text-ink-700/40"
                            />
                          )}
                        </div>
                      )}
                      <button
                        onClick={() =>
                          onRemove(m.user.id, m.user.name ?? m.user.email)
                        }
                        className="text-danger-600 hover:text-danger-700 transition-colors cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}

            {invitations.map((inv) => (
              <tr
                key={inv.id}
                className="hover:bg-surface-50 transition-colors"
              >
                <td className="px-6 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-surface-200 text-ink-700 text-xs font-bold flex items-center justify-center shrink-0">
                      {inv.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-ink-900 truncate">
                        {inv.email}
                      </p>
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
                    onClick={() => onRevoke(inv.id)}
                    className="text-danger-600 hover:text-danger-700 transition-colors cursor-pointer"
                  >
                    Revoke
                  </button>
                </td>
              </tr>
            ))}

            {members.length === 0 && invitations.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-10 text-center text-ink-700/40"
                >
                  No teammates found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
