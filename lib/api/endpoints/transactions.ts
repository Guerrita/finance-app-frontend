import { apiClient } from "@/lib/api/client"
import type { ApiResponse, Transaction, TransactionListResponse } from "@/types/api"

export interface TransactionFilters {
  month?: string
  type?: "income" | "expense"
  category?: string
  cursor?: string
  limit?: number
}

export const transactionsApi = {
  list: (filters: TransactionFilters = {}) =>
    apiClient.get<ApiResponse<TransactionListResponse>>("/transactions", {
      params: filters,
    }),

  get: (id: string) =>
    apiClient.get<ApiResponse<Transaction>>(`/transactions/${id}`),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/transactions/${id}`),
}
