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

    // Once access has been denied, stop this effect from taking any
    // further action. Without this, clearAuth() below flips
    // isAuthenticated to false, this effect re-runs (isAuthenticated is
    // a dependency), and its own "not logged in -> go to /login" branch
    // fires automatically — auto-redirecting a denied user away from
    // the error page before they've done anything themselves.
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

  // Reset stale denial state once the user is no longer authenticated
  // as anyone (e.g. they explicitly log out, or clearAuth() ran after
  // a denied switchActive) — so a fresh login attempt isn't wrongly
  // blocked by leftover state.
  //
  // Adjusted directly during render (React's documented alternative to
  // an Effect for reacting to a state change) instead of in a
  // useEffect, since this is a synchronous response to isAuthenticated
  // changing, not a sync with an external system.
  if (isAuthenticated !== prevIsAuthenticated) {
    setPrevIsAuthenticated(isAuthenticated);

    if (!isAuthenticated && accessDenied) {
      setAccessDenied(false);
    }
  }

  // Clears switchKeyRef once accessDenied actually flips back to false:
  // without this, the SAME account logging back in to retry computes
  // the identical switchKey as before, the guard above sees it
  // "already tried", and silently skips calling switchActive a second
  // time at all. This has to run as a real Effect rather than during
  // render, since refs can't be written while rendering.
  const prevAccessDeniedRef = useRef(accessDenied);

  useEffect(() => {
    if (prevAccessDeniedRef.current && !accessDenied) {
      switchKeyRef.current = null;
    }

    prevAccessDeniedRef.current = accessDenied;
  }, [accessDenied]);

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