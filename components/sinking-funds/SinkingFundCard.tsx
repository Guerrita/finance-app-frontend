"use client"

import { SinkingFund } from "@/types/api"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils/format"
import { 
  Plus, Pencil, Trash2, Calendar, 
  RefreshCw, Wallet 
} from "lucide-react"
import { format, differenceInDays } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { safeParseDate } from "@/lib/utils/format"

interface SinkingFundCardProps {
  fund: SinkingFund
  onAddContribution: (fund: SinkingFund) => void
  onEdit: (fund: SinkingFund) => void
  onDelete: (fund: SinkingFund) => void
}

const RECURRENCE_LABELS: Record<string, string> = {
  "one-time": "Único",
  "monthly": "Mensual",
  "quarterly": "Trimestral",
  "yearly": "Anual",
}

export function SinkingFundCard({ 
  fund, 
  onAddContribution, 
  onEdit, 
  onDelete 
}: SinkingFundCardProps) {
  const targetDate = safeParseDate(fund.expected_date)
  const daysRemaining = differenceInDays(targetDate, new Date())
  const progressPercentage = Math.min(100, Math.round((fund.current_saved / fund.expected_amount) * 100))
  
  const isOnTrack = progressPercentage >= (100 - (daysRemaining / 365) * 100) || true // Simple heuristic

  return (
    <Card className="overflow-hidden border-slate-100 hover:shadow-md transition-shadow">
      <CardHeader className="p-4 pb-0 flex flex-row items-start justify-between space-y-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-700 leading-none mb-1">{fund.name}</h3>
            <div className="flex items-center gap-1">
              <RefreshCw className="h-2.5 w-2.5 text-slate-400" />
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                {RECURRENCE_LABELS[fund.recurrence]}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400" onClick={() => onEdit(fund)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-destructive" onClick={() => onDelete(fund)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {fund.description && (
          <p className="text-xs text-slate-500 mb-4 line-clamp-1">{fund.description}</p>
        )}

        <div className="mb-4">
          <div className="flex justify-between items-end mb-2">
            <span className="text-xs text-slate-500 font-medium">Progreso</span>
            <span className="text-xs font-bold text-slate-700">
              {progressPercentage}%
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2 bg-indigo-50" />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-bold">Fondo Actual</p>
            <p className="text-sm font-bold text-slate-700">
              {formatCurrency(fund.current_saved, fund.currency)}
            </p>
            <p className="text-[10px] text-slate-400">
              objetivo {formatCurrency(fund.expected_amount, fund.currency)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-400 uppercase font-bold">Aporte Sugerido</p>
            <p className="text-sm font-bold text-indigo-600">
              {formatCurrency(fund.monthly_contribution, fund.currency)}/mes
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between py-3 border-t border-slate-50">
          <div className="flex flex-col">
            <div className="flex items-center gap-1 text-slate-500 mb-1">
              <Calendar className="h-3 w-3" />
              <span className="text-[10px] font-medium">
                {format(targetDate, "dd MMM yyyy", { locale: es })}
              </span>
            </div>
            <span className="text-[10px] text-slate-400">
              {daysRemaining > 0 ? `${daysRemaining} días restantes` : "Fecha alcanzada"}
            </span>
          </div>
          
          <Badge 
            variant="outline" 
            className={cn(
              "text-[10px] px-2 py-0 h-5 border-none",
              isOnTrack 
                ? "bg-green-50 text-green-600" 
                : "bg-amber-50 text-amber-600"
            )}
          >
            {isOnTrack ? "Al día" : "Atención"}
          </Badge>
        </div>

        <Button 
          className="w-full mt-4 h-9 text-xs font-semibold gap-2 bg-indigo-600 hover:bg-indigo-700" 
          onClick={() => onAddContribution(fund)}
        >
          <Plus className="h-4 w-4" />
          Añadir fondo
        </Button>
      </CardContent>
    </Card>
  )
}
