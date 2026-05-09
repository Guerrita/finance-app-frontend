"use client"

import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, Cell,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/shared/EmptyState"
import { ErrorState } from "@/components/shared/ErrorState"
import { TrendingUp, DollarSign, Wallet, PiggyBank, BarChart2 } from "lucide-react"
import { useYearToDateReport } from "@/lib/api/endpoints/reports"
import { formatCurrency } from "@/lib/utils/format"
import { getCategoryLabel } from "@/lib/utils/categories"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"

function shortMonthName(month: string): string {
  const [y, m] = month.split("-")
  const name = format(new Date(Number(y), Number(m) - 1, 1), "MMM", { locale: es })
  return name.charAt(0).toUpperCase() + name.slice(1).replace(".", "")
}

function formatChartValue(value: number): string {
  const abs = Math.abs(value)
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `${(value / 1_000).toFixed(0)}K`
  return `${value}`
}

interface KpiCardProps {
  icon: React.ElementType
  iconBg: string
  iconColor: string
  label: string
  value: string
  sub?: string
}

function KpiCard({ icon: Icon, iconBg, iconColor, label, value, sub }: KpiCardProps) {
  return (
    <Card className="bg-white border-slate-100">
      <CardContent className="p-6 flex items-start gap-4">
        <div className={cn("p-3 rounded-full flex-shrink-0", iconBg, iconColor)}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-slate-500">{label}</p>
          <p className="text-xl font-bold text-slate-800 tabular-nums mt-0.5 truncate">{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  )
}

function YtdSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-white border-slate-100">
            <CardContent className="p-6 flex items-start gap-4">
              <Skeleton className="h-11 w-11 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-32" />
              </div>
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
    </div>
  )
}

export function YtdReportTab() {
  const { data, isLoading, error } = useYearToDateReport()

  if (isLoading) return <YtdSkeleton />
  if (error) return <ErrorState message={error.message} />
  if (!data || data.monthly_breakdown.length === 0) {
    return (
      <EmptyState
        icon={BarChart2}
        title="Sin datos para el año actual"
        description="Registra ingresos y gastos para ver tu reporte anual"
      />
    )
  }

  const { summary, monthly_breakdown, top_expense_categories, goals_progress } = data

  const savingsRate = summary.total_income > 0
    ? (summary.total_balance / summary.total_income) * 100
    : 0

  const lineChartData = monthly_breakdown.map((m) => ({
    name: shortMonthName(m.month),
    Ingresos: m.income,
    Gastos: m.expenses,
    Balance: m.balance,
  }))

  const topCategoriesData = top_expense_categories.map((c) => ({
    name: getCategoryLabel(c.category),
    total: c.total,
    percentage: c.percentage,
  }))

  return (
    <div className="flex flex-col gap-6">
      {/* Section 1: KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={DollarSign}
          iconBg="bg-green-50"
          iconColor="text-green-600"
          label="Ingreso acumulado"
          value={formatCurrency(summary.total_income)}
          sub={`Prom. ${formatCurrency(summary.avg_monthly_income)}/mes`}
        />
        <KpiCard
          icon={Wallet}
          iconBg="bg-red-50"
          iconColor="text-red-600"
          label="Gasto acumulado"
          value={formatCurrency(summary.total_expenses)}
          sub={`Prom. ${formatCurrency(summary.avg_monthly_expenses)}/mes`}
        />
        <KpiCard
          icon={TrendingUp}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          label="Balance acumulado"
          value={formatCurrency(summary.total_balance)}
        />
        <KpiCard
          icon={PiggyBank}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          label="Tasa de ahorro"
          value={`${savingsRate.toFixed(1)}%`}
          sub={`${data.months_elapsed} ${data.months_elapsed === 1 ? "mes" : "meses"} transcurridos`}
        />
      </div>

      {/* Section 2: Monthly evolution line chart */}
      <Card className="bg-white border-slate-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-slate-700">Evolución Mensual</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={288} minWidth={1}>
              <LineChart data={lineChartData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={formatChartValue} tick={{ fontSize: 11 }} width={56} />
                <Tooltip formatter={(value: unknown) => formatCurrency(Number(value))} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="Ingresos"
                  stroke="#22C55E"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="Gastos"
                  stroke="#EF4444"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="Balance"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Section 3: Top expense categories */}
      {top_expense_categories.length > 0 && (
        <Card className="bg-white border-slate-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-slate-700">Top Categorías de Gasto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row gap-6 items-start">
              <div className="w-full lg:w-80 flex-shrink-0">
                <ResponsiveContainer width="100%" height={256} minWidth={1}>
                  <BarChart
                    layout="vertical"
                    data={topCategoriesData}
                    margin={{ top: 4, right: 24, left: 0, bottom: 4 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                    <XAxis type="number" tickFormatter={formatChartValue} tick={{ fontSize: 10 }} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={80}
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip formatter={(value: unknown) => formatCurrency(Number(value))} />
                    <Bar dataKey="total" name="Total" radius={[0, 4, 4, 0]}>
                      {topCategoriesData.map((_, i) => (
                        <Cell
                          key={i}
                          fill={`hsl(${0 + i * 20}, 80%, ${55 - i * 3}%)`}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="overflow-x-auto w-full pt-2">
                <table className="w-full text-sm min-w-[320px]">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left py-2 font-medium text-slate-500">Categoría</th>
                      <th className="text-right py-2 font-medium text-slate-500">Total gastado</th>
                      <th className="text-right py-2 font-medium text-slate-500">% del total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {top_expense_categories.map((item) => (
                      <tr key={item.category} className="border-b border-slate-50">
                        <td className="py-2.5 text-slate-700">{getCategoryLabel(item.category)}</td>
                        <td className="text-right py-2.5 tabular-nums font-medium text-slate-800">
                          {formatCurrency(item.total)}
                        </td>
                        <td className="text-right py-2.5 tabular-nums text-slate-500">
                          {item.percentage.toFixed(1)}%
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

      {/* Section 4: Goals progress */}
      {goals_progress.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-slate-700 mb-3">Progreso de Metas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {goals_progress.map((goal) => (
              <Card key={goal.name} className="bg-white border-slate-100">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-700 truncate">{goal.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5 capitalize">{goal.type}</p>
                    </div>
                    <span className="text-sm font-bold text-brand-600 tabular-nums ml-2">
                      {(goal.progress ?? goal.progress_percentage ?? 0).toFixed(0)}%
                    </span>
                  </div>
                  <Progress value={Math.min(goal.progress ?? goal.progress_percentage ?? 0, 100)} className="h-2 mb-2" />
                  <div className="flex justify-between text-xs text-slate-500 tabular-nums">
                    <span>{formatCurrency(goal.current_saved)}</span>
                    <span>{formatCurrency(goal.target_amount)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
