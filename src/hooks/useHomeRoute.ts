import { useQuery } from "@tanstack/react-query";
import { organizationsApi } from "@/lib/api/organizations.api";

export function useHomeRoute() {
  const { data: organizations } = useQuery({
    queryKey: ["organizations-mine"],
    queryFn: organizationsApi.listMine,
  });
  const activeOrg = organizations?.find((o) => o.isActive);
  return activeOrg?.role === "MEMBER" ? "/portal" : "/dashboard";
}