import { cn } from "@/lib/utils"

interface SkeletonCardProps {
  lines?: number
  className?: string
}

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("rounded-md bg-muted animate-skeleton-pulse", className)}
    />
  )
}

export function SkeletonCard({ lines = 3, className }: SkeletonCardProps) {
  return (
    <div className={cn("card-base space-y-3", className)}>
      <Skeleton className="h-4 w-2/5" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn("h-3", i === lines - 1 ? "w-3/5" : "w-full")}
        />
      ))}
    </div>
  )
}
