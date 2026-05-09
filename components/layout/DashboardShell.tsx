"use client"

import { useState, useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Sidebar } from "./Sidebar"
import { Header } from "./Header"
import { BottomNav } from "./BottomNav"
import { cn } from "@/lib/utils"
import { QUERY_KEYS } from "@/lib/utils/constants"
import { fetchCategories, fetchCurrencies } from "@/lib/api/endpoints/categories"

interface DashboardShellProps {
  children: React.ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const queryClient = useQueryClient()

  useEffect(() => {
    queryClient.prefetchQuery({
      queryKey: QUERY_KEYS.categories(),
      queryFn: fetchCategories,
      staleTime: Infinity,
    })
    queryClient.prefetchQuery({
      queryKey: QUERY_KEYS.currencies(),
      queryFn: fetchCurrencies,
      staleTime: Infinity,
    })
  }, [])

  return (
    <div className="flex min-h-screen bg-surface-subtle">
      {/* Sidebar Desktop */}
      <Sidebar className="hidden lg:flex h-screen sticky top-0" />

      {/* Sidebar Mobile (Drawer) */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden transition-opacity duration-300",
          isSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
        
        {/* Drawer content */}
        <div
          className={cn(
            "absolute inset-y-0 left-0 w-64 flex flex-col bg-slate-900 transition-transform duration-300 ease-in-out",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <Sidebar className="flex-1 w-full min-h-0" />
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        
        <main className="flex-1 flex flex-col min-w-0 pb-safe lg:pb-0">
          {children}
        </main>

        <BottomNav className="lg:hidden" />
      </div>
    </div>
  )
}
