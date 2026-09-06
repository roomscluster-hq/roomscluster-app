"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Features", href: "/#features" },
  { label: "Pricing", href: "/#pricing" },
  { label: "FAQ", href: "/#faq" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 60);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu on Escape, and if the viewport grows past the
  // breakpoint where the panel is hidden by CSS anyway — otherwise the
  // state can be left stuck "open" for when the user shrinks back down.
  useEffect(() => {
    if (!menuOpen) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }

    function onResize() {
      if (window.innerWidth >= 1024) setMenuOpen(false);
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
    };
  }, [menuOpen]);

  const solidHeader = scrolled || menuOpen;

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        solidHeader
          ? "bg-surface-0/95 backdrop-blur-sm border-b border-surface-200"
          : "bg-transparent border-b border-transparent",
      )}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-lg font-bold text-primary-600 tracking-tight">
            <Image
              src={"/logo2.png"}
              alt="RoomsCluster"
              width={160}
              height={48}
              className="h-10 object-cover"
              priority
            />
          </Link>
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-ink-700 hover:[&>a]:text-ink-900">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-ink-900 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="hidden sm:inline text-sm font-medium text-ink-700 hover:text-ink-900 transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="text-sm bg-primary-600 hover:bg-primary-700 text-white px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <span className="sm:hidden">Get started</span>
            <span className="hidden sm:inline">Get started free</span>
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="lg:hidden flex items-center justify-center h-9 w-9 rounded-lg text-ink-700 hover:bg-surface-100 transition-colors"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <>
          <div
            className="fixed inset-x-0 top-16 bottom-0 -z-10 bg-ink-900/20 lg:hidden"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
          <nav className="lg:hidden border-t border-surface-200 bg-surface-0 px-4 sm:px-6 py-3 shadow-raised">
            <div className="flex flex-col">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="py-3 text-sm font-medium text-ink-700 hover:text-ink-900 border-b border-surface-100 last:border-b-0 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="sm:hidden py-3 text-sm font-medium text-ink-700 hover:text-ink-900 transition-colors"
              >
                Log in
              </Link>
            </div>
          </nav>
        </>
      )}
    </header>
  );
}
