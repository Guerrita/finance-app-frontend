import type { Metadata } from "next"
import { PageWrapper } from "@/components/layout/PageWrapper"

export const metadata: Metadata = { title: "Transacciones — FinanceApp" }

export default function TransactionsPage() {
  return (
    <PageWrapper title="Transacciones">
      {/* Transaction list goes here */}
    </PageWrapper>
  )
}
