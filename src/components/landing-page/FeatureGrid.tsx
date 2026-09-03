"use client";

import {
  Gauge,
  Hand,
  Users,
  Video,
  ArrowUpRight,
  Check,
} from "lucide-react";

export function FeatureGrid() {
  const features = [
    {
      icon: Users,
      number: "01",
      title: "Groups & enrollment",
      description:
        "Organize learners into groups and control exactly who can access each session.",
      points: [
        "Email-based access",
        "Enrollment management",
        "Optional access expiry",
      ],
      featured: true,
    },
    {
      icon: Gauge,
      number: "02",
      title: "Member portal",
      description:
        "Give every learner a dedicated space to find their classes, join sessions, and access recordings.",
      points: [
        "Personal dashboard",
        "Upcoming sessions",
        "Recording library",
      ],
    },
    {
      icon: Hand,
      number: "03",
      title: "Real-time engagement",
      description:
        "Keep learners involved with the tools they need to participate, ask questions, and interact.",
      points: [
        "Live Q&A",
        "Polls & chat",
        "Hand raising",
      ],
    },
    {
      icon: Video,
      number: "04",
      title: "Recording & replay",
      description:
        "Automatically capture your sessions so learners can revisit lessons whenever they need.",
      points: [
        "Session recordings",
        "On-demand access",
        "Replay from the portal",
      ],
    },
  ];

  return (
    <section
      id="features"
      className="relative overflow-hidden bg-surface-50 py-20 md:py-28"
    >
      {/* Background decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        <div className="absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-primary-100/40 blur-3xl" />

        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(#0f172a 1px, transparent 1px), linear-gradient(90deg, #0f172a 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        {/* Feature grid */}
        <div className="grid gap-5 md:grid-cols-2">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <article
                key={feature.title}
                className={[
                  "group relative overflow-hidden rounded-2xl border p-7 md:p-8",
                  "transition-all duration-500 ease-out",
                  "motion-safe:animate-[featureIn_0.7s_ease-out_both]",
                  "hover:-translate-y-1.5 hover:shadow-2xl",
                  feature.featured
                    ? "border-primary-200 bg-primary-600 text-white shadow-xl shadow-primary-600/10"
                    : "border-surface-200 bg-white hover:border-primary-100",
                ].join(" ")}
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                {/* Hover glow */}
                <div
                  className={[
                    "pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full blur-3xl",
                    "opacity-0 transition-opacity duration-500 group-hover:opacity-100",
                    feature.featured
                      ? "bg-white/20"
                      : "bg-primary-200/50",
                  ].join(" ")}
                />

                {/* Decorative number */}
                <div
                  className={[
                    "absolute right-7 top-7 text-xs font-semibold tracking-widest",
                    feature.featured
                      ? "text-white/40"
                      : "text-ink-900/15",
                  ].join(" ")}
                >
                  {feature.number}
                </div>

                {/* Icon */}
                <div
                  className={[
                    "relative mb-8 flex h-12 w-12 items-center justify-center rounded-xl",
                    "transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3",
                    feature.featured
                      ? "bg-white/15 text-white"
                      : "bg-primary-50 text-primary-600",
                  ].join(" ")}
                >
                  <Icon size={23} strokeWidth={1.8} />
                </div>

                {/* Content */}
                <div className="relative">
                  <h3
                    className={[
                      "text-xl font-semibold tracking-tight",
                      feature.featured
                        ? "text-white"
                        : "text-ink-900",
                    ].join(" ")}
                  >
                    {feature.title}
                  </h3>

                  <p
                    className={[
                      "mt-3 max-w-md text-sm leading-6",
                      feature.featured
                        ? "text-white/70"
                        : "text-ink-700/60",
                    ].join(" ")}
                  >
                    {feature.description}
                  </p>

                  {/* Feature points */}
                  <div className="mt-6 flex flex-wrap gap-x-5 gap-y-3">
                    {feature.points.map((point) => (
                      <div
                        key={point}
                        className={[
                          "flex items-center gap-2 text-xs font-medium",
                          feature.featured
                            ? "text-white/80"
                            : "text-ink-700/70",
                        ].join(" ")}
                      >
                        <span
                          className={[
                            "flex h-4 w-4 items-center justify-center rounded-full",
                            feature.featured
                              ? "bg-white/15 text-white"
                              : "bg-primary-50 text-primary-600",
                          ].join(" ")}
                        >
                          <Check size={10} strokeWidth={3} />
                        </span>

                        {point}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Arrow */}
                <div
                  className={[
                    "absolute bottom-7 right-7 flex h-9 w-9 items-center justify-center rounded-full",
                    "transition-all duration-500",
                    "translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100",
                    feature.featured
                      ? "bg-white text-primary-600"
                      : "bg-primary-600 text-white",
                  ].join(" ")}
                >
                  <ArrowUpRight size={17} />
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* Local animation */}
      <style jsx>{`
        @keyframes featureIn {
          from {
            opacity: 0;
            transform: translateY(18px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          @keyframes featureIn {
            from,
            to {
              opacity: 1;
              transform: none;
            }
          }
        }
      `}</style>
    </section>
  );
}