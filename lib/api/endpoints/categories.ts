import { apiClient } from "@/lib/api/client"
import type { ApiResponse, Category } from "@/types/api"
import { useQuery } from "@tanstack/react-query"

export interface CategoriesResponse {
  expense_categories: Category[]
  income_categories: Category[]
}

export const categoriesApi = {
  list: async () => {
    const { data } = await apiClient.get<ApiResponse<CategoriesResponse>>("/categories")
    if (!data.success) throw new Error(data.error.message)
    return data.data
  },
}

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: categoriesApi.list,
  })
}
