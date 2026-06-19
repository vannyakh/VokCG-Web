'use client'

import { App, Button, Input } from 'antd'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { useRegister } from '@vokcg/api'
import { USER_ROUTES } from '@vokcg/constants'

export default function RegisterPage() {
  const router = useRouter()
  const register = useRegister()
  const { message } = App.useApp()
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = () => {
    if (!email || !username || !password) return
    register.mutate(
      {
        email,
        username,
        password,
        ...(fullName.trim() ? { full_name: fullName.trim() } : {}),
      },
      {
        onSuccess: () => router.push(USER_ROUTES.create),
        onError: (err) => message.error(err.message),
      },
    )
  }

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-extrabold text-primary">Create account</h1>
        <p className="text-sm text-muted">
          A default avatar is generated automatically for your profile.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-primary">Email</label>
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="you@example.com"
            size="large"
            autoFocus
            style={{ borderRadius: '9999px' }}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-primary">Username</label>
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="yourname"
            size="large"
            style={{ borderRadius: '9999px' }}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-primary">
            Full name <span className="text-xs font-normal text-muted">(optional)</span>
          </label>
          <Input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Jane Doe"
            size="large"
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

      <Button
        type="primary"
        block
        size="large"
        loading={register.isPending}
        onClick={handleSubmit}
        style={{ borderRadius: '9999px', fontWeight: 700 }}
      >
        Create account
      </Button>

      <p className="text-center text-sm text-muted">
        Already have an account?{' '}
        <Link href={USER_ROUTES.login} className="font-semibold text-accent hover:opacity-80">
          Sign in
        </Link>
      </p>
    </div>
  )
}
