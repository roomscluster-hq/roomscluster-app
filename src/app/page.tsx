"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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
      <div className="bg-[#0F1729] rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-white text-sm font-medium">Q3 Product Walkthrough</span>
            <span className="flex items-center gap-1 text-xs bg-[#16A34A] text-white px-2 py-0.5 rounded-full">
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
              className="aspect-video rounded-lg bg-linear-to-br from-[#1E293B] to-[#0F1729] flex items-center justify-center"
            >
              <span className="text-white/60 text-xs font-semibold">{initials}</span>
            </div>
          ))}
        </div>

        {/* Chat strip */}
        <div className="px-3 pb-3">
          <div className="bg-white/5 rounded-lg px-3 py-2 flex items-start gap-2 transition-opacity duration-500">
            <span className="text-[#2563EB] text-xs font-medium shrink-0">
              {visibleMessage.name}
            </span>
            <span className="text-white/70 text-xs truncate">{visibleMessage.text}</span>
          </div>
        </div>
      </div>

      {/* Floating stat card */}
      <div className="absolute -bottom-4 -right-4 bg-white rounded-xl shadow-lg border border-gray-100 px-4 py-3 hidden sm:block">
        <p className="text-xs text-gray-400">Joined in</p>
        <p className="text-lg font-bold text-gray-900">8 seconds</p>
      </div>
    </div>
  );
}

function NavBar() {
  return (
    <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#0F1729] flex items-center justify-center">
            <span className="text-white text-xs font-bold">RC</span>
          </div>
          <span className="font-semibold text-gray-900">RoomsCluster</span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
          <a href="#features" className="hover:text-gray-900 transition">Features</a>
          <a href="#how-it-works" className="hover:text-gray-900 transition">How it works</a>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-gray-600 hover:text-gray-900 transition font-medium"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="text-sm bg-[#2563EB] hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            Get started free
          </Link>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="max-w-6xl mx-auto px-6 pt-16 pb-24 grid md:grid-cols-2 gap-12 items-center">
      <div>
        <p className="text-xs font-semibold text-[#2563EB] uppercase tracking-wider mb-4">
          Built for hosts who run real sessions
        </p>
        <h1 className="text-4xl md:text-5xl font-bold text-[#0F1729] leading-tight tracking-tight">
          Go live in seconds.
          <br />
          Run the room with confidence.
        </h1>
        <p className="text-gray-500 text-lg mt-5 leading-relaxed max-w-md">
          RoomsCluster is the webinar platform built for hosts — schedule a
          session, share one link, and manage your room without fighting the
          software.
        </p>

        <div className="flex items-center gap-4 mt-8">
          <Link
            href="/register"
            className="bg-[#2563EB] hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition"
          >
            Create your first session
          </Link>
          <a
            href="#how-it-works"
            className="text-gray-600 hover:text-gray-900 font-medium text-sm transition"
          >
            See how it works →
          </a>
        </div>

        <p className="text-xs text-gray-400 mt-4">
          No credit card required · Start hosting in under a minute
        </p>
      </div>

      <LiveRoomMock />
    </section>
  );
}

function Features() {
  const features = [
    {
      title: "One link, no friction",
      description:
        "Attendees join from a browser — no app to download, no account to create. Just the link.",
      icon: "🔗",
    },
    {
      title: "Hand-raise, built in",
      description:
        "Guests raise their hand, you bring them on mic and camera with one click. No separate tool.",
      icon: "✋",
    },
    {
      title: "Chat that doesn't disappear",
      description:
        "Every message is saved. Download the full transcript after the session ends.",
      icon: "💬",
    },
    {
      title: "Know who showed up",
      description:
        "Full attendance list with join and leave times, exportable as CSV for your records.",
      icon: "📋",
    },
    {
      title: "Whiteboard, when you need it",
      description:
        "Switch from video to a shared whiteboard mid-session without losing the room.",
      icon: "🖊️",
    },
    {
      title: "Built for scale",
      description:
        "Run sessions up to 1,000 participants without the room slowing down.",
      icon: "📈",
    },
  ];

  return (
    <section id="features" className="max-w-6xl mx-auto px-6 py-20 border-t border-gray-100">
      <div className="max-w-xl mb-12">
        <h2 className="text-3xl font-bold text-[#0F1729] tracking-tight">
          Everything a host actually needs
        </h2>
        <p className="text-gray-500 mt-3">
          Not a video call with extra buttons. A room built around the job of running a session.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {features.map((f) => (
          <div
            key={f.title}
            className="border border-gray-100 rounded-xl p-6 hover:border-gray-200 hover:shadow-sm transition"
          >
            <span className="text-2xl">{f.icon}</span>
            <h3 className="font-semibold text-[#0F1729] mt-4">{f.title}</h3>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">{f.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      title: "Create a session",
      description: "Give it a title, set a time, or start instantly. Takes 30 seconds.",
    },
    {
      title: "Share the link",
      description: "Send your join link by email, chat, or post it anywhere. No accounts needed to join.",
    },
    {
      title: "Run the room",
      description: "Bring guests on mic, manage chat, switch to whiteboard, and end whenever you're done.",
    },
  ];

  return (
    <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-20 border-t border-gray-100">
      <h2 className="text-3xl font-bold text-[#0F1729] tracking-tight mb-12">
        From idea to live, in three steps
      </h2>

      <div className="grid md:grid-cols-3 gap-8">
        {steps.map((step, i) => (
          <div key={step.title} className="relative">
            <div className="text-5xl font-bold text-gray-100 mb-3">
              {String(i + 1).padStart(2, "0")}
            </div>
            <h3 className="font-semibold text-[#0F1729] text-lg">{step.title}</h3>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20">
      <div className="bg-[#0F1729] rounded-2xl px-8 md:px-16 py-16 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
          Your next session is one link away
        </h2>
        <p className="text-white/60 mt-3 max-w-md mx-auto">
          Create a free account and host your first webinar today.
        </p>
        <Link
          href="/register"
          className="inline-block mt-8 bg-white text-[#0F1729] px-7 py-3 rounded-lg font-medium hover:bg-gray-100 transition"
        >
          Get started free
        </Link>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-sm text-gray-400">
        <span>© {new Date().getFullYear()} RoomsCluster</span>
        <div className="flex gap-6">
          <Link href="/login" className="hover:text-gray-600 transition">
            Sign in
          </Link>
          <Link href="/register" className="hover:text-gray-600 transition">
            Sign up
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div className="bg-[#FAFAF9] min-h-screen">
      <NavBar />
      <Hero />
      <Features />
      <HowItWorks />
      <FinalCTA />
      <Footer />
    </div>
  );
}