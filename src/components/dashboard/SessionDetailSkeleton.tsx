import { Skeleton } from "../ui/Skeleton";

export function SessionDetailSkeleton() {
  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-2">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border border-surface-200 rounded-xl p-5 space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-6 w-12" />
          </div>
        ))}
      </div>

      {/* Join link card */}
      <div className="border border-surface-200 rounded-xl p-5 mb-4 space-y-3">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>

      {/* Attendance table */}
      <div className="border border-surface-200 rounded-xl p-5 space-y-4">
        <Skeleton className="h-4 w-32" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}