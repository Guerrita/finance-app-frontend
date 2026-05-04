import type { Metadata } from 'next'
import { RegisterForm } from '@/components/auth/RegisterForm'

export const metadata: Metadata = { title: 'Crear cuenta — FinanceApp' }

export default function RegisterPage() {
  return (
    <div className="card-base space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Crear cuenta</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Empieza a controlar tus finanzas hoy
        </p>
      </div>
      <RegisterForm />
    </div>
  )
}
