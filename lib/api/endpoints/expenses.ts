import { apiClient } from "@/lib/api/client"
import type { ApiResponse, Expense } from "@/types/api"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { usePaginated } from "@/lib/hooks/usePaginated"
import { QUERY_KEYS } from "@/lib/utils/constants"

export interface CreateExpenseDto {
  name: string
  amount: number
  category?: string
  currency?: string
  recurrence_day?: number
  start_month?: string
  end_month?: string
  is_recurring?: boolean
}

export const expensesApi = {
  listFixed: async () => {
    const { data } = await apiClient.get<ApiResponse<{ expenses: Expense[]; total: number }>>("/expenses/fixed")
    if (!data.success) throw new Error(data.error.message)
    return data.data
  },

  listVariable: async (month?: string) => {
    const { data } = await apiClient.get<ApiResponse<{ expenses: any[]; total: number }>>("/expenses/variable", {
      params: { month }
    })
    if (!data.success) throw new Error(data.error.message)
    const expenses = data.data.expenses.map(exp => ({
      ...exp,
      amount: exp.estimated_amount ?? exp.amount
    }))
    return { ...data.data, expenses }
  },

  createFixed: async (dto: CreateExpenseDto) => {
    const { data } = await apiClient.post<ApiResponse<Expense>>("/expenses/fixed", dto)
    if (!data.success) throw new Error(data.error.message)
    return data.data
  },

  createVariable: async (dto: CreateExpenseDto & { month?: string }) => {
    const { data } = await apiClient.post<ApiResponse<Expense>>("/expenses/variable", {
      ...dto,
      estimated_amount: dto.amount,
      month: dto.month
    })
    if (!data.success) throw new Error(data.error.message)
    return data.data
  },

  update: async (type: "fixed" | "variable", id: string, dto: Partial<CreateExpenseDto>) => {
    const payload = { ...dto }
    if (type === "variable" && dto.amount !== undefined) {
      // @ts-ignore
      payload.estimated_amount = dto.amount
    }
    const { data } = await apiClient.put<ApiResponse<Expense>>(`/expenses/${type}/${id}`, payload)
    if (!data.success) throw new Error(data.error.message)
    return data.data
  },

  delete: async (type: "fixed" | "variable", id: string) => {
    const { data } = await apiClient.delete<ApiResponse<void>>(`/expenses/${type}/${id}`)
    if (!data.success) throw new Error(data.error.message)
    return data.data
  },
}

export const useExpensesFixed = () => {
  return usePaginated<Expense>({
    queryKey: QUERY_KEYS.fixedExpenses(),
    url: "/expenses/fixed",
    dataKey: "expenses",
    pageSize: 20,
  })
}

export const useExpensesVariable = (month?: string) => {
  return usePaginated<any>({
    queryKey: QUERY_KEYS.variableExpenses(),
    url: "/expenses/variable",
    params: month ? { month } : undefined,
    dataKey: "expenses",
    pageSize: 20,
  })
}

export const useCreateExpense = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ type, dto, month }: { type: "fixed" | "variable"; dto: CreateExpenseDto; month?: string }) =>
      type === "fixed" ? expensesApi.createFixed(dto) : expensesApi.createVariable({ ...dto, month }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["expenses", variables.type] })
    },
  })
}

export const useUpdateExpense = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ type, id, dto }: { type: "fixed" | "variable"; id: string; dto: Partial<CreateExpenseDto> }) =>
      expensesApi.update(type, id, dto),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["expenses", variables.type] })
    },
  })
}

export const useDeleteExpense = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ type, id }: { type: "fixed" | "variable"; id: string }) =>
      expensesApi.delete(type, id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["expenses", variables.type] })
    },
  })
}
