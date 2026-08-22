"use client";

import { useQuery } from "@tanstack/react-query";
import { groupsApi } from "@/lib/api/groups.api";

interface GroupFilterProps {
  organizationId?: string;
  currentFilter: string;
  onChange: (groupId: string) => void;
}

export function GroupFilter({ organizationId, currentFilter, onChange }: GroupFilterProps) {
  const { data } = useQuery({
    queryKey: ["groups-picker", organizationId],
    queryFn: () => groupsApi.list(organizationId!, 1, 100),
    enabled: !!organizationId,
  });

  const groups = data?.groups ?? [];
  if (groups.length === 0) return null;

  return (
    <select
      value={currentFilter}
      onChange={(e) => onChange(e.target.value)}
      className="px-3 py-1.5 mb-4 rounded-full text-xs font-medium border border-surface-200 text-ink-700/60 bg-surface-0 hover:bg-surface-50 focus:outline-none focus:ring-2 focus:ring-primary-600 cursor-pointer"
    >
      <option value="ALL">All groups</option>
      {groups.map((g) => (
        <option key={g.id} value={g.id}>
          {g.name}
        </option>
      ))}
    </select>
  );
}