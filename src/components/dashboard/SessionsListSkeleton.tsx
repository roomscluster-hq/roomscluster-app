import { Skeleton } from "../ui/Skeleton";

export function SessionsListSkeleton() {
  return (
    <div className="divide-y divide-surface-200">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center justify-between px-6 py-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-64" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-4 w-14" />
          </div>
        </div>
      ))}
    </div>
  );
}