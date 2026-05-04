import { apiClient } from "@/lib/api/client"
import type { ApiResponse, BudgetSetup } from "@/types/api"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

export interface UpdateBudgetDto {
  monthly_income_goal: number
  savings_rate_target: number
  currency: string
}

export const budgetApi = {
  getSetup: async () => {
    const { data } = await apiClient.get<ApiResponse<BudgetSetup>>("/budget/setup")
    if (!data.success) throw new Error(data.error.message)
    return data.data
  },

  updateSetup: async (dto: Partial<UpdateBudgetDto>) => {
    const { data } = await apiClient.put<ApiResponse<BudgetSetup>>("/budget/setup", dto)
    if (!data.success) throw new Error(data.error.message)
    return data.data
  },
}

export const useBudgetSetup = () => {
  return useQuery({
    queryKey: ["budget-setup"],
    queryFn: budgetApi.getSetup,
  })
}

export const useUpdateBudgetSetup = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: budgetApi.updateSetup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budget-setup"] })
    },
  })
}
