import { apiClient } from "@/lib/api/client"
import type { ApiResponse, AuthUser } from "@/types/api"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuthStore } from "@/store/auth.store"

export interface UpdateUserDto {
  name?: string
  preferred_currency?: string
}

export const usersApi = {
  me: async () => {
    const { data } = await apiClient.get<ApiResponse<AuthUser>>("/users/me")
    if (!data.success) throw new Error(data.error.message)
    return data.data
  },

  update: async (dto: UpdateUserDto) => {
    const { data } = await apiClient.put<ApiResponse<AuthUser>>("/users/me", dto)
    if (!data.success) throw new Error(data.error.message)
    return data.data
  },

  deleteAccount: async () => {
    const { data } = await apiClient.delete<ApiResponse<void>>("/users/me")
    if (!data.success) throw new Error(data.error.message)
  },
}

export const useMe = () =>
  useQuery({ queryKey: ["user", "me"], queryFn: usersApi.me })

export const useUpdateMe = () => {
  const queryClient = useQueryClient()
  const setUser = useAuthStore((s) => s.setUser)
  return useMutation({
    mutationFn: usersApi.update,
    onSuccess: (updated) => {
      queryClient.setQueryData(["user", "me"], updated)
      setUser(updated)
    },
  })
}

export const useDeleteAccount = () =>
  useMutation({ mutationFn: usersApi.deleteAccount })
