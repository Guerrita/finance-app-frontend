"use client"

import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PaginationControlsProps {
  hasMore: boolean
  isLoading: boolean
  onLoadMore: () => void
  count: number
  total?: number
  label?: string
}

export function PaginationControls({
  hasMore,
  isLoading,
  onLoadMore,
  count,
  total,
  label = "elementos",
}: PaginationControlsProps) {
  return (
    <div className="flex flex-col items-center gap-2 py-4">
      <p className="text-xs text-muted-foreground">
        Mostrando {count}{total ? ` de ${total}` : ""} {label}
      </p>
      {hasMore && (
        <Button
          variant="outline"
          size="sm"
          onClick={onLoadMore}
          disabled={isLoading}
          className="min-w-[140px]"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              Cargando...
            </>
          ) : (
            "Cargar más"
          )}
        </Button>
      )}
    </div>
  )
}
