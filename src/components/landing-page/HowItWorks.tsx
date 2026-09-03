import {
  ArrowRight,
  Check,
  FolderKanban,
  Radio,
  UserPlus,
} from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      number: "01",
      icon: FolderKanban,
      title: "Create your organization",
      description:
        "Set up your academy and organize members into Groups for cohorts, courses, or teams.",
      preview: (
        <div className="rounded-xl border border-surface-200 bg-surface-50 p-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-primary-100 flex items-center justify-center">
              <FolderKanban size={14} className="text-primary-600" />
            </div>
            <div>
              <div className="h-1.5 w-20 rounded bg-ink-900/20" />
              <div className="h-1 w-12 rounded bg-ink-900/10 mt-1.5" />
            </div>
          </div>

          <div className="space-y-2">
            {["Frontend Cohort", "Backend Cohort", "Design Team"].map(
              (item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 rounded-lg bg-surface-0 border border-surface-200 px-2.5 py-2"
                >
                  <div className="w-5 h-5 rounded bg-primary-50" />
                  <span className="text-[10px] text-ink-700">{item}</span>
                </div>
              )
            )}
          </div>
        </div>
      ),
    },
    {
      number: "02",
      icon: UserPlus,
      title: "Enroll your members",
      description:
        "Invite members by email and control exactly who gets access, including optional cohort expiry dates.",
      preview: (
        <div className="rounded-xl border border-surface-200 bg-surface-50 p-3">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-semibold text-ink-700">
              Add members
            </span>
            <span className="text-[9px] text-primary-600 font-medium">
              24 enrolled
            </span>
          </div>

          <div className="flex gap-2">
            <div className="flex-1 h-8 rounded-lg bg-surface-0 border border-surface-200 px-2.5 flex items-center">
              <span className="text-[9px] text-ink-700/40">
                member@email.com
              </span>
            </div>

            <div className="h-8 px-3 rounded-lg bg-primary-600 text-white flex items-center justify-center">
              <UserPlus size={12} />
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3">
            <Check size={12} className="text-primary-600" />
            <span className="text-[9px] text-ink-700/50">
              Access controlled by enrollment
            </span>
          </div>
        </div>
      ),
    },
    {
      number: "03",
      icon: Radio,
      title: "Go live",
      description:
        "Start your session and let enrolled members join. Recordings and transcripts are ready when class ends.",
      preview: (
        <div className="rounded-xl border border-surface-200 bg-surface-50 p-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
              <span className="text-[10px] font-semibold text-ink-700">
                Live session
              </span>
            </div>

            <span className="text-[9px] font-mono text-ink-700/40">
              01:42:18
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            <div className="h-14 rounded-lg bg-ink-900/90" />
            <div className="h-14 rounded-lg bg-ink-900/70" />
            <div className="h-14 rounded-lg bg-ink-900/50" />
          </div>

          <div className="flex items-center justify-between mt-3">
            <span className="text-[9px] text-ink-700/50">
              126 participants
            </span>

            <span className="text-[9px] font-medium text-primary-600">
              Recording on
            </span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section
      id="how-it-works"
      className="py-20 md:py-28 border-t border-surface-200"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="max-w-2xl mb-14">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-600">
            How it works
          </span>

          <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight text-ink-900">
            From enrollment to live, without the admin headache.
          </h2>

          <p className="mt-4 text-ink-700/60 leading-relaxed">
            Set up your organization once, control who gets access, and focus
            on delivering great sessions.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-5">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <div key={step.number} className="relative">
                {/* Connector */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-7 left-[calc(100%+4px)] w-3 z-20">
                    <ArrowRight
                      size={16}
                      className="text-surface-300"
                    />
                  </div>
                )}

                <div className="h-full rounded-3xl border border-surface-200 bg-surface-0 p-6 hover:border-primary-200 transition-colors">
                  {/* Number + icon */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-semibold text-ink-700/30">
                      {step.number}
                    </span>

                    <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
                      <Icon size={18} />
                    </div>
                  </div>

                  {/* Copy */}
                  <div className="mt-7">
                    <h3 className="text-lg font-bold text-ink-900">
                      {step.title}
                    </h3>

                    <p className="mt-2 text-sm text-ink-700/60 leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {/* UI preview */}
                  <div className="mt-7">{step.preview}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}