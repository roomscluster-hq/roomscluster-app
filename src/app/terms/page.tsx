import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageLayout, type LegalSection } from "@/components/legal/LegalPageLayout";
import { LegalTodo } from "@/components/legal/LegalTodo";

export const metadata: Metadata = {
  title: "Terms of Service — RoomsCluster",
  description: "The terms that govern your use of RoomsCluster.",
};

const sections: LegalSection[] = [
  {
    id: "about",
    heading: "1. About RoomsCluster",
    body: (
      <p>
        RoomsCluster (&quot;we,&quot; &quot;us,&quot; &quot;our&quot;) is a
        virtual webinar and classroom platform provided by{" "}
        <LegalTodo>RoomsCluster</LegalTodo>, operating at
        roomscluster.com. These Terms govern your use of the service, whether
        you&apos;re a host, organization owner, teammate, or enrolled member.
      </p>
    ),
  },
  {
    id: "accounts",
    heading: "2. Accounts",
    body: (
      <p>
        You must provide accurate information when creating an account. You
        are responsible for maintaining the security of your account and for
        all activity under it. Organizations may invite teammates and enroll
        members, who are each bound by these Terms when they use the service.
      </p>
    ),
  },
  {
    id: "billing",
    heading: "3. Plans and Billing",
    body: (
      <p>
        RoomsCluster offers Free, Pro, and Business plans with the features
        and limits described on our{" "}
        <Link href="/#pricing" className="text-primary-600 hover:underline">
          Pricing
        </Link>{" "}
        page, plus a custom Enterprise plan available by direct arrangement.
        Paid plans are billed monthly in Nigerian Naira (₦) via Paystack. By
        subscribing to a paid plan, you authorize us to charge your payment
        method on a recurring monthly basis until you cancel.
      </p>
    ),
  },
  {
    id: "acceptable-use",
    heading: "4. Acceptable Use",
    body: (
      <>
        <p>You may not use RoomsCluster to:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Violate any law;</li>
          <li>Harass, abuse, or harm others;</li>
          <li>
            Distribute malware or attempt to compromise the security of the
            service;
          </li>
          <li>
            Record or share sessions without appropriate consent from
            participants where required by law; or
          </li>
          <li>
            Exceed the usage limits of your plan through technical
            circumvention.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "content",
    heading: "5. Content and Recordings",
    body: (
      <p>
        You retain ownership of the content you create using RoomsCluster,
        including session recordings, chat messages, and materials shared
        during sessions. You are responsible for ensuring you have the right
        to record and store any content involving other participants, and
        for complying with applicable consent requirements. We store
        recordings on your behalf and do not claim ownership over them.
      </p>
    ),
  },
  {
    id: "termination",
    heading: "6. Termination",
    body: (
      <p>
        You may stop using the service at any time. We may suspend or
        terminate accounts that violate these Terms, engage in abusive
        behavior, or pose a security risk to the platform or other users.
      </p>
    ),
  },
  {
    id: "availability",
    heading: "7. Service Availability",
    body: (
      <p>
        We aim to provide reliable service but do not guarantee
        uninterrupted availability. Planned maintenance or unforeseen
        outages may occur.
      </p>
    ),
  },
  {
    id: "liability",
    heading: "8. Limitation of Liability",
    body: (
      <p>
        To the maximum extent permitted by law, RoomsCluster is not liable
        for indirect, incidental, or consequential damages arising from your
        use of the service. Our total liability for any claim is limited to
        the amount you paid us in the 12 months preceding the claim.
      </p>
    ),
  },
  {
    id: "changes",
    heading: "9. Changes to These Terms",
    body: (
      <p>
        We may update these Terms from time to time. We will notify active
        subscribers of material changes by email before they take effect.
      </p>
    ),
  },
  {
    id: "governing-law",
    heading: "10. Governing Law",
    body: (
      <p>
        These Terms are governed by the laws of the Federal Republic of
        Nigeria.
      </p>
    ),
  },
  {
    id: "contact",
    heading: "11. Contact",
    body: (
      <p>
        Questions about these Terms:{" "}
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

export default function TermsPage() {
  return (
    <LegalPageLayout
      eyebrow="Legal"
      title="Terms of Service"
      lastUpdated={
        <>
          September 3, 2026
        </>
      }
      sections={sections}
    />
  );
}
