"use client"

import { useState } from "react"
import { PageWrapper } from "@/components/layout/PageWrapper"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BudgetConfigTab } from "@/components/budget/BudgetConfigTab"
import { IncomeTab } from "@/components/budget/IncomeTab"
import { ExpensesTab } from "@/components/budget/ExpensesTab"
import { MonthPlanTab } from "@/components/budget/MonthPlanTab"
import { BudgetSummary } from "@/components/budget/BudgetSummary"
import { useIncomes } from "@/lib/api/endpoints/income"
import { useExpensesFixed, useExpensesVariable } from "@/lib/api/endpoints/expenses"
import { useBudgetSetup } from "@/lib/api/endpoints/budget"
import { useMonthContext } from "@/lib/context/month.context"

export default function BudgetPage() {
  const [activeTab, setActiveTab] = useState("config")
  const [mounted, setMounted] = useState<Set<string>>(() => new Set(["config"]))

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setMounted((prev) => {
      if (prev.has(value)) return prev
      const next = new Set(prev)
      next.add(value)
      return next
    })
  }
  const { month } = useMonthContext()
  const { data: budgetSetup } = useBudgetSetup()
  const { items: incomes } = useIncomes()
  const { items: fixedExpenses } = useExpensesFixed()
  const { items: variableExpenses } = useExpensesVariable(month)

  const totalIncome = incomes.reduce((acc: number, curr: any) => acc + curr.amount, 0)
  const totalFixed = fixedExpenses.reduce((acc: number, curr: any) => acc + curr.amount, 0)
  const totalVariable = variableExpenses.reduce((acc: number, curr: any) => acc + (curr.estimated_amount ?? curr.amount), 0)
  const currency = budgetSetup?.currency || "COP"

  const isPlanTab = activeTab === "plan"

  return (
    <PageWrapper title="Planificación de Presupuesto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className={isPlanTab ? "lg:col-span-3" : "lg:col-span-2"}>
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="config">Configuración</TabsTrigger>
              <TabsTrigger value="income">Ingresos</TabsTrigger>
              <TabsTrigger value="expenses">Gastos</TabsTrigger>
              <TabsTrigger value="plan">Plan del Mes</TabsTrigger>
            </TabsList>

            <TabsContent value="config" className="mt-0">
              {mounted.has("config") && <BudgetConfigTab />}
            </TabsContent>

            <TabsContent value="income" className="mt-0">
              {mounted.has("income") && <IncomeTab currency={currency} />}
            </TabsContent>

            <TabsContent value="expenses" className="mt-0">
              {mounted.has("expenses") && <ExpensesTab currency={currency} />}
            </TabsContent>

            <TabsContent value="plan" className="mt-0">
              {mounted.has("plan") && <MonthPlanTab onGoToIncome={() => handleTabChange("income")} />}
            </TabsContent>
          </Tabs>
        </div>

        {!isPlanTab && (
          <div className="lg:col-span-1">
            <BudgetSummary
              totalIncome={totalIncome}
              totalFixedExpenses={totalFixed}
              totalVariableExpenses={totalVariable}
              currency={currency}
            />
          </div>
        )}
      </div>
    </PageWrapper>
  )
}
