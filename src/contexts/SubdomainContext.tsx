"use client";

import { createContext, useContext, useEffect, useState, useRef, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, usePathname } from "next/navigation";
import { organizationsApi, type PublicOrgBranding } from "@/lib/api/organizations.api";
import { getSubdomainSlug } from "@/lib/subdomain";
import { useAuthStore } from "@/store/auth.store";
import { resolveHomeRoute } from "@/hooks/resolveHomeRoute";

interface SubdomainContextValue {
  slug: string | null;
  org: PublicOrgBranding | null;
  isLoading: boolean;
  accessDenied: boolean;
}

const SubdomainContext = createContext<SubdomainContextValue>({
  slug: null,
  org: null,
  isLoading: false,
  accessDenied: false,
});

export function SubdomainProvider({ children }: { children: ReactNode }) {
    // const [slug] = useState<string | null>(() => getSubdomainSlug());
    const [slug, setSlug] = useState<string | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const hasRedirected = useRef(false);

useEffect(() => {
  // Defer to avoid calling setState synchronously within an effect —
  // same pattern used in useFolderManagement.ts
  const t = setTimeout(() => {
    setSlug(getSubdomainSlug());
  }, 0);
  return () => clearTimeout(t);
}, []);

  const { data: org, isLoading } = useQuery({
    queryKey: ["subdomain-org", slug],
    queryFn: () => organizationsApi.getBySlug(slug!),
    enabled: !!slug,
    retry: false,
  });

  // Only take over navigation the FIRST time, and only from the bare
  // marketing landing page — never hijack someone already navigating
  // around inside the app on this same subdomain.
  useEffect(() => {
    if (!org || hasRedirected.current || pathname !== "/") return;

    hasRedirected.current = true;

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    organizationsApi
      .switchActive(org.id)
      .then(async () => {
        const homeRoute = await resolveHomeRoute();
        router.replace(homeRoute);
      })
      .catch(() => setAccessDenied(true));
  }, [org, isAuthenticated, pathname, router]);

  useEffect(() => {
    if (!org) return;
    if (org.primaryColor) {
      document.documentElement.style.setProperty("--color-primary-600", org.primaryColor);
    }
    if (org.fontFamily) {
      document.documentElement.style.setProperty("--font-sans", org.fontFamily);
    }
  }, [org]);

  return (
    <SubdomainContext.Provider value={{ slug, org: org ?? null, isLoading, accessDenied }}>
      {children}
    </SubdomainContext.Provider>
  );
}

export function useSubdomain() {
  return useContext(SubdomainContext);
}