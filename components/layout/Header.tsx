"use client"

import { usePathname, useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, Menu, Wallet, Bell } from "lucide-react"
import { useMonthContext } from "@/lib/context/month.context"
import { useDashboardOverview } from "@/lib/api/endpoints/dashboard"
import { useAuthStore } from "@/store/auth.store"
import { formatMonth, formatCurrency } from "@/lib/utils/format"
import { Skeleton } from "@/components/ui/skeleton"
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
  const router = useRouter()
  const { month, prevMonth, nextMonth, isCurrentMonth } = useMonthContext()
  const currency = useAuthStore((s) => s.user?.preferred_currency ?? "COP")
  const overview = useDashboardOverview()

  const displayTitle = title || ROUTE_TITLES[pathname] || "FinanceApp"
  const isDashboard = pathname === ROUTES.dashboard

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

      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Balance widget */}
        {overview.isLoading ? (
          <Skeleton className="h-5 w-20" />
        ) : overview.data ? (
          <>
            <button
              onClick={() => !isDashboard && router.push(ROUTES.dashboard)}
              className={cn(
                "flex items-center gap-1.5 px-2 py-1 rounded-md text-sm font-semibold tabular-nums transition-colors",
                overview.data.balance >= 0
                  ? "bg-green-50 text-green-700 hover:bg-green-100"
                  : "bg-red-50 text-red-700 hover:bg-red-100",
                isDashboard && "cursor-default"
              )}
              aria-label="Ver balance en dashboard"
            >
              <Wallet className="h-3.5 w-3.5 flex-shrink-0" />
              <span>{formatCurrency(overview.data.balance, currency)}</span>
            </button>

            {overview.data.active_alerts > 0 && (
              <div className="relative">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <span className="absolute -top-1 -right-1 bg-expense text-white text-2xs rounded-full h-3.5 w-3.5 flex items-center justify-center leading-none font-bold">
                  {overview.data.active_alerts > 9 ? "9+" : overview.data.active_alerts}
                </span>
              </div>
            )}
          </>
        ) : null}

        {/* Month selector */}
        {showMonthSelector && (
          <div className="flex items-center gap-1">
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
      </div>
    </header>
  )
}
