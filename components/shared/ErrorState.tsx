import { AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({
  title = "Ocurrió un error",
  message,
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        "py-10 px-6 rounded-md bg-expense-subtle border border-expense/20",
        className
      )}
    >
      <AlertCircle className="h-8 w-8 text-expense mb-3" />
      <h3 className="text-sm font-semibold text-expense">{title}</h3>
      {message && (
        <p className="text-xs text-muted-foreground mt-1 font-mono">{message}</p>
      )}
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 text-xs font-medium text-brand-600 hover:text-brand-700 underline-offset-2 hover:underline"
        >
          Reintentar
        </button>
      )}
    </div>
  )
}
