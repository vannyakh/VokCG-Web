'use client'

import { App, Input } from 'antd'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { useRegister } from '@/api'
import { USER_ROUTES } from '@vokcg/constants'
import {
  AuthField,
  AuthFooterText,
  AuthFormActions,
  AuthFormFields,
  AuthFormStack,
  AuthSubmitButton,
  authInputClassName,
} from '@vokcg/ui'

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
    <AuthFormStack>
      <AuthFormFields>
        <AuthField label="Email" htmlFor="reg-email">
          <Input
            id="reg-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="you@example.com"
            size="large"
            autoFocus
            className={authInputClassName}
          />
        </AuthField>

        <AuthField label="Username" htmlFor="reg-username">
          <Input
            id="reg-username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="yourname"
            size="large"
            className={authInputClassName}
          />
        </AuthField>

        <AuthField label="Full name" htmlFor="reg-fullname" optional>
          <Input
            id="reg-fullname"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Jane Doe"
            size="large"
            className={authInputClassName}
          />
        </AuthField>

        <AuthField label="Password" htmlFor="reg-password">
          <Input.Password
            id="reg-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a strong password"
            size="large"
            className={authInputClassName}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
        </AuthField>
      </AuthFormFields>

      <AuthFormActions>
        <AuthSubmitButton loading={register.isPending} onClick={handleSubmit}>
          Create account
        </AuthSubmitButton>
      </AuthFormActions>

      <AuthFooterText>
        Already have an account?{' '}
        <Link href={USER_ROUTES.login} className="font-semibold text-accent transition-opacity hover:opacity-80">
          Sign in
        </Link>
      </AuthFooterText>
    </AuthFormStack>
  )
}
