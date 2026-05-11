"use client"

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/shared/EmptyState"
import { ErrorState } from "@/components/shared/ErrorState"
import { TrendingUp, DollarSign, Wallet, PiggyBank, BarChart2 } from "lucide-react"
import { useYearToDateReport } from "@/lib/api/endpoints/reports"
import { formatCurrency } from "@/lib/utils/format"
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

  const {
    summary,
    months_included = [],
    monthly_trend = [],
  } = data ?? {}

  if (!summary || monthly_trend.length === 0) {
    return (
      <EmptyState
        icon={BarChart2}
        title="Sin datos para el año actual"
        description="Registra ingresos y gastos para ver tu reporte anual"
      />
    )
  }

  const monthsElapsed = months_included.length
  const avgIncome = monthsElapsed > 0 ? summary.total_actual_income / monthsElapsed : 0
  const avgExpenses = monthsElapsed > 0 ? summary.total_actual_expenses / monthsElapsed : 0
  const savingsRate = summary.total_actual_income > 0
    ? (summary.total_balance / summary.total_actual_income) * 100
    : 0

  const lineChartData = monthly_trend.map((m) => ({
    name: shortMonthName(m.month),
    Ingresos: m.actual_income,
    Gastos: m.actual_expenses,
    Balance: m.balance,
  }))

  return (
    <div className="flex flex-col gap-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={DollarSign}
          iconBg="bg-green-50"
          iconColor="text-green-600"
          label="Ingreso acumulado"
          value={formatCurrency(summary.total_actual_income)}
          sub={`Prom. ${formatCurrency(avgIncome)}/mes`}
        />
        <KpiCard
          icon={Wallet}
          iconBg="bg-red-50"
          iconColor="text-red-600"
          label="Gasto acumulado"
          value={formatCurrency(summary.total_actual_expenses)}
          sub={`Prom. ${formatCurrency(avgExpenses)}/mes`}
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
          sub={`${monthsElapsed} ${monthsElapsed === 1 ? "mes" : "meses"} transcurridos`}
        />
      </div>

      {/* Evolución mensual */}
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
    </div>
  )
}
