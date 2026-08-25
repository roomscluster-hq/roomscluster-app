"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { getInitials } from "@/lib/utils";
import { X, Search, Loader2 } from "lucide-react";
import { useHostAssignment } from "@/hooks/dashboard/useHostAssignment";

interface HostAssignmentPanelProps {
  organizationId: string;
  groupId: string;
}

export function HostAssignmentPanel({ organizationId, groupId }: HostAssignmentPanelProps) {
  const [search, setSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { hosts, isLoading, toggleHost, isPendingUserId } = useHostAssignment(
    organizationId,
    groupId,
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (isLoading) return null;

  const assigned = hosts.filter((h) => h.groupIds?.includes(groupId));
  const unassigned = hosts.filter((h) => !h.groupIds?.includes(groupId));
  const filtered = unassigned.filter((h) => {
    const q = search.toLowerCase();
    if (!q) return true;
    return (
      h.user.name?.toLowerCase().includes(q) ||
      h.user.email.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <p className="text-xs text-ink-700/50 mb-3">
        Hosts added here can create and manage sessions under this group.
      </p>

      {assigned.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {assigned.map((h) => {
            const pending = isPendingUserId === h.user.id;
            return (
              <div
                key={h.user.id}
                className="flex items-center gap-1.5 bg-primary-50 border border-primary-100 rounded-full pl-1 pr-2 py-0.5"
              >
                {h.user.image ? (
                  <Image
                    src={h.user.image}
                    alt={h.user.name ?? ""}
                    width={20}
                    height={20}
                    className="rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-primary-600 flex items-center justify-center text-white text-[9px] font-bold shrink-0">
                    {getInitials(h.user.name ?? h.user.email)}
                  </div>
                )}
                <span className="text-xs font-medium text-primary-700 max-w-[140px] truncate">
                  {h.user.name ?? h.user.email}
                </span>
                {pending ? (
                  <Loader2 size={12} className="animate-spin text-primary-400" />
                ) : (
                  <button
                    type="button"
                    onClick={() => toggleHost(h.user.id, true)}
                    className="text-primary-400 hover:text-primary-600 transition-colors cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {unassigned.length === 0 && assigned.length === 0 ? (
        <p className="text-sm text-ink-700/50">
          No hosts in this organization yet. Invite someone as a Host from the
          Teammates tab first.
        </p>
      ) : (
        <div ref={containerRef} className="relative max-w-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-700/40 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setDropdownOpen(true);
              }}
              onFocus={() => setDropdownOpen(true)}
              placeholder="Search hosts to add..."
              className="w-full border border-surface-200 bg-surface-0 text-ink-900 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
          </div>

          {dropdownOpen && (
            <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-surface-0 border border-surface-200 rounded-lg shadow-raised max-h-48 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="px-3 py-3 text-sm text-ink-700/50 text-center">
                  {search ? "No hosts found" : "All hosts are already assigned"}
                </div>
              ) : (
                filtered.map((h) => (
                  <button
                    key={h.user.id}
                    type="button"
                    onClick={() => {
                      toggleHost(h.user.id, false);
                      setSearch("");
                      setDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-surface-50 transition-colors text-left cursor-pointer"
                  >
                    {h.user.image ? (
                      <Image
                        src={h.user.image}
                        alt={h.user.name ?? ""}
                        width={28}
                        height={28}
                        className="rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {getInitials(h.user.name ?? h.user.email)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink-900 truncate">
                        {h.user.name ?? h.user.email}
                      </p>
                      <p className="text-xs text-ink-700/50 truncate">{h.user.email}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}