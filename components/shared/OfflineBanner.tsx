"use client"

import { useEffect, useState } from "react"
import { WifiOff } from "lucide-react"

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    const onOffline = () => setIsOffline(true)
    const onOnline = () => setIsOffline(false)
    window.addEventListener("offline", onOffline)
    window.addEventListener("online", onOnline)
    return () => {
      window.removeEventListener("offline", onOffline)
      window.removeEventListener("online", onOnline)
    }
  }, [])

  if (!isOffline) return null

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 bg-warning text-white
                 flex items-center justify-center gap-2 py-2 text-sm font-medium
                 pt-[calc(0.5rem+env(safe-area-inset-top))]"
    >
      <WifiOff className="h-4 w-4" />
      Sin conexión — algunos datos pueden estar desactualizados
    </div>
  )
}
