"use client"

import { usePathname } from "next/navigation"
import { ChevronLeft, ChevronRight, Menu } from "lucide-react"
import { useMonthContext } from "@/lib/context/month.context"
import { formatMonth } from "@/lib/utils/format"
import { cn } from "@/lib/utils"
import { ROUTES } from "@/lib/utils/constants"

interface HeaderProps {
  title?: string
  showMonthSelector?: boolean
  onMenuClick?: () => void
  className?: string
}

const ROUTE_TITLES: Record<string, string> = {
  [ROUTES.dashboard]: "Dashboard",
  [ROUTES.transactions]: "Transacciones",
  [ROUTES.budget]: "Presupuesto",
  [ROUTES.goals]: "Metas de Ahorro",
  [ROUTES.sinkingFunds]: "Fondos de Reserva",
  [ROUTES.reports]: "Reportes",
}

export function Header({
  title,
  showMonthSelector = true,
  onMenuClick,
  className,
}: HeaderProps) {
  const pathname = usePathname()
  const { month, prevMonth, nextMonth, isCurrentMonth } = useMonthContext()

  const displayTitle = title || ROUTE_TITLES[pathname] || "FinanceApp"

  return (
    <header
      className={cn(
        "sticky top-0 z-30 bg-card/95 backdrop-blur-sm border-b border-border/50",
        "px-4 h-14 flex items-center justify-between gap-4",
        className
      )}
    >
      <div className="flex items-center gap-3 truncate">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 -ml-1 rounded-md hover:bg-muted transition-colors"
          aria-label="Abrir menú"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold lg:text-xl truncate">
          {displayTitle}
        </h1>
      </div>

      {showMonthSelector && (
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Mes anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <span className="text-sm font-medium capitalize tabular-nums min-w-[100px] text-center">
            {formatMonth(month)}
          </span>

          <button
            onClick={nextMonth}
            disabled={isCurrentMonth}
            className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Mes siguiente"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </header>
  )
}
