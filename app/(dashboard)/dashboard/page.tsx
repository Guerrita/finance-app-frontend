import type { Metadata } from "next"
import { PageWrapper } from "@/components/layout/PageWrapper"

export const metadata: Metadata = { title: "Dashboard — FinanceApp" }

export default function DashboardPage() {
  return (
    <PageWrapper title="Dashboard">
      {/* Dashboard widgets go here */}
    </PageWrapper>
  )
}
