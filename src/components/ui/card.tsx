import { cn } from "@/lib/utils";

interface CardProps {
  className?: string;
  children: React.ReactNode;
  /** "surface" = border only, for dense lists. "raised" = border + soft shadow, for primary content/cards/modals. */
  variant?: "surface" | "raised";
}

export function Card({ className, children, variant = "surface" }: CardProps) {
  return (
    <div
      className={cn(
        "bg-surface-0 rounded-card border border-surface-200",
        variant === "raised" && "shadow-raised",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children }: Omit<CardProps, "variant">) {
  return (
    <div className={cn("px-6 py-4 border-b border-surface-200", className)}>
      {children}
    </div>
  );
}

export function CardContent({ className, children }: Omit<CardProps, "variant">) {
  return (
    <div className={cn("px-6 py-4", className)}>
      {children}
    </div>
  );
}
