'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { authApi } from '@/lib/api/endpoints/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const step1Schema = z.object({
  email: z.string().email('Email inválido'),
})

const step2Schema = z
  .object({
    code: z
      .string()
      .length(6, 'El código debe tener 6 dígitos')
      .regex(/^\d+$/, 'Solo se permiten números'),
    newPassword: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

type Step1Values = z.infer<typeof step1Schema>
type Step2Values = z.infer<typeof step2Schema>

interface ForgotPasswordFormProps {
  initialEmail?: string
}

export function ForgotPasswordForm({ initialEmail = '' }: ForgotPasswordFormProps) {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [email, setEmail] = useState(initialEmail)
  const [serverError, setServerError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const form1 = useForm<Step1Values>({
    resolver: zodResolver(step1Schema),
    defaultValues: { email: initialEmail },
  })
  const form2 = useForm<Step2Values>({ resolver: zodResolver(step2Schema) })

  async function onStep1({ email }: Step1Values) {
    setServerError('')
    try {
      await authApi.forgotPassword(email)
      setEmail(email)
      setStep(2)
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: { message?: string } } } }
      setServerError(
        err.response?.data?.error?.message ?? 'No se pudo enviar el código. Intenta de nuevo.'
      )
    }
  }

  async function onStep2({ code, newPassword }: Step2Values) {
    setServerError('')
    console.log('[ForgotPassword] Resetting password for:', { email, code, newPassword })
    try {
      const res = await authApi.resetPassword(email, code, newPassword)
      const payload = res.data
      if (!payload.success) {
        setServerError(payload.error.message)
        return
      }
      router.replace('/login')
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: { message?: string } } } }
      setServerError(
        err.response?.data?.error?.message ?? 'Error al restablecer. Intenta de nuevo.'
      )
    }
  }

  if (step === 1) {
    return (
      <form onSubmit={form1.handleSubmit(onStep1)} noValidate className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="fp-email">Email</Label>
          <Input
            id="fp-email"
            type="email"
            autoComplete="email"
            placeholder="tu@email.com"
            {...form1.register('email')}
          />
          {form1.formState.errors.email && (
            <p className="text-xs text-destructive">
              {form1.formState.errors.email.message}
            </p>
          )}
        </div>

        {serverError && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {serverError}
          </p>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={form1.formState.isSubmitting}
        >
          {form1.formState.isSubmitting && <Loader2 size={16} className="animate-spin" />}
          Enviar código
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          <Link href="/login" className="text-primary hover:underline">
            Volver al inicio de sesión
          </Link>
        </p>
      </form>
    )
  }

  return (
    <form onSubmit={form2.handleSubmit(onStep2)} noValidate className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Ingresa el código enviado a{' '}
        <span className="font-medium text-foreground">{email}</span>
      </p>

      <div className="space-y-1.5">
        <Label htmlFor="reset-code">Código de 6 dígitos</Label>
        <Input
          id="reset-code"
          type="text"
          inputMode="numeric"
          pattern="\d*"
          maxLength={6}
          placeholder="123456"
          className="text-center text-xl tracking-[0.5em]"
          {...form2.register('code')}
        />
        {form2.formState.errors.code && (
          <p className="text-xs text-destructive">
            {form2.formState.errors.code.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="new-password">Nueva contraseña</Label>
        <div className="relative">
          <Input
            id="new-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres"
            className="pr-10"
            {...form2.register('newPassword')}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Ocultar' : 'Mostrar'}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground [min-height:unset] [min-width:unset]"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {form2.formState.errors.newPassword && (
          <p className="text-xs text-destructive">
            {form2.formState.errors.newPassword.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="confirm-new-password">Confirmar contraseña</Label>
        <div className="relative">
          <Input
            id="confirm-new-password"
            type={showConfirm ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Repite tu contraseña"
            className="pr-10"
            {...form2.register('confirmPassword')}
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            aria-label={showConfirm ? 'Ocultar' : 'Mostrar'}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground [min-height:unset] [min-width:unset]"
          >
            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {form2.formState.errors.confirmPassword && (
          <p className="text-xs text-destructive">
            {form2.formState.errors.confirmPassword.message}
          </p>
        )}
      </div>

      {serverError && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {serverError}
        </p>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={form2.formState.isSubmitting}
      >
        {form2.formState.isSubmitting && <Loader2 size={16} className="animate-spin" />}
        Restablecer contraseña
      </Button>
    </form>
  )
}
