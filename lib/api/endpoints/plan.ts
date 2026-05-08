import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api/client"
import { QUERY_KEYS } from "@/lib/utils/constants"
import type { ApiSuccess, MonthPlan, Projection } from "@/types/api"

export function usePlan(month: string) {
  const [year, m] = month.split("-")
  return useQuery({
    queryKey: QUERY_KEYS.plan(month),
    queryFn: async () => {
      const { data } = await apiClient.get<ApiSuccess<MonthPlan>>(`/plan/${year}/${m}`)
      return data.data
    },
    staleTime: 1000 * 60 * 5,
  })
}

export function useProjection(months = 12) {
  return useQuery({
    queryKey: QUERY_KEYS.projection(months),
    queryFn: async () => {
      const { data } = await apiClient.get<ApiSuccess<Projection>>(
        `/plan/projection?months=${months}`
      )
      return data.data
    },
    staleTime: 1000 * 60 * 10,
  })
}
