import type { Metadata } from "next";
import { LegalPageLayout, type LegalSection } from "@/components/legal/LegalPageLayout";
import { LegalTodo } from "@/components/legal/LegalTodo";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy — RoomsCluster",
  description: "How billing, cancellations, downgrades, and refunds work on RoomsCluster.",
};

const sections: LegalSection[] = [
  {
    id: "cancelling",
    heading: "Cancelling Your Subscription",
    body: (
      <p>
        To cancel your Pro or Business subscription, contact us at{" "}
        <a
          href="mailto:support@roomscluster.com"
          className="text-primary-600 hover:underline"
        >
          support@roomscluster.com
        </a>
        . We will process your cancellation and confirm once complete. Your
        organization will retain its current plan&apos;s features until the
        end of your current billing period, after which it will move to the
        Free plan.
      </p>
    ),
  },
  {
    id: "refunds",
    heading: "Refunds",
    body: (
      <p>
        Subscription fees are billed in advance for each monthly period and
        are non-refundable for that period once billing has occurred, except
        where required by law. If you cancel mid-cycle, you will retain
        access to your paid plan&apos;s features until the end of the period
        you&apos;ve already paid for — we do not prorate or refund the
        unused portion.
      </p>
    ),
  },
  {
    id: "downgrades",
    heading: "Downgrades",
    body: (
      <p>
        If you move from Business to Pro, or from Pro to Free, the change
        takes effect at the start of your next billing cycle. You keep your
        current plan&apos;s features for the remainder of the period
        you&apos;ve already paid for.
      </p>
    ),
  },
  {
    id: "failed-payments",
    heading: "Failed Payments",
    body: (
      <p>
        If a recurring payment fails, we will mark your subscription as past
        due. If payment is not successfully retried within{" "}
        <LegalTodo>7 days</LegalTodo>, your organization
        will be moved to the Free plan, and any features beyond Free&apos;s
        limits will no longer be accessible until you resubscribe.
      </p>
    ),
  },
  {
    id: "enterprise",
    heading: "Enterprise Plans",
    body: (
      <p>
        Enterprise agreements are governed by the specific terms agreed upon
        directly with your organization, which take precedence over this
        policy where they conflict.
      </p>
    ),
  },
  {
    id: "contact",
    heading: "Contact",
    body: (
      <p>
        Billing questions:{" "}
        <a
          href="mailto:support@roomscluster.com"
          className="text-primary-600 hover:underline"
        >
          support@roomscluster.com
        </a>
      </p>
    ),
  },
];

export default function RefundsPage() {
  return (
    <LegalPageLayout
      eyebrow="Legal"
      title="Refund & Cancellation Policy"
      lastUpdated={
        <>
          September 3, 2026
        </>
      }
      sections={sections}
    />
  );
}
