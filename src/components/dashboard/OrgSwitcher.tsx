"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { organizationsApi } from "@/lib/api/organizations.api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function OrgSwitcher({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: organizations, isLoading } = useQuery({
    queryKey: ["organizations-mine"],
    queryFn: organizationsApi.listMine,
  });

  const switchMutation = useMutation({
    mutationFn: (organizationId: string) =>
      organizationsApi.switchActive(organizationId),
    onSuccess: (_, organizationId) => {
      queryClient.invalidateQueries({ queryKey: ["folder-contents"] });
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["organizations-mine"] });
      toast.success("Switched workspace");
      setOpen(false);

      const target = organizations?.find((o) => o.id === organizationId);
      router.push(
        target?.role === "MEMBER" ? "/portal" : "/dashboard/sessions",
      );
    },
    onError: () => toast.error("Failed to switch workspace"),
  });

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (isLoading || !organizations) {
    return <div className="w-40 h-9 bg-surface-200 rounded-lg animate-pulse" />;
  }

  const activeOrg = organizations.find((o) => o.isActive) ?? organizations[0];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-2 rounded-lg border border-surface-200 hover:border-surface-200 hover:bg-surface-50 transition-colors text-sm cursor-pointer",
          compact ? "px-2 py-1.5" : "w-full px-3 py-2",
        )}
      >
        <span className="w-5 h-5 rounded bg-primary-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
          {activeOrg?.name.charAt(0).toUpperCase() ?? "?"}
        </span>
        {!compact && (
          <span className="text-ink-700 font-medium truncate flex-1 text-left">
            {activeOrg?.isPersonal
              ? "Personal Workspace"
              : (activeOrg?.name ?? "Workspace")}
          </span>
        )}
        <svg
          className="w-3.5 h-3.5 text-ink-700/50 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {open && (
        <div
          className={cn(
            "absolute mt-2 w-64 max-w-[calc(100vw-2rem)] bg-surface-0 border border-surface-200 rounded-xl shadow-raised py-2 z-50",
            compact ? "right-0" : "left-0",
          )}
        >
          <p className="px-3 py-1 text-xs font-medium text-ink-700/50 uppercase tracking-wide">
            Workspaces
          </p>
          {organizations.map((org) => (
            <button
              key={org.id}
              onClick={() => !org.isActive && switchMutation.mutate(org.id)}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 transition-colors text-left cursor-pointer",
                org.isActive ? "bg-primary-50" : "hover:bg-surface-50",
              )}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-7 h-7 rounded-lg bg-primary-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                  {org.name.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink-900 truncate">
                    {org.isPersonal ? "Personal Workspace" : org.name}
                  </p>
                  <p className="text-xs text-ink-700/50">
                    {org.role === "OWNER"
                      ? "Owner"
                      : org.role === "ADMIN"
                        ? "Admin"
                        : org.role === "HOST"
                          ? "Host"
                          : "Member"}
                    {!org.isPersonal &&
                      ` · ${org.memberCount} member${org.memberCount !== 1 ? "s" : ""}`}
                  </p>
                </div>
              </div>
              {org.isActive && (
                <svg
                  className="w-4 h-4 text-primary-600 shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
