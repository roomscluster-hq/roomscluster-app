"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import { SubdomainProvider, useSubdomain } from "@/contexts/SubdomainContext";
import { SubdomainErrorPage } from "@/components/SubdomainErrorPage";
import { useAuthStore } from "@/store/auth.store";
import { UpgradePromptModal } from "@/components/UpgradePromptModal";
import { usePathname } from "next/navigation";

const PUBLIC_SUBDOMAIN_PATHS = ["/login", "/magic", "/reset-password"];

function SubdomainGate({ children }: { children: React.ReactNode }) {
  const { accessDenied } = useSubdomain();
  const { isAuthenticated } = useAuthStore();
  const pathname = usePathname();

 const isPublicAuthPath = PUBLIC_SUBDOMAIN_PATHS.some((p) => pathname.startsWith(p));

  if (accessDenied && !isPublicAuthPath) {
    return <SubdomainErrorPage variant="access-denied" isAuthenticated={isAuthenticated} />;
  }
  return <>{children}</>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <SubdomainProvider>
        <SubdomainGate>{children}</SubdomainGate>
      </SubdomainProvider>
      <UpgradePromptModal />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}