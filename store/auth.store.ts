import { create } from "zustand"
import { persist } from "zustand/middleware"

interface AuthUser {
  user_id: string
  email: string
  name: string
  preferred_currency: string
}

interface Tokens {
  idToken: string
  accessToken: string
  refreshToken: string | null
}

interface AuthState {
  idToken: string | null
  accessToken: string | null
  refreshToken: string | null
  user: AuthUser | null
  isAuthenticated: boolean
  _hasHydrated: boolean
  setTokens: (tokens: Partial<Tokens>) => void
  setUser: (user: AuthUser) => void
  setHasHydrated: (val: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      idToken: null,
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      _hasHydrated: false,

      setTokens: (tokens) => set({ ...tokens, isAuthenticated: true }),
      setUser: (user) => set({ user }),
      setHasHydrated: (val) => set({ _hasHydrated: val }),
      logout: () =>
        set({
          idToken: null,
          accessToken: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: "finance-auth",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
      partialize: (s) => ({
        idToken: s.idToken,
        accessToken: s.accessToken,
        refreshToken: s.refreshToken,
        user: s.user,
        isAuthenticated: s.isAuthenticated,
      }),
    }
  )
)
