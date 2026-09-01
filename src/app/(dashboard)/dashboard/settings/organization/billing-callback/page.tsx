"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { billingApi } from "@/lib/api/billing.api";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle } from "lucide-react";

function BillingCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reference = searchParams.get("reference");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["billing-verify", reference],
    queryFn: () => billingApi.verifyTransaction(reference!),
    enabled: !!reference,
    retry: false,
  });

  if (!reference) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <h1 className="text-xl font-semibold text-ink-900">Something went wrong</h1>
          <p className="text-ink-700/60 text-sm mt-2">
            We couldn&apos;t find a payment reference for this page.
          </p>
          <Button className="mt-6" onClick={() => router.push("/dashboard/settings/organization?tab=billing")}>
            Back to Billing
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const isSuccess = !isError && data?.status === "success";

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        {isSuccess ? (
          <CheckCircle2 size={48} className="text-primary-600 mx-auto mb-4" />
        ) : (
          <XCircle size={48} className="text-danger-600 mx-auto mb-4" />
        )}

        <h1 className="text-xl font-semibold text-ink-900">
          {isSuccess ? "Payment successful" : "Payment not completed"}
        </h1>
        <p className="text-ink-700/60 text-sm mt-2">
          {isSuccess
            ? "Your plan is being updated — this can take a few seconds to reflect."
            : (data?.message ?? "Something went wrong with your payment. You haven't been charged.")}
        </p>

        <Button className="mt-6" onClick={() => router.push("/dashboard/settings/organization?tab=billing")}>
          {isSuccess ? "Go to Billing" : "Try again"}
        </Button>
      </div>
    </div>
  );
}

export default function BillingCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    }>
      <BillingCallbackContent />
    </Suspense>
  );
}