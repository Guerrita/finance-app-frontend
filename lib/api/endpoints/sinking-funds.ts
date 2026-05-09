import { apiClient } from "@/lib/api/client"
import type {
  ApiResponse,
  SinkingFund,
  SinkingFundContribution,
  SinkingFundContributionsResponse,
} from "@/types/api"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { usePaginated } from "@/lib/hooks/usePaginated"
import { QUERY_KEYS } from "@/lib/utils/constants"

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

export interface SinkingFundContributionDto {
  amount: number
  date: string
  notes?: string
}

export interface UpdateSinkingFundContributionDto {
  amount?: number
  date?: string
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

  addContribution: async ({ id, dto }: { id: string; dto: SinkingFundContributionDto }) => {
    const { data } = await apiClient.post<ApiResponse<SinkingFundContribution>>(
      `/sinking-funds/${id}/contributions`,
      dto,
    )
    if (!data.success) throw new Error(data.error.message)
    return data.data
  },

  getContributions: async ({ id, month }: { id: string; month?: string }) => {
    const params = month ? `?month=${month}` : ""
    const { data } = await apiClient.get<ApiResponse<SinkingFundContributionsResponse>>(
      `/sinking-funds/${id}/contributions${params}`,
    )
    if (!data.success) throw new Error(data.error.message)
    return data.data
  },

  updateContribution: async ({
    id,
    contrib_id,
    dto,
  }: {
    id: string
    contrib_id: string
    dto: UpdateSinkingFundContributionDto
  }) => {
    const { data } = await apiClient.put<ApiResponse<SinkingFundContribution>>(
      `/sinking-funds/${id}/contributions/${contrib_id}`,
      dto,
    )
    if (!data.success) throw new Error(data.error.message)
    return data.data
  },

  deleteContribution: async ({ id, contrib_id }: { id: string; contrib_id: string }) => {
    const { data } = await apiClient.delete<ApiResponse<void>>(
      `/sinking-funds/${id}/contributions/${contrib_id}`,
    )
    if (!data.success) throw new Error(data.error.message)
    return data.data
  },
}

export const useSinkingFunds = () => {
  return usePaginated<SinkingFund>({
    queryKey: QUERY_KEYS.sinkingFunds(),
    url: "/sinking-funds",
    dataKey: "funds",
    pageSize: 12,
  })
}

export const useSinkingFundContributions = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: QUERY_KEYS.sinkingFundContributions(id),
    queryFn: () => sinkingFundsApi.getContributions({ id }),
    enabled: !!id && enabled,
  })
}

export const useCreateSinkingFund = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: sinkingFundsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sinkingFunds() })
    },
  })
}

export const useUpdateSinkingFund = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: sinkingFundsApi.update,
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sinkingFunds() })
      queryClient.invalidateQueries({ queryKey: ["sinking-funds", id] })
    },
  })
}

export const useDeleteSinkingFund = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: sinkingFundsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sinkingFunds() })
    },
  })
}

export const useAddSinkingFundContribution = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: sinkingFundsApi.addContribution,
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sinkingFunds() })
      queryClient.invalidateQueries({ queryKey: ["sinking-funds", id] })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sinkingFundContributions(id) })
    },
  })
}

export const useUpdateSinkingFundContribution = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: sinkingFundsApi.updateContribution,
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sinkingFunds() })
      queryClient.invalidateQueries({ queryKey: ["sinking-funds", id] })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sinkingFundContributions(id) })
    },
  })
}

export const useDeleteSinkingFundContribution = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: sinkingFundsApi.deleteContribution,
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sinkingFunds() })
      queryClient.invalidateQueries({ queryKey: ["sinking-funds", id] })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sinkingFundContributions(id) })
    },
  })
}
