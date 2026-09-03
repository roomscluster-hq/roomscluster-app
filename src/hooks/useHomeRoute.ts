import { useActiveOrganization } from "@/hooks/useOrganizationsMine";

export function useHomeRoute() {
  const { activeOrg } = useActiveOrganization();
  return activeOrg?.role === "MEMBER" ? "/portal" : "/dashboard";
}