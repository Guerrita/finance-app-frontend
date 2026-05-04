'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { authApi } from '@/lib/api/endpoints/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const schema = z.object({
  code: z
    .string()
    .length(6, 'El código debe tener 6 dígitos')
    .regex(/^\d+$/, 'Solo se permiten números'),
})

type FormValues = z.infer<typeof schema>

export function ConfirmForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') ?? ''

  const [serverError, setServerError] = useState('')
  const [resendSuccess, setResendSuccess] = useState(false)
  const [isResending, setIsResending] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit({ code }: FormValues) {
    setServerError('')
    try {
      const res = await authApi.confirm(email, code)
      const payload = res.data
      if (!payload.success) {
        setServerError(payload.error.message)
        return
      }
      router.replace('/login')
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: { message?: string } } } }
      setServerError(
        err.response?.data?.error?.message ?? 'Código inválido. Intenta de nuevo.'
      )
    }
  }

  async function handleResend() {
    if (!email) return
    setServerError('')
    setResendSuccess(false)
    setIsResending(true)
    try {
      await authApi.forgotPassword(email)
      setResendSuccess(true)
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: { message?: string } } } }
      setServerError(
        err.response?.data?.error?.message ?? 'No se pudo reenviar. Intenta más tarde.'
      )
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="space-y-4">
      {email && (
        <p className="text-sm text-muted-foreground text-center">
          Enviamos un código a{' '}
          <span className="font-medium text-foreground">{email}</span>
        </p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="code">Código de 6 dígitos</Label>
          <Input
            id="code"
            type="text"
            inputMode="numeric"
            pattern="\d*"
            maxLength={6}
            placeholder="123456"
            className="text-center text-xl tracking-[0.5em]"
            {...register('code')}
          />
          {errors.code && (
            <p className="text-xs text-destructive">{errors.code.message}</p>
          )}
        </div>

        {serverError && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {serverError}
          </p>
        )}
        {resendSuccess && (
          <p className="rounded-md bg-income/10 px-3 py-2 text-sm text-income">
            Código reenviado. Revisa tu correo.
          </p>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          Confirmar cuenta
        </Button>
      </form>

      <div className="text-center">
        <button
          type="button"
          onClick={handleResend}
          disabled={isResending}
          className="text-sm text-primary hover:underline disabled:opacity-50 [min-height:unset] [min-width:unset]"
        >
          {isResending ? 'Reenviando…' : 'Reenviar código'}
        </button>
      </div>
    </div>
  )
}
