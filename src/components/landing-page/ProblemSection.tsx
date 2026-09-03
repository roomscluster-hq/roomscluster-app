import { CreditCard, Layers, ShieldOff, ArrowDown } from "lucide-react";

export function ProblemSection() {
  const problems = [
    {
      icon: ShieldOff,
      number: "01",
      title: "Anyone can get the link",
      description:
        "Shared meeting links make it difficult to control who joins. No enrollment, no roster, and no reliable way to verify access.",
    },
    {
      icon: Layers,
      number: "02",
      title: "Everything lives in different places",
      description:
        "Enrollment happens somewhere else, classes happen on another platform, and recordings disappear into chat threads.",
    },
    {
      icon: CreditCard,
      number: "03",
      title: "Your tools weren't built for your workflow",
      description:
        "Generic meeting tools give you a room, but leave you to figure out learner management, access, and everything around it.",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-surface-50 py-20 md:py-28">
      {/* Background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-primary-100/40 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        {/* Header */}
        <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary-600">
              <span className="h-1.5 w-1.5 rounded-full bg-primary-600" />
              The problem
            </div>

            <h2 className="text-3xl font-bold tracking-[-0.03em] text-ink-900 md:text-5xl">
              Running online training shouldn&apos;t feel this complicated.
            </h2>

            <p className="mt-4 max-w-xl text-base leading-7 text-ink-700/60 md:text-lg">
              Most tools were designed for meetings. Training organizations
              need much more than a meeting link.
            </p>
          </div>

          <div className="hidden md:block">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-surface-200 bg-white text-ink-500 shadow-sm">
              <ArrowDown size={18} />
            </div>
          </div>
        </div>

        {/* Problems */}
        <div className="grid gap-5 md:grid-cols-3">
          {problems.map((problem) => {
            const Icon = problem.icon;

            return (
              <article
                key={problem.title}
                className="
                  group relative overflow-hidden
                  rounded-2xl border border-surface-200
                  bg-white p-7
                  transition-all duration-500
                  hover:-translate-y-1
                  hover:border-primary-100
                  hover:shadow-xl hover:shadow-slate-900/5
                "
              >
                {/* Number */}
                <div className="absolute right-6 top-6 text-xs font-semibold tracking-widest text-ink-900/10">
                  {problem.number}
                </div>

                {/* Icon */}
                <div
                  className="
                    mb-8 flex h-12 w-12 items-center justify-center
                    rounded-xl bg-surface-100 text-ink-700
                    transition-all duration-500
                    group-hover:bg-primary-50
                    group-hover:text-primary-600
                    group-hover:scale-105
                  "
                >
                  <Icon size={21} />
                </div>

                <h3 className="text-lg font-semibold tracking-tight text-ink-900">
                  {problem.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-ink-700/60">
                  {problem.description}
                </p>

                {/* Bottom accent */}
                <div
                  className="
                    absolute bottom-0 left-0 h-0.5 w-0
                    bg-primary-600
                    transition-all duration-500
                    group-hover:w-full
                  "
                />
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}