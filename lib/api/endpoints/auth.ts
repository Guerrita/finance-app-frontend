import { apiClient } from "@/lib/api/client"
import type { ApiResponse, LoginResponse } from "@/types/api"

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post<ApiResponse<LoginResponse>>("/auth/login", {
      email,
      password,
    }),

  register: (name: string, email: string, password: string) =>
    apiClient.post<ApiResponse<void>>("/auth/register", {
      name,
      email,
      password,
    }),

  confirm: (email: string, code: string) =>
    apiClient.post<ApiResponse<void>>("/auth/confirm", { email, code }),

  forgotPassword: (email: string) =>
    apiClient.post<ApiResponse<void>>("/auth/forgot-password", { email }),

  resetPassword: (email: string, code: string, newPassword: string) =>
    apiClient.post<ApiResponse<void>>("/auth/reset-password", {
      email,
      code,
      newPassword,
    }),

  refresh: (refreshToken: string, userSub: string) =>
    apiClient.post<ApiResponse<{ id_token: string; access_token: string }>>(
      "/auth/refresh",
      { refresh_token: refreshToken, user_sub: userSub }
    ),
}
