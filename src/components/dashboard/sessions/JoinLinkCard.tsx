"use client";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface JoinLinkCardProps {
  joinUrl: string;
}

export function JoinLinkCard({ joinUrl }: JoinLinkCardProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(joinUrl);
    toast.success("Link copied to clipboard");
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <h2 className="font-semibold text-ink-900">Session Join Link</h2>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3">
          <code className="flex-1 bg-surface-50 border border-surface-200 rounded-lg px-3 py-2 text-sm text-ink-700 truncate">
            {joinUrl}
          </code>
          <Button variant="secondary" size="sm" onClick={handleCopy}>
            Copy
          </Button>
        </div>
        <p className="text-xs text-ink-700/40 mt-2">
          Share this link with your attendees
        </p>
      </CardContent>
    </Card>
  );
}
