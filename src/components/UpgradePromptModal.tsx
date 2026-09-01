"use client";

import { useRouter } from "next/navigation";
import { useUpgradePromptStore } from "@/store/upgrade-prompt.store";
import { Button } from "@/components/ui/button";
import { X, Sparkles } from "lucide-react";

const PLAN_LABEL: Record<string, string> = {
  PRO: "Pro",
  BUSINESS: "Business",
};

export function UpgradePromptModal() {
  const { isOpen, message, suggestedPlan, close } = useUpgradePromptStore();
  const router = useRouter();

  if (!isOpen) return null;

  function handleUpgrade() {
    close();
    router.push("/dashboard/settings/organization?tab=billing");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-surface-0 rounded-2xl shadow-raised border border-surface-200 max-w-sm w-full p-6 relative">
        <button
          onClick={close}
          className="absolute top-4 right-4 text-ink-700/40 hover:text-ink-700 cursor-pointer"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 mb-4">
          <Sparkles size={22} />
        </div>

        <h2 className="text-lg font-semibold text-ink-900 mb-2">
          {suggestedPlan ? `Upgrade to ${PLAN_LABEL[suggestedPlan]}` : "Upgrade required"}
        </h2>
        <p className="text-sm text-ink-700/60 mb-6">{message}</p>

        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={close}>
            Not now
          </Button>
          <Button className="flex-1" onClick={handleUpgrade}>
            View plans
          </Button>
        </div>
      </div>
    </div>
  );
}