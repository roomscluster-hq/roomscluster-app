"use client";

interface Organization {
  name: string;
  isPersonal: boolean;
  role?: string;
}

interface WorkspaceIndicatorProps {
  organization?: Organization;
}

export function WorkspaceIndicator({ organization }: WorkspaceIndicatorProps) {
  if (!organization) return null;

  return (
    <div className="flex items-center gap-2 mb-5 text-sm">
      <span className="w-5 h-5 rounded bg-primary-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
        {organization.name.charAt(0).toUpperCase()}
      </span>
      <span className="text-ink-700/60">
        Viewing{" "}
        <strong className="text-ink-700">
          {organization.isPersonal ? "your Personal Workspace" : organization.name}
        </strong>
        {organization.role === "OWNER" && !organization.isPersonal && " · seeing everyone's sessions"}
      </span>
    </div>
  );
}
