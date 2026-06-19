'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState, type ReactNode } from 'react'

import { ADMIN_APP_URL, ADMIN_ROUTES, USER_ROUTES } from '@vokcg/constants'
import { useAuthStore } from '@vokcg/store'

import { LoadingScreen } from '@vokcg/ui'

function GuestGuardInner({ children }: { children: ReactNode }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const accessToken = useAuthStore((s) => s.accessToken)
  const isAdmin = useAuthStore((s) => s.isAdmin())
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() => setHydrated(true))
    setHydrated(useAuthStore.persist.hasHydrated())
    return unsub
  }, [])

  useEffect(() => {
    if (!hydrated || !accessToken) return

    if (isAdmin) {
      const from = searchParams.get('from')
      const adminFrom =
        from && from.startsWith('/') && !from.startsWith('//') ? from : ADMIN_ROUTES.overview
      window.location.href = `${ADMIN_APP_URL}${ADMIN_ROUTES.login}?from=${encodeURIComponent(adminFrom)}`
      return
    }

    router.replace(USER_ROUTES.create)
  }, [accessToken, hydrated, isAdmin, router, searchParams])

  if (!hydrated || accessToken) return <LoadingScreen />

  return children
}

export function GuestGuard({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <GuestGuardInner>{children}</GuestGuardInner>
    </Suspense>
  )
}
