import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/utils/format"

interface CurrencyDisplayProps {
  amount: number
  currency?: string
  type?: "income" | "expense" | "neutral"
  size?: "sm" | "md" | "lg" | "xl"
  showSign?: boolean
  className?: string
}

const sizeClasses = {
  sm: "text-sm font-medium",
  md: "text-base font-semibold",
  lg: "text-lg font-semibold",
  xl: "text-3xl font-bold",
}

export function CurrencyDisplay({
  amount,
  currency = "COP",
  type = "neutral",
  size = "md",
  showSign = false,
  className,
}: CurrencyDisplayProps) {
  const colorClass =
    type === "income"
      ? "text-income"
      : type === "expense"
        ? "text-expense"
        : "text-foreground"

  const prefix = showSign && type === "income" ? "+" : ""

  return (
    <span
      data-amount
      className={cn("tabular-nums", sizeClasses[size], colorClass, className)}
    >
      {prefix}
      {formatCurrency(amount, currency)}
    </span>
  )
}
