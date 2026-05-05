import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react"
import { CurrencyDisplay } from "@/components/shared/CurrencyDisplay"
import { cn } from "@/lib/utils"

interface TransactionSummaryProps {
  income: number
  expenses: number
  balance: number
}

export function TransactionSummary({ income, expenses, balance }: TransactionSummaryProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="border-none bg-emerald-50/50 shadow-none dark:bg-emerald-950/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
            Total Ingresos
          </CardTitle>
          <div className="rounded-full bg-emerald-100 p-2 dark:bg-emerald-900/50">
            <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            <CurrencyDisplay 
              amount={income} 
              type="income" 
              size="lg"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-none bg-rose-50/50 shadow-none dark:bg-rose-950/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-rose-900 dark:text-rose-100">
            Total Gastos
          </CardTitle>
          <div className="rounded-full bg-rose-100 p-2 dark:bg-rose-900/50">
            <TrendingDown className="h-4 w-4 text-rose-600 dark:text-rose-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            <CurrencyDisplay 
              amount={expenses} 
              type="expense" 
              size="lg"
            />
          </div>
        </CardContent>
      </Card>

      <Card className={cn(
        "border-none shadow-none",
        balance >= 0 
          ? "bg-blue-50/50 dark:bg-blue-950/20" 
          : "bg-rose-50/50 dark:bg-rose-950/20"
      )}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className={cn(
            "text-sm font-medium",
            balance >= 0 ? "text-blue-900 dark:text-blue-100" : "text-rose-900 dark:text-rose-100"
          )}>
            Balance
          </CardTitle>
          <div className={cn(
            "rounded-full p-2",
            balance >= 0 ? "bg-blue-100 dark:bg-blue-900/50" : "bg-rose-100 dark:bg-rose-900/50"
          )}>
            <DollarSign className={cn(
              "h-4 w-4",
              balance >= 0 ? "text-blue-600 dark:text-blue-400" : "text-rose-600 dark:text-rose-400"
            )} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            <CurrencyDisplay 
              amount={balance} 
              type={balance >= 0 ? "income" : "expense"} 
              size="lg"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
