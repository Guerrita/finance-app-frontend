import axios from "axios"
import { toast } from "sonner"
import { env } from "@/lib/env"
import { useAuthStore } from "@/store/auth.store"

const MAX_RETRIES = 3

export const apiClient = axios.create({
  baseURL: env.NEXT_PUBLIC_API_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
})

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().idToken
  console.log(`[API Client] Request to ${config.url} with token:`, token ? "Token present" : "No token")
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let isRefreshing = false
let failedQueue: Array<{
  resolve: (v: string) => void
  reject: (e: unknown) => void
}> = []

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    console.error(`[API Client] Error in ${error.config?.method?.toUpperCase()} ${error.config?.url}:`, error.response?.status, error.response?.data || error.message)
    const original = error.config

    // ── 429: Rate limiting con exponential backoff ─────────────────────
    if (error.response?.status === 429) {
      original._retryCount = (original._retryCount ?? 0) + 1
      if (original._retryCount <= MAX_RETRIES) {
        const delay = Math.pow(2, original._retryCount) * 1000
        await new Promise((resolve) => setTimeout(resolve, delay))
        return apiClient(original)
      }
      toast.error("Demasiadas solicitudes. Intenta de nuevo en un momento.")
      return Promise.reject(error)
    }

    // ── 401: Token refresh ────────────────────────────────────────────
    if (error.response?.status !== 401 || original._retry || original.url?.includes("/auth/")) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`
        return apiClient(original)
      })
    }

    original._retry = true
    isRefreshing = true

    try {
      const { refreshToken, user } = useAuthStore.getState()
      const { data } = await axios.post(
        `${env.NEXT_PUBLIC_API_URL}/auth/refresh`,
        { 
          refresh_token: refreshToken,
          user_sub: user?.user_id
        }
      )
      const { id_token, access_token } = data.data
      useAuthStore
        .getState()
        .setTokens({
          idToken: id_token,
          accessToken: access_token,
          refreshToken,
        })
      failedQueue.forEach((p) => p.resolve(id_token))
      failedQueue = []
      original.headers.Authorization = `Bearer ${id_token}`
      return apiClient(original)
    } catch (e) {
      console.error("[API Client] Refresh token failed or session expired:", e)
      failedQueue.forEach((p) => p.reject(e))
      failedQueue = []
      useAuthStore.getState().logout()
      window.location.href = "/login"
      return Promise.reject(e)
    } finally {
      isRefreshing = false
    }
  }
)
