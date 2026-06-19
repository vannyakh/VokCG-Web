import { GuestGuard } from '../../components/guest-guard'
import { AuthLayout } from '@vokcg/ui'

export default function GuestLayout({ children }: { children: React.ReactNode }) {
  return (
    <GuestGuard>
      <AuthLayout>{children}</AuthLayout>
    </GuestGuard>
  )
}
