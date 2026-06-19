'use client'

import { App, Input } from 'antd'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'

import { useLogin } from '@/api'
import { USER_ROUTES } from '@vokcg/constants'
import {
  AuthCardHeader,
  AuthField,
  AuthFooterText,
  AuthFormActions,
  AuthFormFields,
  AuthFormStack,
  AuthSubmitButton,
  authInputClassName,
  LoadingScreen,
} from '@vokcg/ui'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const login = useLogin()
  const { message } = App.useApp()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const redirectTo = searchParams.get('from') ?? USER_ROUTES.create

  const handleSubmit = () => {
    if (!email || !password) return
    login.mutate(
      { email, password },
      {
        onSuccess: () => router.push(redirectTo),
        onError: (err) => message.error(err.message),
      },
    )
  }

  return (
    <AuthFormStack>

      <AuthFormFields>
        <AuthField label="Email" htmlFor="email">
          <Input
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="you@example.com"
            size="large"
            autoFocus
            className={authInputClassName}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
        </AuthField>

        <AuthField label="Password" htmlFor="password">
          <Input.Password
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
            size="large"
            className={authInputClassName}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
        </AuthField>
      </AuthFormFields>

      <AuthFormActions>
        <AuthSubmitButton loading={login.isPending} onClick={handleSubmit}>
          Sign in
        </AuthSubmitButton>
      </AuthFormActions>

      <AuthFooterText>
        No account?{' '}
        <Link href={USER_ROUTES.register} className="font-semibold text-accent transition-opacity hover:opacity-80">
          Create one
        </Link>
      </AuthFooterText>
    </AuthFormStack>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <LoginForm />
    </Suspense>
  )
}
