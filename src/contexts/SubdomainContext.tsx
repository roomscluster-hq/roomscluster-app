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

export function SubdomainProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [slug, setSlug] = useState<string | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);

  const { isAuthenticated, user } = useAuthStore();

  const [prevIsAuthenticated, setPrevIsAuthenticated] = useState(isAuthenticated);

  const router = useRouter();
  const pathname = usePathname();

  const switchKeyRef = useRef<string | null>(null);
  const prevAccessDeniedRef = useRef(accessDenied);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSlug(getSubdomainSlug());
    }, 0);

    return () => clearTimeout(timer);
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

  const notFound = !!slug && !isLoading && isError;

  useEffect(() => {
    if (!org) return;

    // If we just recovered from a denial (accessDenied flipped true ->
    // false, e.g. from a fresh successful login), clear the switchKey
    // guard RIGHT HERE, before the check below — in the same effect
    // that reads it, not a separate effect. Two separate effects both
    // reacting to accessDenied changing run in declaration order within
    // one commit; putting the reset in a later-declared effect meant it
    // always ran too late, after this effect had already read the
    // stale ref value and bailed out.
    if (prevAccessDeniedRef.current && !accessDenied) {
      switchKeyRef.current = null;
    }
    prevAccessDeniedRef.current = accessDenied;

    if (accessDenied) return;

    if (!isAuthenticated) {
      if (pathname !== "/login") {
        router.replace("/login");
      }

      return;
    }

    if (!user?.id) return;

    const switchKey = `${user.id}:${org.id}`;

    if (switchKeyRef.current === switchKey) {
      return;
    }

    switchKeyRef.current = switchKey;

    organizationsApi
      .switchActive(org.id)
      .then(async () => {
        const homeRoute = await resolveHomeRoute();

        if (pathname !== homeRoute) {
          router.replace(homeRoute);
        }
      })
      .catch(async () => {
        await useAuthStore.getState().clearAuth();

        setAccessDenied(true);
      });
  }, [org, isAuthenticated, user?.id, pathname, router, accessDenied]);

  // Reset stale denial state on a fresh, successful login while
  // previously denied — the transition INTO isAuthenticated=true, not
  // out of it. Adjusted directly during render (React's documented
  // alternative to an Effect for reacting to a prop/state change).
  if (isAuthenticated !== prevIsAuthenticated) {
    setPrevIsAuthenticated(isAuthenticated);

    if (isAuthenticated && accessDenied) {
      setAccessDenied(false);
    }
  }

  function applyBrandingOverride(
    ramp: Record<string, string>,
    fontFamily?: string | null,
  ) {
    const styleId = "org-branding-override";

    let styleEl = document.getElementById(
      styleId,
    ) as HTMLStyleElement | null;

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

      rules.push(
        `.text-primary-${shade} { color: ${hex} !important; }`,
      );

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
      rules.push(
        `body, .font-sans { font-family: ${fontFamily} !important; }`,
      );
    }

    styleEl.textContent = rules.join("\n");
  }

  useEffect(() => {
    if (!org) return;

    if (org.primaryColor) {
      const ramp = generateColorRamp(org.primaryColor);

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

  useEffect(() => {
    if (!accessDenied) return;

    const styleEl = document.getElementById(
      "org-branding-override",
    );

    if (styleEl) {
      styleEl.remove();
    }
  }, [accessDenied]);

  return (
    <SubdomainContext.Provider
      value={{
        slug,
        org: org ?? null,
        isLoading,
        accessDenied,
        notFound,
      }}
    >
      {children}
    </SubdomainContext.Provider>
  );
}

export function useSubdomain() {
  return useContext(SubdomainContext);
}