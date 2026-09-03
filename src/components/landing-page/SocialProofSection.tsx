import {
  CheckCircle2,
  GraduationCap,
  MessageSquare,
  ShieldCheck,
  Users,
} from "lucide-react";

export function SocialProofSection() {
  const proofPoints = [
    {
      icon: GraduationCap,
      eyebrow: "Built for academies",
      title: "Designed around how online learning actually works",
      description:
        "Groups, member enrollment, controlled access, live classrooms, recordings, and transcripts — all in one workflow.",
    },
    {
      icon: Users,
      eyebrow: "For real cohorts",
      title: "Give every learner the right room",
      description:
        "Invite members by email and organize them by cohort, course, or team so access stays under your control.",
    },
    {
      icon: ShieldCheck,
      eyebrow: "Your platform",
      title: "Keep your brand in front of your students",
      description:
        "Business plans let organizations use their own subdomain, logo, and visual identity across the live experience.",
    },
  ];

  return (
    <section className="py-20 md:py-28 border-t border-surface-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="max-w-2xl mb-12">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-600">
            Why RoomsCluster
          </span>

          <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight text-ink-900">
            Built around the way academies teach.
          </h2>

          <p className="mt-4 text-ink-700/60 leading-relaxed max-w-xl">
            RoomsCluster brings enrollment, access control, live sessions, and
            post-class content into one place, without forcing your academy
            into a generic meeting tool.
          </p>
        </div>

        {/* Proof cards */}
        <div className="grid md:grid-cols-3 gap-5">
          {proofPoints.map((point) => {
            const Icon = point.icon;

            return (
              <div
                key={point.title}
                className="group rounded-3xl border border-surface-200 bg-surface-0 p-6 md:p-7 hover:border-primary-200 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
                    <Icon size={19} />
                  </div>

                  <CheckCircle2
                    size={17}
                    className="text-primary-500/50 group-hover:text-primary-500 transition-colors"
                  />
                </div>

                <div className="mt-7">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-700/40">
                    {point.eyebrow}
                  </span>

                  <h3 className="mt-2 text-lg font-bold text-ink-900 leading-snug">
                    {point.title}
                  </h3>

                  <p className="mt-3 text-sm text-ink-700/60 leading-relaxed">
                    {point.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Early-stage credibility strip */}
        <div className="mt-5 rounded-3xl bg-ink-900 p-6 md:p-7">
          <div className="flex flex-col md:flex-row md:items-center gap-5">
            <div className="w-11 h-11 shrink-0 rounded-xl bg-primary-500/10 text-primary-400 flex items-center justify-center">
              <MessageSquare size={19} />
            </div>

            <div className="flex-1">
              <p className="text-sm font-semibold text-white">
                We&apos;re building RoomsCluster with academies, not just for
                them.
              </p>

              <p className="mt-1 text-sm text-white/45 leading-relaxed">
                Early feedback directly shapes the product, from enrollment
                workflows to classroom capacity and recording.
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-2 text-xs font-medium text-white/40">
              <span className="w-2 h-2 rounded-full bg-primary-500" />
              Early access
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}