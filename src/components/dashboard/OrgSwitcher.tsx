"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { organizationsApi } from "@/lib/api/organizations.api";
import { toast } from "sonner";

export function OrgSwitcher() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: organizations, isLoading } = useQuery({
    queryKey: ["organizations-mine"],
    queryFn: organizationsApi.listMine,
  });

  const switchMutation = useMutation({
    mutationFn: (organizationId: string) => organizationsApi.switchActive(organizationId),
    onSuccess: () => {
      // Active org changed — every org-scoped query needs to refetch
      queryClient.invalidateQueries({ queryKey: ["folder-contents"] });
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["organizations-mine"] });
      toast.success("Switched workspace");
      setOpen(false);
      router.push("/dashboard/sessions");
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
    return <div className="w-40 h-9 bg-gray-100 rounded-lg animate-pulse" />;
  }

  const activeOrg = organizations.find((o) => o.isActive) ?? organizations[0];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 transition text-sm cursor-pointer"
      >
        <span className="w-5 h-5 rounded bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
          {activeOrg?.name.charAt(0).toUpperCase() ?? "?"}
        </span>
        <span className="text-gray-700 font-medium max-w-[140px] truncate">
          {activeOrg?.isPersonal ? "Personal Workspace" : activeOrg?.name ?? "Workspace"}
        </span>
        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-50">
          <p className="px-3 py-1 text-xs font-medium text-gray-400 uppercase tracking-wide">
            Workspaces
          </p>
          {organizations.map((org) => (
            <button
              key={org.id}
              onClick={() => !org.isActive && switchMutation.mutate(org.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 transition text-left cursor-pointer ${
                org.isActive ? "bg-blue-50" : "hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-7 h-7 rounded-lg bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                  {org.name.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {org.isPersonal ? "Personal Workspace" : org.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {org.role === "OWNER" ? "Owner" : "Member"}
                    {!org.isPersonal && ` · ${org.memberCount} member${org.memberCount !== 1 ? "s" : ""}`}
                  </p>
                </div>
              </div>
              {org.isActive && (
                <svg className="w-4 h-4 text-blue-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}