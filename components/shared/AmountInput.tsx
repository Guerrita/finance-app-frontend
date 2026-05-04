"use client"

import { forwardRef } from "react"
import { NumericFormat, NumericFormatProps } from "react-number-format"
import { cn } from "@/lib/utils"

const CURRENCY_DECIMALS: Record<string, number> = {
  COP: 0, CLP: 0, ARS: 0, MXN: 0,
  BRL: 2, USD: 2, EUR: 2, PEN: 2,
}

interface AmountInputProps
  extends Omit<NumericFormatProps, "onChange" | "onValueChange"> {
  currency?: string
  onValueChange?: (value: number | undefined) => void
  error?: boolean
  className?: string
}

export const AmountInput = forwardRef<HTMLInputElement, AmountInputProps>(
  ({ currency = "COP", onValueChange, error, className, ...props }, ref) => {
    const decimals = CURRENCY_DECIMALS[currency] ?? 2

    return (
      <NumericFormat
        getInputRef={ref}
        thousandSeparator="."
        decimalSeparator=","
        decimalScale={decimals}
        allowNegative={false}
        onValueChange={(values) => onValueChange?.(values.floatValue)}
        className={cn(
          "flex h-11 w-full rounded-md border bg-surface-muted px-3 py-2",
          "text-sm font-medium tabular-nums",
          "placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error
            ? "border-destructive focus-visible:ring-destructive"
            : "border-input",
          className
        )}
        {...props}
      />
    )
  }
)

AmountInput.displayName = "AmountInput"
