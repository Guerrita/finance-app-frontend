import { apiClient } from "@/lib/api/client"
import type { ApiResponse, Transaction, TransactionListResponse } from "@/types/api"

export interface TransactionFilters {
  month?: string
  type?: "income" | "expense"
  category?: string
  cursor?: string
  limit?: number
}

export interface TransactionCreate {
  amount: number
  type: "income" | "expense"
  description: string
  category: string
  date: string
  currency?: string
  expense_id?: string
  income_id?: string
  notes?: string
}

export const transactionsApi = {
  list: async (filters: TransactionFilters = {}) => {
    const { data } = await apiClient.get<ApiResponse<TransactionListResponse>>("/transactions", {
      params: filters,
    })
    if (!data.success) throw new Error(data.error.message)
    return data.data
  },

  get: async (id: string) => {
    const { data } = await apiClient.get<ApiResponse<Transaction>>(`/transactions/${id}`)
    if (!data.success) throw new Error(data.error.message)
    return data.data
  },

  create: async (payload: TransactionCreate) => {
    const { data } = await apiClient.post<ApiResponse<Transaction>>("/transactions", payload)
    if (!data.success) throw new Error(data.error.message)
    return data.data
  },

  update: async (id: string, payload: Partial<TransactionCreate>) => {
    const { data } = await apiClient.put<ApiResponse<Transaction>>(`/transactions/${id}`, payload)
    if (!data.success) throw new Error(data.error.message)
    return data.data
  },

  delete: async (id: string) => {
    const { data } = await apiClient.delete<ApiResponse<void>>(`/transactions/${id}`)
    if (!data.success) throw new Error(data.error.message)
    return data.data
  },
}

import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query"

export const useTransactions = (filters: TransactionFilters) => {
  return useInfiniteQuery({
    queryKey: ["transactions", filters.month, filters.type, filters.category],
    queryFn: ({ pageParam }) =>
      transactionsApi.list({ ...filters, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      if (!lastPage || !lastPage.meta) return undefined
      return lastPage.meta.has_more ? (lastPage.meta.cursor || undefined) : undefined
    },
  })
}


export const useCreateTransaction = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: transactionsApi.create,
    onMutate: async (newTransaction) => {
      const month = newTransaction.date.substring(0, 7)
      const queryKey = ["transactions", month, undefined, undefined]
      
      await queryClient.cancelQueries({ queryKey })
      const previousData = queryClient.getQueryData(queryKey)

      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return old
        const newTx = {
          ...newTransaction,
          id: "temp-id-" + Date.now(),
          created_at: Date.now(),
          updated_at: Date.now(),
        }
        
        return {
          ...old,
          pages: old.pages.map((page: any, index: number) => {
            if (index === 0) {
              return {
                ...page,
                transactions: [newTx, ...page.transactions],
                total: page.total + 1,
                summary: {
                  ...page.summary,
                  total_income: newTransaction.type === "income" 
                    ? page.summary.total_income + newTransaction.amount 
                    : page.summary.total_income,
                  total_expenses: newTransaction.type === "expense" 
                    ? page.summary.total_expenses + newTransaction.amount 
                    : page.summary.total_expenses,
                  balance: newTransaction.type === "income" 
                    ? page.summary.balance + newTransaction.amount 
                    : page.summary.balance - newTransaction.amount,
                }
              }
            }
            return page
          })
        }
      })

      return { previousData }
    },
    onError: (err, newTransaction, context) => {
      const month = newTransaction.date.substring(0, 7)
      queryClient.setQueryData(["transactions", month, undefined, undefined], context?.previousData)
    },
    onSettled: (_, __, variables) => {
      const month = variables.date.substring(0, 7)
      queryClient.invalidateQueries({ queryKey: ["transactions", month] })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
    },
  })
}


export const useUpdateTransaction = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<TransactionCreate> }) =>
      transactionsApi.update(id, payload),
    onSuccess: (data) => {
      const month = data.date.substring(0, 7)
      queryClient.invalidateQueries({ queryKey: ["transactions", month] })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
    },
  })
}

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: transactionsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
    },
  })
}

