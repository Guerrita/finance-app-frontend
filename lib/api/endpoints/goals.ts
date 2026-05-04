import { apiClient } from "@/lib/api/client"
import type { ApiResponse, Goal } from "@/types/api"

export interface CreateGoalDto {
  name: string
  type: string
  target_amount: number
  target_date: number
  monthly_contribution: number
  category: string
  currency: string
}

export const goalsApi = {
  list: () => apiClient.get<ApiResponse<Goal[]>>("/goals"),

  get: (id: string) => apiClient.get<ApiResponse<Goal>>(`/goals/${id}`),

  create: (dto: CreateGoalDto) =>
    apiClient.post<ApiResponse<Goal>>("/goals", dto),

  update: (id: string, dto: Partial<CreateGoalDto>) =>
    apiClient.patch<ApiResponse<Goal>>(`/goals/${id}`, dto),

  delete: (id: string) => apiClient.delete<ApiResponse<void>>(`/goals/${id}`),

  addContribution: (id: string, amount: number) =>
    apiClient.post<ApiResponse<Goal>>(`/goals/${id}/contributions`, { amount }),
}
