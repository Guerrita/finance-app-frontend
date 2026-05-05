'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'

export function DashboardGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { isAuthenticated, _hasHydrated } = useAuthStore()

  useEffect(() => {
    if (_hasHydrated && !isAuthenticated) {
      router.replace('/login')
    }
  }, [_hasHydrated, isAuthenticated, router])

  // Evitar parpadeo o redirecciones prematuras durante la hidratación
  if (!_hasHydrated) {
    return null // O un spinner de carga
  }

  return <>{children}</>
}
