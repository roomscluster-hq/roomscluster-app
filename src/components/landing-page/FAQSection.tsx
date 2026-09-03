import { ChevronDown } from "lucide-react";

function FAQItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  return (
    <details className="group rounded-2xl border border-surface-200 bg-surface-0 px-5 transition-colors hover:border-surface-300">
      <summary className="flex items-center justify-between gap-5 py-5 cursor-pointer list-none">
        <span className="text-sm md:text-[15px] font-semibold text-ink-900">
          {question}
        </span>

        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-100 text-ink-700/50 transition-all group-open:bg-primary-50 group-open:text-primary-600">
          <ChevronDown
            size={16}
            className="transition-transform duration-200 group-open:rotate-180"
          />
        </span>
      </summary>

      <div className="overflow-hidden">
        <p className="max-w-2xl pb-5 pr-10 text-sm text-ink-700/60 leading-7">
          {answer}
        </p>
      </div>
    </details>
  );
}

export function FAQSection() {
  const faqs = [
    {
      question: "What is RoomsCluster?",
      answer:
        "RoomsCluster is a live learning platform built for academies, tutors, and organizations. You can organize learners into groups, control who gets access, host live sessions, and keep recordings and transcripts in one place.",
    },
    {
      question: "Do I need a credit card to get started?",
      answer:
        "No. You can start on the Free plan without entering payment details. Use it to create your organization and experience a real live session before deciding whether you need a paid plan.",
    },
    {
      question: "Can I invite and control access for my learners?",
      answer:
        "Yes. You can organize members into groups and invite them by email. Access to your sessions can be controlled so your classroom isn't simply an open link that anyone can join.",
    },
    {
      question: "How many people can join a live session?",
      answer:
        "RoomsCluster is designed for online classes, webinars, and group sessions. Your available capacity depends on your plan and session configuration. If you regularly run large sessions, we can help you choose the right plan.",
    },
    {
      question: "Are live sessions recorded?",
      answer:
        "Yes. Sessions can be recorded so learners can revisit the class afterwards. Recording availability and limits depend on your plan.",
    },
    {
      question: "Does RoomsCluster provide transcripts?",
      answer:
        "Yes. Supported plans include AI-powered transcription for recorded sessions, making it easier to turn live classes into searchable notes and learning resources.",
    },
    {
      question: "Can I use my academy's branding?",
      answer:
        "Yes. Business and Enterprise plans support organization branding, including your logo, visual identity, and custom subdomain so the experience feels like an extension of your own academy.",
    },
    {
      question: "Can I pay in Naira?",
      answer:
        "Yes. RoomsCluster's paid plans are billed in Nigerian Naira through Paystack, making it straightforward for Nigerian academies and organizations to subscribe.",
    },
    {
      question: "What happens when I reach my plan's limits?",
      answer:
        "You'll be notified when you reach a plan limit and can upgrade to a plan with more capacity or features. Your account won't be unexpectedly charged for moving to a higher plan.",
    },
    {
      question: "Can I cancel my subscription?",
      answer:
        "Yes. Paid plans don't require a long-term contract. You can cancel your subscription and continue using the plan according to the applicable billing period.",
    },
  ];

  return (
    <section
      id="faq"
      className="border-t border-surface-200 py-20 md:py-28"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="max-w-2xl mx-auto text-center mb-12 md:mb-14">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-600">
            FAQ
          </span>

          <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight text-ink-900">
            Questions, answered.
          </h2>

          <p className="mt-4 text-sm md:text-base text-ink-700/60 leading-relaxed">
            Everything you need to know before bringing your next class,
            cohort, or webinar to RoomsCluster.
          </p>
        </div>

        {/* FAQ */}
        <div className="space-y-3">
          {faqs.map((faq) => (
            <FAQItem key={faq.question} {...faq} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-10 rounded-3xl bg-ink-900 px-6 py-7 md:px-8 md:py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div>
              <p className="text-sm font-semibold text-white">
                Still have questions?
              </p>

              <p className="mt-1 text-sm text-white/45">
                We&apos;re happy to help you figure out the right setup for
                your academy.
              </p>
            </div>

            <a
              href="#contact"
              className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-ink-900 transition-transform hover:-translate-y-0.5"
            >
              Talk to us
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}