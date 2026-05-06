"use client"

import { format, isToday, isYesterday, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { Transaction } from "@/types/api"
import { Pencil, Trash2, Loader2 } from "lucide-react"
import { CurrencyDisplay } from "@/components/shared/CurrencyDisplay"
import { useCategories } from "@/lib/api/endpoints/categories"
import { Button } from "@/components/ui/button"

interface TransactionListProps {
  transactions: Transaction[]
  onEdit: (transaction: Transaction) => void
  onDelete: (transaction: Transaction) => void
  onLoadMore?: () => void
  hasMore?: boolean
  isLoadingMore?: boolean
}

export function TransactionList({
  transactions,
  onEdit,
  onDelete,
  onLoadMore,
  hasMore,
  isLoadingMore,
}: TransactionListProps) {
  const { data: categories } = useCategories()

  const groupTransactionsByDate = (txs: Transaction[]) => {
    const groups: Record<string, Transaction[]> = {}
    txs.forEach((tx) => {
      if (!groups[tx.date]) groups[tx.date] = []
      groups[tx.date].push(tx)
    })
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]))
  }

  const formatDateLabel = (dateStr: string) => {
    const date = parseISO(dateStr)
    if (isToday(date)) return "Hoy"
    if (isYesterday(date)) return "Ayer"
    return format(date, "d 'de' MMMM", { locale: es })
  }

  const getCategoryInfo = (catId: string) => {
    const allCats = [
      ...(categories?.income_categories || []),
      ...(categories?.expense_categories || []),
    ]
    return allCats.find((c) => c.id === catId)
  }

  const grouped = groupTransactionsByDate(transactions)

  if (transactions.length === 0 && !isLoadingMore) {
    return null // Handled by page
  }

  return (
    <div className="space-y-8">
      {grouped.map(([date, items]) => (
        <div key={date} className="space-y-3">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] pl-1">
            {formatDateLabel(date)}
          </h3>
          <div className="space-y-2">
            {items.map((tx) => {
              const cat = getCategoryInfo(tx.category)
              return (
                <div
                  key={tx.id}
                  className="group flex items-center justify-between rounded-2xl border border-border/40 bg-card p-4 transition-all hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 dark:hover:bg-muted/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-muted/50 text-2xl shadow-inner group-hover:scale-105 transition-transform">
                      {cat?.icon || "💰"}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                        {tx.description}
                      </span>
                      <span className="text-xs font-medium text-muted-foreground truncate">
                        {cat?.name_es || "Sin categoría"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:gap-8">
                    <div className="text-right shrink-0">
                      <CurrencyDisplay
                        amount={tx.amount}
                        type={tx.type}
                        size="md"
                        showSign
                        className="block font-bold tabular-nums"
                      />
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity max-sm:hidden">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10"
                        onClick={() => onEdit(tx)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-xl text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10"
                        onClick={() => onDelete(tx)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Mobile Menu (Visible always on mobile for accessibility) */}
                    <div className="flex items-center gap-1 sm:hidden">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground"
                        onClick={() => onEdit(tx)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {hasMore && (
        <div className="flex justify-center pt-6 pb-10">
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="w-full max-w-xs h-11 border-dashed rounded-xl gap-2 font-medium"
          >
            {isLoadingMore && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {isLoadingMore ? "Cargando..." : "Cargar más transacciones"}
          </Button>
        </div>
      )}
    </div>
  )
}
