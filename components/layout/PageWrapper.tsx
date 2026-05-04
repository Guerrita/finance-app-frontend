import { cn } from "@/lib/utils"

interface PageWrapperProps {
  title: string
  description?: string
  action?: React.ReactNode
  children?: React.ReactNode
  className?: string
}

export function PageWrapper({
  title,
  description,
  action,
  children,
  className,
}: PageWrapperProps) {
  return (
    <div className={cn("flex-1 w-full max-w-7xl mx-auto", className)}>
      {/* Page header */}
      <div className="px-4 py-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">
              {title}
            </h1>
            {description && (
              <p className="text-muted-foreground mt-1 text-sm lg:text-base">
                {description}
              </p>
            )}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      </div>

      {/* Page content */}
      <div className="px-4 pb-12 lg:px-8">
        {children}
      </div>
    </div>
  )
}
