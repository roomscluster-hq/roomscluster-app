import Image from "next/image";
import Link from "next/link";

export function Footer() {
  const productLinks = [
    { label: "Features", href: "/#features" },
    { label: "Pricing", href: "/pricing" },
    { label: "FAQ", href: "/#faq" },
  ];

  const companyLinks = [
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  const accountLinks = [
    { label: "Log in", href: "/login" },
    { label: "Sign up", href: "/register" },
  ];

  const legalLinks = [
    { label: "Terms of Service", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Refund & Cancellation", href: "/refunds" },
  ];

  return (
    <footer className="border-t border-surface-200 bg-[#F7F8FA]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Main footer */}
        <div className="grid grid-cols-2 gap-10 py-14 md:grid-cols-5 md:gap-8 md:py-16">
          {/* Brand */}
          <div className="col-span-2 md:col-span-2">
            <Link href="/" className="inline-flex items-center">
              <Image
                src="/logo2.png"
                alt="RoomsCluster"
                width={160}
                height={48}
                className="h-10 object-cover"
              />
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-6 text-ink-700/60">
              Structured enrollment, live sessions, recording, and Naira billing
              for training organizations and academies.
            </p>

            <p className="mt-4 text-xs text-ink-700/40">
              Built for organizations that take online learning seriously.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-sm font-semibold text-ink-900">Product</h3>

            <ul className="mt-4 space-y-3">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-ink-700/60 transition-colors hover:text-ink-900"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-ink-900">Company</h3>

            <ul className="mt-4 space-y-3">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-ink-700/60 transition-colors hover:text-ink-900"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-sm font-semibold text-ink-900">Account</h3>

            <ul className="mt-4 space-y-3">
              {accountLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-ink-700/60 transition-colors hover:text-ink-900"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Legal */}
        <div className="border-t border-surface-200 py-7">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-700/40">
                Legal
              </h3>

              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
                {legalLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-xs text-ink-700/50 transition-colors hover:text-ink-900"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <p className="text-xs text-ink-700/40">
              Payments for paid plans are processed in Nigerian Naira.
            </p>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-surface-200 py-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-ink-700/40">
              © {new Date().getFullYear()} RoomsCluster. All rights reserved.
            </p>

            <p className="text-xs text-ink-700/40">
              Live learning, structured.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
