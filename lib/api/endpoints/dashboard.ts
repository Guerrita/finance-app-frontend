import { apiClient } from "@/lib/api/client"
import type { ApiResponse, TransactionSummary } from "@/types/api"

export interface DashboardData {
  month: string
  summary: TransactionSummary
  budget_progress: number
  savings_rate: number
  recent_transactions: {
    id: string
    type: "income" | "expense"
    amount: number
    description: string
    category: string
    date: string
    currency: string
  }[]
  goals_summary: { active: number; total_saved: number }
  sinking_funds_summary: { active: number; total_saved: number }
}

export const dashboardApi = {
  get: (month: string) =>
    apiClient.get<ApiResponse<DashboardData>>(`/dashboard/${month}`),
}
