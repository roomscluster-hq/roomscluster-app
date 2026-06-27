"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error("[Dashboard Error]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
      <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
        <span className="text-2xl">⚠️</span>
      </div>
      <h2 className="text-xl font-semibold text-gray-900">Something went wrong</h2>
      <p className="text-sm text-gray-500 mt-2 max-w-sm">
        This page ran into a problem loading your data. You can try again, or
        head back to your dashboard.
      </p>

      <div className="flex items-center gap-3 mt-6">
        <button
          onClick={reset}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          Try again
        </button>
        <button
          onClick={() => router.push("/dashboard")}
          className="text-gray-600 hover:text-gray-900 text-sm font-medium transition"
        >
          Back to dashboard
        </button>
      </div>

      {process.env.NODE_ENV === "development" && (
        <details className="mt-8 text-left bg-gray-50 border border-gray-200 rounded-lg p-4 max-w-lg">
          <summary className="text-xs text-gray-400 cursor-pointer">
            Error details (dev only)
          </summary>
          <pre className="text-xs text-red-600 mt-2 whitespace-pre-wrap wrap-break-words">
            {error.message}
          </pre>
        </details>
      )}
    </div>
  );
}