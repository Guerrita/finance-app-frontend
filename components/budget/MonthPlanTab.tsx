"use client"

import { useState } from "react"
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarDays } from "lucide-react"
import { usePlan, useProjection } from "@/lib/api/endpoints/plan"
import { useBudgetSetup } from "@/lib/api/endpoints/budget"
import { useMonthContext } from "@/lib/context/month.context"
import { SkeletonCard } from "@/components/shared/SkeletonCard"
import { EmptyState } from "@/components/shared/EmptyState"
import {
  Accordion, AccordionItem, AccordionTrigger, AccordionContent,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { formatCurrency, safeParseDate } from "@/lib/utils/format"
import { getCategoryIcon } from "@/lib/utils/categories"
import { cn } from "@/lib/utils"
import type { Goal, SinkingFund, IncomePlanSource } from "@/types/api"

const HORIZONS = [3, 6, 12, 24] as const

function formatMonthLabel(month: string | number): string {
  const date = safeParseDate(month)
  const label = format(date, "MMM yyyy", { locale: es })
  return label.charAt(0).toUpperCase() + label.slice(1).replace(".", "")
}

function compactAmount(v: number): string {
  const abs = Math.abs(v)
  if (abs >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `${(v / 1_000).toFixed(0)}K`
  return `${v}`
}

interface MonthPlanTabProps {
  onGoToIncome?: () => void
}

export function MonthPlanTab({ onGoToIncome }: MonthPlanTabProps) {
  const { month } = useMonthContext()
  const [horizonMonths, setHorizonMonths] = useState<(typeof HORIZONS)[number]>(12)
  const { data: plan, isLoading: planLoading } = usePlan(month)
  const { data: projection, isLoading: projLoading } = useProjection(horizonMonths)
  const { data: budgetSetup } = useBudgetSetup()
  const currency = budgetSetup?.currency || "COP"

  if (planLoading) {
    return (
      <div className="space-y-4">
        <SkeletonCard lines={6} />
        <SkeletonCard lines={5} />
        <SkeletonCard lines={3} />
      </div>
    )
  }

  const isEmpty =
    !plan ||
    (plan.income.sources.length === 0 &&
      plan.fixed_expenses.items.length === 0 &&
      plan.variable_expenses.items.length === 0)

  if (isEmpty) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="Configura tus ingresos y gastos para ver el plan de tu mes."
        action={
          onGoToIncome ? (
            <Button variant="outline" size="sm" onClick={onGoToIncome}>
              Ir a Ingresos Planificados
            </Button>
          ) : undefined
        }
      />
    )
  }

  const {
    summary,
    income,
    fixed_expenses,
    variable_expenses,
    savings_goals: rawGoals,
    sinking_funds: rawSinking,
  } = plan

  const goals = {
    items: rawGoals?.items ?? [],
    total_monthly_contribution: rawGoals?.total ?? 0,
  }
  const sinking_funds = {
    items: rawSinking?.items ?? [],
    total_monthly_contribution: rawSinking?.total ?? 0,
  }

  const totalSavings =
    goals.total_monthly_contribution + sinking_funds.total_monthly_contribution

  const savingsItems = [
    ...goals.items.map((g: Goal) => ({
      id: g.id,
      name: g.name,
      category: (g.type as string) || "other",
      amount: g.monthly_contribution ?? 0,
      badge: "Meta" as const,
    })),
    ...sinking_funds.items.map((s: SinkingFund) => ({
      id: s.id,
      name: s.name,
      category: s.category || "other",
      amount: s.monthly_contribution ?? 0,
      badge: "Fondo" as const,
    })),
  ]

  const chartData = projection?.months?.map((p) => ({
    name: formatMonthLabel(p.month),
    ingresos: p.total_income,
    gastos: p.total_expenses,
    ahorro: p.total_savings,
    acumulado: p.cumulative_savings,
  })) ?? []

  return (
    <div className="space-y-6">
      {/* Flujo del Mes */}
      <div className="card-base p-6">
        <h2 className="font-semibold text-base mb-5">Flujo del Mes</h2>
        <div className="space-y-3">
          <FlowRow label="+ Ingresos planificados" amount={summary.total_income} currency={currency} color="income" />
          <FlowRow label="− Gastos fijos" amount={fixed_expenses.total} currency={currency} color="expense" />
          <FlowRow label="− Gastos variables" amount={variable_expenses.total} currency={currency} color="expense" />
          <FlowRow label="− Contribución a metas" amount={goals.total_monthly_contribution} currency={currency} color="blue" />
          <FlowRow label="− Fondos de reserva" amount={sinking_funds.total_monthly_contribution} currency={currency} color="indigo" />
        </div>

        <div className="border-t mt-4 pt-4 flex items-center justify-between gap-4 flex-wrap">
          <span className="text-sm text-muted-foreground font-medium">
            = Disponible al finalizar el mes
          </span>
          <span
            className={cn(
              "text-3xl font-bold tabular-nums",
              summary.available >= 0 ? "text-income" : "text-expense"
            )}
          >
            {formatCurrency(summary.available, currency)}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            Tasa de ahorro: {(summary.savings_rate * 100).toFixed(1)}%
          </span>
          {summary.is_deficit && (
            <span className="inline-flex items-center rounded-full bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">
              ⚠️ Déficit proyectado
            </span>
          )}
        </div>
      </div>

      {/* Secciones colapsables */}
      <Accordion type="multiple" className="card-base overflow-hidden">
        <PlanSection
          value="income"
          emoji="💰"
          label="Ingresos"
          count={income.sources.length}
          total={income.total}
          currency={currency}
          totalSuffix="total"
        >
          <IncomeSourceList items={income.sources} currency={currency} />
        </PlanSection>

        <PlanSection
          value="fixed"
          emoji="🏠"
          label="Gastos Fijos"
          count={fixed_expenses.items.length}
          total={fixed_expenses.total}
          currency={currency}
          totalSuffix="total"
        >
          <ItemList
            items={fixed_expenses.items.map((e) => ({
              id: e.id,
              name: e.name,
              category: e.category,
              amount: e.amount,
            }))}
            currency={currency}
          />
        </PlanSection>

        <PlanSection
          value="variable"
          emoji="📊"
          label="Gastos Variables"
          count={variable_expenses.items.length}
          total={variable_expenses.total}
          currency={currency}
          totalSuffix="total"
        >
          <ItemList
            items={variable_expenses.items.map((e) => ({
              id: e.id,
              name: e.name,
              category: e.category,
              amount: e.estimated_amount ?? e.amount ?? 0,
            }))}
            currency={currency}
          />
        </PlanSection>

        <PlanSection
          value="savings"
          emoji="🎯"
          label="Ahorros planificados"
          count={savingsItems.length}
          total={totalSavings}
          currency={currency}
          totalSuffix="mes"
          last
        >
          {savingsItems.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">Sin items configurados</p>
          ) : (
            <div className="space-y-2">
              {savingsItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-lg shrink-0">{getCategoryIcon(item.category)}</span>
                    <span className="text-sm font-medium truncate">{item.name}</span>
                    <span
                      className={cn(
                        "inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium",
                        item.badge === "Meta"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-indigo-100 text-indigo-700"
                      )}
                    >
                      {item.badge}
                    </span>
                  </div>
                  <span className="text-sm font-semibold tabular-nums ml-4 shrink-0">
                    {formatCurrency(item.amount, currency)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </PlanSection>
      </Accordion>

      {/* Proyección futura */}
      <div className="card-base p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="font-semibold text-base">Proyección futura</h2>
          <div className="flex gap-1">
            {HORIZONS.map((h) => (
              <Button
                key={h}
                variant={horizonMonths === h ? "default" : "outline"}
                size="sm"
                className="h-7 px-2.5 text-xs"
                onClick={() => setHorizonMonths(h)}
              >
                {h}M
              </Button>
            ))}
          </div>
        </div>

        {projLoading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={280} minWidth={1}>
              <ComposedChart data={chartData} margin={{ top: 4, right: 48, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  yAxisId="bars"
                  tickFormatter={compactAmount}
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={44}
                />
                <YAxis
                  yAxisId="line"
                  orientation="right"
                  tickFormatter={compactAmount}
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={44}
                />
                <Tooltip
                  formatter={(value, name) => {
                    const labels: Record<string, string> = {
                      ingresos: "Ingresos",
                      gastos: "Gastos",
                      ahorro: "Ahorro del mes",
                      acumulado: "Acumulado",
                    }
                    const numVal = typeof value === "number" ? value : 0
                    const strName = String(name)
                    return [formatCurrency(numVal, currency), labels[strName] ?? strName]
                  }}
                />
                <Bar
                  yAxisId="bars"
                  dataKey="ingresos"
                  fill="#86efac"
                  radius={[3, 3, 0, 0]}
                  maxBarSize={20}
                />
                <Bar
                  yAxisId="bars"
                  dataKey="gastos"
                  fill="#fca5a5"
                  radius={[3, 3, 0, 0]}
                  maxBarSize={20}
                />
                <Line
                  yAxisId="line"
                  type="monotone"
                  dataKey="acumulado"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>

            {projection && (
              <div className="grid grid-cols-3 gap-4 pt-3 border-t">
                <StatCard
                  label="Ingreso promedio"
                  value={formatCurrency(projection.summary?.total_income_projected ?? 0, currency)}
                />
                <StatCard
                  label="Gasto promedio"
                  value={formatCurrency(projection.summary?.total_expenses_projected ?? 0, currency)}
                />
                <StatCard
                  label="Ahorro proyectado total"
                  value={formatCurrency(projection.summary?.total_savings_projected ?? 0, currency)}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function FlowRow({
  label,
  amount,
  currency,
  color,
}: {
  label: string
  amount: number
  currency: string
  color: "income" | "expense" | "blue" | "indigo"
}) {
  const colorClass = {
    income: "text-income",
    expense: "text-expense",
    blue: "text-blue-600",
    indigo: "text-indigo-600",
  }[color]

  return (
    <div className="flex items-center justify-between text-sm gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("font-semibold tabular-nums shrink-0", colorClass)}>
        {formatCurrency(amount, currency)}
      </span>
    </div>
  )
}

function PlanSection({
  value,
  emoji,
  label,
  count,
  total,
  currency,
  totalSuffix,
  last,
  children,
}: {
  value: string
  emoji: string
  label: string
  count: number
  total: number
  currency: string
  totalSuffix: string
  last?: boolean
  children: React.ReactNode
}) {
  return (
    <AccordionItem value={value} className={cn("px-6", last && "border-b-0")}>
      <AccordionTrigger className="hover:no-underline py-4 gap-2">
        <div className="flex flex-1 items-center justify-between mr-3 min-w-0">
          <div className="flex items-center gap-2 text-sm font-medium min-w-0">
            <span className="shrink-0">{emoji}</span>
            <span className="truncate">{label}</span>
            <span className="text-xs text-muted-foreground font-normal shrink-0">
              ({count})
            </span>
          </div>
          <span className="text-sm font-semibold tabular-nums shrink-0 ml-4">
            {formatCurrency(total, currency)}/{totalSuffix}
          </span>
        </div>
      </AccordionTrigger>
      <AccordionContent>{children}</AccordionContent>
    </AccordionItem>
  )
}

function IncomeSourceList({ items, currency }: { items: IncomePlanSource[]; currency: string }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground py-2">Sin items configurados</p>
  }
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.id} className="flex items-center justify-between py-1 gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-lg shrink-0">{getCategoryIcon(item.category)}</span>
            <span className="text-sm font-medium truncate">{item.name}</span>
            {item.type && (
              <span className={cn(
                "inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium",
                item.type === "fixed" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
              )}>
                {item.type === "fixed" ? "Fijo" : "Variable"}
              </span>
            )}
          </div>
          <span className="text-sm font-semibold tabular-nums shrink-0">
            {formatCurrency(item.amount, currency)}
          </span>
        </div>
      ))}
    </div>
  )
}

function ItemList({
  items,
  currency,
}: {
  items: { id: string; name: string; category: string; amount: number }[]
  currency: string
}) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground py-2">Sin items configurados</p>
  }
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.id} className="flex items-center justify-between py-1 gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-lg shrink-0">{getCategoryIcon(item.category)}</span>
            <span className="text-sm font-medium truncate">{item.name}</span>
          </div>
          <span className="text-sm font-semibold tabular-nums shrink-0">
            {formatCurrency(item.amount, currency)}
          </span>
        </div>
      ))}
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-xs text-muted-foreground leading-snug">{label}</p>
      <p className="text-sm font-semibold tabular-nums mt-1">{value}</p>
    </div>
  )
}
