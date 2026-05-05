import { apiClient } from "@/lib/api/client"
import type { ApiResponse, SinkingFund } from "@/types/api"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

export interface CreateSinkingFundDto {
  name: string
  description?: string
  expected_amount: number
  expected_date: string
  current_saved?: number
  monthly_contribution?: number
  category?: string
  currency?: string
  recurrence: "one-time" | "monthly" | "quarterly" | "yearly"
}

export interface ContributionDto {
  amount: number
  type: string
  date: string
  notes?: string
}

export const sinkingFundsApi = {
  list: async () => {
    const { data } = await apiClient.get<ApiResponse<{ funds: SinkingFund[]; total: number }>>("/sinking-funds")
    if (!data.success) throw new Error(data.error.message)
    return data.data
  },

  get: async (id: string) => {
    const { data } = await apiClient.get<ApiResponse<SinkingFund>>(`/sinking-funds/${id}`)
    if (!data.success) throw new Error(data.error.message)
    return data.data
  },

  create: async (dto: CreateSinkingFundDto) => {
    const { data } = await apiClient.post<ApiResponse<SinkingFund>>("/sinking-funds", dto)
    if (!data.success) throw new Error(data.error.message)
    return data.data
  },

  update: async ({ id, dto }: { id: string; dto: Partial<CreateSinkingFundDto> }) => {
    const { data } = await apiClient.put<ApiResponse<SinkingFund>>(`/sinking-funds/${id}`, dto)
    if (!data.success) throw new Error(data.error.message)
    return data.data
  },

  delete: async (id: string) => {
    const { data } = await apiClient.delete<ApiResponse<void>>(`/sinking-funds/${id}`)
    if (!data.success) throw new Error(data.error.message)
    return data.data
  },

  addContribution: async ({ id, dto }: { id: string; dto: ContributionDto }) => {
    const { data } = await apiClient.post<ApiResponse<SinkingFund>>(`/sinking-funds/${id}/contributions`, dto)
    if (!data.success) throw new Error(data.error.message)
    return data.data
  },
}

export const useSinkingFunds = () => {
  return useQuery({
    queryKey: ["sinking-funds"],
    queryFn: sinkingFundsApi.list,
  })
}

export const useCreateSinkingFund = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: sinkingFundsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sinking-funds"] })
    },
  })
}

export const useUpdateSinkingFund = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: sinkingFundsApi.update,
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["sinking-funds"] })
      queryClient.invalidateQueries({ queryKey: ["sinking-funds", id] })
    },
  })
}

export const useDeleteSinkingFund = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: sinkingFundsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sinking-funds"] })
    },
  })
}

export const useAddSinkingFundContribution = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: sinkingFundsApi.addContribution,
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["sinking-funds"] })
      queryClient.invalidateQueries({ queryKey: ["sinking-funds", id] })
    },
  })
}
