import type { Metadata } from "next"
import { PageWrapper } from "@/components/layout/PageWrapper"

export const metadata: Metadata = { title: "Metas — FinanceApp" }

export default function GoalsPage() {
  return (
    <PageWrapper title="Metas de ahorro">
      {/* Goals list goes here */}
    </PageWrapper>
  )
}
