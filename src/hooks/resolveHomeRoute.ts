import { organizationsApi } from "@/lib/api/organizations.api";

export async function resolveHomeRoute(): Promise<string> {
  try {
    const organizations = await organizationsApi.listMine();
    const activeOrg = organizations.find((o) => o.isActive);
    return activeOrg?.role === "MEMBER" ? "/portal" : "/dashboard";
  } catch {
    return "/dashboard";
  }
}