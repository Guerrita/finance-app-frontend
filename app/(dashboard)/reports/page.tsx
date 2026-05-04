import type { Metadata } from "next"
import { PageWrapper } from "@/components/layout/PageWrapper"

export const metadata: Metadata = { title: "Reportes — FinanceApp" }

export default function ReportsPage() {
  return (
    <PageWrapper title="Reportes">
      {/* Reports charts go here */}
    </PageWrapper>
  )
}
