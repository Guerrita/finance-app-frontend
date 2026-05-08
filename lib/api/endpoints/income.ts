import { apiClient } from "@/lib/api/client"
import type { ApiResponse, Income, IncomeVariable } from "@/types/api"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { usePaginated } from "@/lib/hooks/usePaginated"
import { QUERY_KEYS } from "@/lib/utils/constants"

export interface CreateFixedIncomeDto {
  name: string
  amount: number
  category?: string
  currency?: string
  recurrence_day?: number
  start_month?: string
  end_month?: string
  is_recurring?: boolean
}

export interface CreateVariableIncomeDto {
  name: string
  amount: number
  category?: string
  currency?: string
}

export const incomeApi = {
  list: async () => {
    const { data } = await apiClient.get<ApiResponse<{ incomes: Income[]; total: number }>>("/income")
    if (!data.success) throw new Error(data.error.message)
    return data.data
  },
  create: async (dto: CreateFixedIncomeDto) => {
    const { data } = await apiClient.post<ApiResponse<Income>>("/income", dto)
    if (!data.success) throw new Error(data.error.message)
    return data.data
  },
  update: async (id: string, dto: Partial<CreateFixedIncomeDto>) => {
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

export const incomeVariableApi = {
  list: async () => {
    const { data } = await apiClient.get<ApiResponse<{ incomes: IncomeVariable[]; total: number }>>("/income/variable")
    if (!data.success) throw new Error(data.error.message)
    return data.data
  },
  create: async (dto: CreateVariableIncomeDto) => {
    const { data } = await apiClient.post<ApiResponse<IncomeVariable>>("/income/variable", dto)
    if (!data.success) throw new Error(data.error.message)
    return data.data
  },
  update: async (id: string, dto: Partial<CreateVariableIncomeDto>) => {
    const { data } = await apiClient.put<ApiResponse<IncomeVariable>>(`/income/variable/${id}`, dto)
    if (!data.success) throw new Error(data.error.message)
    return data.data
  },
  delete: async (id: string) => {
    const { data } = await apiClient.delete<ApiResponse<void>>(`/income/variable/${id}`)
    if (!data.success) throw new Error(data.error.message)
    return data.data
  },
}

export const useIncomes = () =>
  usePaginated<Income>({ queryKey: QUERY_KEYS.income(), url: "/income", dataKey: "incomes", pageSize: 20 })

export const useCreateIncome = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: incomeApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.income() }),
  })
}

export const useUpdateIncome = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<CreateFixedIncomeDto> }) => incomeApi.update(id, dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.income() }),
  })
}

export const useDeleteIncome = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: incomeApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.income() }),
  })
}

export const useIncomeVariable = () =>
  usePaginated<IncomeVariable>({ queryKey: QUERY_KEYS.incomeVariable(), url: "/income/variable", dataKey: "incomes", pageSize: 20 })

export const useCreateIncomeVariable = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: incomeVariableApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.incomeVariable() }),
  })
}

export const useUpdateIncomeVariable = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<CreateVariableIncomeDto> }) => incomeVariableApi.update(id, dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.incomeVariable() }),
  })
}

export const useDeleteIncomeVariable = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: incomeVariableApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.incomeVariable() }),
  })
}
