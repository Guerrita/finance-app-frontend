import { useState, useCallback } from "react"
import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api/client"

interface UsePaginatedOptions {
  queryKey: unknown[]
  url: string
  params?: Record<string, string | number | undefined>
  dataKey: string
  pageSize?: number
}

export function usePaginated<T>({
  queryKey,
  url,
  params,
  dataKey,
  pageSize = 20,
}: UsePaginatedOptions) {
  const [cursor, setCursor] = useState<string | null>(null)
  const [accumulated, setAccumulated] = useState<T[]>([])

  const query = useQuery({
    queryKey: [...queryKey, { cursor, pageSize, ...params }],
    queryFn: async () => {
      const sp = new URLSearchParams({ limit: String(pageSize) })
      if (cursor) sp.set("cursor", cursor)
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          if (v !== undefined) sp.set(k, String(v))
        })
      }
      const { data } = await apiClient.get(`${url}?${sp}`)
      return data
    },
  })

  const handleLoadMore = useCallback(() => {
    const nextCursor = query.data?.meta?.cursor
    if (!nextCursor) return
    setAccumulated((prev) => [...prev, ...(query.data?.data[dataKey] ?? [])])
    setCursor(nextCursor)
  }, [query.data, dataKey])

  const reset = useCallback(() => {
    setCursor(null)
    setAccumulated([])
  }, [])

  const currentPage: T[] = query.data?.data[dataKey] ?? []
  const items: T[] = cursor ? [...accumulated, ...currentPage] : currentPage

  return {
    items,
    meta: query.data?.meta,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    hasMore: query.data?.meta?.has_more ?? false,
    onLoadMore: handleLoadMore,
    reset,
  }
}
