import type { Metadata } from "next"
import { PageWrapper } from "@/components/layout/PageWrapper"

export const metadata: Metadata = { title: "Fondos — FinanceApp" }

export default function SinkingFundsPage() {
  return (
    <PageWrapper title="Fondos de provisión">
      {/* Sinking funds list goes here */}
    </PageWrapper>
  )
}
