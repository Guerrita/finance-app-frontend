"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  Target,
  BarChart3,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ROUTES } from "@/lib/utils/constants"

const navItems = [
  { href: ROUTES.dashboard,    label: "Inicio",         Icon: LayoutDashboard },
  { href: ROUTES.transactions, label: "Movimientos",    Icon: ArrowLeftRight },
  { href: ROUTES.budget,       label: "Presupuesto",    Icon: PieChart },
  { href: ROUTES.goals,        label: "Metas",          Icon: Target },
  { href: ROUTES.reports,      label: "Reportes",       Icon: BarChart3 },
]

interface BottomNavProps {
  className?: string
}

export function BottomNav({ className }: BottomNavProps) {
  const pathname = usePathname()

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border/50",
        "h-[var(--bottom-nav-height)]",
        "pb-[env(safe-area-inset-bottom)]",
        className
      )}
    >
      <div className="flex h-full items-center justify-around px-1">
        {navItems.map(({ href, label, Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/")
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 flex-1 h-full",
                "text-xs transition-colors",
                isActive
                  ? "text-brand-600"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon
                className="h-5 w-5"
                strokeWidth={isActive ? 2.5 : 1.75}
              />
              <span className="font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
