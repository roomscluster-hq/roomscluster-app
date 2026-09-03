import type { Metadata } from "next";
import { LegalPageLayout, type LegalSection } from "@/components/legal/LegalPageLayout";

export const metadata: Metadata = {
  title: "Privacy Policy — RoomsCluster",
  description: "How RoomsCluster collects, uses, and protects your data.",
};

const sections: LegalSection[] = [
  {
    id: "what-we-collect",
    heading: "What We Collect",
    body: (
      <ul className="list-disc pl-5 space-y-2">
        <li>
          <span className="font-medium text-ink-900">
            Account information:
          </span>{" "}
          name, email address, and profile image (for organization owners,
          teammates, and enrolled members)
        </li>
        <li>
          <span className="font-medium text-ink-900">
            Organization data:
          </span>{" "}
          organization name, subdomain, branding assets (logo, color, font)
          you choose to upload
        </li>
        <li>
          <span className="font-medium text-ink-900">Session content:</span>{" "}
          chat messages, recordings (audio and/or video, depending on your
          plan and settings), and AI-generated transcripts you request
        </li>
        <li>
          <span className="font-medium text-ink-900">Enrollment data:</span>{" "}
          email addresses of members you enroll into Groups, for access
          control purposes
        </li>
        <li>
          <span className="font-medium text-ink-900">
            Payment information:
          </span>{" "}
          we do not store your card details. Payments are processed by
          Paystack, and we retain only a customer reference and
          authorization reference needed to manage your subscription
        </li>
        <li>
          <span className="font-medium text-ink-900">Technical data:</span>{" "}
          IP address, browser type, and session identifiers, used for
          authentication and security
        </li>
      </ul>
    ),
  },
  {
    id: "how-we-use",
    heading: "How We Use Your Data",
    body: (
      <ul className="list-disc pl-5 space-y-2">
        <li>
          To provide and operate the service, including access control for
          enrolled members
        </li>
        <li>To process payments and manage subscriptions via Paystack</li>
        <li>
          To send transactional communications: magic-link sign-in,
          enrollment invitations, co-host notifications, and password resets
          (via Resend)
        </li>
        <li>
          To generate transcripts of recordings you choose to submit for
          transcription (via AssemblyAI)
        </li>
        <li>To maintain the security and integrity of the platform</li>
      </ul>
    ),
  },
  {
    id: "third-party-processors",
    heading: "Third-Party Processors",
    body: (
      <>
        <p>
          We use the following third parties to operate RoomsCluster, each
          bound by their own data protection obligations:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <span className="font-medium text-ink-900">Paystack</span> —
            payment processing
          </li>
          <li>
            <span className="font-medium text-ink-900">
              Amazon Web Services (S3)
            </span>{" "}
            — storage of session recordings
          </li>
          <li>
            <span className="font-medium text-ink-900">AssemblyAI</span> —
            audio transcription, only for recordings you explicitly submit
          </li>
          <li>
            <span className="font-medium text-ink-900">Resend</span> —
            transactional email delivery
          </li>
        </ul>
        <p>
          Video and audio during live sessions are transmitted through
          infrastructure we operate and control directly; we do not route
          live session media through a third-party video provider.
        </p>
      </>
    ),
  },
  {
    id: "data-retention",
    heading: "Data Retention",
    body: (
      <p>
        We retain your account data for as long as your account is active.
        Recordings and transcripts are retained until you delete them or
        close your account, at which point we will delete this data within a
        reasonable period, except where retention is required by law.
      </p>
    ),
  },
  {
    id: "your-rights",
    heading: "Your Rights",
    body: (
      <p>
        Under the NDPR, you have the right to access, correct, or request
        deletion of your personal data. To exercise these rights, contact us
        at{" "}
        <a
          href="mailto:support@roomscluster.com"
          className="text-primary-600 hover:underline"
        >
          support@roomscluster.com
        </a>
        . We will respond within the timeframe required by applicable law.
      </p>
    ),
  },
  {
    id: "cookies",
    heading: "Cookies and Local Storage",
    body: (
      <p>
        We use cookies and browser local storage to maintain your login
        session and, for guests joining sessions without an account, to
        remember your session identity for the duration of that session.
      </p>
    ),
  },
  {
    id: "childrens-privacy",
    heading: "Children's Privacy",
    body: (
      <p>
        RoomsCluster is intended for use by organizations, educators, and
        adult learners. We do not knowingly collect personal data from
        children without appropriate parental or institutional consent
        obtained by the enrolling organization.
      </p>
    ),
  },
  {
    id: "changes",
    heading: "Changes to This Policy",
    body: (
      <p>
        We will notify you by email of any material changes to this policy
        before they take effect.
      </p>
    ),
  },
  {
    id: "contact",
    heading: "Contact",
    body: (
      <p>
        Privacy questions or data requests:{" "}
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

export default function PrivacyPage() {
  return (
    <LegalPageLayout
      eyebrow="Legal"
      title="Privacy Policy"
      lastUpdated={
        <>
          September 3, 2026
        </>
      }
      intro="RoomsCluster is committed to protecting your personal data in accordance with the Nigeria Data Protection Regulation (NDPR) and applicable data protection law."
      sections={sections}
    />
  );
}
