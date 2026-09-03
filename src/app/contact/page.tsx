import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { NavBar } from "@/components/landing-page/NavBar";
import { Footer } from "@/components/landing-page/Footer";
import { ContactForm } from "@/components/contact/ContactForm";

export const metadata: Metadata = {
  title: "Contact — RoomsCluster",
  description:
    "Get in touch with the RoomsCluster team about support, billing, enterprise plans, or privacy requests.",
};

const directContacts = [
  {
    icon: Mail,
    label: "General & support",
    email: "support@roomscluster.com",
    note: "Questions, technical help, billing, or anything else related to your RoomsCluster account.",
  },
  {
    icon: Building2,
    label: "Sales & Enterprise",
    email: "admin@roomscluster.com",
    note: "For larger organizations, Enterprise plans, custom requirements, or partnership conversations.",
  },
  {
    icon: ShieldCheck,
    label: "Privacy & data requests",
    email: "support@roomscluster.com",
    note: "For requests relating to access, correction, deletion, or other privacy matters.",
  },
];

export default function ContactPage() {
  return (
    <div className="bg-surface-0">
      <NavBar />

      {/* Hero */}
      <header className="relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 50% 0%, rgba(224,231,255,0.9), transparent 55%)",
          }}
        />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 pt-32 pb-16 md:pt-40 md:pb-20 text-center">
          <span className="inline-flex items-center rounded-full border border-primary-100 bg-primary-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-primary-600">
            Contact
          </span>

          <h1 className="mt-5 text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-ink-900 leading-tight">
            Let&apos;s talk about your organization.
          </h1>

          <p className="mt-5 max-w-xl mx-auto text-base md:text-lg text-ink-700/60 leading-8">
            Whether you&apos;re evaluating RoomsCluster, already using it, or
            exploring an Enterprise setup, we&apos;d like to hear from you.
          </p>
        </div>
      </header>

      {/* Contact area */}
      <section className="border-t border-surface-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-24">
          <div className="grid lg:grid-cols-[1fr_360px] gap-10 lg:gap-16 items-start">
            {/* Form */}
            <div className="rounded-3xl border border-surface-200 bg-surface-0 p-6 sm:p-8 md:p-10 shadow-sm">
              <div className="mb-8">
                <h2 className="text-xl md:text-2xl font-bold text-ink-900">
                  Send us a message
                </h2>

                <p className="mt-2 text-sm text-ink-700/55 leading-6">
                  Tell us what you&apos;re working on and we&apos;ll point you
                  in the right direction.
                </p>
              </div>

              <ContactForm />
            </div>

            {/* Contact information */}
            <aside>
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-600">
                Get in touch
              </span>

              <h2 className="mt-3 text-2xl md:text-3xl font-bold tracking-tight text-ink-900">
                We&apos;re here to help.
              </h2>

              <p className="mt-3 text-sm text-ink-700/60 leading-6">
                Choose the option that best matches what you need.
              </p>

              <div className="mt-8 space-y-6">
                {directContacts.map((contact) => {
                  const Icon = contact.icon;

                  return (
                    <div key={contact.label}>
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                          <Icon size={17} />
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-ink-900">
                            {contact.label}
                          </p>

                          <a
                            href={`mailto:${contact.email}`}
                            className="mt-0.5 inline-block text-sm text-primary-600 hover:text-primary-700 hover:underline"
                          >
                            {contact.email}
                          </a>

                          <p className="mt-1.5 text-xs text-ink-700/50 leading-5">
                            {contact.note}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Response time */}
              <div className="mt-8 rounded-2xl border border-surface-200 bg-[#F7F8FA] p-5">
                <p className="text-sm font-semibold text-ink-900">
                  Response times
                </p>

                <p className="mt-1.5 text-xs text-ink-700/50 leading-5">
                  We&apos;re an early-stage team, so response times may vary.
                  We&apos;ll get back to you as soon as we can.
                </p>
              </div>

              {/* Enterprise */}
              <div className="mt-5 rounded-2xl bg-ink-900 p-5">
                <p className="text-sm font-semibold text-white">
                  Running a larger organization?
                </p>

                <p className="mt-2 text-xs text-white/45 leading-5">
                  Tell us about your organization and what you need. We can
                  discuss Enterprise options and custom requirements.
                </p>

                <Link
                  href="/pricing"
                  className="group inline-flex items-center gap-1.5 mt-4 text-xs font-semibold text-white"
                >
                  Explore plans
                  <ArrowRight
                    size={14}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}