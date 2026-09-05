"use client";

import Link from "next/link";
import { Compass } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";

export default function NotFound() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-surface-0">
      <div className="text-center max-w-sm">
        <Compass size={40} className="text-primary-600 mx-auto mb-4" />
        <h1 className="text-xl font-semibold text-ink-900">This room doesn&apos;t exist</h1>
        <p className="text-ink-700/60 text-sm mt-2">
          The page you&apos;re looking for doesn&apos;t exist, may have moved, or the link might be broken.
        </p>
        <Link
          href={isAuthenticated ? "/dashboard" : "/"}
          className="inline-block mt-6 text-sm font-medium text-primary-600 hover:underline"
        >
          {isAuthenticated ? "Go to your dashboard" : "Go to homepage"}
        </Link>
        <p className="text-xs text-ink-700/40 mt-4">
          Think this is a mistake?{" "}
          <Link href="/contact" className="text-primary-600 hover:underline">
            Contact us
          </Link>
        </p>
      </div>
    </div>
  );
}
