import Link from "next/link";
import { Gauge, Users, Video, ArrowRight } from "lucide-react";
import { LiveRoomMock } from "./LiveRoomMock";

export function Hero() {
  const chips = [
    {
      icon: Users,
      label: "Enrollment & access control",
    },
    {
      icon: Gauge,
      label: "Up to 500 participants",
    },
    {
      icon: Video,
      label: "Session recording & replay",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-surface-0">
      {/* Background */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[650px] w-[900px] -translate-x-1/2 rounded-full bg-primary-100/60 blur-3xl" />

        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(#0f172a 1px, transparent 1px), linear-gradient(90deg, #0f172a 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="absolute left-[8%] top-[35%] h-32 w-32 rounded-full bg-primary-200/30 blur-3xl" />

        <div className="absolute right-[8%] top-[25%] h-40 w-40 rounded-full bg-indigo-200/30 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        {/* Hero content */}
        <div className="mx-auto max-w-4xl pt-28 text-center md:pt-36">
          {/* Eyebrow */}
          <div className="mx-auto mb-7 inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50/80 px-3.5 py-1.5 backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-primary-500 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary-600" />
            </span>

            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-primary-700">
              Built for training organizations
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl font-bold leading-[1.08] tracking-[-0.04em] text-ink-900 sm:text-5xl md:text-6xl lg:text-7xl">
            Everything you need to{" "}
            <span className="text-primary-600">run training online.</span>
          </h1>

          {/* Description */}
          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-ink-700/65 sm:text-lg md:text-xl md:leading-8">
            Enroll learners, control access, host live classes, engage your
            audience, and keep every session available for replay — all in one
            platform.
          </p>

          {/* CTA */}
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-7 py-3.5 font-semibold text-white shadow-lg shadow-primary-600/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary-700 hover:shadow-xl hover:shadow-primary-600/25 sm:w-auto"
            >
              Start free
              <ArrowRight
                size={17}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>

            <a
              href="#features"
              className="inline-flex w-full items-center justify-center rounded-xl border border-surface-200 bg-white/70 px-7 py-3.5 font-semibold text-ink-900 backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-surface-300 hover:bg-white sm:w-auto"
            >
              See how it works
            </a>
          </div>

          {/* Chips */}
          <div className="mt-9 flex flex-wrap items-center justify-center gap-2.5">
            {chips.map((chip) => {
              const Icon = chip.icon;

              return (
                <div
                  key={chip.label}
                  className="group inline-flex items-center gap-2 rounded-full border border-surface-200 bg-white/80 px-4 py-2 text-sm font-medium text-ink-700 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-primary-100 hover:shadow-md"
                >
                  <Icon
                    size={15}
                    className="text-primary-600 transition-transform duration-300 group-hover:scale-110"
                  />

                  {chip.label}
                </div>
              );
            })}
          </div>
        </div>

        {/* Product preview */}
        <div className="relative mx-auto mt-16 max-w-5xl pb-20 md:mt-20 md:pb-28">
          {/* Glow */}
          <div
            aria-hidden="true"
            className="absolute -inset-8 rounded-[2rem] bg-primary-300/30 blur-3xl"
          />

          {/* Secondary glow */}
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-10 h-48 w-3/4 -translate-x-1/2 rounded-full bg-indigo-200/30 blur-3xl"
          />

          {/* Mockup */}
          <div
            className="
    relative overflow-visible rounded-2xl
    border border-surface-200
    bg-white
    shadow-[0_30px_80px_rgba(15,23,42,0.14)]
  "
          >
            <LiveRoomMock />
          </div>
        </div>
      </div>
    </section>
  );
}
