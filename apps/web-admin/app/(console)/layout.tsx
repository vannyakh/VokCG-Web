'use client'

import { AdminAuthGuard } from '../../components/admin-auth-guard'
import { AdminShell } from '@vokcg/ui'

export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthGuard>
      <AdminShell>{children}</AdminShell>
    </AdminAuthGuard>
  )
}
