import { apiClient } from "@/lib/api/client"
import type { ApiResponse, SinkingFund } from "@/types/api"

export interface CreateSinkingFundDto {
  name: string
  description?: string
  expected_amount: number
  expected_date: number
  category: string
  currency: string
  recurrence: "one-time" | "monthly" | "quarterly" | "yearly"
}

export const sinkingFundsApi = {
  list: () => apiClient.get<ApiResponse<SinkingFund[]>>("/sinking-funds"),

  get: (id: string) =>
    apiClient.get<ApiResponse<SinkingFund>>(`/sinking-funds/${id}`),

  create: (dto: CreateSinkingFundDto) =>
    apiClient.post<ApiResponse<SinkingFund>>("/sinking-funds", dto),

  update: (id: string, dto: Partial<CreateSinkingFundDto>) =>
    apiClient.patch<ApiResponse<SinkingFund>>(`/sinking-funds/${id}`, dto),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/sinking-funds/${id}`),

  addContribution: (id: string, amount: number) =>
    apiClient.post<ApiResponse<SinkingFund>>(
      `/sinking-funds/${id}/contributions`,
      { amount }
    ),
}
