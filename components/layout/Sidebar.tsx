"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  Target,
  Wallet,
  BarChart3,
  LogOut,
  Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ROUTES } from "@/lib/utils/constants"
import { useAuthStore } from "@/store/auth.store"

const navItems = [
  { href: ROUTES.dashboard,    label: "Dashboard",       Icon: LayoutDashboard },
  { href: ROUTES.transactions, label: "Transacciones",   Icon: ArrowLeftRight },
  { href: ROUTES.budget,       label: "Presupuesto",     Icon: PieChart },
  { href: ROUTES.goals,        label: "Metas",           Icon: Target },
  { href: ROUTES.sinkingFunds, label: "Fondos",          Icon: Wallet },
  { href: ROUTES.reports,      label: "Reportes",        Icon: BarChart3 },
]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <aside
      className={cn(
        "w-60 min-h-screen flex-col bg-slate-900 text-white sticky top-0",
        className
      )}
    >
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <span className="text-lg font-bold tracking-tight">FinanceApp</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/")
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                "border-l-2",
                isActive
                  ? "bg-brand-600/20 text-brand-300 border-brand-600"
                  : "text-slate-400 border-transparent hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="px-3 py-4 border-t border-white/10">
        {user && (
          <Link
            href={ROUTES.settings}
            className={cn(
              "flex items-center gap-3 px-3 py-2 mb-2 rounded-md transition-colors",
              "hover:bg-white/5",
              pathname === ROUTES.settings && "bg-brand-600/20"
            )}
            aria-label="Ir a configuración de perfil"
          >
            <div className="h-8 w-8 rounded-full bg-brand-600 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-white select-none">
                {user.name.trim().split(/\s+/).slice(0, 2).map((w: string) => w[0]?.toUpperCase() ?? "").join("")}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-slate-400 truncate">
                {user.preferred_currency} • configuración
              </p>
            </div>
            <Settings className="h-3.5 w-3.5 text-slate-500 shrink-0" />
          </Link>
        )}
        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2.5 rounded-md",
            "text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          )}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
