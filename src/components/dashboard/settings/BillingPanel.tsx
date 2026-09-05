"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { billingApi } from "@/lib/api/billing.api";
import { toast } from "sonner";
import { Check } from "lucide-react";

const PLAN_DETAILS = {
  FREE: {
    label: "Free",
    price: null,
    features: [
      "1 co-host per session",
      "Sessions up to 1 hour",
      "Audio recording (40 min per session)",
    ],
  },
  PRO: {
    label: "Pro",
    price: "₦20,000/month",
    features: [
      "5 teammates",
      "2 co-hosts per session",
      "Sessions up to 3 hours",
      "Video recording (up to 2 hours)",
      "Groups, Enrollment & Member Portal",
    ],
  },
  BUSINESS: {
    label: "Business",
    price: "₦75,000/month",
    features: [
      "30 teammates",
      "5 co-hosts per session",
      "Sessions up to 5 hours",
      "Unlimited recording",
      "Simultaneous audio + video recording",
      "Custom subdomain & branding",
    ],
  },
} as const;

interface BillingPanelProps {
  organizationId: string;
}

export function BillingPanel({ organizationId }: BillingPanelProps) {
  const [loadingPlan, setLoadingPlan] = useState<"PRO" | "BUSINESS" | null>(
    null,
  );
  const [now, setNow] = useState(() => Date.now());

  const { data: status, isLoading } = useQuery({
    queryKey: ["billing-status", organizationId],
    queryFn: () => billingApi.getStatus(organizationId),
  });

  const upgradeMutation = useMutation({
    mutationFn: (targetPlan: "PRO" | "BUSINESS") =>
      billingApi.initiateUpgrade(organizationId, targetPlan),
    onSuccess: (data) => {
      window.location.href = data.authorizationUrl;
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

  const trialEndsAt = status?.trialEndsAt ? new Date(status.trialEndsAt) : null;
  const isOnTrial = !!trialEndsAt && trialEndsAt.getTime() > now;
  const trialDaysLeft = isOnTrial
    ? Math.max(1, Math.ceil((trialEndsAt!.getTime() - now) / 86_400_000))
    : 0;

  if (isLoading || !status) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (status.plan === "ENTERPRISE") {
    return (
      <Card>
        <CardContent className="py-6">
          <h2 className="font-semibold text-ink-900 mb-1">Enterprise Plan</h2>
          <p className="text-sm text-ink-700/60">
            Your organization is on a custom Enterprise plan. Contact us for any
            changes.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-semibold text-ink-900 mb-1">Current plan</h2>
        <p className="text-sm text-ink-700/60">
          You&apos;re currently on the{" "}
          <span className="font-medium text-ink-900">
            {PLAN_DETAILS[status.plan].label}
          </span>{" "}
          plan.
        </p>
        <p className="text-sm text-ink-700/60 mt-1">
          {status.maxTeammates === null
            ? `${status.teammatesUsed} teammates`
            : `${status.teammatesUsed} of ${status.maxTeammates} teammates used`}
        </p>
        {isOnTrial && (
          <p className="text-sm text-primary-700 mt-1 font-medium">
            {trialDaysLeft} day{trialDaysLeft === 1 ? "" : "s"} left in your
            free trial
          </p>
        )}
        {!isOnTrial &&
          status.plan !== "FREE" &&
          status.subscriptionRenewsAt && (
            <p className="text-sm text-ink-700/60 mt-1">
              Renews on{" "}
              {new Date(status.subscriptionRenewsAt).toLocaleDateString()}
            </p>
          )}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {(["PRO", "BUSINESS"] as const).map((plan) => {
          const details = PLAN_DETAILS[plan];
          const isCurrent = status.plan === plan;
          const isDowngradeTarget =
            status.plan === "BUSINESS" && plan === "PRO";

          return (
            <Card key={plan} className={isCurrent ? "border-primary-600" : ""}>
              <CardContent className="py-6 flex flex-col h-full">
                <div className="flex items-baseline justify-between mb-1">
                  <h3 className="font-semibold text-ink-900">
                    {details.label}
                  </h3>
                  {isCurrent && (
                    <span className="text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full">
                      Current plan
                    </span>
                  )}
                </div>
                <p className="text-lg font-bold text-ink-900 mb-4">
                  {details.price}
                </p>

                <ul className="space-y-2 mb-6 flex-1">
                  {details.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm text-ink-700"
                    >
                      <Check
                        size={16}
                        className="text-primary-600 shrink-0 mt-0.5"
                      />
                      {feature}
                    </li>
                  ))}
                </ul>

                {!isCurrent && !isDowngradeTarget && (
                  <Button
                    className="w-full"
                    onClick={() => handleUpgrade(plan)}
                    disabled={loadingPlan === plan}
                  >
                    {loadingPlan === plan
                      ? "Redirecting..."
                      : `Upgrade to ${details.label}`}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <p className="text-xs text-ink-700/50">
        Need more than Business offers?{" "}
        <a
          href="mailto:hello@roomscluster.com"
          className="text-primary-600 hover:underline"
        >
          Contact us about Enterprise
        </a>
        .
      </p>

      <p className="text-xs text-ink-700/50">
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
    </div>
  );
}
