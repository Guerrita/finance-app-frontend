import { cn } from "@/lib/utils"
import { getCategoryIcon, getCategoryLabel } from "@/lib/utils/categories"

interface CategoryBadgeProps {
  categoryId: string
  locale?: "es" | "en"
  className?: string
}

export function CategoryBadge({
  categoryId,
  locale = "es",
  className,
}: CategoryBadgeProps) {
  const icon = getCategoryIcon(categoryId)
  const label = getCategoryLabel(categoryId)

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1",
        "rounded-sm bg-muted text-muted-foreground",
        "text-xs font-medium",
        className
      )}
    >
      <span aria-hidden>{icon}</span>
      {label}
    </span>
  )
}
