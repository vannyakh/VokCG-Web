'use client'

import { App, Button, Input } from 'antd'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

import { useLogin } from '@vokcg/api'
import { ADMIN_APP_URL, ADMIN_ROUTES, USER_ROUTES } from '@vokcg/constants'
import { useAuthStore } from '@vokcg/store'

export default function LoginPage() {
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
        onSuccess: () => {
          if (useAuthStore.getState().isAdmin()) {
            window.location.href = `${ADMIN_APP_URL}${ADMIN_ROUTES.login}?from=${ADMIN_ROUTES.overview}`
            return
          }
          router.push(redirectTo)
        },
        onError: (err) => message.error(err.message),
      },
    )
  }

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-4 p-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-primary">Email</label>
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="you@example.com"
            size="large"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            style={{ borderRadius: '9999px' }}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-primary">Password</label>
          <Input.Password
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            size="large"
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            style={{ borderRadius: '9999px' }}
          />
        </div>
      </div>

      <div className="flex justify-center p-2">
        <Button
          type="primary"
          block
          size="large"
          loading={login.isPending}
          onClick={handleSubmit}
          style={{ borderRadius: '9999px', fontWeight: 700 }}
        >
          Sign in
        </Button>
      </div>

      <p className="text-center text-sm text-muted">
        No account?{' '}
        <Link href={USER_ROUTES.register} className="font-semibold text-accent hover:opacity-80">
          Create one
        </Link>
      </p>
    </div>
  )
}
