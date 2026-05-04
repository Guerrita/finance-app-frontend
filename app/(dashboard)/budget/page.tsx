"use client"

import { PageWrapper } from "@/components/layout/PageWrapper"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BudgetConfigTab } from "@/components/budget/BudgetConfigTab"
import { IncomeTab } from "@/components/budget/IncomeTab"
import { ExpensesTab } from "@/components/budget/ExpensesTab"
import { BudgetSummary } from "@/components/budget/BudgetSummary"
import { useIncomes } from "@/lib/api/endpoints/income"
import { useExpensesFixed, useExpensesVariable } from "@/lib/api/endpoints/expenses"
import { useBudgetSetup } from "@/lib/api/endpoints/budget"

import { useMonthContext } from "@/lib/context/month.context"

export default function BudgetPage() {
  const { month } = useMonthContext()
  const { data: budgetSetup } = useBudgetSetup()
  const { data: incomesData } = useIncomes()
  const { data: fixedExpensesData } = useExpensesFixed()
  const { data: variableExpensesData } = useExpensesVariable(month)

  const totalIncome = incomesData?.incomes.reduce((acc, curr) => acc + curr.amount, 0) || 0
  const totalFixed = fixedExpensesData?.expenses.reduce((acc, curr) => acc + curr.amount, 0) || 0
  const totalVariable = variableExpensesData?.expenses.reduce((acc, curr) => acc + curr.amount, 0) || 0
  const currency = budgetSetup?.currency || "COP"

  return (
    <PageWrapper title="Planificación de Presupuesto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Tabs defaultValue="config" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="config">Configuración</TabsTrigger>
              <TabsTrigger value="income">Ingresos</TabsTrigger>
              <TabsTrigger value="expenses">Gastos</TabsTrigger>
            </TabsList>

            <TabsContent value="config" className="mt-0">
              <BudgetConfigTab />
            </TabsContent>

            <TabsContent value="income" className="mt-0">
              <IncomeTab />
            </TabsContent>

            <TabsContent value="expenses" className="mt-0">
              <ExpensesTab />
            </TabsContent>
          </Tabs>
        </div>

        <div className="lg:col-span-1">
          <BudgetSummary
            totalIncome={totalIncome}
            totalFixedExpenses={totalFixed}
            totalVariableExpenses={totalVariable}
            currency={currency}
          />
        </div>
      </div>
    </PageWrapper>
  )
}
