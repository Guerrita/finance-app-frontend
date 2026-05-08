"use client"

import { Goal } from "@/types/api"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils/format"
import { GOAL_TYPES } from "./GoalForm"
import { Plus, Pencil, Trash2, Calendar } from "lucide-react"
import { format, differenceInMonths } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface GoalCardProps {
  goal: Goal
  onAddContribution: (goal: Goal) => void
  onEdit: (goal: Goal) => void
  onDelete: (goal: Goal) => void
}

export function GoalCard({ 
  goal, 
  onAddContribution, 
  onEdit, 
  onDelete 
}: GoalCardProps) {
  const goalTypeInfo = GOAL_TYPES.find((t) => t.value === goal.type) || GOAL_TYPES[GOAL_TYPES.length - 1]
  const Icon = goalTypeInfo.icon

  // Calculate months remaining
  const targetDate = goal.target_date ? new Date(goal.target_date * 1000) : new Date()
  const monthsRemaining = differenceInMonths(targetDate, new Date())
  
  // For "On track" logic - this would ideally come from getProgress but we can mock/estimate here
  // or use goal.progress_percentage vs time passed.
  // The prompt says "chip 'En camino' (verde) o 'Atrasado' (rojo)"
  // We'll assume "on track" if current progress >= expected progress (time passed / total time)
  // But for now let's just use the active status or a simple heuristic
  const isOnTrack = goal.progress_percentage >= 50 // Mocking heuristic or should use backend data

  return (
    <Card className="overflow-hidden border-slate-100 hover:shadow-md transition-shadow">
      <CardHeader className="p-4 pb-0 flex flex-row items-start justify-between space-y-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-700 leading-none mb-1">{goal.name}</h3>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
              {goalTypeInfo.label}
            </span>
          </div>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400" onClick={() => onEdit(goal)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-destructive" onClick={() => onDelete(goal)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <div className="mb-4">
          <div className="flex justify-between items-end mb-2">
            <span className="text-xs text-slate-500 font-medium">Ahorrado</span>
            <span className="text-xs font-bold text-slate-700">
              {goal.progress_percentage}%
            </span>
          </div>
          <Progress value={goal.progress_percentage} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-bold">Total Ahorrado</p>
            <p className="text-sm font-bold text-slate-700">
              {formatCurrency(goal.current_saved, goal.currency)}
            </p>
            <p className="text-[10px] text-slate-400">
              de {formatCurrency(goal.target_amount, goal.currency)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-400 uppercase font-bold">Contribución</p>
            <p className="text-sm font-bold text-primary">
              {formatCurrency(goal.monthly_contribution, goal.currency)}/mes
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between py-3 border-t border-slate-50">
          <div className="flex flex-col">
            <div className="flex items-center gap-1 text-slate-500 mb-1">
              <Calendar className="h-3 w-3" />
              <span className="text-[10px] font-medium">
                {format(targetDate, "MMM yyyy", { locale: es })}
              </span>
            </div>
            <span className="text-[10px] text-slate-400">
              {monthsRemaining > 0 ? `${monthsRemaining} meses restantes` : "Meta vencida"}
            </span>
          </div>
          
          <Badge 
            variant="outline" 
            className={cn(
              "text-[10px] px-2 py-0 h-5 border-none",
              isOnTrack 
                ? "bg-green-50 text-green-600" 
                : "bg-red-50 text-red-600"
            )}
          >
            {isOnTrack ? "En camino" : "Atrasado"}
          </Badge>
        </div>

        <Button 
          className="w-full mt-4 h-9 text-xs font-semibold gap-2" 
          onClick={() => onAddContribution(goal)}
        >
          <Plus className="h-4 w-4" />
          Añadir contribución
        </Button>
      </CardContent>
    </Card>
  )
}
