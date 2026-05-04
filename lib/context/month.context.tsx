"use client"

import { createContext, useContext, useState, useCallback } from "react"
import { format, addMonths, subMonths } from "date-fns"
import { getCurrentMonth } from "@/lib/utils/format"

interface MonthContextValue {
  month: string
  setMonth: (month: string) => void
  nextMonth: () => void
  prevMonth: () => void
  isCurrentMonth: boolean
}

const MonthContext = createContext<MonthContextValue | null>(null)

export function MonthProvider({ children }: { children: React.ReactNode }) {
  const [month, setMonth] = useState(getCurrentMonth)

  const currentMonth = getCurrentMonth()

  const nextMonth = useCallback(() => {
    setMonth((prev) => {
      if (prev >= currentMonth) return prev
      const [y, m] = prev.split("-").map(Number)
      return format(addMonths(new Date(y, m - 1, 1), 1), "yyyy-MM")
    })
  }, [currentMonth])

  const prevMonth = useCallback(() => {
    setMonth((prev) => {
      const [y, m] = prev.split("-").map(Number)
      return format(subMonths(new Date(y, m - 1, 1), 1), "yyyy-MM")
    })
  }, [])

  return (
    <MonthContext.Provider
      value={{
        month,
        setMonth,
        nextMonth,
        prevMonth,
        isCurrentMonth: month === currentMonth,
      }}
    >
      {children}
    </MonthContext.Provider>
  )
}

export function useMonthContext() {
  const ctx = useContext(MonthContext)
  if (!ctx) throw new Error("useMonthContext must be used inside MonthProvider")
  return ctx
}
