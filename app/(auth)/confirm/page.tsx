import type { Metadata } from 'next'
import { Suspense } from 'react'
import { ConfirmForm } from '@/components/auth/ConfirmForm'

export const metadata: Metadata = { title: 'Confirmar cuenta — FinanceApp' }

export default function ConfirmPage() {
  return (
    <div className="card-base space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Confirma tu cuenta</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Ingresa el código que enviamos a tu correo electrónico
        </p>
      </div>
      <Suspense fallback={<div className="h-40 animate-pulse rounded-md bg-muted" />}>
        <ConfirmForm />
      </Suspense>
    </div>
  )
}
