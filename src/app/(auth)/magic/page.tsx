import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import { MagicLinkContent } from "./MagicLinkContent";

export default function MagicPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-3">
            <Spinner className="w-8 h-8 mx-auto" />
            <p className="text-sm text-ink-700/60">Signing you in...</p>
          </div>
        </div>
      }
    >
      <MagicLinkContent />
    </Suspense>
  );
}
