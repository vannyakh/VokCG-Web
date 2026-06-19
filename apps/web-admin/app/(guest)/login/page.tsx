'use client'

import { App, Button, Input } from 'antd'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'

import { useLogin } from '@vokcg/api'
import { ADMIN_ROUTES, STUDIO_APP_URL, USER_ROUTES } from '@vokcg/constants'
import { useAuthStore } from '@vokcg/store'

import { LoadingScreen } from '@vokcg/ui'

function AdminLoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const login = useLogin()
  const clearSession = useAuthStore((s) => s.clearSession)
  const { message } = App.useApp()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const redirectTo = searchParams.get('from') ?? ADMIN_ROUTES.overview
  const accessError = searchParams.get('error')

  const handleSubmit = () => {
    if (!email || !password) return
    login.mutate(
      { email, password },
      {
        onSuccess: () => {
          if (!useAuthStore.getState().isAdmin()) {
            clearSession()
            message.error('This account does not have admin access.')
            return
          }

          const destination =
            redirectTo.startsWith('/') && !redirectTo.startsWith('//')
              ? redirectTo
              : ADMIN_ROUTES.overview
          router.replace(destination)
        },
        onError: (err) => message.error(err.message),
      },
    )
  }

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="text-lg font-bold text-primary">Admin sign in</h1>
        <p className="text-sm text-muted">Platform administration console</p>
      </div>

      {accessError === 'forbidden' && (
        <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-center text-sm text-rose-600 dark:text-rose-400">
          You don&apos;t have permission to access the admin console.
        </p>
      )}

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
        Studio user?{' '}
        <Link
          href={`${STUDIO_APP_URL}${USER_ROUTES.login}`}
          className="font-semibold text-accent hover:opacity-80"
        >
          Go to studio login
        </Link>
      </p>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <AdminLoginForm />
    </Suspense>
  )
}
