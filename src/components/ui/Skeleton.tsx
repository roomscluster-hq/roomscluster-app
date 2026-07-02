
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-surface-200 rounded-md ${className}`}
    />
  );
}