import { useMonthContext } from "@/lib/context/month.context"
import { formatMonth } from "@/lib/utils/format"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCategories } from "@/lib/api/endpoints/categories"

interface TransactionFiltersProps {
  type: string
  setType: (type: string) => void
  category: string
  setCategory: (category: string) => void
  onNewTransaction: () => void
}

export function TransactionFilters({
  type,
  setType,
  category,
  setCategory,
  onNewTransaction,
}: TransactionFiltersProps) {
  const { month, prevMonth, nextMonth, isCurrentMonth } = useMonthContext()
  const { data: categories } = useCategories()

  const expenseCategories = categories?.expense_categories || []
  const incomeCategories = categories?.income_categories || []

  const currentCategories = type === "income" 
    ? incomeCategories 
    : type === "expense" 
      ? expenseCategories 
      : [...incomeCategories, ...expenseCategories]

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        {/* Month Selector */}
        <div className="flex items-center gap-1 rounded-lg border bg-card p-1 shadow-sm">
          <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-semibold px-2 min-w-[120px] text-center capitalize tabular-nums">
            {formatMonth(month)}
          </span>
          <Button variant="ghost" size="icon" onClick={nextMonth} disabled={isCurrentMonth} className="h-8 w-8">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Type Filter */}
        <Tabs value={type} onValueChange={setType} className="w-auto">
          <TabsList className="h-10 p-1">
            <TabsTrigger value="all" className="px-4 text-xs font-semibold uppercase tracking-wider">Todos</TabsTrigger>
            <TabsTrigger value="income" className="px-4 text-xs font-semibold uppercase tracking-wider">Ingresos</TabsTrigger>
            <TabsTrigger value="expense" className="px-4 text-xs font-semibold uppercase tracking-wider">Gastos</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Category Filter */}
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="h-10 w-[200px] bg-card shadow-sm">
            <SelectValue placeholder="Todas las categorías" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {currentCategories.map((cat) => (
              <SelectItem key={`${cat.type}-${cat.id}`} value={cat.id}>
                <div className="flex items-center gap-2">
                  <span>{cat.icon}</span>
                  <span>{cat.name_es}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button onClick={onNewTransaction} className="gap-2 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
        <Plus className="h-4 w-4" />
        Nueva transacción
      </Button>
    </div>
  )
}
