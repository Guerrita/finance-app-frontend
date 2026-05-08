import { apiClient } from "@/lib/api/client"
import type { ApiResponse, DashboardData, DashboardOverview } from "@/types/api"
import { useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "@/lib/utils/constants"

export const dashboardApi = {
  get: async (month: string): Promise<DashboardData> => {
    const { data } = await apiClient.get<ApiResponse<DashboardData>>("/dashboard", {
      params: { month },
    })
    if (!data.success) throw new Error(data.error.message)
    return data.data
  },

  overview: async (): Promise<DashboardOverview> => {
    const { data } = await apiClient.get<ApiResponse<DashboardOverview>>("/dashboard/overview")
    if (!data.success) throw new Error(data.error.message)
    return data.data
  },
}

export function useDashboard(month: string) {
  return useQuery({
    queryKey: QUERY_KEYS.dashboard(month),
    queryFn: () => dashboardApi.get(month),
    staleTime: 1000 * 60 * 2,
  })
}

export function useDashboardOverview() {
  return useQuery({
    queryKey: QUERY_KEYS.dashboardOverview(),
    queryFn: dashboardApi.overview,
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60,
    refetchIntervalInBackground: false,
  })
}
