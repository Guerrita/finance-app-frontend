"use client"

import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  text?: string
  className?: string
  fullPage?: boolean
}

export function LoadingSpinner({
  text = "Cargando...",
  className,
  fullPage = false,
}: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 p-8",
        fullPage && "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm",
        className
      )}
    >
      <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      {text && <p className="text-sm font-medium text-muted-foreground">{text}</p>}
    </div>
  )
}
