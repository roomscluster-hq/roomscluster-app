import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { NavBar } from "@/components/landing-page/NavBar";
import { Footer } from "@/components/landing-page/Footer";

export interface LegalSection {
  id: string;
  heading: string;
  body: ReactNode;
}

interface LegalPageLayoutProps {
  eyebrow: string;
  title: string;
  lastUpdated: ReactNode;
  intro?: ReactNode;
  sections: LegalSection[];
}

export function LegalPageLayout({
  eyebrow,
  title,
  lastUpdated,
  intro,
  sections,
}: LegalPageLayoutProps) {
  return (
    <div className="bg-surface-0">
      <NavBar />

      <header className="bg-surface-50 border-b border-surface-200 pt-32 pb-12 md:pt-40 md:pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-600">
            {eyebrow}
          </span>
          <h1 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight text-ink-900">
            {title}
          </h1>
          <p className="mt-4 text-sm text-ink-700/50">
            Last updated: {lastUpdated}
          </p>
          {intro && (
            <p className="mt-4 text-ink-700/70 leading-relaxed max-w-2xl">
              {intro}
            </p>
          )}
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        {/* Mobile table of contents */}
        <details className="lg:hidden group mb-10 bg-surface-50 border border-surface-200 rounded-card px-4">
          <summary className="flex items-center justify-between gap-4 py-3.5 cursor-pointer list-none text-sm font-semibold text-ink-900">
            On this page
            <ChevronDown
              size={16}
              className="text-ink-700/40 shrink-0 transition-transform group-open:rotate-180"
            />
          </summary>
          <nav className="pb-4">
            <ul className="space-y-2.5">
              {sections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="text-sm text-ink-700/60 hover:text-primary-600 transition-colors"
                  >
                    {section.heading}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </details>

        <div className="lg:grid lg:grid-cols-[220px_1fr] lg:gap-12">
          {/* Sticky desktop table of contents */}
          <aside className="hidden lg:block">
            <nav className="sticky top-24">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-700/40 mb-4">
                On this page
              </p>
              <ul className="space-y-3 border-l border-surface-200">
                {sections.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="block pl-4 -ml-px border-l-2 border-transparent text-sm text-ink-700/60 hover:text-ink-900 hover:border-surface-300 transition-colors"
                    >
                      {section.heading}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* Content */}
          <div className="max-w-[70ch] space-y-12">
            {sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-24">
                <h2 className="text-xl font-bold text-ink-900 tracking-tight mb-4">
                  {section.heading}
                </h2>
                <div className="space-y-4 text-[15px] text-ink-700/80 leading-7">
                  {section.body}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
