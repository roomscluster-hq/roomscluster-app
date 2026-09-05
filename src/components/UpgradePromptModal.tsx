"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useUpgradePromptStore } from "@/store/upgrade-prompt.store";
import { organizationsApi } from "@/lib/api/organizations.api";
import { billingApi } from "@/lib/api/billing.api";
import { PLAN_DETAILS } from "@/lib/planDetails";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { X, Sparkles, Check } from "lucide-react";

export function UpgradePromptModal() {
  const { isOpen, message, suggestedPlan, close } = useUpgradePromptStore();
  const [loadingPlan, setLoadingPlan] = useState<"PRO" | "BUSINESS" | null>(
    null,
  );
  const [now, setNow] = useState(() => Date.now());

  // Reads the same cached data every other part of the app already uses —
  // usually already in the cache, so this rarely triggers a fresh fetch
  const { data: organizations } = useQuery({
    queryKey: ["organizations-mine"],
    queryFn: organizationsApi.listMine,
    enabled: isOpen,
  });
  const activeOrg = organizations?.find((o) => o.isActive);

  const upgradeMutation = useMutation({
    mutationFn: (targetPlan: "PRO" | "BUSINESS") =>
      billingApi.initiateUpgrade(activeOrg!.id, targetPlan),
    onSuccess: (data) => {
      // Open in a NEW TAB — deliberately never navigates the current tab,
      // so an active LiveKit/socket session is never disconnected just
      // because someone hit a plan limit mid-meeting.
      window.open(data.authorizationUrl, "_blank");
      toast.success("Complete your upgrade in the new tab that just opened.");
      setLoadingPlan(null);
      close();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message ?? "Failed to start upgrade");
      setLoadingPlan(null);
    },
  });

  function handleUpgrade(plan: "PRO" | "BUSINESS") {
    setLoadingPlan(plan);
    upgradeMutation.mutate(plan);
  }

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(interval);
  }, []);

  if (!isOpen) return null;

  // Only show plans genuinely above the org's current one
  const trialEndsAt = activeOrg?.trialEndsAt
    ? new Date(activeOrg.trialEndsAt)
    : null;
  const isOnTrial = !!trialEndsAt && trialEndsAt.getTime() > now;

  const plansToShow = (["PRO", "BUSINESS"] as const).filter(
    (plan) => plan !== activeOrg?.plan || isOnTrial,
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-surface-0 rounded-2xl shadow-raised border border-surface-200 max-w-md w-full p-6 relative max-h-[90vh] overflow-y-auto">
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
          Upgrade required
        </h2>
        <p className="text-sm text-ink-700/60 mb-6">{message}</p>

        <div className="space-y-3">
          {plansToShow.map((plan) => {
            const details = PLAN_DETAILS[plan];
            const isSuggested = plan === suggestedPlan;
            return (
              <div
                key={plan}
                className={`rounded-xl border p-4 ${isSuggested ? "border-primary-600 bg-primary-50/30" : "border-surface-200"}`}
              >
                <div className="flex items-baseline justify-between mb-2">
                  <h3 className="font-semibold text-ink-900">
                    {details.label}
                  </h3>
                  <span className="text-sm font-bold text-ink-900">
                    {details.price}
                  </span>
                </div>
                <ul className="space-y-1 mb-3">
                  {details.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-xs text-ink-700"
                    >
                      <Check
                        size={14}
                        className="text-primary-600 shrink-0 mt-0.5"
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  size="sm"
                  onClick={() => handleUpgrade(plan)}
                  disabled={loadingPlan === plan || !activeOrg}
                >
                  {loadingPlan === plan
                    ? "Redirecting..."
                    : `Upgrade to ${details.label}`}
                </Button>
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-ink-700/40 mt-4">
          By upgrading, you agree to our{" "}
          <a
            href="/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 hover:underline"
          >
            Terms
          </a>{" "}
          and{" "}
          <a
            href="/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 hover:underline"
          >
            Privacy Policy
          </a>
          .
        </p>

        <button
          onClick={close}
          className="w-full text-center text-sm text-ink-700/60 hover:text-ink-700 mt-3 cursor-pointer"
        >
          Not now
        </button>
      </div>
    </div>
  );
}
