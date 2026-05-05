"use client"

import { useState } from "react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion"
import { EmptyState } from "@/components/shared/EmptyState"
import { ErrorState } from "@/components/shared/ErrorState"
import { BarChart2, Download, TrendingUp, TrendingDown } from "lucide-react"
import { useMonthlyReport } from "@/lib/api/endpoints/reports"
import { formatCurrency, formatMonth } from "@/lib/utils/format"
import { getCategoryLabel } from "@/lib/utils/categories"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const PIE_COLORS = ["#3B82F6", "#22C55E", "#EF4444", "#F59E0B", "#8B5CF6", "#EC4899", "#14B8A6", "#F97316"]

function formatChartValue(value: number): string {
  const abs = Math.abs(value)
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `${(value / 1_000).toFixed(0)}K`
  return `${value}`
}

function VarianceChip({ variance, percentage }: { variance: number; percentage?: number }) {
  const isPositive = variance >= 0
  return (
    <span className={cn(
      "inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap",
      isPositive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
    )}>
      {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {variance > 0 ? "+" : ""}{formatCurrency(variance)}
      {percentage !== undefined && ` (${percentage > 0 ? "+" : ""}${percentage.toFixed(1)}%)`}
    </span>
  )
}

function ExpenseStatus({ variance_percentage }: { variance_percentage: number }) {
  if (variance_percentage <= 0)
    return <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">OK</span>
  if (variance_percentage <= 10)
    return <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700">Cuidado</span>
  return <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700">Excedido</span>
}

function ReportSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-white border-slate-100">
            <CardContent className="p-6 space-y-3">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-8 w-36" />
              <Skeleton className="h-5 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="bg-white border-slate-100">
        <CardContent className="p-6">
          <Skeleton className="h-4 w-48 mb-4" />
          <Skeleton className="h-72 w-full" />
        </CardContent>
      </Card>
      <Card className="bg-white border-slate-100">
        <CardContent className="p-6">
          <Skeleton className="h-4 w-40 mb-4" />
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    </div>
  )
}

interface MonthlyReportTabProps {
  month: string
}

export function MonthlyReportTab({ month }: MonthlyReportTabProps) {
  const { data, isLoading, error } = useMonthlyReport(month)
  const [expenseFilter, setExpenseFilter] = useState<"all" | "fixed" | "variable">("all")

  if (isLoading) return <ReportSkeleton />
  if (error) return <ErrorState message={error.message} />

  const hasData = data && (
    data.income_breakdown.length > 0 ||
    data.expense_breakdown.length > 0 ||
    data.summary.actual_income > 0 ||
    data.summary.actual_expenses > 0
  )

  if (!hasData) {
    return (
      <EmptyState
        icon={BarChart2}
        title="Sin datos para el período seleccionado"
        description={`No hay información disponible para ${formatMonth(month)}`}
      />
    )
  }

  const { summary, income_breakdown, expense_breakdown, categories_summary } = data!

  const barChartData = [
    { name: "Ingresos", planificado: summary.planned_income, real: summary.actual_income },
    { name: "Gastos", planificado: summary.planned_expenses, real: summary.actual_expenses },
  ]

  const pieData = categories_summary
    .filter((c) => c.actual > 0)
    .map((c) => ({ name: getCategoryLabel(c.category), value: c.actual }))

  const filteredExpenses =
    expenseFilter === "all"
      ? expense_breakdown
      : expense_breakdown.filter((e) => e.type === expenseFilter)

  const incomePlannedTotal = income_breakdown.reduce((s, i) => s + i.planned, 0)
  const incomeActualTotal = income_breakdown.reduce((s, i) => s + i.actual, 0)

  return (
    <div className="flex flex-col gap-6">
      {/* Section 1: Executive Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Income card */}
        <Card className="bg-white border-slate-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Ingresos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-slate-400">Planificado</span>
              <span className="tabular-nums font-medium text-slate-600">{formatCurrency(summary.planned_income)}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-slate-400">Real</span>
              <span className={cn(
                "tabular-nums font-bold text-xl",
                summary.actual_income >= summary.planned_income ? "text-green-600" : "text-red-600"
              )}>
                {formatCurrency(summary.actual_income)}
              </span>
            </div>
            <VarianceChip variance={summary.income_variance} percentage={summary.income_variance_percentage} />
          </CardContent>
        </Card>

        {/* Expenses card */}
        <Card className="bg-white border-slate-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Gastos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-slate-400">Planificado</span>
              <span className="tabular-nums font-medium text-slate-600">{formatCurrency(summary.planned_expenses)}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-slate-400">Real</span>
              <span className={cn(
                "tabular-nums font-bold text-xl",
                summary.actual_expenses <= summary.planned_expenses ? "text-green-600" : "text-red-600"
              )}>
                {formatCurrency(summary.actual_expenses)}
              </span>
            </div>
            <VarianceChip variance={summary.expense_variance} percentage={summary.expense_variance_percentage} />
          </CardContent>
        </Card>

        {/* Balance card */}
        <Card className="bg-white border-slate-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Balance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-slate-400">Planificado</span>
              <span className="tabular-nums font-medium text-slate-600">{formatCurrency(summary.planned_balance)}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-slate-400">Real</span>
              <span className={cn(
                "tabular-nums font-bold text-xl",
                summary.actual_balance >= summary.planned_balance ? "text-green-600" : "text-red-600"
              )}>
                {formatCurrency(summary.actual_balance)}
              </span>
            </div>
            <VarianceChip variance={summary.balance_variance} />
          </CardContent>
        </Card>
      </div>

      {/* Section 2: Comparative bar chart */}
      <Card className="bg-white border-slate-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-slate-700">Comparativa Planificado vs Real</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={formatChartValue} tick={{ fontSize: 11 }} width={56} />
                <Tooltip formatter={(value: unknown) => formatCurrency(Number(value))} />
                <Legend />
                <Bar dataKey="planificado" name="Planificado" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="real" name="Real" radius={[4, 4, 0, 0]}>
                  {barChartData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={
                        i === 0
                          ? entry.real >= entry.planificado ? "#22C55E" : "#EF4444"
                          : entry.real <= entry.planificado ? "#22C55E" : "#EF4444"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Income breakdown (collapsible) */}
      <Card className="bg-white border-slate-100">
        <CardContent className="pt-4 px-0 pb-0">
          <Accordion type="single" collapsible defaultValue="income">
            <AccordionItem value="income" className="border-0">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <span className="text-base font-semibold text-slate-700">Desglose de Ingresos</span>
              </AccordionTrigger>
              <AccordionContent className="pb-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[560px]">
                    <thead>
                      <tr className="border-y border-slate-100 bg-slate-50">
                        <th className="text-left px-6 py-3 font-medium text-slate-500">Fuente de ingreso</th>
                        <th className="text-right px-4 py-3 font-medium text-slate-500">Planificado</th>
                        <th className="text-right px-4 py-3 font-medium text-slate-500">Real</th>
                        <th className="text-right px-4 py-3 font-medium text-slate-500">Varianza</th>
                        <th className="text-right px-6 py-3 font-medium text-slate-500">Trans.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {income_breakdown.map((item) => (
                        <tr key={item.income_id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                          <td className="px-6 py-3">
                            <p className="font-medium text-slate-700">{item.name}</p>
                            <p className="text-xs text-slate-400">{getCategoryLabel(item.category)}</p>
                          </td>
                          <td className="text-right px-4 py-3 tabular-nums text-slate-500">{formatCurrency(item.planned)}</td>
                          <td className="text-right px-4 py-3 tabular-nums font-medium text-slate-800">{formatCurrency(item.actual)}</td>
                          <td className="text-right px-4 py-3">
                            <VarianceChip variance={item.variance} />
                          </td>
                          <td className="text-right px-6 py-3 text-slate-400 tabular-nums">{item.transactions_count}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-50 border-t border-slate-200 font-semibold">
                        <td className="px-6 py-3 text-slate-700">Total</td>
                        <td className="text-right px-4 py-3 tabular-nums text-slate-600">{formatCurrency(incomePlannedTotal)}</td>
                        <td className="text-right px-4 py-3 tabular-nums text-slate-800">{formatCurrency(incomeActualTotal)}</td>
                        <td className="text-right px-4 py-3">
                          <VarianceChip variance={incomeActualTotal - incomePlannedTotal} />
                        </td>
                        <td />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Section 4: Expense breakdown */}
      <Card className="bg-white border-slate-100">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="text-base font-semibold text-slate-700">Desglose de Gastos</CardTitle>
            <div className="flex gap-2">
              {(["all", "fixed", "variable"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setExpenseFilter(t)}
                  className={cn(
                    "min-h-[32px] px-3 rounded-full text-xs font-medium transition-colors",
                    expenseFilter === t
                      ? "bg-brand-600 text-white"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  )}
                >
                  {t === "all" ? "Todos" : t === "fixed" ? "Fijo" : "Variable"}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0 pt-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="border-y border-slate-100 bg-slate-50">
                  <th className="text-left px-6 py-3 font-medium text-slate-500">Nombre</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500">Tipo</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500">Categoría</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-500">Planificado</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-500">Real</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-500">Var. %</th>
                  <th className="text-right px-6 py-3 font-medium text-slate-500">Estado</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-400 text-xs">
                      Sin gastos para este filtro
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((item) => (
                    <tr key={item.expense_id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-3 font-medium text-slate-700">{item.name}</td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          "inline-flex px-2 py-0.5 rounded-full text-xs font-medium",
                          item.type === "fixed" ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"
                        )}>
                          {item.type === "fixed" ? "Fijo" : "Variable"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">{getCategoryLabel(item.category)}</td>
                      <td className="text-right px-4 py-3 tabular-nums text-slate-500">{formatCurrency(item.planned)}</td>
                      <td className="text-right px-4 py-3 tabular-nums font-medium text-slate-800">{formatCurrency(item.actual)}</td>
                      <td className={cn(
                        "text-right px-4 py-3 tabular-nums text-xs font-semibold",
                        item.variance_percentage > 10 ? "text-red-600" :
                        item.variance_percentage > 0 ? "text-yellow-600" : "text-green-600"
                      )}>
                        {item.variance_percentage > 0 ? "+" : ""}{item.variance_percentage.toFixed(1)}%
                      </td>
                      <td className="text-right px-6 py-3">
                        <ExpenseStatus variance_percentage={item.variance_percentage} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Section 5: Category summary */}
      {pieData.length > 0 && (
        <Card className="bg-white border-slate-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-slate-700">Resumen por Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row gap-6 items-start">
              <div className="h-64 w-full lg:w-72 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={56}
                      outerRadius={96}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: unknown) => formatCurrency(Number(v))} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="overflow-x-auto w-full">
                <table className="w-full text-sm min-w-[400px]">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left py-2 font-medium text-slate-500">Categoría</th>
                      <th className="text-right py-2 font-medium text-slate-500">Planificado</th>
                      <th className="text-right py-2 font-medium text-slate-500">Real</th>
                      <th className="text-right py-2 font-medium text-slate-500">Varianza</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories_summary.map((item, i) => (
                      <tr key={item.category} className="border-b border-slate-50">
                        <td className="py-2.5 flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                          />
                          <span>{getCategoryLabel(item.category)}</span>
                        </td>
                        <td className="text-right py-2.5 tabular-nums text-slate-500">{formatCurrency(item.planned)}</td>
                        <td className="text-right py-2.5 tabular-nums font-medium text-slate-800">{formatCurrency(item.actual)}</td>
                        <td className="text-right py-2.5">
                          <VarianceChip variance={item.variance} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Export PDF */}
      <div className="flex justify-end pb-4">
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => toast.info("Próximamente — exportación a PDF")}
        >
          <Download className="h-4 w-4" />
          Exportar PDF
        </Button>
      </div>
    </div>
  )
}
