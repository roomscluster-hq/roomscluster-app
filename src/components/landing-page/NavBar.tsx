"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function NavBar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 60);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-surface-0/80 backdrop-blur-sm border-b border-surface-200"
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
            <Link href="/#features" className="hover:text-ink-900 transition-colors">
              Features
            </Link>
            <Link href="/#pricing" className="hover:text-ink-900 transition-colors">
              Pricing
            </Link>
            <Link href="/#faq" className="hover:text-ink-900 transition-colors">
              FAQ
            </Link>
            <Link href="/blog" className="hover:text-ink-900 transition-colors">
              Blog
            </Link>
            <Link href="/about" className="hover:text-ink-900 transition-colors">
              About
            </Link>
            <Link href="/contact" className="hover:text-ink-900 transition-colors">
              Contact
            </Link>
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
        </div>
      </div>
    </header>
  );
}
