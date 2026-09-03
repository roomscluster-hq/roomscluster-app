"use client";

import { useQuery } from "@tanstack/react-query";
import { organizationsApi } from "@/lib/api/organizations.api";
import { useAuthStore } from "@/store/auth.store";

// Single source of truth for this query — key, fetch function, and the
// guest-safety gate all live here once. Every component that needs org
// data calls this hook instead of writing out its own useQuery block.
export function useOrganizationsMine() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ["organizations-mine"],
    queryFn: organizationsApi.listMine,
    enabled: isAuthenticated,
  });
}

// Convenience — several components only ever want "whichever org is
// currently active," and were each re-deriving that themselves
export function useActiveOrganization() {
  const { data: organizations, ...rest } = useOrganizationsMine();
  const activeOrg = organizations?.find((o) => o.isActive);
  return { activeOrg, organizations, ...rest };
}