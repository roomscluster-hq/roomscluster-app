"use client";

import { toast } from "sonner";

export function CopyJoinLink({ joinCode }: { joinCode: string }) {
  const joinUrl = `${window.location.origin}/room/${joinCode}`;

  return (
    <div className="flex items-center gap-3">
      <code className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 truncate">
        {joinUrl}
      </code>
      <button
        onClick={() => {
          navigator.clipboard.writeText(joinUrl);
          toast.success("Link copied to clipboard");
        }}
        className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition"
      >
        Copy
      </button>
    </div>
  );
}
