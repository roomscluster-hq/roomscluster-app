import { cn } from "@/lib/utils";
import { SessionStatus } from "@/types";

interface BadgeProps {
  status: SessionStatus;
  className?: string;
}

const statusStyles: Record<SessionStatus, { pill: string; dot: string }> = {
  LIVE: { pill: "bg-success-100 text-success-600", dot: "bg-success-600" },
  SCHEDULED: { pill: "bg-primary-100 text-primary-700", dot: "bg-primary-600" },
  ENDED: { pill: "bg-surface-200 text-ink-700", dot: "bg-ink-700" },
};

const statusLabels: Record<SessionStatus, string> = {
  LIVE: "Live",
  SCHEDULED: "Scheduled",
  ENDED: "Ended",
};

export function StatusBadge({ status, className }: BadgeProps) {
  const styles = statusStyles[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full",
        styles.pill,
        className
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          styles.dot,
          status === "LIVE" && "animate-pulse"
        )}
        aria-hidden="true"
      />
      {statusLabels[status]}
    </span>
  );
}
