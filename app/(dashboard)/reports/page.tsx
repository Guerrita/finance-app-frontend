"use client"

import { PageWrapper } from "@/components/layout/PageWrapper"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { MonthlyReportTab } from "@/components/reports/MonthlyReportTab"
import { YtdReportTab } from "@/components/reports/YtdReportTab"
import { useMonthContext } from "@/lib/context/month.context"
import { formatMonth } from "@/lib/utils/format"

export default function ReportsPage() {
  const { month } = useMonthContext()

  return (
    <PageWrapper
      title="Reportes"
      description={formatMonth(month)}
    >
      <Tabs defaultValue="monthly">
        <TabsList className="mb-6">
          <TabsTrigger value="monthly">Reporte Mensual</TabsTrigger>
          <TabsTrigger value="ytd">Año a la Fecha</TabsTrigger>
        </TabsList>

        <TabsContent value="monthly">
          <MonthlyReportTab month={month} />
        </TabsContent>

        <TabsContent value="ytd">
          <YtdReportTab />
        </TabsContent>
      </Tabs>
    </PageWrapper>
  )
}
