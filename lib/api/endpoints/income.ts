import { apiClient } from "@/lib/api/client"
import type { ApiResponse, Income } from "@/types/api"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

export interface CreateIncomeDto {
  name: string
  amount: number
  type: string
  category: string
  currency: string
}

export const incomeApi = {
  list: async () => {
    const { data } = await apiClient.get<ApiResponse<{ incomes: Income[]; total: number }>>("/income")
    if (!data.success) throw new Error(data.error.message)
    return data.data
  },

  create: async (dto: CreateIncomeDto) => {
    const { data } = await apiClient.post<ApiResponse<Income>>("/income", dto)
    if (!data.success) throw new Error(data.error.message)
    return data.data
  },

  update: async (id: string, dto: Partial<CreateIncomeDto>) => {
    const { data } = await apiClient.put<ApiResponse<Income>>(`/income/${id}`, dto)
    if (!data.success) throw new Error(data.error.message)
    return data.data
  },

  delete: async (id: string) => {
    const { data } = await apiClient.delete<ApiResponse<void>>(`/income/${id}`)
    if (!data.success) throw new Error(data.error.message)
    return data.data
  },
}

export const useIncomes = () => {
  return useQuery({
    queryKey: ["incomes"],
    queryFn: incomeApi.list,
  })
}

export const useCreateIncome = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: incomeApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incomes"] })
    },
  })
}

export const useUpdateIncome = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<CreateIncomeDto> }) => 
      incomeApi.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incomes"] })
    },
  })
}

export const useDeleteIncome = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: incomeApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incomes"] })
    },
  })
}
