"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { organizationsApi, OrgMember } from "@/lib/api/organizations.api";
import { getInitials } from "@/lib/utils";
import { X, Search } from "lucide-react";

export interface SelectedCoHost {
  userId: string;
  name: string;
  email: string;
  image: string | null;
}

interface CoHostSelectorProps {
  organizationId: string;
  currentUserId: string; // exclude the host themselves
  value: SelectedCoHost[];
  onChange: (value: SelectedCoHost[]) => void;
}

export function CoHostSelector({
  organizationId,
  currentUserId,
  value,
  onChange,
}: CoHostSelectorProps) {
  const [search, setSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: members = [], isLoading } = useQuery({
    queryKey: ["org-members", organizationId],
    queryFn: () => organizationsApi.listMembers(organizationId),
    enabled: !!organizationId,
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter members — exclude current user and already selected
  const selectedIds = new Set(value.map((c) => c.userId));
  const filtered = members.filter((m: OrgMember) => {
    if (m.user.id === currentUserId) return false;
    if (selectedIds.has(m.user.id)) return false;
    const q = search.toLowerCase();
    if (!q) return true;
    return (
      m.user.name?.toLowerCase().includes(q) ||
      m.user.email.toLowerCase().includes(q)
    );
  });

  function select(member: OrgMember) {
    onChange([
      ...value,
      {
        userId: member.user.id,
        name: member.user.name ?? member.user.email,
        email: member.user.email,
        image: member.user.image,
      },
    ]);
    setSearch("");
    setDropdownOpen(false);
  }

  function remove(userId: string) {
    onChange(value.filter((c) => c.userId !== userId));
  }

  return (
    <div>
      <label className="block text-sm font-medium text-ink-700 mb-1.5">
        Pre-assign Co-hosts
      </label>
      <p className="text-xs text-ink-700/50 mb-2">
        These members will automatically have co-host permissions when they join.
      </p>

      {/* Selected co-hosts */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {value.map((cohost) => (
            <div
              key={cohost.userId}
              className="flex items-center gap-1.5 bg-primary-50 border border-primary-100 rounded-full pl-1 pr-2 py-0.5"
            >
              <div className="w-5 h-5 rounded-full bg-primary-600 flex items-center justify-center text-white text-[9px] font-bold shrink-0">
                {getInitials(cohost.name)}
              </div>
              <span className="text-xs font-medium text-primary-700 max-w-[120px] truncate">
                {cohost.name}
              </span>
              <button
                type="button"
                onClick={() => remove(cohost.userId)}
                className="text-primary-400 hover:text-primary-600 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Search input */}
      <div ref={containerRef} className="relative">
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
            placeholder="Search members by name or email..."
            className="w-full border border-surface-200 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
          />
        </div>

        {/* Dropdown */}
        {dropdownOpen && (
          <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-surface-200 rounded-lg shadow-raised max-h-48 overflow-y-auto">
            {isLoading ? (
              <div className="px-3 py-4 text-center">
                <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="px-3 py-3 text-sm text-ink-700/50 text-center">
                {search ? "No members found" : "No other members in this organization"}
              </div>
            ) : (
              filtered.map((member: OrgMember) => (
                <button
                  key={member.user.id}
                  type="button"
                  onClick={() => select(member)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-surface-50 transition-colors text-left"
                >
                  {member.user.image ? (
                    <img
                      src={member.user.image}
                      alt={member.user.name ?? ""}
                      className="w-7 h-7 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {getInitials(member.user.name ?? member.user.email)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink-900 truncate">
                      {member.user.name ?? member.user.email}
                    </p>
                    <p className="text-xs text-ink-700/50 truncate">{member.user.email}</p>
                  </div>
                  <span className="ml-auto shrink-0 text-xs text-ink-700/40 capitalize">
                    {member.role.toLowerCase()}
                  </span>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}