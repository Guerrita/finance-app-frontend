import { apiClient } from "@/lib/api/client"
import type { ApiResponse, Goal, GoalProgress } from "@/types/api"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

export interface CreateGoalDto {
  name: string
  type: string
  target_amount: number
  target_date: string
  current_saved?: number
  monthly_contribution?: number
  currency?: string
}

export interface ContributionDto {
  amount: number
  type: string
  date: string
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

  addContribution: async ({ id, dto }: { id: string; dto: ContributionDto }) => {
    const { data } = await apiClient.post<ApiResponse<Goal>>(`/goals/${id}/contributions`, dto)
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
  return useQuery({
    queryKey: ["goals"],
    queryFn: goalsApi.list,
  })
}

export const useGoalProgress = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["goals", id, "progress"],
    queryFn: () => goalsApi.getProgress(id),
    enabled: !!id && enabled,
  })
}

export const useCreateGoal = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: goalsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] })
    },
  })
}

export const useUpdateGoal = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: goalsApi.update,
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["goals"] })
      queryClient.invalidateQueries({ queryKey: ["goals", id] })
    },
  })
}

export const useDeleteGoal = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: goalsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] })
    },
  })
}

export const useAddGoalContribution = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: goalsApi.addContribution,
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["goals"] })
      queryClient.invalidateQueries({ queryKey: ["goals", id] })
      queryClient.invalidateQueries({ queryKey: ["goals", id, "progress"] })
    },
  })
}
