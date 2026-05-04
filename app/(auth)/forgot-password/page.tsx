import type { Metadata } from 'next'
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm'

export const metadata: Metadata = { title: 'Recuperar contraseña — FinanceApp' }

export default function ForgotPasswordPage() {
  return (
    <div className="card-base space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Recuperar contraseña</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Te enviaremos un código para restablecer tu contraseña
        </p>
      </div>
      <ForgotPasswordForm />
    </div>
  )
}
