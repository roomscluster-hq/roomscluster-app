"use client";

import { Building2, Users } from "lucide-react";

export type Tab = "general" | "teammates";

interface TabConfig {
  id: Tab;
  label: string;
  icon: typeof Building2;
}

const TABS: TabConfig[] = [
  { id: "general", label: "General", icon: Building2 },
  { id: "teammates", label: "Teammates", icon: Users },
];

interface OrganizationTabsProps {
  activeTab: Tab;
  onChange: (tab: Tab) => void;
}

export function OrganizationTabs({ activeTab, onChange }: OrganizationTabsProps) {
  return (
    <nav className="flex md:flex-col gap-1 overflow-x-auto">
      {TABS.map((t) => {
        const Icon = t.icon;
        const active = activeTab === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm whitespace-nowrap transition-colors cursor-pointer ${
              active
                ? "bg-surface-0 border border-surface-200 shadow-raised text-primary-600 font-semibold"
                : "text-ink-700/60 hover:bg-surface-50"
            }`}
          >
            <Icon size={18} />
            {t.label}
          </button>
        );
      })}
    </nav>
  );
}

export { TABS };
export type { TabConfig };
