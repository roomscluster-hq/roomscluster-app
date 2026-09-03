import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  FileText,
  Palette,
  Play,
  Sparkles,
  Users,
} from "lucide-react";

export function FeatureBento() {
  return (
    <section className="py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-12 gap-5">
          {/* ─────────────────────────────────────────────
              BRANDING — LARGE FEATURE
          ───────────────────────────────────────────── */}
          <div className="lg:col-span-7 relative overflow-hidden rounded-3xl border border-surface-200 bg-surface-0 p-7 md:p-9">
            {/* Decorative background */}
            <div className="absolute -right-24 -top-24 w-72 h-72 rounded-full bg-primary-100/60 blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center">
                    <Palette size={18} />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-500">
                    Your brand
                  </span>
                </div>

                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary-50 text-primary-700 border border-primary-100">
                  Business
                </span>
              </div>

              <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-ink-900 max-w-lg">
                Make every live session feel like your own platform.
              </h3>

              <p className="mt-4 text-ink-700/60 leading-relaxed max-w-xl">
                Put your academy at the center. Use your own subdomain, logo,
                colors, and branded experience while RoomsCluster handles the
                live infrastructure underneath.
              </p>

              <Link
                href="/register"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700 group"
              >
                Explore business plans
                <ArrowUpRight
                  size={16}
                  className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Link>
            </div>

            {/* Browser preview */}
            <div className="relative mt-10 rounded-2xl border border-surface-200 bg-surface-50 shadow-sm overflow-hidden">
              {/* Browser bar */}
              <div className="h-9 px-3 flex items-center gap-1.5 border-b border-surface-200 bg-surface-100/70">
                <span className="w-2 h-2 rounded-full bg-surface-300" />
                <span className="w-2 h-2 rounded-full bg-surface-300" />
                <span className="w-2 h-2 rounded-full bg-surface-300" />

                <div className="ml-3 flex-1 max-w-xs h-5 rounded-md bg-surface-0 border border-surface-200 flex items-center px-2">
                  <span className="text-[9px] font-mono text-ink-500 truncate">
                    youracademy.roomscluster.com
                  </span>
                </div>
              </div>

              {/* Mock platform */}
              <div className="p-5 md:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white text-xs font-bold">
                      Y
                    </div>

                    <div>
                      <div className="h-2 w-24 rounded bg-ink-900/80" />
                      <div className="h-1.5 w-16 rounded bg-ink-900/10 mt-1.5" />
                    </div>
                  </div>

                  <div className="h-7 w-20 rounded-lg bg-primary-600/10" />
                </div>

                <div className="grid grid-cols-3 gap-3 mt-6">
                  <div className="h-20 rounded-xl bg-surface-0 border border-surface-200 p-3">
                    <div className="h-2 w-10 rounded bg-ink-900/10" />
                    <div className="h-5 w-14 rounded bg-ink-900/80 mt-3" />
                  </div>

                  <div className="h-20 rounded-xl bg-surface-0 border border-surface-200 p-3">
                    <div className="h-2 w-12 rounded bg-ink-900/10" />
                    <div className="h-5 w-10 rounded bg-primary-600/80 mt-3" />
                  </div>

                  <div className="h-20 rounded-xl bg-surface-0 border border-surface-200 p-3">
                    <div className="h-2 w-10 rounded bg-ink-900/10" />
                    <div className="h-5 w-12 rounded bg-ink-900/80 mt-3" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ─────────────────────────────────────────────
              RECORDING / AI — SMALL FEATURE
          ───────────────────────────────────────────── */}
          <div className="lg:col-span-5 relative overflow-hidden rounded-3xl bg-ink-900 p-7 md:p-9 text-white">
            {/* Glow */}
            <div className="absolute -right-20 -bottom-20 w-64 h-64 rounded-full bg-primary-500/10 blur-3xl pointer-events-none" />

            <div className="relative z-10 h-full flex flex-col">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-primary-400">
                  <Sparkles size={18} />
                </div>

                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-white/40">
                  Built for learning
                </span>
              </div>

              <h3 className="mt-8 text-2xl md:text-3xl font-bold tracking-tight max-w-sm">
                Turn every session into something your students can revisit.
              </h3>

              <p className="mt-4 text-sm md:text-base text-white/50 leading-relaxed">
                Record your classes, keep the conversation, and generate
                transcripts automatically so nothing valuable gets lost.
              </p>

              {/* Feature list */}
              <div className="mt-7 space-y-3">
                {[
                  { icon: Play, label: "HD session recording" },
                  { icon: FileText, label: "AI-generated transcripts" },
                  { icon: Users, label: "Designed for large classes" },
                ].map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 rounded-xl bg-white/[0.05] border border-white/[0.07] px-3.5 py-3"
                  >
                    <div className="w-7 h-7 rounded-lg bg-primary-500/10 text-primary-400 flex items-center justify-center">
                      <Icon size={14} />
                    </div>

                    <span className="text-sm text-white/70">{label}</span>

                    <Check
                      size={14}
                      className="ml-auto text-primary-400"
                    />
                  </div>
                ))}
              </div>

              {/* Capacity indicator */}
              <div className="mt-auto pt-10">
                <div className="rounded-2xl bg-white/[0.05] border border-white/[0.08] p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-white/40 font-mono">
                      CONCURRENT CAPACITY
                    </span>

                    <span className="text-xs font-semibold text-primary-400">
                      LOAD TESTED
                    </span>
                  </div>

                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold tracking-tight">
                      500
                    </span>
                    <span className="text-sm text-white/40 mb-1">
                      participants
                    </span>
                  </div>

                  <div className="mt-3 h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full w-[82%] rounded-full bg-primary-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}