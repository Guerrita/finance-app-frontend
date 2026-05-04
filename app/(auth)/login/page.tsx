import type { Metadata } from 'next'
import { LoginForm } from '@/components/auth/LoginForm'

export const metadata: Metadata = { title: 'Iniciar sesión — FinanceApp' }

export default function LoginPage() {
  return (
    <div className="card-base space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Iniciar sesión</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Ingresa a tu cuenta para continuar
        </p>
      </div>
      <LoginForm />
    </div>
  )
}
