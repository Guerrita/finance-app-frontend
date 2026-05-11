"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import {
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
} from "lucide-react"

import { useTrends } from "@/lib/api/endpoints/reports"
import { useAuthStore } from "@/store/auth.store"
import { formatCurrency, safeParseDate } from "@/lib/utils/format"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { ROUTES } from "@/lib/utils/constants"
import type { TrendDirection } from "@/types/api"

// ─── Helpers ──────────────────────────────────────────────────────────────────

const RANGE_OPTIONS = [3, 6, 12, 24] as const
type Range = typeof RANGE_OPTIONS[number]

function formatMonthShort(monthStr: string | number): string {
  try {
    // If it's a month string like "2024-05", safeParseDate handles it.
    // If it's a number, it handles it as well.
    const date = safeParseDate(monthStr)
    return format(date, "MMM", { locale: es })
  } catch {
    return String(monthStr)
  }
}

function compactAmount(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `$${Math.round(value / 1_000)}K`
  return `$${Math.round(value)}`
}

function TrendChip({
  direction,
  invert = false,
  label,
}: {
  direction: TrendDirection
  invert?: boolean
  label: string
}) {
  const isPositive = invert
    ? direction === "decreasing"
    : direction === "increasing"
  const isNeutral = direction === "stable"

  const colorCls = isNeutral
    ? "bg-muted text-muted-foreground"
    : isPositive
    ? "bg-green-100 text-green-700"
    : "bg-red-100 text-red-700"

  const Icon = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown
  const dirLabel =
    direction === "increasing" ? "Creciendo" : direction === "decreasing" ? "Reduciendo" : "Estable"

  return (
    <div className={cn("flex items-center gap-1.5 px-3 py-2 rounded-lg flex-1 min-w-0", colorCls)}>
      <Icon className="h-4 w-4 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs font-semibold truncate">{label}</p>
        <p className="text-xs opacity-80">{dirLabel}</p>
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <Card className="card-base">
      <CardContent className="p-4 space-y-3">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-48 w-full" />
      </CardContent>
    </Card>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function TrendsTab() {
  const [range, setRange] = useState<Range>(6)
  const router = useRouter()
  const currency = useAuthStore((s) => s.user?.preferred_currency ?? "COP")
  const { data, isLoading, error } = useTrends(range)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center gap-2">
          {RANGE_OPTIONS.map((r) => (
            <Skeleton key={r} className="h-8 w-12" />
          ))}
        </div>
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    )
  }

  if (error || !data) {
    return (
      <Card className="card-base">
        <CardContent className="p-8 flex flex-col items-center gap-3 text-center">
          <BarChart3 className="h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Error al cargar tendencias.</p>
        </CardContent>
      </Card>
    )
  }

  const {
    months_analyzed = 0,
    monthly_data = [],
    averages,
    trends,
    top_categories = [],
  } = data

  if (months_analyzed < 2 || !averages || !trends || monthly_data.length === 0) {
    return (
      <Card className="card-base">
        <CardContent className="p-8 flex flex-col items-center gap-3 text-center">
          <BarChart3 className="h-10 w-10 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">Datos insuficientes</p>
          <p className="text-xs text-muted-foreground max-w-xs">
            Necesitas al menos 2 meses de transacciones para ver tendencias.
          </p>
          <button
            onClick={() => router.push(ROUTES.transactions)}
            className="mt-2 text-xs font-medium text-brand-600 hover:underline underline-offset-2"
          >
            Ir a Transacciones →
          </button>
        </CardContent>
      </Card>
    )
  }

  const chartData = monthly_data.map((point) => ({
    ...point,
    monthLabel: formatMonthShort(point.month),
  }))

  return (
    <div className="space-y-6">

      {/* ── Selector de rango ─────────────────────────────── */}
      <div className="flex justify-center gap-2">
        {RANGE_OPTIONS.map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={cn(
              "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
              range === r
                ? "bg-brand-600 text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {r}M
          </button>
        ))}
      </div>

      {/* ── Chips de dirección de tendencia ───────────────── */}
      <div className="flex gap-2">
        <TrendChip direction={trends.income_trend} label="Ingresos" />
        <TrendChip direction={trends.expenses_trend} label="Gastos" invert />
        <TrendChip direction={trends.savings_trend} label="Balance" />
      </div>

      {/* ── Gráfica de evolución ───────────────────────────── */}
      <Card className="card-base">
        <div className="px-4 pt-4 pb-2 border-b border-border/50">
          <h3 className="text-sm font-semibold text-foreground">Evolución mensual</h3>
        </div>
        <CardContent className="px-4 pt-4 pb-4">
          <ResponsiveContainer width="100%" height={280} minWidth={1}>
            <LineChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis
                dataKey="monthLabel"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tickFormatter={compactAmount}
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={52}
              />
              <Tooltip
                formatter={(value, name) => [
                  name === "savings_rate"
                    ? `${(value as number).toFixed(1)}%`
                    : formatCurrency(value as number, currency),
                  name === "income"
                    ? "Ingresos"
                    : name === "expenses"
                    ? "Gastos"
                    : name === "balance"
                    ? "Balance"
                    : "Tasa ahorro",
                ]}
                labelFormatter={(label) => `Mes: ${label}`}
                cursor={{ stroke: "rgba(0,0,0,0.08)", strokeWidth: 1 }}
              />
              <Legend
                iconSize={10}
                wrapperStyle={{ fontSize: 12 }}
                formatter={(value) =>
                  value === "income"
                    ? "Ingresos"
                    : value === "expenses"
                    ? "Gastos"
                    : "Balance"
                }
              />
              <Line
                type="monotone"
                dataKey="income"
                stroke="#22C55E"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="expenses"
                stroke="#EF4444"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="balance"
                stroke="#3B82F6"
                strokeWidth={2}
                strokeDasharray="4 2"
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* ── Promedios del período (grid 2×2) ──────────────── */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="card-base">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground mb-1">Ingreso prom./mes</p>
            <p className="text-base font-bold tabular-nums text-green-600">
              {formatCurrency(averages.avg_income, currency)}
            </p>
          </CardContent>
        </Card>
        <Card className="card-base">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground mb-1">Gasto prom./mes</p>
            <p className="text-base font-bold tabular-nums text-red-600">
              {formatCurrency(averages.avg_expenses, currency)}
            </p>
          </CardContent>
        </Card>
        <Card className="card-base">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground mb-1">Balance prom./mes</p>
            <p
              className={cn(
                "text-base font-bold tabular-nums",
                averages.avg_balance >= 0 ? "text-blue-600" : "text-red-600"
              )}
            >
              {formatCurrency(averages.avg_balance, currency)}
            </p>
          </CardContent>
        </Card>
        <Card className="card-base">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground mb-1">Tasa ahorro prom.</p>
            <p className="text-base font-bold tabular-nums text-indigo-600">
              {(averages.avg_savings_rate ?? 0).toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Top categorías de gasto ───────────────────────── */}
      {top_categories.length > 0 && (
        <Card className="card-base">
          <div className="px-4 pt-4 pb-2 border-b border-border/50">
            <h3 className="text-sm font-semibold text-foreground">Top categorías de gasto</h3>
          </div>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="text-left border-b border-border/50">
                    <th className="px-4 py-2 text-xs font-medium text-muted-foreground w-8">#</th>
                    <th className="px-4 py-2 text-xs font-medium text-muted-foreground">Categoría</th>
                    <th className="px-4 py-2 text-xs font-medium text-muted-foreground text-right">Total</th>
                    <th className="px-4 py-2 text-xs font-medium text-muted-foreground w-40">% del total</th>
                  </tr>
                </thead>
                <tbody>
                  {top_categories.slice(0, 8).map((cat, i) => (
                    <tr key={cat.category} className="border-b border-border/30 last:border-0">
                      <td className="px-4 py-3 text-xs text-muted-foreground">{i + 1}</td>
                      <td className="px-4 py-3 text-sm font-medium text-foreground">{cat.category_name}</td>
                      <td className="px-4 py-3 text-sm font-semibold tabular-nums text-right">
                        {formatCurrency(cat.total_spent, currency)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-red-400"
                              style={{ width: `${Math.min(cat.percentage_of_total, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs tabular-nums text-muted-foreground w-10 text-right">
                            {cat.percentage_of_total.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
