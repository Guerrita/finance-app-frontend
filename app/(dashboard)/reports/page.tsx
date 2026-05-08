"use client"

import { useState } from "react"
import { PageWrapper } from "@/components/layout/PageWrapper"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { MonthlyReportTab } from "@/components/reports/MonthlyReportTab"
import { YtdReportTab } from "@/components/reports/YtdReportTab"
import { TrendsTab } from "@/components/reports/TrendsTab"
import { useMonthContext } from "@/lib/context/month.context"
import { formatMonth } from "@/lib/utils/format"

export default function ReportsPage() {
  const { month } = useMonthContext()
  const [activeTab, setActiveTab] = useState("monthly")
  const [mounted, setMounted] = useState<Set<string>>(() => new Set(["monthly"]))

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setMounted((prev) => {
      if (prev.has(value)) return prev
      const next = new Set(prev)
      next.add(value)
      return next
    })
  }

  return (
    <PageWrapper
      title="Reportes"
      description={formatMonth(month)}
    >
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mb-6 w-full grid grid-cols-3">
          <TabsTrigger value="monthly">Reporte Mensual</TabsTrigger>
          <TabsTrigger value="ytd">Año a la Fecha</TabsTrigger>
          <TabsTrigger value="trends">Tendencias</TabsTrigger>
        </TabsList>

        <TabsContent value="monthly">
          {mounted.has("monthly") && <MonthlyReportTab month={month} />}
        </TabsContent>

        <TabsContent value="ytd">
          {mounted.has("ytd") && <YtdReportTab />}
        </TabsContent>

        <TabsContent value="trends">
          {mounted.has("trends") && <TrendsTab />}
        </TabsContent>
      </Tabs>
    </PageWrapper>
  )
}
