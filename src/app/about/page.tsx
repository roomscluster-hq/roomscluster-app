import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { NavBar } from "@/components/landing-page/NavBar";
import { Footer } from "@/components/landing-page/Footer";

export const metadata: Metadata = {
  title: "About — RoomsCluster",
  description:
    "Learn why RoomsCluster exists and how we're building a better live learning experience for training organizations and academies.",
};

export default function AboutPage() {
  const principles = [
    {
      icon: ShieldCheck,
      title: "Access should be intentional",
      description:
        "A classroom shouldn't depend on whether someone has the right link. Organizations should know who is enrolled and who has access.",
    },
    {
      icon: Users,
      title: "Learners need structure",
      description:
        "Groups, cohorts, enrollment, live sessions, and recordings should work together instead of being scattered across different tools.",
    },
    {
      icon: Sparkles,
      title: "The experience should feel yours",
      description:
        "Your academy shouldn't have to disappear behind a generic meeting tool. RoomsCluster is designed to become part of your organization's learning experience.",
    },
  ];

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

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 pt-32 pb-20 md:pt-40 md:pb-28 text-center">
          <span className="inline-flex items-center rounded-full border border-primary-100 bg-primary-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-primary-600">
            About RoomsCluster
          </span>

          <h1 className="mt-5 text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-ink-900 leading-[1.08]">
            Live learning should feel like a platform, not a collection of
            links.
          </h1>

          <p className="mt-6 max-w-2xl mx-auto text-base md:text-lg text-ink-700/60 leading-8">
            RoomsCluster is building the infrastructure training organizations
            need to enroll learners, control access, run live sessions, and
            keep the learning experience organized.
          </p>
        </div>
      </header>

      {/* Story */}
      <section className="border-t border-surface-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 md:py-28">
          <div className="grid lg:grid-cols-[0.75fr_1.25fr] gap-12 lg:gap-20 items-start">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-600">
                Why we started
              </span>

              <h2 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight text-ink-900">
                The problem wasn&apos;t the video call.
              </h2>
            </div>

            <div className="space-y-6 text-base md:text-lg text-ink-700/70 leading-8">
              <p>
                Training organizations were already using tools like Zoom and
                Teams to run their classes. The problem was everything around
                the call.
              </p>

              <p>
                Enrollment lived somewhere else. Student lists lived
                somewhere else. Announcements happened in WhatsApp groups.
                Payments were handled separately. Then, when it was time for
                class, someone simply shared a meeting link.
              </p>

              <p>
                That works when you&apos;re running an occasional meeting. It
                becomes much harder when you&apos;re running structured cohorts,
                recurring classes, and hundreds of learners.
              </p>

              <p className="text-ink-900 font-medium">
                RoomsCluster was created to bring those pieces together.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Product philosophy */}
      <section className="bg-[#F7F8FA] border-y border-surface-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 md:py-28">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-600">
              What we believe
            </span>

            <h2 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight text-ink-900">
              Built around the organization, not just the meeting.
            </h2>

            <p className="mt-4 text-base text-ink-700/60 leading-7">
              We think live learning deserves the same structure and attention
              as the rest of your academy.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 mt-12">
            {principles.map((principle) => {
              const Icon = principle.icon;

              return (
                <div
                  key={principle.title}
                  className="rounded-3xl border border-surface-200 bg-surface-0 p-6 md:p-7"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                    <Icon size={19} />
                  </div>

                  <h3 className="mt-6 text-lg font-bold text-ink-900">
                    {principle.title}
                  </h3>

                  <p className="mt-3 text-sm text-ink-700/60 leading-6">
                    {principle.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Built for */}
      <section>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 md:py-28">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-center">
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                <GraduationCap size={21} />
              </div>

              <span className="block mt-6 text-xs font-semibold uppercase tracking-[0.14em] text-primary-600">
                Who we&apos;re building for
              </span>

              <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight text-ink-900">
                For organizations that run real learning programs.
              </h2>

              <p className="mt-5 text-base text-ink-700/60 leading-7">
                RoomsCluster is designed for training academies, tutoring
                organizations, professional education providers, and
                institutions running structured recurring classes.
              </p>
            </div>

            <div className="rounded-3xl border border-surface-200 bg-surface-0 p-6 md:p-8 shadow-sm">
              <p className="text-sm font-semibold text-ink-900">
                A better workflow
              </p>

              <div className="mt-6 space-y-4">
                {[
                  "Create your organization",
                  "Organize learners into groups",
                  "Enroll members by email",
                  "Run controlled live sessions",
                  "Keep recordings and transcripts available afterwards",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                      <Check size={14} />
                    </div>

                    <span className="text-sm text-ink-700/70">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Early stage */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20 md:pb-28">
        <div className="relative overflow-hidden rounded-[2rem] bg-ink-900 px-6 py-12 md:px-12 md:py-14">
          <div
            className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary-500/10 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-400">
              Where we are today
            </span>

            <h2 className="mt-4 text-2xl md:text-3xl font-bold tracking-tight text-white">
              We&apos;re early — and that&apos;s intentional.
            </h2>

            <p className="mt-4 text-sm md:text-base text-white/55 leading-7">
              RoomsCluster is being built deliberately, with a focus on
              solving the operational problems that come with running live
              learning at scale. We&apos;re listening closely to early
              organizations and using that feedback to shape what we build
              next.
            </p>

            <p className="mt-4 text-sm md:text-base text-white/55 leading-7">
              Our goal isn&apos;t to build another generic video conferencing tool.
              It&apos;s to build the infrastructure that makes running an online
              academy simpler.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-surface-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 md:py-28 text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-600">
            Try RoomsCluster
          </span>

          <h2 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight text-ink-900">
            Ready to see how it works?
          </h2>

          <p className="mt-4 max-w-xl mx-auto text-sm md:text-base text-ink-700/60 leading-7">
            Create your organization, invite your first members, and run a
            real session before committing to anything.
          </p>

          <Link
            href="/register"
            className="group inline-flex items-center gap-2 mt-8 bg-primary-600 hover:bg-primary-700 text-white px-7 py-3.5 rounded-xl font-semibold transition-all shadow-lg shadow-primary-600/20 hover:-translate-y-0.5"
          >
            Start free
            <ArrowRight
              size={17}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}