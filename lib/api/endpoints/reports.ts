import { apiClient } from "@/lib/api/client"
import type { ApiResponse, MonthlyReport, YtdReport } from "@/types/api"
import { useQuery } from "@tanstack/react-query"

export const reportsApi = {
  monthly: async (month: string) => {
    const { data } = await apiClient.get<ApiResponse<MonthlyReport>>("/reports/monthly", {
      params: { month },
    })
    if (!data.success) throw new Error(data.error.message)
    return data.data
  },

  ytd: async () => {
    const { data } = await apiClient.get<ApiResponse<YtdReport>>("/reports/year-to-date")
    if (!data.success) throw new Error(data.error.message)
    return data.data
  },
}

export const useMonthlyReport = (month: string) => {
  return useQuery({
    queryKey: ["reports", "monthly", month],
    queryFn: () => reportsApi.monthly(month),
    enabled: !!month,
  })
}

export const useYearToDateReport = () => {
  return useQuery({
    queryKey: ["reports", "ytd"],
    queryFn: reportsApi.ytd,
  })
}
