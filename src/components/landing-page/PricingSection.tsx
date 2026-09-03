import Link from "next/link";
import { ArrowRight, Building2, Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { PLAN_DETAILS } from "@/lib/planDetails";

export function PricingSection() {
  const plans = [
    {
      key: "free",
      label: PLAN_DETAILS.FREE.label,
      eyebrow: "Get started",
      price: "₦0",
      period: "forever",
      description:
        "Experience live sessions and see how RoomsCluster fits your academy.",
      features: PLAN_DETAILS.FREE.features,
      cta: { label: "Start free", href: "/register" },
    },
    {
      key: "pro",
      label: PLAN_DETAILS.PRO.label,
      eyebrow: "For growing academies",
      price: "₦20,000",
      period: "/month",
      description:
        "Enroll members, control access, and run recurring classes without the manual work.",
      features: PLAN_DETAILS.PRO.features,
      cta: { label: "Start free", href: "/register" },
    },
    {
      key: "business",
      label: PLAN_DETAILS.BUSINESS.label,
      eyebrow: "For established organizations",
      price: "₦75,000",
      period: "/month",
      description:
        "Put your brand on the experience and give your organization a more professional live-learning platform.",
      features: PLAN_DETAILS.BUSINESS.features,
      cta: { label: "Start free", href: "/register" },
      highlighted: true,
    },
    {
      key: "enterprise",
      label: "Enterprise",
      eyebrow: "Built around you",
      price: "Custom",
      period: "",
      description:
        "Flexible infrastructure and support for organizations with larger or specialized requirements.",
      features: [
        "Custom teammates & co-hosts",
        "Custom session length",
        "Unlimited recording & transcription",
        "Dedicated support",
      ],
      cta: {
        label: "Talk to us",
        href: "mailto:hello@roomscluster.com",
      },
    },
  ];

  return (
    <section id="pricing" className="py-20 md:py-28 bg-surface-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="max-w-2xl mb-12 md:mb-14">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-600">
            Pricing
          </span>

          <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight text-ink-900">
            Start small. Scale when your academy does.
          </h2>

          <p className="mt-4 text-ink-700/60 leading-relaxed max-w-xl">
            Choose the level of access your organization needs. Every paid
            plan is billed in Naira through Paystack.
          </p>
        </div>

        {/* Pricing grid */}
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4 items-stretch">
          {plans.map((plan) => {
            const highlighted = plan.highlighted;

            return (
              <div
                key={plan.key}
                className={cn(
                  "relative flex flex-col rounded-3xl p-6 md:p-7",
                  "transition-all duration-200",
                  highlighted
                    ? [
                        "bg-ink-900 text-white",
                        "ring-2 ring-primary-500",
                        "shadow-raised",
                        "xl:-translate-y-3",
                      ]
                    : "bg-surface-0 border border-surface-200",
                )}
              >
                {/* Popular badge */}
                {highlighted && (
                  <div className="absolute -top-3 left-6 inline-flex items-center gap-1.5 rounded-full bg-primary-600 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
                    <Sparkles size={12} />
                    Most popular
                  </div>
                )}

                {/* Plan heading */}
                <div>
                  <div
                    className={cn(
                      "text-[11px] font-semibold uppercase tracking-[0.12em]",
                      highlighted
                        ? "text-primary-400"
                        : "text-ink-700/40",
                    )}
                  >
                    {plan.eyebrow}
                  </div>

                  <h3
                    className={cn(
                      "mt-2 text-lg font-bold",
                      highlighted ? "text-white" : "text-ink-900",
                    )}
                  >
                    {plan.label}
                  </h3>
                </div>

                {/* Price */}
                <div className="mt-7">
                  <div className="flex items-baseline gap-1">
                    <span
                      className={cn(
                        "text-3xl md:text-4xl font-bold tracking-tight",
                        highlighted ? "text-white" : "text-ink-900",
                      )}
                    >
                      {plan.price}
                    </span>

                    {plan.period && (
                      <span
                        className={cn(
                          "text-sm",
                          highlighted
                            ? "text-white/40"
                            : "text-ink-700/50",
                        )}
                      >
                        {plan.period}
                      </span>
                    )}
                  </div>

                  <p
                    className={cn(
                      "mt-3 text-sm leading-relaxed min-h-[72px]",
                      highlighted
                        ? "text-white/50"
                        : "text-ink-700/60",
                    )}
                  >
                    {plan.description}
                  </p>
                </div>

                {/* Divider */}
                <div
                  className={cn(
                    "my-6 border-t",
                    highlighted
                      ? "border-white/10"
                      : "border-surface-200",
                  )}
                />

                {/* Features */}
                <div className="flex-1">
                  <p
                    className={cn(
                      "text-[11px] font-semibold uppercase tracking-[0.1em] mb-4",
                      highlighted
                        ? "text-white/30"
                        : "text-ink-700/40",
                    )}
                  >
                    Includes
                  </p>

                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className={cn(
                          "flex items-start gap-2.5 text-sm leading-relaxed",
                          highlighted
                            ? "text-white/70"
                            : "text-ink-700",
                        )}
                      >
                        <span
                          className={cn(
                            "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
                            highlighted
                              ? "bg-primary-500/15 text-primary-400"
                              : "bg-primary-50 text-primary-600",
                          )}
                        >
                          <Check size={11} strokeWidth={3} />
                        </span>

                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                <Link
                  href={plan.cta.href}
                  className={cn(
                    "mt-8 flex items-center justify-center gap-2 w-full rounded-xl px-4 py-3 text-sm font-semibold transition-all",
                    highlighted
                      ? "bg-primary-600 text-white hover:bg-primary-500"
                      : "border border-surface-200 bg-surface-0 text-ink-900 hover:bg-surface-50 hover:border-surface-300",
                  )}
                >
                  {plan.cta.label}

                  {highlighted && (
                    <ArrowRight
                      size={15}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  )}
                </Link>
              </div>
            );
          })}
        </div>

        {/* Enterprise note */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-2 text-center text-sm text-ink-700/50">
          <Building2 size={15} />
          <span>
            Need a custom setup?{" "}
            <Link
              href="mailto:hello@roomscluster.com"
              className="font-semibold text-ink-700 hover:text-primary-600 transition-colors"
            >
              Talk to our team
            </Link>{" "}
            about Enterprise.
          </span>
        </div>
      </div>
    </section>
  );
}