import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api/client"
import { QUERY_KEYS } from "@/lib/utils/constants"
import type { ApiSuccess, Category, Currency } from "@/types/api"

export async function fetchCategories() {
  const { data } = await apiClient.get<ApiSuccess<{
    expense_categories: Category[]
    income_categories: Category[]
  }>>("/categories")
  return data.data
}

export async function fetchCurrencies() {
  const { data } = await apiClient.get<ApiSuccess<{ currencies: Currency[] }>>(
    "/currencies"
  )
  return data.data.currencies
}

export function useCategories() {
  return useQuery({
    queryKey: QUERY_KEYS.categories(),
    queryFn: fetchCategories,
    staleTime: Infinity,
    gcTime: Infinity,
  })
}

export function useCategoriesByType(type: "income" | "expense") {
  const query = useCategories()
  return {
    ...query,
    data:
      type === "expense"
        ? query.data?.expense_categories ?? []
        : query.data?.income_categories ?? [],
  }
}

export function useCurrencies() {
  return useQuery({
    queryKey: QUERY_KEYS.currencies(),
    queryFn: fetchCurrencies,
    staleTime: Infinity,
    gcTime: Infinity,
  })
}
