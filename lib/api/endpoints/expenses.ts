import { apiClient } from "@/lib/api/client"
import type { ApiResponse, Expense } from "@/types/api"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

export interface CreateExpenseDto {
  name: string
  amount: number
  category: string
  currency: string
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
    // Mapear estimated_amount a amount para consistencia en el frontend
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
  return useQuery({
    queryKey: ["expenses", "fixed"],
    queryFn: expensesApi.listFixed,
  })
}

export const useExpensesVariable = (month?: string) => {
  return useQuery({
    queryKey: ["expenses", "variable", month],
    queryFn: () => expensesApi.listVariable(month),
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
