import { apiClient } from "@/lib/api/client"
import type { ApiResponse } from "@/types/api"

export interface MonthlyReport {
  month: string
  total_income: number
  total_expenses: number
  balance: number
  savings_rate: number
  by_category: { category: string; amount: number; percentage: number }[]
}

export interface YtdReport {
  year: number
  months: MonthlyReport[]
  total_income: number
  total_expenses: number
  average_savings_rate: number
}

export const reportsApi = {
  monthly: (month: string) =>
    apiClient.get<ApiResponse<MonthlyReport>>(`/reports/monthly/${month}`),

  ytd: () => apiClient.get<ApiResponse<YtdReport>>("/reports/ytd"),
}
