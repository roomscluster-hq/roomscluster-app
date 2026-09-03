import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

export function FinalCTA() {
  const benefits = [
    "Create your organization",
    "Invite your first members",
    "Run your first live session",
  ];

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20 md:py-28">
      <div className="relative overflow-hidden rounded-[2rem] bg-primary-600 px-6 py-14 sm:px-10 md:px-16 md:py-20">
        {/* Background decoration */}
        <div
          className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-white/10 blur-3xl"
          aria-hidden="true"
        />

        <div
          className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-ink-900/20 blur-3xl"
          aria-hidden="true"
        />

        <div
          className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white/80">
            Start with RoomsCluster
          </span>

          <h2 className="mt-5 text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
            Give your next cohort a better way to learn live.
          </h2>

          <p className="mt-5 max-w-xl mx-auto text-sm sm:text-base leading-7 text-white/70">
            Bring enrollment, access control, live classrooms, recordings, and
            transcripts together in one platform built for your academy.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/register"
              className="group inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-semibold text-primary-700 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-surface-50"
            >
              Start free
              <ArrowRight
                size={17}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>

            <Link
              href="#pricing"
              className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              View plans
            </Link>
          </div>

          {/* Reassurance */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {benefits.map((benefit) => (
              <div
                key={benefit}
                className="flex items-center gap-1.5 text-xs text-white/55"
              >
                <Check size={14} className="text-white/80" />
                {benefit}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}