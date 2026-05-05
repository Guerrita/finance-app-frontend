'use client'

import { useSearchParams } from 'next/navigation'
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm'

export function ForgotPasswordPageContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') ?? ''
  return <ForgotPasswordForm initialEmail={email} />
}
