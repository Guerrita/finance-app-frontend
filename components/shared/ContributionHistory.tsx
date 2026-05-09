"use client"

import { Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, safeParseDate } from "@/lib/utils/format"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"

const CONTRIBUTION_TYPE_LABELS: Record<string, string> = {
  regular: "Regular",
  extra: "Extra",
  initial: "Inicial",
  bonus: "Bono",
  gift: "Regalo",
  adjustment: "Ajuste",
  other: "Otro",
}

const CONTRIBUTION_TYPE_COLORS: Record<string, string> = {
  regular: "bg-blue-50 text-blue-600",
  extra: "bg-green-50 text-green-600",
  initial: "bg-purple-50 text-purple-600",
  bonus: "bg-amber-50 text-amber-600",
  gift: "bg-pink-50 text-pink-600",
  adjustment: "bg-slate-50 text-slate-600",
  other: "bg-slate-50 text-slate-500",
}

export interface ContributionHistoryItem {
  contrib_id: string
  date: string
  amount: number
  notes?: string
  contribution_type?: string
  month: string
}

interface ContributionHistoryProps {
  items: ContributionHistoryItem[]
  currency: string
  isLoading: boolean
  onEdit: (contrib_id: string) => void
  onDelete: (contrib_id: string) => void
}

export function ContributionHistory({
  items,
  currency,
  isLoading,
  onEdit,
  onDelete,
}: ContributionHistoryProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 rounded-md bg-slate-100 animate-pulse" />
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-slate-400 text-center py-4">Sin contribuciones registradas</p>
    )
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item.contrib_id}
          className="flex items-center gap-3 p-3 rounded-md bg-slate-50 border border-slate-100"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-sm font-semibold text-slate-700 tabular-nums">
                {formatCurrency(item.amount, currency)}
              </span>
              {item.contribution_type && (
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] px-1.5 py-0 h-4 border-none font-medium",
                    CONTRIBUTION_TYPE_COLORS[item.contribution_type] ?? "bg-slate-50 text-slate-500",
                  )}
                >
                  {CONTRIBUTION_TYPE_LABELS[item.contribution_type] ?? item.contribution_type}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">
                {format(safeParseDate(item.date), "d MMM yyyy", { locale: es })}
              </span>
              {item.notes && (
                <span className="text-[11px] text-slate-400 truncate">· {item.notes}</span>
              )}
            </div>
          </div>

          <div className="flex gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-slate-400 hover:text-slate-600"
              onClick={() => onEdit(item.contrib_id)}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-slate-400 hover:text-destructive"
              onClick={() => onDelete(item.contrib_id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
