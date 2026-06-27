import { cn } from "@/lib/utils";
import { SessionStatus } from "@/types";

interface BadgeProps {
  status: SessionStatus;
  className?: string;
}

const statusStyles: Record<SessionStatus, string> = {
  LIVE: "bg-green-100 text-green-700",
  SCHEDULED: "bg-blue-100 text-blue-700",
  ENDED: "bg-gray-100 text-gray-500",
};

export function StatusBadge({ status, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "text-xs font-medium px-2.5 py-1 rounded-full",
        statusStyles[status],
        className
      )}
    >
      {status}
    </span>
  );
}