"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RoomError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error("[Room Error]", error);
  }, [error]);

  return (
    <div className="h-screen bg-gray-900 flex flex-col items-center justify-center text-center px-6">
      <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
        <span className="text-2xl">⚠️</span>
      </div>
      <h2 className="text-xl font-semibold text-white">The session ran into a problem</h2>
      <p className="text-sm text-gray-400 mt-2 max-w-sm">
        Something interrupted this room. Your connection may have dropped, or
        the session may have ended. Try rejoining.
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
          className="text-gray-400 hover:text-white text-sm font-medium transition"
        >
          Leave room
        </button>
      </div>

      {process.env.NODE_ENV === "development" && (
        <details className="mt-8 text-left bg-gray-800 border border-gray-700 rounded-lg p-4 max-w-lg">
          <summary className="text-xs text-gray-500 cursor-pointer">
            Error details (dev only)
          </summary>
          <pre className="text-xs text-red-400 mt-2 whitespace-pre-wrap wrap-break-words">
            {error.message}
          </pre>
        </details>
      )}
    </div>
  );
}