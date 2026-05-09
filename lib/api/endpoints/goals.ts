import { apiClient } from "@/lib/api/client"
import type {
  ApiResponse,
  Goal,
  GoalProgress,
  GoalContribution,
  GoalContributionsResponse,
} from "@/types/api"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { usePaginated } from "@/lib/hooks/usePaginated"
import { QUERY_KEYS } from "@/lib/utils/constants"

export interface CreateGoalDto {
  name: string
  type: string
  target_amount: number
  target_date: string
  current_saved?: number
  monthly_contribution?: number
  currency?: string
}

export interface GoalContributionDto {
  amount: number
  contribution_type?: string
  transaction_type?: string
  date: string
  notes?: string
}

export interface UpdateGoalContributionDto {
  amount?: number
  contribution_type?: string
  transaction_type?: string
  date?: string
  notes?: string
}

export const goalsApi = {
  list: async () => {
    const { data } = await apiClient.get<ApiResponse<{ goals: Goal[]; total: number }>>("/goals")
    if (!data.success) throw new Error(data.error.message)
    return data.data
  },

  get: async (id: string) => {
    const { data } = await apiClient.get<ApiResponse<Goal>>(`/goals/${id}`)
    if (!data.success) throw new Error(data.error.message)
    return data.data
  },

  create: async (dto: CreateGoalDto) => {
    const { data } = await apiClient.post<ApiResponse<Goal>>("/goals", dto)
    if (!data.success) throw new Error(data.error.message)
    return data.data
  },

  update: async ({ id, dto }: { id: string; dto: Partial<CreateGoalDto> }) => {
    const { data } = await apiClient.put<ApiResponse<Goal>>(`/goals/${id}`, dto)
    if (!data.success) throw new Error(data.error.message)
    return data.data
  },

  delete: async (id: string) => {
    const { data } = await apiClient.delete<ApiResponse<void>>(`/goals/${id}`)
    if (!data.success) throw new Error(data.error.message)
    return data.data
  },

  addContribution: async ({ id, dto }: { id: string; dto: GoalContributionDto }) => {
    const { data } = await apiClient.post<ApiResponse<GoalContribution>>(
      `/goals/${id}/contributions`,
      dto,
    )
    if (!data.success) throw new Error(data.error.message)
    return data.data
  },

  getContributions: async ({ id, month }: { id: string; month?: string }) => {
    const params = month ? `?month=${month}` : ""
    const { data } = await apiClient.get<ApiResponse<GoalContributionsResponse>>(
      `/goals/${id}/contributions${params}`,
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
    dto: UpdateGoalContributionDto
  }) => {
    const { data } = await apiClient.put<ApiResponse<GoalContribution>>(
      `/goals/${id}/contributions/${contrib_id}`,
      dto,
    )
    if (!data.success) throw new Error(data.error.message)
    return data.data
  },

  deleteContribution: async ({ id, contrib_id }: { id: string; contrib_id: string }) => {
    const { data } = await apiClient.delete<ApiResponse<void>>(
      `/goals/${id}/contributions/${contrib_id}`,
    )
    if (!data.success) throw new Error(data.error.message)
    return data.data
  },

  getProgress: async (id: string) => {
    const { data } = await apiClient.get<ApiResponse<GoalProgress>>(`/goals/${id}/progress`)
    if (!data.success) throw new Error(data.error.message)
    return data.data
  },
}

export const useGoals = () => {
  return usePaginated<Goal>({
    queryKey: QUERY_KEYS.goals(),
    url: "/goals",
    dataKey: "goals",
    pageSize: 12,
  })
}

export const useGoalProgress = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["goals", id, "progress"],
    queryFn: () => goalsApi.getProgress(id),
    enabled: !!id && enabled,
  })
}

export const useGoalContributions = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: QUERY_KEYS.goalContributions(id),
    queryFn: () => goalsApi.getContributions({ id }),
    enabled: !!id && enabled,
  })
}

export const useCreateGoal = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: goalsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.goals() })
    },
  })
}

export const useUpdateGoal = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: goalsApi.update,
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.goals() })
      queryClient.invalidateQueries({ queryKey: ["goals", id] })
    },
  })
}

export const useDeleteGoal = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: goalsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.goals() })
    },
  })
}

export const useAddGoalContribution = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: goalsApi.addContribution,
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.goals() })
      queryClient.invalidateQueries({ queryKey: ["goals", id] })
      queryClient.invalidateQueries({ queryKey: ["goals", id, "progress"] })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.goalContributions(id) })
    },
  })
}

export const useUpdateGoalContribution = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: goalsApi.updateContribution,
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.goals() })
      queryClient.invalidateQueries({ queryKey: ["goals", id] })
      queryClient.invalidateQueries({ queryKey: ["goals", id, "progress"] })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.goalContributions(id) })
    },
  })
}

export const useDeleteGoalContribution = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: goalsApi.deleteContribution,
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.goals() })
      queryClient.invalidateQueries({ queryKey: ["goals", id] })
      queryClient.invalidateQueries({ queryKey: ["goals", id, "progress"] })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.goalContributions(id) })
    },
  })
}
