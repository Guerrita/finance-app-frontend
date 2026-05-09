"use client"

import Link from "next/link"
import { parseISO, format, fromUnixTime } from "date-fns"
import { es } from "date-fns/locale"
import { useQueryClient } from "@tanstack/react-query"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts"
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  PiggyBank,
} from "lucide-react"

import { useMonthContext } from "@/lib/context/month.context"
import { useAuthStore } from "@/store/auth.store"
import { useDashboard } from "@/lib/api/endpoints/dashboard"
import { PageWrapper } from "@/components/layout/PageWrapper"
import { ErrorState } from "@/components/shared/ErrorState"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatCurrency, formatMonth, safeParseDate } from "@/lib/utils/format"
import { getCategoryIcon } from "@/lib/utils/categories"
import { QUERY_KEYS, ROUTES } from "@/lib/utils/constants"
import { cn } from "@/lib/utils"
import type {
  DashboardData,
  DashboardAlert,
  DashboardCategoryExpense,
} from "@/types/api"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTxDate(dateStr: string | number): string {
  try {
    return format(safeParseDate(dateStr), "d MMM", { locale: es })
  } catch {
    return String(dateStr)
  }
}

function compactNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${Math.round(value / 1_000)}K`
  return String(Math.round(value))
}

function statusChip(progress: number) {
  if (progress > 100)
    return { label: "Excedido", cls: "bg-red-100 text-red-700 border border-red-200" }
  if (progress > 80)
    return { label: "Cuidado", cls: "bg-amber-100 text-amber-700 border border-amber-200" }
  return { label: "OK", cls: "bg-green-100 text-green-700 border border-green-200" }
}

function CircularRing({ value, size = 48 }: { value: number; size?: number }) {
  const r = (size - 8) / 2
  const circ = 2 * Math.PI * r
  const pct = Number.isFinite(value) ? value : 0
  const offset = circ - (Math.min(pct, 100) / 100) * circ
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#e2e8f0" strokeWidth={5} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="#4f46e5"
          strokeWidth={5}
          fill="none"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-2xs font-bold text-foreground">
        {Math.round(pct)}%
      </span>
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="card-base">
        <CardContent className="p-4">
          <Skeleton className="h-4 w-52 mb-3" />
          <Skeleton className="h-2 w-full mb-2" />
          <Skeleton className="h-3 w-32" />
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="card-base">
            <CardContent className="p-4 space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-7 w-28" />
              <Skeleton className="h-2 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="card-base">
        <CardContent className="p-4 space-y-4">
          <Skeleton className="h-4 w-40" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-2 w-full" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="card-base">
          <CardContent className="p-4 space-y-3">
            <Skeleton className="h-4 w-40" />
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>
        <Card className="card-base">
          <CardContent className="p-4">
            <Skeleton className="h-4 w-40 mb-4" />
            <Skeleton className="h-52 w-full" />
          </CardContent>
        </Card>
      </div>

      <Card className="card-base">
        <CardContent className="p-4 space-y-4">
          <div className="flex gap-3">
            <Skeleton className="h-9 w-36" />
            <Skeleton className="h-9 w-36" />
          </div>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Section: Alerts ──────────────────────────────────────────────────────────

function AlertsSection({ alerts }: { alerts: DashboardAlert[] }) {
  return (
    <div className="space-y-2">
      {alerts.map((alert, i) => (
        <div
          key={i}
          className={cn(
            "flex items-start gap-3 p-4 rounded-md border",
            alert.severity === "critical"
              ? "bg-red-50 border-red-200"
              : "bg-amber-50 border-amber-200"
          )}
        >
          <AlertTriangle
            className={cn(
              "h-5 w-5 mt-0.5 shrink-0",
              alert.severity === "critical" ? "text-red-600" : "text-amber-600"
            )}
          />
          <p
            className={cn(
              "flex-1 text-sm font-medium",
              alert.severity === "critical" ? "text-red-800" : "text-amber-800"
            )}
          >
            {alert.message}
          </p>
          {alert.action && (
            <span className="text-xs text-muted-foreground shrink-0">{alert.action}</span>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Section: Expenses by Category ────────────────────────────────────────────

function ExpensesByCategory({
  categories,
  currency,
}: {
  categories: DashboardCategoryExpense[]
  currency: string
}) {
  const computeProgress = (cat: DashboardCategoryExpense) =>
    cat.planned > 0 ? (cat.actual / cat.planned) * 100 : 0
  const sorted = [...categories].sort((a, b) => computeProgress(b) - computeProgress(a))
  return (
    <Card className="card-base">
      <div className="px-4 pt-4 pb-2 border-b border-border/50">
        <h3 className="text-sm font-semibold text-foreground">Gastos por Categoría</h3>
      </div>
      <CardContent className="px-4 pt-4 pb-4">
        {sorted.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Sin categorías registradas este mes
          </p>
        ) : (
          <div className="space-y-4">
            {sorted.map((cat) => {
              const progress = cat.planned > 0 ? (cat.actual / cat.planned) * 100 : 0
              const chip = statusChip(progress)
              return (
                <div key={cat.category} className="flex items-center gap-3">
                  <span className="text-xl shrink-0">{getCategoryIcon(cat.category)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium truncate">{cat.category_name}</p>
                      <span
                        className={cn(
                          "text-2xs font-semibold px-1.5 py-0.5 rounded shrink-0 ml-2",
                          chip.cls
                        )}
                      >
                        {chip.label}
                      </span>
                    </div>
                    <Progress value={Math.min(progress, 100)} className="h-1.5" />
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <p className="text-xs font-semibold tabular-nums">
                      {formatCurrency(cat.actual, currency)}
                    </p>
                    <p className="text-2xs text-muted-foreground tabular-nums">
                      / {formatCurrency(cat.planned, currency)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { month } = useMonthContext()
  const { data, isLoading, isFetching, error } = useDashboard(month)
  const queryClient = useQueryClient()
  const currency = useAuthStore((s) => s.user?.preferred_currency ?? "COP")

  function handleRefresh() {
    queryClient.invalidateQueries({ queryKey: ["dashboard"] })
  }

  const refreshBtn = (
    <Button
      variant="outline"
      size="sm"
      onClick={handleRefresh}
      disabled={isFetching}
      className="gap-2"
    >
      <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
      Actualizar
    </Button>
  )

  if (isLoading) {
    return (
      <PageWrapper title="Dashboard" action={refreshBtn}>
        <DashboardSkeleton />
      </PageWrapper>
    )
  }

  if (error || !data) {
    return (
      <PageWrapper title="Dashboard">
        <ErrorState
          message={(error as Error)?.message}
          onRetry={handleRefresh}
        />
      </PageWrapper>
    )
  }

  const s = data?.financial_summary
  const monthLabel = formatMonth(month)

  const chartData = s ? [
    {
      name: "Ingresos",
      Planificado: s.total_planned_income,
      Real: s.total_actual_income,
      isIncome: true,
    },
    {
      name: "Gastos",
      Planificado: s.total_planned_expenses,
      Real: s.total_actual_expenses,
      isIncome: false,
    },
  ] : []

  return (
    <PageWrapper title="Dashboard" action={refreshBtn}>
      <div className="space-y-6 pb-safe">

        {/* ── Fila 1: Progress Banner (overview data — visible rápido) ─ */}
        <Card className="card-base">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                {data ? (
                  <>
                    <p className="text-sm font-semibold text-foreground capitalize">
                      {monthLabel} — Día {data.days_elapsed} de {data.days_in_month}
                    </p>
                    <Progress value={data.progress_percentage} className="mt-2 h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {data.progress_percentage}% del mes transcurrido
                    </p>
                  </>
                ) : (
                  <>
                    <Skeleton className="h-4 w-52 mb-3" />
                    <Skeleton className="h-2 w-full mb-2" />
                    <Skeleton className="h-3 w-32" />
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                {data && s ? (
                  <>
                    {s.projected_end_balance >= 0 ? (
                      <ArrowUpRight className="h-5 w-5 text-income shrink-0" />
                    ) : (
                      <ArrowDownRight className="h-5 w-5 text-expense shrink-0" />
                    )}
                    <div>
                      <p className="text-xs text-muted-foreground">Proyección fin de mes (ritmo variable + fijos)</p>
                      <p
                        className={cn(
                          "text-lg font-bold tabular-nums",
                          s.projected_end_balance >= 0 ? "text-income" : "text-expense"
                        )}
                      >
                        {formatCurrency(s.projected_end_balance, currency)}
                      </p>
                    </div>
                  </>
                ) : (
                  <Skeleton className="h-12 w-36" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Fila 2: KPI Cards ─────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading || !data || !s ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="card-base">
                <CardContent className="p-4 space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-7 w-28" />
                  <Skeleton className="h-2 w-full" />
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              {/* Ingresos */}
              <Card className="card-base">
                <CardContent className="p-4">
                  <div className="flex items-center gap-1.5 mb-1">
                    <TrendingUp className="h-3.5 w-3.5 text-income" />
                    <p className="text-xs font-medium text-muted-foreground">Ingresos</p>
                  </div>
                  <p className="text-lg font-bold tabular-nums text-foreground leading-tight">
                    {formatCurrency(s.total_actual_income, currency)}
                  </p>
                  <p className="text-xs text-muted-foreground mb-2 tabular-nums">
                    de {formatCurrency(s.total_planned_income, currency)}
                  </p>
                  <Progress value={Math.min(s.income_progress, 100)} className="h-1.5" />
                  <p className="text-xs text-income mt-1 tabular-nums">
                    {Math.round(s.income_progress)}%
                  </p>
                </CardContent>
              </Card>

              {/* Gastos */}
              <Card className="card-base">
                <CardContent className="p-4">
                  <div className="flex items-center gap-1.5 mb-1">
                    <TrendingDown className="h-3.5 w-3.5 text-expense" />
                    <p className="text-xs font-medium text-muted-foreground">Gastos</p>
                  </div>
                  <p className="text-lg font-bold tabular-nums text-foreground leading-tight">
                    {formatCurrency(s.total_actual_expenses, currency)}
                  </p>
                  <p className="text-xs text-muted-foreground mb-2 tabular-nums">
                    de {formatCurrency(s.total_planned_expenses, currency)}
                  </p>
                  <Progress value={Math.min(s.expense_progress, 100)} className="h-1.5" />
                  <p
                    className={cn(
                      "text-xs mt-1 tabular-nums",
                      s.expense_progress > 100 ? "text-expense" : "text-warning"
                    )}
                  >
                    {Math.round(s.expense_progress)}%
                  </p>
                </CardContent>
              </Card>

              {/* Balance Actual */}
              <Card className="card-base">
                <CardContent className="p-4">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Balance del mes</p>
                  <p
                    className={cn(
                      "text-lg font-bold tabular-nums leading-tight",
                      s.actual_balance >= 0 ? "text-income" : "text-expense"
                    )}
                  >
                    {formatCurrency(s.actual_balance, currency)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2 tabular-nums">
                    Planificado: {formatCurrency(s.planned_balance, currency)}
                  </p>
                </CardContent>
              </Card>

              {/* Disponible en variables */}
              <Card className="card-base">
                <CardContent className="p-4">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Variables restante</p>
                  <p
                    className={cn(
                      "text-lg font-bold tabular-nums leading-tight",
                      s.available_to_spend >= 0 ? "text-income" : "text-expense"
                    )}
                  >
                    {formatCurrency(s.available_to_spend, currency)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">del presupuesto variable</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* ── Fila 3: Alertas ───────────────────────────────────── */}
        {data?.alerts && data.alerts.length > 0 && <AlertsSection alerts={data.alerts} />}

        {/* ── Fila 4: Gastos por Categoría ──────────────────────── */}
        {isLoading || !data ? (
          <Card className="card-base">
            <CardContent className="p-4 space-y-4">
              <Skeleton className="h-4 w-40" />
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-2 w-full" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </CardContent>
          </Card>
        ) : (
          <ExpensesByCategory categories={data.expenses_by_category} currency={currency} />
        )}

        {/* ── Fila 5: Transacciones + Gráfica ───────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Últimas Transacciones */}
          <Card className="card-base">
            <div className="px-4 pt-4 pb-2 flex items-center justify-between border-b border-border/50">
              <h3 className="text-sm font-semibold text-foreground">Últimas Transacciones</h3>
              <Link
                href={ROUTES.transactions}
                className="text-xs text-brand-600 hover:underline underline-offset-2 [min-height:unset] [min-width:unset]"
              >
                Ver todas
              </Link>
            </div>
            <CardContent className="px-4 pt-4 pb-4">
              {isLoading || !data ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                      <div className="flex-1 space-y-1">
                        <Skeleton className="h-3 w-28" />
                        <Skeleton className="h-2 w-16" />
                      </div>
                      <Skeleton className="h-4 w-20 shrink-0" />
                    </div>
                  ))}
                </div>
              ) : data.recent_transactions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  Sin transacciones recientes
                </p>
              ) : (
                <div className="space-y-3">
                  {data.recent_transactions.slice(0, 5).map((tx) => (
                    <div key={tx.id} className="flex items-center gap-3">
                      <span className="text-xl shrink-0">{getCategoryIcon(tx.category)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{tx.description}</p>
                        <p className="text-xs text-muted-foreground">{formatTxDate(tx.date)}</p>
                      </div>
                      <p
                        className={cn(
                          "text-sm font-semibold tabular-nums shrink-0",
                          tx.type === "income" ? "text-income" : "text-expense"
                        )}
                      >
                        {tx.type === "income" ? "+" : "−"}
                        {formatCurrency(tx.amount, currency)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Gráfica Ingresos vs Gastos */}
          <Card className="card-base">
            <div className="px-4 pt-4 pb-2 border-b border-border/50">
              <h3 className="text-sm font-semibold text-foreground">Ingresos vs Gastos</h3>
            </div>
            <CardContent className="px-4 pt-4 pb-4">
              {isLoading || !data || !s ? (
                <Skeleton className="h-52 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={220} minWidth={1}>
                  <BarChart
                    data={chartData}
                    margin={{ top: 4, right: 4, left: 0, bottom: 4 }}
                    barSize={32}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tickFormatter={compactNumber}
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      width={48}
                    />
                    <Tooltip
                      formatter={(value) => [
                        formatCurrency(value as number, currency),
                        "",
                      ]}
                      cursor={{ fill: "rgba(0,0,0,0.04)" }}
                    />
                    <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="Planificado" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Real" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.isIncome ? "#16a34a" : "#dc2626"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Fila 6: Metas y Fondos (Tabs) ─────────────────────── */}
        <Card className="card-base">
          <CardContent className="p-4">
            {isLoading || !data ? (
              <div className="space-y-3">
                <div className="flex gap-3 mb-4">
                  <Skeleton className="h-9 w-36" />
                  <Skeleton className="h-9 w-36" />
                </div>
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <Tabs defaultValue="goals">
                <TabsList className="mb-4">
                  <TabsTrigger value="goals" className="gap-2">
                    <Target className="h-4 w-4" />
                    Metas de Ahorro
                  </TabsTrigger>
                  <TabsTrigger value="funds" className="gap-2">
                    <PiggyBank className="h-4 w-4" />
                    Fondos de Reserva
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="goals">
                  {data.goals_summary.goals.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Sin metas activas
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {data.goals_summary.goals
                        .filter((g) => g.name && !g.id.includes("#CONTRIB#"))
                        .slice(0, 3)
                        .map((goal) => (
                          <div key={goal.id} className="flex items-center gap-3">
                            <CircularRing value={goal.progress ?? goal.progress_percentage ?? 0} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{goal.name}</p>
                              <p className="text-xs text-muted-foreground tabular-nums">
                                {formatCurrency(goal.current_saved, currency)} /{" "}
                                {formatCurrency(goal.target_amount, currency)}
                              </p>
                            </div>
                          </div>
                        ))}
                      <Link
                        href={ROUTES.goals}
                        className="block text-center text-xs text-brand-600 hover:underline underline-offset-2 pt-1 [min-height:unset] [min-width:unset]"
                      >
                        Ver todas →
                      </Link>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="funds">
                  {data.sinking_funds_summary.funds.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Sin fondos de reserva
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {data.sinking_funds_summary.funds.slice(0, 3).map((fund) => {
                        const pct =
                          fund.expected_amount > 0
                            ? Math.round((fund.current_saved / fund.expected_amount) * 100)
                            : 0
                        return (
                          <div key={fund.id} className="flex items-center gap-3">
                            <CircularRing value={pct} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{fund.name}</p>
                              <p className="text-xs text-muted-foreground tabular-nums">
                                {formatCurrency(fund.current_saved, currency)} /{" "}
                                {formatCurrency(fund.expected_amount, currency)}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                      <Link
                        href={ROUTES.sinkingFunds}
                        className="block text-center text-xs text-brand-600 hover:underline underline-offset-2 pt-1 [min-height:unset] [min-width:unset]"
                      >
                        Ver todos →
                      </Link>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>

        {/* ── Fila 7: Recomendaciones ───────────────────────────── */}
        {data?.recommendations && data.recommendations.length > 0 && (
          <Card className="card-base">
            <div className="px-4 pt-4 pb-2 flex items-center gap-2 border-b border-border/50">
              <Lightbulb className="h-4 w-4 text-warning shrink-0" />
              <h3 className="text-sm font-semibold text-foreground">Recomendaciones</h3>
            </div>
            <CardContent className="px-4 pt-4 pb-4">
              <ul className="space-y-2">
                {data.recommendations.map((rec, i) => {
                  const text = typeof rec === "string" ? rec : rec.message
                  return (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-warning mt-0.5 shrink-0">•</span>
                      <p className="text-sm text-foreground">{text}</p>
                    </li>
                  )
                })}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </PageWrapper>
  )
}
