'use client'

import { Suspense } from 'react'

import { AuthLayout, LoadingScreen } from '@vokcg/ui'

import { AdminGuestGuard } from '../../components/admin-guest-guard'

export default function GuestLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <AdminGuestGuard>
        <AuthLayout>{children}</AuthLayout>
      </AdminGuestGuard>
    </Suspense>
  )
}
