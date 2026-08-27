"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  ClipboardList,
  Folder,
  Gauge,
  Hand,
  Link2,
  Video,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSubdomain } from "@/contexts/SubdomainContext";
import { Spinner } from "@/components/ui/spinner";
import Image from "next/image";

// ── Animated mock of the live room UI — the hero's signature element ──
function LiveRoomMock() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 2200);
    return () => clearInterval(interval);
  }, []);

  const messages = [
    { name: "Amaka", text: "Can you share the slides after?" },
    { name: "David", text: "Loud and clear 👍" },
    { name: "Priya", text: "Joining from Lagos!" },
  ];
  const visibleMessage = messages[tick % messages.length];

  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="bg-ink-900 rounded-modal shadow-2xl border border-white/10 overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-white text-sm font-medium">
              Q3 Product Walkthrough
            </span>
            <span className="flex items-center gap-1 text-xs bg-success-600 text-white px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              LIVE
            </span>
          </div>
          <span className="text-xs text-white/40">42 attending</span>
        </div>

        {/* Video tiles */}
        <div className="grid grid-cols-2 gap-1.5 p-3">
          {["AM", "DK", "PR", "+39"].map((initials, i) => (
            <div
              key={i}
              className="aspect-video rounded-lg bg-linear-to-br from-ink-700 to-ink-900 flex items-center justify-center"
            >
              <span className="text-white/60 text-xs font-semibold">
                {initials}
              </span>
            </div>
          ))}
        </div>

        {/* Chat strip */}
        <div className="px-3 pb-3">
          <div className="bg-white/5 rounded-lg px-3 py-2 flex items-start gap-2 transition-opacity duration-500">
            <span className="text-primary-500 text-xs font-medium shrink-0">
              {visibleMessage.name}
            </span>
            <span className="text-white/70 text-xs truncate">
              {visibleMessage.text}
            </span>
          </div>
        </div>
      </div>

      {/* Floating stat card */}
      <div className="absolute -bottom-4 -right-4 bg-surface-0 rounded-card shadow-raised border border-surface-200 px-4 py-3 hidden sm:block">
        <p className="text-xs text-ink-700/50">Joined in</p>
        <p className="text-lg font-bold text-ink-900">8 seconds</p>
      </div>
    </div>
  );
}

// ── Nav — transparent over the dark hero, glassy once scrolled past it ──
function NavBar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 60);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const linkClass = cn(
    "transition-colors",
    scrolled
      ? "text-ink-700 hover:text-ink-900"
      : "text-white/70 hover:text-white",
  );

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-surface-0/80 backdrop-blur-sm shadow-raised"
          : "bg-transparent",
      )}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="text-lg font-bold text-primary-600 tracking-tight"
          >
            <Image
              src={"/logo2.png"}
              alt="logo.png"
              width={160}
              height={48}
              className="h-10 object-cover"
              priority
            />
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <a href="#features" className={linkClass}>
              Features
            </a>
            <a href="#how-it-works" className={linkClass}>
              How it works
            </a>
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className={cn("hidden sm:inline text-sm font-medium", linkClass)}
          >
            Sign in
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

function Hero() {
  return (
    <section className="relative bg-ink-900 overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 25%, rgba(36,84,224,0.25), transparent 60%)",
        }}
      />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 pt-32 pb-14 md:pt-40 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-8">
          <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
          <span className="text-white/70 text-xs font-mono tracking-wider uppercase">
            Built for hosts who run real sessions
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight tracking-tight">
          Go live in seconds.
          <br />
          Run the room with confidence.
        </h1>

        <p className="text-white/60 text-lg mt-6 max-w-xl mx-auto leading-relaxed">
          RoomsCluster is the webinar platform built for hosts — schedule a
          session, share one link, and manage your room without fighting the
          software.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
          <Link
            href="/register"
            className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-white px-7 py-3.5 rounded-lg font-semibold transition-colors shadow-lg shadow-primary-600/20"
          >
            Create your first session
          </Link>
          <a
            href="#how-it-works"
            className="w-full sm:w-auto text-center px-7 py-3.5 rounded-lg font-semibold text-white border border-white/20 hover:bg-white/10 transition-colors"
          >
            See how it works
          </a>
        </div>

        <p className="text-xs text-white/40 mt-5">
          No credit card required · Start hosting in under a minute
        </p>
      </div>

      {/* Product mock */}
      <div className="relative px-4 sm:px-6 pb-20 md:pb-28">
        <div className="relative max-w-md mx-auto">
          <div
            className="absolute -inset-6 bg-primary-600/20 rounded-modal blur-3xl"
            aria-hidden="true"
          />
          <div className="relative">
            <LiveRoomMock />
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureBento() {
  const features = [
    {
      icon: Link2,
      title: "One link, no friction",
      description:
        "Attendees join from a browser — no app to download, no account to create.",
    },
    {
      icon: Hand,
      title: "Hand-raise, built in",
      description:
        "Guests raise their hand, you bring them on mic and camera with one click.",
    },
    {
      icon: Gauge,
      title: "Built for scale",
      description:
        "Run sessions up to 1,000 participants without the room slowing down.",
    },
  ];

  return (
    <section id="features" className="py-16 md:py-24 bg-surface-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="max-w-xl mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-ink-900 tracking-tight">
            Everything a host actually needs
          </h2>
          <p className="text-ink-700/60 mt-3">
            Not a video call with extra buttons. A room built around the job of
            running a session.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="bg-surface-0 border border-surface-200 rounded-card p-6 flex flex-col gap-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-raised"
              >
                <div className="w-11 h-11 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600">
                  <Icon size={22} />
                </div>
                <div>
                  <h3 className="font-semibold text-ink-900">{f.title}</h3>
                  <p className="text-sm text-ink-700/60 mt-1.5 leading-relaxed">
                    {f.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      title: "Create a session",
      description:
        "Give it a title, set a time, or start instantly. Takes 30 seconds.",
    },
    {
      title: "Share the link",
      description:
        "Send your join link by email, chat, or post it anywhere. No accounts needed to join.",
    },
    {
      title: "Run the room",
      description:
        "Bring guests on mic, manage chat, switch to whiteboard, and end whenever you're done.",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-24 border-t border-surface-200"
    >
      <h2 className="text-2xl md:text-3xl font-bold text-ink-900 tracking-tight mb-12">
        From idea to live, in three steps
      </h2>

      <div className="grid md:grid-cols-3 gap-8">
        {steps.map((step, i) => (
          <div key={step.title} className="relative">
            <div className="text-5xl font-bold text-surface-200 mb-3">
              {String(i + 1).padStart(2, "0")}
            </div>
            <h3 className="font-semibold text-ink-900 text-lg">{step.title}</h3>
            <p className="text-sm text-ink-700/60 mt-2 leading-relaxed">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Two-panel bento — workspace organization + attendance export ──
function ContentBento() {
  return (
    <section className="py-16 md:py-24 bg-surface-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-12 gap-5 items-stretch">
          {/* Workspace / folders */}
          <div className="lg:col-span-7 bg-surface-0 border border-surface-200 rounded-card p-8 flex flex-col justify-between">
            <div>
              <span className="inline-block bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-xs font-semibold mb-4">
                Workspace Control
              </span>
              <h3 className="text-xl md:text-2xl font-bold text-ink-900 mb-3">
                Organize sessions the way your team actually works
              </h3>
              <p className="text-ink-700/60 max-w-md mb-6">
                Group sessions into folders, switch between personal and shared
                workspaces, and keep every recording and transcript where you
                can find it.
              </p>
              <Link
                href="/register"
                className="text-primary-600 font-semibold text-sm inline-flex items-center gap-1.5 group"
              >
                Explore workspaces
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
            </div>
            <div className="flex gap-3 mt-8">
              {[Folder, Video, ClipboardList].map((Icon, i) => (
                <div
                  key={i}
                  className="w-14 h-14 rounded-lg bg-surface-50 border border-surface-200 flex items-center justify-center text-primary-600"
                >
                  <Icon size={22} />
                </div>
              ))}
            </div>
          </div>

          {/* Attendance / export */}
          <div className="lg:col-span-5 bg-ink-900 rounded-card p-8 flex flex-col justify-between text-white">
            <div>
              <div className="w-11 h-11 rounded-lg bg-white/10 flex items-center justify-center text-primary-500 mb-6">
                <ClipboardList size={22} />
              </div>
              <h3 className="text-xl font-bold mb-3">
                Know exactly who showed up
              </h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Full attendance with join and leave times. Export the list — and
                the chat transcript — as CSV or TXT the moment a session ends.
              </p>
            </div>
            <div className="mt-8">
              <div className="flex items-end gap-1.5 h-12 mb-3">
                {[55, 85, 70].map((h, i) => (
                  <div
                    key={i}
                    className="w-full bg-primary-500/20 rounded-sm h-full relative overflow-hidden"
                  >
                    <div
                      className="absolute bottom-0 inset-x-0 bg-primary-500/60"
                      style={{ height: `${h}%` }}
                    />
                  </div>
                ))}
              </div>
              <p className="text-xs font-mono text-white/40">
                CSV · TXT · Instant export
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-24">
      <div className="relative bg-primary-600 rounded-modal px-6 sm:px-8 md:px-16 py-14 md:py-20 text-center overflow-hidden">
        <div
          className="absolute -top-24 -right-24 w-72 h-72 bg-white/10 rounded-full blur-3xl"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-24 -left-24 w-72 h-72 bg-ink-900/20 rounded-full blur-3xl"
          aria-hidden="true"
        />
        <div className="relative">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
            Your next session is one link away
          </h2>
          <p className="text-white/70 mt-3 max-w-md mx-auto">
            Create a free account and host your first webinar today.
          </p>
          <Link
            href="/register"
            className="inline-block mt-8 bg-white text-primary-700 px-8 py-3.5 rounded-lg font-semibold hover:bg-surface-50 transition-colors"
          >
            Get started free
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-surface-0 border-t border-surface-200 py-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid sm:grid-cols-3 gap-10 mb-10">
          <div>
            <span className="font-bold text-primary-600 text-lg">
              RoomsCluster
            </span>
            <p className="text-sm text-ink-700/60 mt-3 max-w-xs">
              The webinar platform built for hosts who run real sessions.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-ink-900 mb-4">Product</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href="#features"
                  className="text-ink-700/60 hover:text-primary-600 transition-colors"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#how-it-works"
                  className="text-ink-700/60 hover:text-primary-600 transition-colors"
                >
                  How it works
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-ink-900 mb-4">Account</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/login"
                  className="text-ink-700/60 hover:text-primary-600 transition-colors"
                >
                  Sign in
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="text-ink-700/60 hover:text-primary-600 transition-colors"
                >
                  Sign up
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="pt-6 border-t border-surface-200 text-sm text-ink-700/40">
          © {new Date().getFullYear()} RoomsCluster
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  const { slug, isLoading } = useSubdomain();

  if (slug) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-0">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="bg-surface-0">
      <NavBar />
      <Hero />
      <FeatureBento />
      <HowItWorks />
      <ContentBento />
      <FinalCTA />
      <Footer />
    </div>
  );
}
