'use client'

import { AuthGuard } from '../../components/auth-guard'
import { StudioShell } from '@vokcg/ui'

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <StudioShell>{children}</StudioShell>
    </AuthGuard>
  )
}
