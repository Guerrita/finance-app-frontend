"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils/format"
import { cn } from "@/lib/utils"

interface BudgetSummaryProps {
  totalIncome: number
  totalFixedExpenses: number
  totalVariableExpenses: number
  currency: string
}

export function BudgetSummary({
  totalIncome,
  totalFixedExpenses,
  totalVariableExpenses,
  currency,
}: BudgetSummaryProps) {
  const totalExpenses = totalFixedExpenses + totalVariableExpenses
  const balance = totalIncome - totalExpenses
  const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0
  const isPositive = balance >= 0

  return (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle>Resumen Proyectado</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Ingresos planificados</span>
            <span>{formatCurrency(totalIncome, currency)}</span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Gastos fijos</span>
            <span>{formatCurrency(totalFixedExpenses, currency)}</span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Gastos variables</span>
            <span>{formatCurrency(totalVariableExpenses, currency)}</span>
          </div>
        </div>

        <div className="pt-4 border-t">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-sm font-medium">Balance proyectado</p>
              <p className={cn(
                "text-2xl font-bold",
                isPositive ? "text-emerald-500" : "text-destructive"
              )}>
                {formatCurrency(balance, currency)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Tasa de ahorro</p>
              <p className="text-lg font-semibold">{Math.max(0, Math.round(savingsRate))}%</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
