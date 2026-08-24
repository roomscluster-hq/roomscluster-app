"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  ReactNode,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, usePathname } from "next/navigation";
import {
  organizationsApi,
  type PublicOrgBranding,
} from "@/lib/api/organizations.api";
import { getSubdomainSlug } from "@/lib/subdomain";
import { useAuthStore } from "@/store/auth.store";
import { resolveHomeRoute } from "@/hooks/resolveHomeRoute";
import { generateColorRamp } from "@/lib/generateColorRamp";

interface SubdomainContextValue {
  slug: string | null;
  org: PublicOrgBranding | null;
  isLoading: boolean;
  accessDenied: boolean;
  notFound: boolean;
}

const SubdomainContext = createContext<SubdomainContextValue>({
  slug: null,
  org: null,
  isLoading: false,
  accessDenied: false,
  notFound: false,
});

export function SubdomainProvider({ children }: { children: ReactNode }) {
  const [slug, setSlug] = useState<string | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const hasRedirected = useRef(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setSlug(getSubdomainSlug());
    }, 0);
    return () => clearTimeout(t);
  }, []);

  const {
    data: org,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["subdomain-org", slug],
    queryFn: () => organizationsApi.getBySlug(slug!),
    enabled: !!slug,
    retry: false,
  });

  // Only true once we're certain: a subdomain was detected, the lookup
  // has finished, and no valid, enabled organization came back for it.
  const notFound = !!slug && !isLoading && isError;

  useEffect(() => {
    if (!org || hasRedirected.current) return;

    hasRedirected.current = true;

    if (!isAuthenticated) {
      if (pathname !== "/login") router.replace("/login");
      return;
    }

    organizationsApi
      .switchActive(org.id)
      .then(async () => {
        const homeRoute = await resolveHomeRoute();
        if (pathname !== homeRoute) router.replace(homeRoute);
      })
      .catch(() => setAccessDenied(true));
  }, [org, isAuthenticated, pathname, router]);

  function applyBrandingOverride(
    ramp: Record<string, string>,
    fontFamily?: string | null,
  ) {
    const styleId = "org-branding-override";
    let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }

    const rules: string[] = [];
    for (const [shade, hex] of Object.entries(ramp)) {
      rules.push(
        `.bg-primary-${shade} { background-color: ${hex} !important; }`,
      );
      rules.push(`.text-primary-${shade} { color: ${hex} !important; }`);
      rules.push(
        `.border-primary-${shade} { border-color: ${hex} !important; }`,
      );
      rules.push(
        `.hover\\:bg-primary-${shade}:hover { background-color: ${hex} !important; }`,
      );
      rules.push(
        `.hover\\:text-primary-${shade}:hover { color: ${hex} !important; }`,
      );
    }

    if (fontFamily) {
      rules.push(`body, .font-sans { font-family: ${fontFamily} !important; }`);
    }

    styleEl.textContent = rules.join("\n");
  }

  useEffect(() => {
    if (!org) return;
    if (org.primaryColor) {
      const ramp = generateColorRamp(org.primaryColor);
      // Keep the CSS variables too — harmless, and helps any component
      // that DOES reference var(--color-primary-600) directly, like the
      // shadcn semantic bridge tokens
      for (const [shade, hex] of Object.entries(ramp)) {
        document.documentElement.style.setProperty(
          `--color-primary-${shade}`,
          hex,
        );
      }
      applyBrandingOverride(ramp, org.fontFamily);
    } else if (org.fontFamily) {
      applyBrandingOverride({}, org.fontFamily);
    }
  }, [org]);

  return (
    <SubdomainContext.Provider
      value={{ slug, org: org ?? null, isLoading, accessDenied, notFound }}
    >
      {children}
    </SubdomainContext.Provider>
  );
}

export function useSubdomain() {
  return useContext(SubdomainContext);
}
